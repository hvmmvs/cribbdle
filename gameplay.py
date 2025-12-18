from __future__ import annotations

from collections import Counter
from itertools import combinations
from typing import Iterable, List


RANK_ORDER = "A23456789TJQK"
RANK_TO_VALUE_FOR_15 = {
    "A": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "T": 10,
    "J": 10,
    "Q": 10,
    "K": 10,
}


def _parse_card(card: str) -> tuple[str, str]:
    """
    Parse a card string like '5C', 'QH', 'TD' into (rank, suit).

    - Rank: one of A,2,3,4,5,6,7,8,9,T,J,Q,K
    - Suit: single character (e.g. C, D, H, S)
    """
    card = card.strip().upper()
    if len(card) != 2:
        raise ValueError(f"Card must be 2 characters like '5C' or 'QH', got {card!r}")
    rank, suit = card[0], card[1]
    if rank not in RANK_ORDER:
        raise ValueError(f"Invalid rank {rank!r} in card {card!r}")
    return rank, suit


def _score_core(all_cards: list[tuple[str, str]]) -> int:
    """
    Core cribbage scoring for fifteens, pairs, and runs.

    Works with any number of cards >= 2. Does NOT handle flush or knobs.
    """
    total_points = 0

    # Fifteens: any combination of cards that sums to 15 is worth 2 points.
    values = [RANK_TO_VALUE_FOR_15[r] for r, _ in all_cards]
    for r in range(2, len(values) + 1):
        for combo in combinations(values, r):
            if sum(combo) == 15:
                total_points += 2

    # Pairs: each pair of same-rank cards scores 2.
    rank_counts = Counter(r for r, _ in all_cards)
    for count in rank_counts.values():
        if count >= 2:
            num_pairs = count * (count - 1) // 2
            total_points += num_pairs * 2

    # Runs: work off rank indices and multiplicities.
    index_counts = Counter(RANK_ORDER.index(r) for r, _ in all_cards)
    distinct_indices: List[int] = sorted(index_counts.keys())

    def _score_runs(indices: List[int], counts: Counter) -> int:
        run_points = 0
        if not indices:
            return 0

        start = 0
        while start < len(indices):
            end = start
            while end + 1 < len(indices) and indices[end + 1] == indices[end] + 1:
                end += 1

            segment = indices[start : end + 1]
            length = len(segment)
            if length >= 3:
                multiplicity = 1
                for idx in segment:
                    multiplicity *= counts[idx]
                run_points += length * multiplicity

            start = end + 1

        return run_points

    total_points += _score_runs(distinct_indices, index_counts)
    return total_points


def score_hand(cards: Iterable[str], *, is_crib: bool = False) -> int:
    """
    Compute the cribbage score for a hand.

    Usage:
        - For a regular 4-card hand without a starter (no flush/knobs logic), pass 4 cards.
        - For a full 5-card hand (4 cards + starter), pass 5 cards; the **last card is
          treated as the starter** for flush and knobs rules.

    Card format:
        Each card is a 2-character string: rank + suit, e.g. '5C', 'QH', 'TD', 'AS'.

    Rules implemented:
        - All 15s (2 points per combination)
        - Pairs (2 points per pair; 3-of-a-kind = 6, 4-of-a-kind = 12)
        - Runs (handles duplicated ranks correctly)
        - Flush (depends on is_crib and whether a starter is present)
        - Knobs (Jack in hand matching starter suit, only when a starter is present)
    """
    cards = list(cards)
    if len(cards) not in (4, 5):
        raise ValueError("Cribbage hand must have 4 or 5 cards")

    parsed = [_parse_card(c) for c in cards]

    if len(parsed) == 5:
        hand_cards = parsed[:4]
        starter = parsed[4]
    else:
        hand_cards = parsed
        starter = None

    all_cards = hand_cards + ([starter] if starter else [])

    # Core scoring (15s, pairs, runs).
    total_points = _score_core(all_cards)

    # 4) Flush:
    # - Without a starter (4 cards): 4-card flush scores 4 (never used in crib).
    # - With starter:
    #     * Non-crib: 4 cards same suit = 4; if starter matches too = 5.
    #     * Crib: needs all 5 same suit for 5 points; otherwise no flush.
    hand_suits = [s for _, s in hand_cards]
    flush_points = 0

    if len(hand_cards) == 4 and len(set(hand_suits)) == 1:
        if starter is None:
            # Classic 4-card hand, no starter yet.
            flush_points = 4
        else:
            if is_crib:
                # Crib needs all 5 same suit.
                starter_suit = starter[1]
                if starter_suit == hand_suits[0]:
                    flush_points = 5
            else:
                # Hand: flush with 4 in hand; +1 if starter matches.
                flush_points = 4
                starter_suit = starter[1]
                if starter_suit == hand_suits[0]:
                    flush_points = 5

    total_points += flush_points

    # 5) Knobs: Jack in hand matching the starter suit scores 1.
    if starter is not None:
        starter_suit = starter[1]
        if any(r == "J" and s == starter_suit for r, s in hand_cards):
            total_points += 1

    return total_points


