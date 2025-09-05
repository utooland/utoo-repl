import type React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface PanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({ title, children, actions, style, contentStyle }) => {
  return (
    <Card 
      className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-border/50 rounded-none"
      style={style}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 h-12 px-4 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          {title}
        </h3>
        {actions && <div>{actions}</div>}
      </CardHeader>
      <CardContent 
        className="flex-1 overflow-auto p-0"
        style={contentStyle}
      >
        {children}
      </CardContent>
    </Card>
  );
};