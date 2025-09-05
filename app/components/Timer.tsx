import type React from 'react';
import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (time: number) => void;
  format?: 'seconds' | 'milliseconds';
  style?: React.CSSProperties;
}

export const Timer: React.FC<TimerProps> = ({
  isRunning,
  onTimeUpdate,
  format = 'seconds',
  style = {},
}) => {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time * (format === 'seconds' ? 1000 : 1);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newTime = format === 'seconds' ? elapsed / 1000 : elapsed;
        setTime(newTime);
        onTimeUpdate?.(newTime);
      }, format === 'seconds' ? 100 : 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, format, onTimeUpdate, time]);

  const formatTime = (time: number): string => {
    if (format === 'seconds') {
      if (time < 60) {
        return `${time.toFixed(1)}s`;
      } else {
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toFixed(1);
        return `${minutes}m ${seconds}s`;
      }
    } else {
      return `${Math.round(time)}ms`;
    }
  };

  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: 500,
        ...style,
      }}
    >
      {formatTime(time)}
    </span>
  );
};