def starter_outcome_stats(
    hand: Iterable[str],
    *,
    is_crib: bool = False,
    deck: Iterable[str] | None = None,
) -> dict:
    """
    For a chosen 4‑card hand, evaluate how different starter cards affect the score.

    The idea is to help answer:
        "How much can the turn‑up card add to this keep, and how swingy is it?"

    Arguments:
        hand:
            An iterable of exactly 4 card codes (e.g. ["5C", "5D", "6H", "7S"]).
        is_crib:
            Whether this 4‑card hand is going into the crib (affects flush logic).
        deck:
            Optional iterable of all cards that could be cut as starter.
            If omitted, uses a full 52‑card deck and excludes the 4 hand cards.

    Returns:
        A dict with:
            - "base_score": score of the 4‑card hand with no starter
            - "by_starter": {starter_card: {"total": total_score, "delta": delta}}
                  where:
                    total = score with that starter (5‑card evaluation)
                    delta = total - base_score
            - "min_total", "max_total"
            - "avg_total", "avg_delta"
    """
    hand = list(hand)
    if len(hand) != 4:
        raise ValueError("starter_outcome_stats expects exactly 4 cards in hand")

    # Base score with no starter: this represents what the 4 cards are worth alone.
    base_score = score_hand(hand, is_crib=is_crib)

    # Build candidate starter list.
    if deck is None:
        ranks = RANK_ORDER
        suits = "CDHS"
        full_deck = [f"{r}{s}" for r in ranks for s in suits]
    else:
        full_deck = [c.strip().upper() for c in deck]

    hand_set = {c.strip().upper() for c in hand}
    candidates = [c for c in full_deck if c not in hand_set]

    by_starter: dict[str, dict[str, float]] = {}
    totals: List[int] = []
    deltas: List[int] = []

    for starter in candidates:
        total = score_hand([*hand, starter], is_crib=is_crib)
        delta = total - base_score
        by_starter[starter] = {"total": total, "delta": delta}
        totals.append(total)
        deltas.append(delta)

    if totals:
        avg_total = sum(totals) / len(totals)
        avg_delta = sum(deltas) / len(deltas)
        min_total = min(totals)
        max_total = max(totals)
    else:
        avg_total = avg_delta = 0.0
        min_total = max_total = base_score

    return {
        "base_score": base_score,
        "by_starter": by_starter,
        "min_total": min_total,
        "max_total": max_total,
        "avg_total": avg_total,
        "avg_delta": avg_delta,
    }


def crib_outcome_stats(
    discard: Iterable[str],
    *,
    deck: Iterable[str] | None = None,
    six_cards: Iterable[str] | None = None,
) -> dict:
    """
    Evaluate the expected crib score for 2 discarded cards.

    The crib is scored with 5 cards total: 2 discards + 2 from opponent + starter.
    Since we don't know what opponent will discard, we average over all possible
    opponent discards for each possible starter.

    Arguments:
        discard:
            An iterable of exactly 2 card codes (the cards being discarded to crib).
        deck:
            Optional iterable of all cards that could be cut as starter.
            If omitted, uses a full 52‑card deck.
        six_cards:
            Optional iterable of the 6 cards that were dealt (to exclude from
            opponent's possible discards). If omitted, only excludes the discard cards.

    Returns:
        A dict with:
            - "avg_score": average crib score over all possible starters and opponent discards
            - "min_score", "max_score"
            - "by_starter": {starter_card: average_score_for_that_starter}
    """
    discard = list(discard)
    if len(discard) != 2:
        raise ValueError("crib_outcome_stats expects exactly 2 cards in discard")

    # Build full deck and determine which cards are available for opponent discards
    if deck is None:
        ranks = RANK_ORDER
        suits = "CDHS"
        full_deck = [f"{r}{s}" for r in ranks for s in suits]
    else:
        full_deck = [c.strip().upper() for c in deck]

    discard_set = {c.strip().upper() for c in discard}
    
    # Cards that are definitely not available (the 6 dealt cards)
    if six_cards is not None:
        dealt_set = {c.strip().upper() for c in six_cards}
    else:
        dealt_set = discard_set
    
    # Available cards for opponent discards and starters
    available = [c for c in full_deck if c not in dealt_set]
    
    by_starter: dict[str, float] = {}
    all_scores: List[int] = []

    # For each possible starter, evaluate all possible opponent discards
    for starter in available:
        # Remaining cards after removing starter (for opponent's 2 discards)
        remaining_for_opponent = [c for c in available if c != starter]
        
        starter_scores: List[int] = []
        
        # Evaluate all possible pairs of opponent discards
        for opp_discard1, opp_discard2 in combinations(remaining_for_opponent, 2):
            # Full crib: 2 your discards + 2 opponent discards + starter = 5 cards
            crib_cards = [*discard, opp_discard1, opp_discard2, starter]
            crib_score = score_hand(crib_cards, is_crib=True)
            starter_scores.append(crib_score)
        
        # Average score for this starter over all opponent discard combinations
        if starter_scores:
            avg_for_starter = sum(starter_scores) / len(starter_scores)
            by_starter[starter] = avg_for_starter
            all_scores.extend(starter_scores)
        else:
            by_starter[starter] = 0.0

    if all_scores:
        avg_score = sum(all_scores) / len(all_scores)
        min_score = min(all_scores)
        max_score = max(all_scores)
    else:
        avg_score = min_score = max_score = 0.0

    return {
        "avg_score": avg_score,
        "min_score": min_score,
        "max_score": max_score,
        "by_starter": by_starter,
    }


