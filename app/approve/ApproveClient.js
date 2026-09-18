'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  APPROVE_BATCH_URL,
  buildDecisionMailto,
  buildVerifyLinks,
  countBy,
  formatBatchDate,
  formatCountLine,
  formatStatusLabel,
  getLeadDecision,
  readDecisionStore,
  statusTone,
  isApprovalProxyConfigured,
  storeLeadDecision,
  submitLeadDecision,
  openMailto,
} from '../../src/utils/approve';
import './approve.css';

function contactLine(lead) {
  const parts = [lead.phone, lead.email].filter(Boolean);
  return parts.join(' · ');
}

function LeadCard({
  lead,
  index,
  decision,
  busy,
  mailtoHref,
  error,
  onDecide,
}) {
  const statusLabel = formatStatusLabel(
    decision?.action === 'approve'
      ? 'accepted'
      : decision?.action === 'skip'
        ? 'skipped'
        : lead.status,
  );
  const tone = statusTone(
    decision?.action === 'approve'
      ? 'accept'
      : decision?.action === 'skip'
        ? 'skip'
        : lead.status,
  );
  const links = buildVerifyLinks(lead);
  const contact = contactLine(lead);
  const done = Boolean(decision);

  return (
    <article
      className={`approve-card${done ? ' is-done' : ''}`}
      aria-labelledby={`lead-${lead.id}-name`}
    >
      <div className="approve-name" id={`lead-${lead.id}-name`}>
        {index + 1}. {lead.business_name}{' '}
        <span className={`approve-pill approve-pill-${tone}`}>{statusLabel}</span>
      </div>
      <div className="approve-meta">
        {[lead.niche, lead.city].filter(Boolean).join(' · ')}
      </div>
      {contact ? (
        <div className="approve-phone">
          {lead.phone ? (
            <a href={`tel:${String(lead.phone).replace(/[^\d+]/g, '')}`}>
              {lead.phone}
            </a>
          ) : null}
          {lead.phone && lead.email ? ' · ' : null}
          {lead.email ? (
            <a href={`mailto:${lead.email}`}>{lead.email}</a>
          ) : null}
        </div>
      ) : null}

      {lead.why ? (
        <>
          <div className="approve-label">Why we&apos;re contacting</div>
          <div className="approve-why">{lead.why}</div>
        </>
      ) : null}

      {links.length > 0 ? (
        <>
          <div className="approve-label">Verify</div>
          <div className="approve-verify">
            {links.map((link) => (
              <a
                key={`${lead.id}-${link.label}`}
                className="approve-verify-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </>
      ) : null}

      {done ? (
        <>
          <div
            className={`approve-done-bar is-${decision.action === 'skip' ? 'skip' : 'accept'}`}
          >
            Done — {decision.action === 'skip' ? 'skipped' : 'accepted'}
          </div>
          {mailtoHref ? (
            <p className="approve-mailto">
              Proxy is not configured, so this tap emailed Allen instead.{' '}
              <a href={mailtoHref}>Open email again</a>
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div className="approve-actions">
            <button
              type="button"
              className="approve-btn approve-btn-accept"
              disabled={busy}
              onClick={() => onDecide(lead, 'approve')}
            >
              {busy ? 'Saving…' : 'Accept'}
            </button>
            <button
              type="button"
              className="approve-btn approve-btn-skip"
              disabled={busy}
              onClick={() => onDecide(lead, 'skip')}
            >
              Skip
            </button>
          </div>
          {error ? <p className="approve-error">{error}</p> : null}
        </>
      )}
    </article>
  );
}

export default function ApproveClient() {
  const [batch, setBatch] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [store, setStore] = useState({});
  const [busyId, setBusyId] = useState('');
  const [mailtoByLead, setMailtoByLead] = useState({});
  const [errorsByLead, setErrorsByLead] = useState({});
  const proxyConfigured = isApprovalProxyConfigured();

  useEffect(() => {
    const previousBackground = document.body.style.backgroundColor;
    const previousColor = document.body.style.color;
    document.body.style.backgroundColor = '#f1f5f9';
    document.body.style.color = '#1e293b';
    return () => {
      document.body.style.backgroundColor = previousBackground;
      document.body.style.color = previousColor;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(APPROVE_BATCH_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('batch-load-failed');
        const data = await response.json();
        if (cancelled) return;
        setBatch(data);
        setStore(readDecisionStore());
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const leads = Array.isArray(batch?.leads) ? batch.leads : [];
  const batchId = batch?.batch_id || '';

  const stats = useMemo(() => {
    const ready = leads.filter((lead) =>
      formatStatusLabel(lead.status).includes('ready'),
    ).length;
    const researching = leads.filter((lead) =>
      formatStatusLabel(lead.status).includes('research'),
    ).length;
    const niches = countBy(leads, (lead) => lead.niche);
    const decisions = leads.map((lead) =>
      getLeadDecision(store, batchId, lead.id),
    );
    const accepted = decisions.filter((d) => d?.action === 'approve').length;
    const skipped = decisions.filter((d) => d?.action === 'skip').length;
    const remaining = leads.length - accepted - skipped;
    return { ready, researching, niches, accepted, skipped, remaining };
  }, [leads, store, batchId]);

  const handleDecide = useCallback(
    async (lead, action) => {
      if (!batch || busyId) return;
      if (getLeadDecision(store, batch.batch_id, lead.id)) return;

      setBusyId(lead.id);
      setErrorsByLead((prev) => {
        const next = { ...prev };
        delete next[lead.id];
        return next;
      });

      try {
        const result = await submitLeadDecision({ action, lead, batch });
        setStore(result.store || readDecisionStore());

        if (result.submittedToProxy) return;

        if (result.usedMailto && result.mailtoHref) {
          setMailtoByLead((prev) => ({ ...prev, [lead.id]: result.mailtoHref }));
          window.requestAnimationFrame(() => openMailto(result.mailtoHref));
          return;
        }

        setErrorsByLead((prev) => ({
          ...prev,
          [lead.id]:
            'Could not reach the approval proxy. Try Accept or Skip again.',
        }));
      } catch {
        if (isApprovalProxyConfigured()) {
          setErrorsByLead((prev) => ({
            ...prev,
            [lead.id]:
              'Could not reach the approval proxy. Try Accept or Skip again.',
          }));
          return;
        }

        const mailtoHref = buildDecisionMailto({
          action,
          lead,
          batchId: batch.batch_id,
        });
        setStore(
          storeLeadDecision({
            batchId: batch.batch_id,
            leadId: lead.id,
            action,
          }),
        );
        setMailtoByLead((prev) => ({ ...prev, [lead.id]: mailtoHref }));
        openMailto(mailtoHref);
      } finally {
        setBusyId('');
      }
    },
    [batch, busyId, store],
  );

  const dateLabel = formatBatchDate(batch?.generated_at, batch?.batch_id);
  const subtitleParts = [
    dateLabel,
    batch?.region,
    'tap Accept or Skip as you check',
  ].filter(Boolean);

  return (
    <div className="approve-root">
      <div className="approve-shell">
        <div className="approve-letter">
          <header className="approve-header">
            <div className="approve-eyebrow">Texas Craft Sites</div>
            <h1 className="approve-title">Daily Approvals</h1>
            <p className="approve-subtitle">{subtitleParts.join(' · ')}</p>
            <div className="approve-summary" aria-live="polite">
              {loadState === 'ready' ? (
                <SummaryText stats={stats} total={leads.length} />
              ) : loadState === 'error' ? (
                <>Could not load this batch. Refresh, or ask Scout to send a new pack.</>
              ) : (
                <>Loading this batch…</>
              )}
            </div>
            {!proxyConfigured ? (
              <div className="approve-notice" role="status">
                Proxy not configured. Accept/Skip will email Allen with the
                action and lead id until the live proxy URL is set.
              </div>
            ) : null}
          </header>

          <div className="approve-body">
            {loadState === 'error' ? (
              <div className="approve-status-msg">
                <strong>Batch unavailable</strong>
                Refresh this page, or wait for Scout to publish the next pack.
              </div>
            ) : loadState === 'loading' ? (
              <div className="approve-status-msg">Loading leads…</div>
            ) : leads.length === 0 ? (
              <div className="approve-status-msg">
                <strong>No leads in this batch</strong>
                Scout can republish <code>batch.json</code> when the next list
                is ready.
              </div>
            ) : (
              leads.map((lead, index) => (
                <LeadCard
                  key={lead.id || index}
                  lead={lead}
                  index={index}
                  decision={getLeadDecision(store, batchId, lead.id)}
                  busy={busyId === lead.id}
                  mailtoHref={mailtoByLead[lead.id]}
                  error={errorsByLead[lead.id]}
                  onDecide={handleDecide}
                />
              ))
            )}
          </div>

          <footer className="approve-footer">
            Texas Craft Sites · internal · Scout
          </footer>
        </div>
      </div>
    </div>
  );
}

function SummaryText({ stats, total }) {
  const { remaining, accepted, skipped, ready, researching, niches } = stats;
  const nicheLine = formatCountLine(niches);

  if (total === 0) {
    return <>No leads in this batch.</>;
  }

  const topLine =
    remaining === 0
      ? `All ${total} reviewed · ${accepted} accepted · ${skipped} skipped`
      : remaining === total
        ? `${total} lead${total === 1 ? '' : 's'} · ${ready} ready${
            researching ? ` · ${researching} researching` : ''
          }`
        : `${remaining} remaining · ${accepted} accepted · ${skipped} skipped`;

  return (
    <>
      <strong>{topLine}</strong>
      {nicheLine ? (
        <>
          <br />
          {nicheLine}
        </>
      ) : null}
      <br />
      {remaining === 0
        ? 'Batch complete on this phone.'
        : (
          <>
            Tap <span className="approve-cue-approve">Accept</span>
            {' / '}
            <span className="approve-cue-skip">Skip</span>
            {' as you check.'}
          </>
        )}
    </>
  );
}
