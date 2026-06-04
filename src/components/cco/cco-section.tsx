'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface CcoSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}

export function CcoSection({ title, description, icon: Icon, children, action }: CcoSectionProps) {
  return (
    <section className="cco-card overflow-hidden">
      <header
        className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4"
        style={{ borderColor: 'var(--cco-hairline)' }}
      >
        <div>
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--cco-ink)' }}>
            {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
            {title}
          </div>
          {description ? (
            <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
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
