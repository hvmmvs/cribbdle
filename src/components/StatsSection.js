import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import StatCard from './StatCard';
import Chart from './Chart';

const StatsSection = ({
  title,
  stats,
  distribution,
  avgValue,
  chartType: initialChartType = 'line',
}) => {
  const [chartType, setChartType] = useState(initialChartType);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.gridItem}>
            <StatCard
              label={stat.label}
              value={stat.value}
              description={stat.description}
              highlight={stat.highlight}
              positive={stat.positive}
              negative={stat.negative}
            />
          </View>
        ))}
      </View>
      <View style={styles.chartControls}>
        <TouchableOpacity
          style={[
            styles.chartToggle,
            chartType === 'histogram' && styles.chartToggleActive,
          ]}
          onPress={() => setChartType('histogram')}>
          <Text
            style={[
              styles.chartToggleText,
              chartType === 'histogram' && styles.chartToggleTextActive,
            ]}>
            Histogram
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chartToggle,
            chartType === 'line' && styles.chartToggleActive,
          ]}
          onPress={() => setChartType('line')}>
          <Text
            style={[
              styles.chartToggleText,
              chartType === 'line' && styles.chartToggleTextActive,
            ]}>
            Line
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chartToggle,
            chartType === 'box' && styles.chartToggleActive,
          ]}
          onPress={() => setChartType('box')}>
          <Text
            style={[
              styles.chartToggleText,
              chartType === 'box' && styles.chartToggleTextActive,
            ]}>
            Box Plot
          </Text>
        </TouchableOpacity>
      </View>
      {distribution && (
        <View style={styles.chartContainer}>
          <Chart
            distribution={distribution}
            avgValue={avgValue}
            chartType={chartType}
            height={120}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    fontSize: 13,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  chartControls: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  chartToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  chartToggleActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
  },
  chartToggleText: {
    fontSize: 11,
    color: '#111827',
  },
  chartToggleTextActive: {
    color: '#f9fafb',
  },
  chartContainer: {
    marginTop: 8,
    height: 120,
  },
});

export default StatsSection;

