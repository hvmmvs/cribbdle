from __future__ import annotations

import random
from typing import List

from flask import Blueprint, jsonify, request

from gameplay import best_keep_from_six, crib_outcome_stats, get_scoring_breakdown, starter_outcome_stats


bp = Blueprint("main", __name__)


RANKS = "A23456789TJQK"
SUITS = "CDHS"


def _build_deck() -> List[str]:
    return [f"{r}{s}" for r in RANKS for s in SUITS]


def _normalize_hand_by_ranks(hand: List[str]) -> List[str]:
    """
    Normalize a hand by extracting just the ranks, sorted.
    This allows comparison of equivalent hands regardless of suits.
    For example: ["5C", "5D", "6H", "7S"] and ["5H", "5S", "6C", "7D"]
    both normalize to ["5", "5", "6", "7"] and are considered equivalent.
    """
    ranks = [c.strip().upper()[0] for c in hand]
    return sorted(ranks)


def _hands_are_equivalent(hand1: List[str], hand2: List[str]) -> bool:
    """
    Check if two hands are equivalent (same ranks, regardless of suits).
    """
    return _normalize_hand_by_ranks(hand1) == _normalize_hand_by_ranks(hand2)


@bp.route("/", methods=["GET"])
def index():
    """API health check endpoint."""
    return jsonify({"status": "ok", "message": "Cribbdle API is running"})


@bp.route("/api/deal", methods=["GET"])
def api_deal():
    """Deal 6 random distinct cards from a fresh deck."""
    deck = _build_deck()
    random.shuffle(deck)
    cards = deck[:6]
    return jsonify({"cards": cards})


@bp.route("/api/score", methods=["POST"])
def api_score():
    """
    Score a chosen 4-card hand and report starter-outcome stats.
    Also compares the selection to the optimal keep from the 6 cards.
    This endpoint returns hand stats quickly, without crib stats.

    Expects JSON like:
        {
          "hand": ["5C", "5D", "6H", "7S"],
          "six_cards": ["5C", "5D", "6H", "7S", "QC", "KD"],
          "is_crib": false,
          "my_crib": true  # true if it's your crib, false if opponent's
        }
    """
    data = request.get_json(silent=True) or {}
    hand = data.get("hand") or []
    six_cards = data.get("six_cards") or []
    is_crib = bool(data.get("is_crib", False))
    my_crib = bool(data.get("my_crib", True))  # Default to your crib

    if not isinstance(hand, list) or len(hand) != 4:
        return (
            jsonify(
                {
                    "error": "Request must include 'hand' as a list of 4 card codes, e.g. ['5C','5D','6H','7S']."
                }
            ),
            400,
        )

    if not isinstance(six_cards, list) or len(six_cards) != 6:
        return (
            jsonify(
                {
                    "error": "Request must include 'six_cards' as a list of 6 card codes."
                }
            ),
            400,
        )

    try:
        # Get stats for the user's selected hand (fast)
        stats = starter_outcome_stats(hand, is_crib=is_crib)
        
        # Find the best keep from the 6 cards (skip crib evaluation for speed)
        best_result = best_keep_from_six(six_cards, is_crib=is_crib, my_crib=my_crib, include_crib=False)
        best_keep = best_result["best_keep"]
        
        # Check if hands are equivalent (same ranks, regardless of suits)
        is_optimal = _hands_are_equivalent(hand, best_keep)
        
        # Return hand stats immediately (without crib stats)
        response = {
            "base_score": stats["base_score"],
            "min_total": stats["min_total"],
            "max_total": stats["max_total"],
            "avg_total": stats["avg_total"],
            "avg_delta": stats["avg_delta"],
            "hand_distribution": [
                v["total"] for v in stats["by_starter"].values()
            ],  # Distribution of 5-card scores across all starters
            "is_optimal": is_optimal,
            "best_keep": best_keep,
            "best_avg_total": best_result["best_stats"]["avg_total"],
            "discard": [c for c in six_cards if c not in hand],
        }

        return jsonify(response)
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 400


@bp.route("/api/score/crib", methods=["POST"])
def api_score_crib():
    """
    Calculate crib stats for discarded cards. This is slower as it evaluates
    all possible opponent discards.

    Expects JSON like:
        {
          "hand": ["5C", "5D", "6H", "7S"],
          "six_cards": ["5C", "5D", "6H", "7S", "QC", "KD"],
        }
    """
    data = request.get_json(silent=True) or {}
    hand = data.get("hand") or []
    six_cards = data.get("six_cards") or []

    if not isinstance(hand, list) or len(hand) != 4:
        return (
            jsonify(
                {
                    "error": "Request must include 'hand' as a list of 4 card codes."
                }
            ),
            400,
        )

    if not isinstance(six_cards, list) or len(six_cards) != 6:
        return (
            jsonify(
                {
                    "error": "Request must include 'six_cards' as a list of 6 card codes."
                }
            ),
            400,
        )

    try:
        # Calculate crib stats for the discarded cards (slow)
        discard = [c for c in six_cards if c not in hand]
        crib_stats = crib_outcome_stats(discard, six_cards=six_cards)
        
        response = {
            "crib_stats": {
                "avg_score": crib_stats["avg_score"],
                "min_score": crib_stats["min_score"],
                "max_score": crib_stats["max_score"],
                "distribution": list(crib_stats["by_starter"].values()),
            },
        }

        return jsonify(response)
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 400


@bp.route("/api/score/breakdown", methods=["POST"])
def api_score_breakdown():
    """
    Get detailed scoring breakdown for a hand.
    
    Expects JSON like:
        {
          "hand": ["5C", "5D", "6H", "7S"],
          "is_crib": false
        }
    """
    data = request.get_json(silent=True) or {}
    hand = data.get("hand") or []
    is_crib = bool(data.get("is_crib", False))
    
    if not isinstance(hand, list) or len(hand) != 4:
        return (
            jsonify(
                {
                    "error": "Request must include 'hand' as a list of 4 card codes."
                }
            ),
            400,
        )
    
    try:
        breakdown = get_scoring_breakdown(hand, is_crib=is_crib)
        return jsonify(breakdown)
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 400


