import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const FeedbackBadge = ({message, type = 'info'}) => {
  if (!message) return null;

  const getStyle = () => {
    if (type === 'success') return [styles.badge, styles.success];
    return [styles.badge, styles.info];
  };

  const textStyle = type === 'success' ? styles.successText : styles.infoText;
  
  return (
    <View style={getStyle()}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: '#d1fae5',
  },
  info: {
    backgroundColor: '#f3f4f6',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  successText: {
    color: '#065f46',
  },
  infoText: {
    color: '#111827',
  },
});

export default FeedbackBadge;

