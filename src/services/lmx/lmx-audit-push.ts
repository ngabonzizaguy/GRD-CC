import { appendActivity, type LmxAuditMeta } from '@cco/services/lmx/lmx-s9';


export function pushLmxAudit(action: string, meta?: LmxAuditMeta): void {
  appendActivity(action, meta?.detail, meta);
}
