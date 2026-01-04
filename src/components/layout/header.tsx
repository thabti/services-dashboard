"use client";

import { Bell, Grid3x3 } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors">
          <Bell className="size-5 text-text-secondary" />
        </button>
        <button className="p-2.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors">
          <Grid3x3 className="size-5 text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
