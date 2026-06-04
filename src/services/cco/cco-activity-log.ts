import { appendActivity, type CcoActivityMeta } from '@cco/services/cco/cco-activity.service';

/** Record a privileged CCo action (action key: `cco.<feature>.<verb>`). */
export function recordCcoActivity(action: string, meta?: CcoActivityMeta): void {
  appendActivity(action, meta?.detail, meta);
}
