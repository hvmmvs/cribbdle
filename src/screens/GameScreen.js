import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CardRow from '../components/CardRow';
import StatsSection from '../components/StatsSection';
import HelpModal from '../components/HelpModal';
import FeedbackBadge from '../components/FeedbackBadge';

// Update this URL based on your setup:
// - iOS Simulator: http://localhost:5555
// - Android Emulator: http://10.0.2.2:5555
// - Physical Device: http://YOUR_COMPUTER_IP:5555
const API_BASE_URL = 'http://localhost:5555';

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const GameScreen = () => {
  const [currentCards, setCurrentCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [bestKeepCards, setBestKeepCards] = useState(null);
  const [userSelectedHand, setUserSelectedHand] = useState(null);
  const [handStats, setHandStats] = useState(null);
  const [cribStats, setCribStats] = useState(null);
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState({message: '', type: 'info'});
  const [loading, setLoading] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [scoringHighlightCards, setScoringHighlightCards] = useState([]);

  useEffect(() => {
    fetchDeal();
  }, []);

  const normalizeHandByRanks = hand => {
    return hand
      .map(c => c.trim().toUpperCase()[0])
      .sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
  };

  const fetchDeal = async () => {
    setLoading(true);
    setStatus('Dealing six cards…');
    clearStats();
    try {
      const res = await fetch(`${API_BASE_URL}/api/deal`);
      if (!res.ok) throw new Error('Deal failed');
      const data = await res.json();
      const cards = (data.cards || []).slice();
      cards.sort((a, b) => {
        const ra = a[0];
        const rb = b[0];
        return RANK_ORDER.indexOf(ra) - RANK_ORDER.indexOf(rb);
      });
      setCurrentCards(cards);
      setSelectedCards([]);
      setStatus('Pick any four cards, then score the hand.');
    } catch (err) {
      console.error(err);
      setStatus('Could not deal cards. Try reloading the page.');
      Alert.alert('Error', 'Could not deal cards. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const clearStats = () => {
    setHandStats(null);
    setCribStats(null);
    setBestKeepCards(null);
    setUserSelectedHand(null);
    setFeedback({message: '', type: 'info'});
    setScoringHighlightCards([]);
  };

  const handleCardPress = card => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const submitScore = async () => {
    if (selectedCards.length !== 4) {
      setStatus('Please select exactly four cards before scoring.');
      Alert.alert('Error', 'Please select exactly four cards before scoring.');
      return;
    }

    setLoading(true);
    setStatus('Scoring hand…');
    setCribStats(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/score`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          hand: selectedCards,
          six_cards: currentCards,
          is_crib: false,
          my_crib: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Scoring failed');
      }

      setHandStats({
        baseScore: data.base_score,
        avgTotal: data.avg_total,
        avgDelta: data.avg_delta,
        minTotal: data.min_total,
        maxTotal: data.max_total,
        distribution: data.hand_distribution,
      });

      setBestKeepCards(data.best_keep);
      setUserSelectedHand(selectedCards);

      if (data.is_optimal) {
        setFeedback({message: 'Perfect! This is the optimal keep', type: 'success'});
      } else {
        setFeedback({
          message: `Optimal keep shown below (expected ${data.best_avg_total.toFixed(1)} points)`,
          type: 'info',
        });
      }

      setStatus('Computing crib stats…');

      // Fetch crib stats in background
      try {
        const cribRes = await fetch(`${API_BASE_URL}/api/score/crib`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            hand: selectedCards,
            six_cards: currentCards,
          }),
        });

        const cribData = await cribRes.json();
        if (cribRes.ok && cribData.crib_stats) {
          setCribStats({
            avgScore: cribData.crib_stats.avg_score,
            minScore: cribData.crib_stats.min_score,
            maxScore: cribData.crib_stats.max_score,
            distribution: cribData.crib_stats.distribution,
          });
        }
      } catch (cribErr) {
        console.error('Crib stats error:', cribErr);
      }

      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Error while scoring hand.');
      Alert.alert('Error', err.message || 'Error while scoring hand.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchCards = () => {
    if (!bestKeepCards || !userSelectedHand) return [];
    const userRanks = normalizeHandByRanks(userSelectedHand);
    const bestRanks = normalizeHandByRanks(bestKeepCards);
    const userRankCounts = {};
    userSelectedHand.forEach(card => {
      const rank = card.trim().toUpperCase()[0];
      userRankCounts[rank] = (userRankCounts[rank] || 0) + 1;
    });
    const matchedRanks = {};
    return bestKeepCards.filter(card => {
      const rank = card.trim().toUpperCase()[0];
      const userCount = userRankCounts[rank] || 0;
      const matchedCount = matchedRanks[rank] || 0;
      if (userCount > matchedCount) {
        matchedRanks[rank] = matchedCount + 1;
        return true;
      }
      return false;
    });
  };

  const getNoMatchCards = () => {
    if (!bestKeepCards || !userSelectedHand) return [];
    const matchCards = getMatchCards();
    return bestKeepCards.filter(card => !matchCards.includes(card));
  };

  const handStatsData = handStats
    ? [
        {
          label: 'Hand Value',
          value: handStats.baseScore.toFixed(0),
          description: 'Your 4 cards without flipped card',
        },
        {
          label: 'Expected Score',
          value: handStats.avgTotal.toFixed(1),
          description: 'Average across all possible flipped cards',
          highlight: true,
        },
        {
          label: 'Flipped Card Bonus',
          value: handStats.avgDelta >= 0 ? `+${handStats.avgDelta.toFixed(1)}` : handStats.avgDelta.toFixed(1),
          description: 'Average points added by flipped card',
          positive: true,
        },
        {
          label: 'Best Case',
          value: handStats.maxTotal.toFixed(0),
          description: 'Highest possible score',
          positive: true,
        },
        {
          label: 'Worst Case',
          value: handStats.minTotal.toFixed(0),
          description: 'Lowest possible score',
          negative: true,
        },
      ]
    : [];

  const cribStatsData = cribStats
    ? [
        {
          label: 'Expected Crib',
          value: cribStats.avgScore.toFixed(1),
          description: 'Average score from your discards',
          highlight: true,
        },
        {
          label: 'Minimum',
          value: cribStats.minScore.toFixed(0),
          description: 'Lowest possible crib score',
          negative: true,
        },
        {
          label: 'Maximum',
          value: cribStats.maxScore.toFixed(0),
          description: 'Highest possible crib score',
          positive: true,
        },
      ]
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Cribbdle
          <TouchableOpacity
            onPress={() => setHelpModalVisible(true)}
            style={styles.helpIcon}>
            <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>
        </Text>
        <Text style={styles.subtitle}>
          Choose four of the six cards, then score the hand to see how much the
          flipped card can help or hurt.
        </Text>
      </View>

      <CardRow
        cards={currentCards}
        selectedCards={selectedCards}
        onCardPress={handleCardPress}
        scoringHighlightCards={scoringHighlightCards}
      />

      {bestKeepCards && (
        <View style={styles.bestKeepSection}>
          <Text style={styles.bestKeepTitle}>Optimal keep</Text>
          <CardRow
            cards={bestKeepCards}
            matchCards={getMatchCards()}
            noMatchCards={getNoMatchCards()}
            showBack={false}
          />
        </View>
      )}

      <Text style={styles.hint}>
        You can select up to four cards. Tap again to deselect. The order doesn't matter.
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={submitScore}
          disabled={loading || selectedCards.length !== 4}>
          <Text style={styles.buttonText}>Score selected hand</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={fetchDeal}
          disabled={loading}>
          <Text style={styles.buttonText}>Re‑deal 6 new cards</Text>
        </TouchableOpacity>
      </View>

      {status ? (
        <Text style={[styles.status, loading && styles.statusLoading]}>
          {status}
        </Text>
      ) : null}

      {loading && <ActivityIndicator size="large" color="#0ea5e9" />}

      <FeedbackBadge message={feedback.message} type={feedback.type} />

      {handStats && (
        <StatsSection
          title="Hand Analysis"
          stats={handStatsData}
          distribution={handStats.distribution}
          avgValue={handStats.avgTotal}
        />
      )}

      {cribStats && (
        <StatsSection
          title="Crib Analysis"
          stats={cribStatsData}
          distribution={cribStats.distribution}
          avgValue={cribStats.avgScore}
        />
      )}

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
    color: '#111827',
  },
  helpIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  helpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  bestKeepSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  bestKeepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#9ca3af',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
  },
  buttonText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  status: {
    fontSize: 13,
    marginBottom: 4,
    minHeight: 20,
    color: '#6b7280',
  },
  statusLoading: {
    color: '#0ea5e9',
  },
});

export default GameScreen;

