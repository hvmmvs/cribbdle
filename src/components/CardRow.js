import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import Card from './Card';

const CardRow = ({
  cards,
  selectedCards = [],
  onCardPress,
  matchCards = [],
  noMatchCards = [],
  scoringHighlightCards = [],
  showBack = false,
}) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {cards.map((card, index) => (
        <Card
          key={`${card}-${index}`}
          card={card}
          isSelected={selectedCards.includes(card)}
          onPress={() => onCardPress && onCardPress(card)}
          isMatch={matchCards.includes(card)}
          isNoMatch={noMatchCards.includes(card)}
          isScoringHighlight={scoringHighlightCards.includes(card)}
          showBack={showBack}
          style={styles.card}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 5,
  },
});

export default CardRow;

