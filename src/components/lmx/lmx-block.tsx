'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface LmxBlockProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}

export function LmxBlock({ title, description, icon: Icon, children, action }: LmxBlockProps) {
  return (
    <section className="lmx-card overflow-hidden">
      <header
        className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4"
        style={{ borderColor: 'var(--lmx-hairline)' }}
      >
        <div>
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--lmx-ink)' }}>
            {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
            {title}
          </div>
          {description ? (
            <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
