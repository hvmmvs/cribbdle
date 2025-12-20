import React from 'react';
import {View, Dimensions} from 'react-native';
import Svg, {
  Rect,
  Line,
  Path,
  Circle,
  G,
  Text as SvgText,
} from 'react-native-svg';

const Chart = ({distribution, avgValue, chartType = 'line', height = 120}) => {
  if (!distribution || distribution.length === 0) {
    return null;
  }

  const width = Dimensions.get('window').width - 64; // Account for padding
  const margin = {top: 4, right: 6, bottom: 18, left: 24};

  const values = distribution
    .map(v => Number(v) || 0)
    .sort((a, b) => a - b);

  if (chartType === 'histogram') {
    const counts = {};
    values.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const bins = Object.keys(counts)
      .map(k => ({score: Number(k), count: counts[k]}))
      .sort((a, b) => a.score - b.score);

    const maxCount = Math.max(...bins.map(b => b.count), 1);
    const binWidth = (width - margin.left - margin.right) / bins.length;

    return (
      <Svg width={width} height={height}>
        <G>
          {bins.map((bin, i) => {
            const x = margin.left + i * binWidth;
            const barHeight = ((bin.count / maxCount) * (height - margin.top - margin.bottom));
            const y = height - margin.bottom - barHeight;
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={binWidth * 0.8}
                height={barHeight}
                fill="#0ea5e9"
              />
            );
          })}
          {typeof avgValue === 'number' && !isNaN(avgValue) && (
            <Line
              x1={margin.left + bins.findIndex(b => b.score === Math.round(avgValue)) * binWidth + binWidth / 2}
              x2={margin.left + bins.findIndex(b => b.score === Math.round(avgValue)) * binWidth + binWidth / 2}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}
        </G>
      </Svg>
    );
  }

  if (chartType === 'line') {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const points = values.map((v, i) => {
      const x = margin.left + (i / (values.length - 1 || 1)) * chartWidth;
      const y = margin.top + chartHeight - ((v - minValue) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <Svg width={width} height={height}>
        <G>
          <Path
            d={`M ${points.split(' ')[0]} ${points.split(' ').slice(1).map(p => `L ${p}`).join(' ')}`}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
          />
          {typeof avgValue === 'number' && !isNaN(avgValue) && (
            <Line
              x1={margin.left}
              x2={width - margin.right}
              y1={margin.top + chartHeight - ((avgValue - minValue) / range) * chartHeight}
              y2={margin.top + chartHeight - ((avgValue - minValue) / range) * chartHeight}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}
        </G>
      </Svg>
    );
  }

  if (chartType === 'box') {
    const q1 = values[Math.floor(values.length * 0.25)];
    const q2 = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const min = Math.max(values[0], q1 - 1.5 * iqr);
    const max = Math.min(values[values.length - 1], q3 + 1.5 * iqr);

    const xCenter = (margin.left + width - margin.right) / 2;
    const boxWidth = 40;
    const chartHeight = height - margin.top - margin.bottom;
    const valueRange = Math.max(max, values[values.length - 1]) - Math.min(min, values[0]) || 1;

    const scaleY = v => margin.top + chartHeight - ((v - Math.min(min, values[0])) / valueRange) * chartHeight;

    return (
      <Svg width={width} height={height}>
        <G>
          <Line
            x1={xCenter}
            x2={xCenter}
            y1={scaleY(min)}
            y2={scaleY(max)}
            stroke="#0ea5e9"
            strokeWidth="1.5"
          />
          <Rect
            x={xCenter - boxWidth / 2}
            y={scaleY(q3)}
            width={boxWidth}
            height={scaleY(q1) - scaleY(q3)}
            fill="#0ea5e9"
            stroke="#0284c7"
            strokeWidth="1"
          />
          <Line
            x1={xCenter - boxWidth / 2}
            x2={xCenter + boxWidth / 2}
            y1={scaleY(q2)}
            y2={scaleY(q2)}
            stroke="#ffffff"
            strokeWidth="2"
          />
          <Line
            x1={xCenter - boxWidth / 2}
            x2={xCenter + boxWidth / 2}
            y1={scaleY(min)}
            y2={scaleY(min)}
            stroke="#0ea5e9"
            strokeWidth="1.5"
          />
          <Line
            x1={xCenter - boxWidth / 2}
            x2={xCenter + boxWidth / 2}
            y1={scaleY(max)}
            y2={scaleY(max)}
            stroke="#0ea5e9"
            strokeWidth="1.5"
          />
          {values
            .filter(v => v < min || v > max)
            .map((v, i) => (
              <Circle
                key={i}
                cx={xCenter}
                cy={scaleY(v)}
                r={2}
                fill="#0ea5e9"
              />
            ))}
          {typeof avgValue === 'number' && !isNaN(avgValue) && (
            <Line
              x1={margin.left}
              x2={width - margin.right}
              y1={scaleY(avgValue)}
              y2={scaleY(avgValue)}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}
        </G>
      </Svg>
    );
  }

  return null;
};

export default Chart;

