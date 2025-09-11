import type React from 'react';

interface TimerProps {
  time: number;
  format?: 'seconds' | 'milliseconds';
  style?: React.CSSProperties;
}

export const Timer: React.FC<TimerProps> = ({
  time,
  format = 'seconds',
  style = {},
}) => {
  const formatTime = (time: number): string => {
    if (format === 'seconds') {
      const timeInSeconds = time / 1000;
      if (timeInSeconds < 60) {
        return `${timeInSeconds.toFixed(3)}s`;
      } else {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = (timeInSeconds % 60).toFixed(3);
        return `${minutes}m ${seconds}s`;
      }
    } else {
      return `${Math.round(time)}ms`;
    }
  };

  return (
    <span
      style={{
        fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", "Cascadia Code", "SF Mono", Monaco, monospace',
        fontSize: '0.875rem',
        color: '#cbd5e1',
        fontWeight: 500,
        ...style,
      }}
    >
      {formatTime(time)}
    </span>
  );
};
