import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import CardRow from './CardRow';

const HelpModal = ({visible, onClose}) => {
  const examplePairs = ['5H', '5D'];
  const exampleThreeKind = ['7C', '7D', '7S'];
  const exampleFourKind = ['JC', 'JD', 'JH', 'JS'];
  const exampleRun3 = ['5C', '6D', '7H'];
  const exampleRun4 = ['4C', '5D', '6H', '7S'];
  const exampleRun5 = ['3C', '4D', '5H', '6S', '7C'];
  const exampleFlush4 = ['2H', '5H', '8H', 'KH'];
  const exampleNobs = ['JH', 'AH', '5H', '9H'];
  const example15 = ['5C', 'KD', '7H', '8S'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>How Cribbage Hands Are Scored</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.paragraph}>
              In cribbage, you score points by finding combinations in your 4-card hand plus the starter card (5 cards total).
            </Text>

            <Text style={styles.sectionTitle}>1. Pairs</Text>
            <Text style={styles.paragraph}>Two cards of the same rank = 2 points</Text>
            <CardRow cards={examplePairs} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: Two 5s = 2 points</Text>

            <Text style={styles.sectionTitle}>2. Three of a Kind</Text>
            <Text style={styles.paragraph}>Three cards of the same rank = 6 points</Text>
            <CardRow cards={exampleThreeKind} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: Three 7s = 6 points</Text>

            <Text style={styles.sectionTitle}>3. Four of a Kind</Text>
            <Text style={styles.paragraph}>Four cards of the same rank = 12 points</Text>
            <CardRow cards={exampleFourKind} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: Four Jacks = 12 points</Text>

            <Text style={styles.sectionTitle}>4. Runs</Text>
            <Text style={styles.paragraph}>Three or more consecutive ranks = 1 point per card</Text>
            <CardRow cards={exampleRun3} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: 5-6-7 = 3 points</Text>
            <CardRow cards={exampleRun4} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: 4-5-6-7 = 4 points</Text>
            <CardRow cards={exampleRun5} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: 3-4-5-6-7 = 5 points</Text>

            <Text style={styles.sectionTitle}>5. Flushes</Text>
            <Text style={styles.paragraph}>Four cards of the same suit (in hand) = 4 points</Text>
            <Text style={styles.paragraph}>Five cards of the same suit (hand + starter) = 5 points</Text>
            <CardRow cards={exampleFlush4} showBack={false} />
            <Text style={styles.exampleExplanation}>Example: Four hearts in hand = 4 points</Text>

            <Text style={styles.sectionTitle}>6. His Nobs</Text>
            <Text style={styles.paragraph}>Jack of the same suit as the starter card = 1 point</Text>
            <CardRow cards={exampleNobs} showBack={false} />
            <Text style={styles.exampleExplanation}>
              Example: Hand has Jack of hearts, starter is Queen of hearts = 1 point
            </Text>

            <Text style={styles.sectionTitle}>7. 15s</Text>
            <Text style={styles.paragraph}>Any combination of cards that add up to 15 = 2 points</Text>
            <CardRow cards={example15} showBack={false} />
            <Text style={styles.exampleExplanation}>
              Example: 5 + King = 15 (2 points), or 7 + 8 = 15 (2 points). Multiple 15s can be scored!
            </Text>

            <Text style={styles.sectionTitle}>Important Notes</Text>
            <Text style={styles.paragraph}>
              • Cards can be used in multiple combinations (e.g., a pair can also be part of a run)
            </Text>
            <Text style={styles.paragraph}>
              • Face cards (J, Q, K) are worth 10 points for 15s
            </Text>
            <Text style={styles.paragraph}>
              • Aces are worth 1 point for 15s
            </Text>
            <Text style={styles.paragraph}>
              • All combinations are counted, so a hand can score many points!
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    maxWidth: 600,
    width: '100%',
    maxHeight: '90%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#111827',
  },
  paragraph: {
    marginBottom: 16,
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
  },
  exampleExplanation: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
    marginBottom: 16,
  },
});

export default HelpModal;

