import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  actions,
  style,
  contentStyle,
}) => {
  const [panelId, setPanelId] = useState<string>("");

  useEffect(() => {
    setPanelId(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  return (
    <Card
      className="flex flex-col bg-slate-950/40 backdrop-blur-xl rounded-none border-y-0 border-l-0 border-r border-white/5 h-full overflow-hidden last:border-r-0 relative group"
      style={style}
    >
      {/* Panel Decals - Moved to bottom for better visibility without overlap */}
      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-800 select-none pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity uppercase tracking-widest z-0">
        {panelId ? `REF_${panelId}` : ""}
      </div>

      {/* HUD Corner Accents */}
      <div className="corner-tl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="corner-tr opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="corner-bl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="corner-br opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 h-10 py-1 px-4 border-b border-white/5 bg-white/5 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-purple-500 rounded-full" />
          <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em] select-none">
            {title}
          </h3>
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0 scrollbar-hide bg-cyber-grid" style={contentStyle}>
        {children}
      </CardContent>
    </Card>
  );
};
