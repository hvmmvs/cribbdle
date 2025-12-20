import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

// For React Native, we'll use the Flask server to serve images
// Update this to match your Flask server URL
const API_BASE_URL = 'http://localhost:5555';
const CARD_ASSET_BASE = `${API_BASE_URL}/assets/kenney_playing-cards-pack/PNG/Cards (large)`;
const CARD_BACK_PATH = `${CARD_ASSET_BASE}/card_back.png`;

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

const cardImagePath = card => {
  const rank = card[0];
  const suitCode = card[1];
  const suitNameMap = {
    C: 'clubs',
    D: 'diamonds',
    H: 'hearts',
    S: 'spades',
  };
  const suitName = suitNameMap[suitCode] || 'back';
  let rankPart;
  if (rank === 'A') rankPart = 'A';
  else if (rank === 'T') rankPart = '10';
  else if (rank === 'J' || rank === 'Q' || rank === 'K') rankPart = rank;
  else {
    rankPart = rank.padStart(2, '0');
  }
  // Return URL for Flask server
  return `${CARD_ASSET_BASE}/card_${suitName}_${rankPart}.png`;
};

const Card = ({
  card,
  isSelected = false,
  onPress,
  isMatch = false,
  isNoMatch = false,
  isScoringHighlight = false,
  showBack = false,
  style,
}) => {
  const [opacityAnim] = useState(new Animated.Value(showBack ? 0 : 1));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: showBack ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [showBack, opacityAnim]);

  useEffect(() => {
    if (isScoringHighlight) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isScoringHighlight, scaleAnim]);

  const getBorderColor = () => {
    if (isScoringHighlight) return '#10b981';
    if (isMatch) return '#10b981';
    if (isNoMatch) return '#ef4444';
    if (isSelected) return '#0ea5e9';
    return '#d1d5db';
  };

  const getBackgroundColor = () => {
    if (isSelected) return '#e0f2fe';
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            transform: [{scale: scaleAnim}],
            shadowColor: isSelected || isScoringHighlight ? '#000' : '#000',
            shadowOpacity: isSelected || isScoringHighlight ? 0.25 : 0.08,
            shadowRadius: isSelected || isScoringHighlight ? 8 : 3,
            shadowOffset: {width: 0, height: 3},
            elevation: isSelected || isScoringHighlight ? 8 : 2,
          },
          isScoringHighlight && styles.scoringHighlight,
        ]}>
        {showBack ? (
          <Animated.View
            style={[
              styles.cardBack,
              {
                opacity: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}>
            <Image
              source={{uri: CARD_BACK_PATH}}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.cardFront,
              {
                opacity: opacityAnim,
              },
            ]}>
            <Image
              source={{uri: cardImagePath(card)}}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Text style={styles.cardCode}>{card}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 70,
    maxWidth: 80,
    aspectRatio: 0.7,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 3},
  },
  cardFront: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '80%',
    borderRadius: 8,
  },
  cardCode: {
    marginTop: 4,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  scoringHighlight: {
    borderWidth: 3,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
});

export default Card;

