'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthForm({ title, subtitle, children }: AuthFormProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              SecureOps
            </h1>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Security Analytics Platform v2.0</p>
        </div>
      </motion.div>
    </div>
  );
}
