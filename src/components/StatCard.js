import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const StatCard = ({label, value, description, highlight = false, positive = false, negative = false}) => {
  const getValueStyle = () => {
    if (highlight) return [styles.value, styles.highlight];
    if (positive) return [styles.value, styles.positive];
    if (negative) return [styles.value, styles.negative];
    return styles.value;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={getValueStyle()}>{value}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
  },
  highlight: {
    color: '#0ea5e9',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#6b7280',
  },
  description: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 14,
  },
});

export default StatCard;