def best_keep_from_six(
    six_cards: Iterable[str],
    *,
    is_crib: bool = False,
    my_crib: bool = True,
    include_crib: bool = True,
) -> dict:
    """
    Given 6 dealt cards, find the best 4‑card keep under expected scoring,
    considering both hand value and crib value of discards.

    This looks at all 15 ways to choose 4 cards from 6, and for each keep:
      - Computes starter_outcome_stats(keep, is_crib=is_crib, deck=remaining_deck)
      - Computes crib_outcome_stats(discard, deck=remaining_deck)
      - Combines hand avg_total with crib avg_score (maximize if my_crib, minimize if opponent's)
      - Returns the keep(s) with the highest combined expected value.

    Args:
        six_cards:
            Iterable of exactly 6 card codes, e.g.
            ["5C", "5D", "6H", "7S", "QC", "KD"].
        is_crib:
            Whether you are optimizing for your crib (`True`) or a regular hand (`False`).
        my_crib:
            If `True`, maximize crib value (you want good discards for your crib).
            If `False`, minimize crib value (you want bad discards for opponent's crib).
        include_crib:
            If `False`, skip crib evaluation and only compare hand values (much faster).
            Default `True` for full evaluation.

    Returns:
        A dict like:
        {
          "best_keep": ["5C", "5D", "6H", "7S"],
          "best_discard": ["QC", "KD"],
          "best_stats": { ... starter_outcome_stats for best keep ... },
          "best_crib_stats": { ... crib_outcome_stats for best discard ... },
          "combined_value": float,  # hand avg_total + (crib avg_score if my_crib, else -crib avg_score)
          "keeps": [
            {
              "keep": [...],
              "discard": [...],
              "stats": { ... },
              "crib_stats": { ... },
              "combined_value": float,
            },
            ...
          ],
        }
    """
    cards = [c.strip().upper() for c in six_cards]
    if len(cards) != 6:
        raise ValueError("best_keep_from_six expects exactly 6 cards")

    # Build deck for possible starters: full 52 minus these 6 cards.
    full_deck = [f"{r}{s}" for r in RANK_ORDER for s in "CDHS"]
    remaining_deck = [c for c in full_deck if c not in set(cards)]

    best_keep: List[str] | None = None
    best_stats: dict | None = None
    best_crib_stats: dict | None = None
    best_combined_value: float = float("-inf")
    keeps: List[dict] = []

    for keep_tuple in combinations(cards, 4):
        keep = list(keep_tuple)
        discard = [c for c in cards if c not in keep]
        stats = starter_outcome_stats(keep, is_crib=is_crib, deck=remaining_deck)
        
        if include_crib:
            crib_stats = crib_outcome_stats(discard, deck=remaining_deck, six_cards=cards)
            # Combined value: hand value + crib value (positive if my_crib, negative if opponent's)
            crib_contribution = crib_stats["avg_score"] if my_crib else -crib_stats["avg_score"]
            combined_value = stats["avg_total"] + crib_contribution
        else:
            # Skip crib evaluation - just use hand value
            crib_stats = None
            combined_value = stats["avg_total"]

        keeps.append(
            {
                "keep": keep,
                "discard": discard,
                "stats": {
                    "base_score": stats["base_score"],
                    "avg_total": stats["avg_total"],
                    "avg_delta": stats["avg_delta"],
                    "min_total": stats["min_total"],
                    "max_total": stats["max_total"],
                },
                "crib_stats": {
                    "avg_score": crib_stats["avg_score"] if crib_stats else 0,
                    "min_score": crib_stats["min_score"] if crib_stats else 0,
                    "max_score": crib_stats["max_score"] if crib_stats else 0,
                } if include_crib else None,
                "combined_value": combined_value,
            }
        )

        # Choose best based on combined value
        if best_keep is None or combined_value > best_combined_value:
            best_keep = keep
            best_stats = stats
            best_crib_stats = crib_stats
            best_combined_value = combined_value
        elif combined_value == best_combined_value and best_stats is not None:
            # Tie-breaker: prefer higher hand max_total
            if stats["max_total"] > best_stats["max_total"]:
                best_keep = keep
                best_stats = stats
                best_crib_stats = crib_stats
                best_combined_value = combined_value

    return {
        "best_keep": best_keep,
        "best_discard": [c for c in cards if best_keep and c not in best_keep],
        "best_stats": best_stats,
        "best_crib_stats": best_crib_stats,
        "combined_value": best_combined_value,
        "keeps": keeps,
    }


