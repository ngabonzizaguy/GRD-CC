'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import {
  approveKycReview,
  listKycReviews,
  rejectKycReview,
} from '@cco/services/lmx/lmx-kyc';
import type { LmxIdentityItem, LmxIdentityStatus } from '@cco/types/identity';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export function LmxKycReviews() {
  const [items, setItems] = useState<LmxIdentityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LmxIdentityStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listKycReviews({ status, page, limit: PAGE_SIZE });
    if (res.ok) {
      setItems(res.data.records);
      setTotal(res.data.total);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onApprove = async (item: LmxIdentityItem) => {
    if (
      !confirm(
        `Approve KYC for ${item.first_name} ${item.last_name}? This also verifies their vehicle.`
      )
    ) {
      return;
    }
    setBusyId(item.identity_id);
    const res = await approveKycReview(item.identity_id, 'Approved via Command Center');
    if (res.ok) {
      toast.success('KYC approved');
      void load();
    } else {
      toast.error(res.message);
    }
    setBusyId(null);
  };

  const onReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      toast.error('Reject reason is required');
      return;
    }
    setBusyId(rejectId);
    const res = await rejectKycReview(rejectId, rejectReason.trim());
    if (res.ok) {
      toast.success('KYC rejected');
      setRejectId(null);
      setRejectReason('');
      void load();
    } else {
      toast.error(res.message);
    }
    setBusyId(null);
  };

  return (
    <LmxBlock
      title="KYC queue"
      description="Approve, reject, or hide the KYC nav item above. Reviews sync with the main admin Identities page."
      icon={ShieldCheck}
      action={
        <button
          type="button"
          className="lmx-btn-ghost px-2 py-1"
          onClick={() => load()}
          disabled={loading}
          aria-label="Refresh KYC list"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected', 'expired'] as LmxIdentityStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            className="lmx-btn-ghost text-xs capitalize"
            data-checked={status === s}
            style={
              status === s
                ? { background: 'var(--lmx-canvas-soft-2)', color: 'var(--lmx-ink)', fontWeight: 500 }
                : undefined
            }
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm" style={{ color: 'var(--lmx-mute)' }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reviews…
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm" style={{ color: 'var(--lmx-mute)' }}>
          No {status} KYC submissions.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.identity_id}
              className="rounded-lg border px-3 py-3"
              style={{ borderColor: 'var(--lmx-hairline)', background: 'var(--lmx-canvas-soft)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--lmx-ink)' }}>
                    {item.first_name} {item.last_name}
                  </p>
                  <p className="text-xs lmx-mono mt-0.5" style={{ color: 'var(--lmx-mute)' }}>
                    {item.id_type} · {item.id_number} · {item.user_id}
                  </p>
                  {item.reject_reason ? (
                    <p className="mt-1 text-xs" style={{ color: 'var(--lmx-error)' }}>
                      {item.reject_reason}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {item.front_image_url ? (
                    <a
                      href={item.front_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lmx-btn-ghost px-2 py-1 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        className="lmx-btn-ghost px-2 py-1 text-xs"
                        disabled={busyId === item.identity_id}
                        onClick={() => onApprove(item)}
                      >
                        {busyId === item.identity_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" style={{ color: '#0cce6b' }} />
                        )}
                      </button>
                      <button
                        type="button"
                        className="lmx-btn-ghost px-2 py-1 text-xs"
                        disabled={busyId === item.identity_id}
                        onClick={() => {
                          setRejectId(item.identity_id);
                          setRejectReason('');
                        }}
                      >
                        <XCircle className="h-4 w-4" style={{ color: 'var(--lmx-error)' }} />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-2 text-sm" style={{ color: 'var(--lmx-body)' }}>
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="lmx-btn-ghost px-2 py-1"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="lmx-btn-ghost px-2 py-1"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {rejectId ? (
        <div
          className="mt-4 rounded-lg border p-4 space-y-3"
          style={{ borderColor: 'var(--lmx-hairline)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
            Reject KYC
          </p>
          <textarea
            className="lmx-input min-h-[80px] w-full resize-y"
            placeholder="Reason shown to the driver…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="lmx-btn-primary text-sm" onClick={() => onReject()}>
              Confirm reject
            </button>
            <button
              type="button"
              className="lmx-btn-ghost text-sm"
              onClick={() => {
                setRejectId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </LmxBlock>
  );
}
