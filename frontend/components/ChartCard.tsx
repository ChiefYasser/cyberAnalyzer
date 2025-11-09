'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  value?: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  children?: ReactNode;
  icon?: ReactNode;
}

export default function ChartCard({
  title,
  value,
  change,
  changeType = 'neutral',
  children,
  icon,
}: ChartCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
          {value && (
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
          )}
          {change && (
            <div className={`text-sm ${changeColors[changeType]}`}>{change}</div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
            {icon}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
