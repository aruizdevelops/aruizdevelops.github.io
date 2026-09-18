'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  buildDecisionMailto,
  buildVerifyLinks,
  CALL_ACTIONS,
  countBy,
  clearSessionToken,
  decisionTone,
  EMAIL_ACTIONS,
  enrollDevice,
  fetchAuthenticatedBatch,
  fetchEnrollmentStatus,
  formatBatchDate,
  formatCallbackWhen,
  formatCountLine,
  formatDecisionLabel,
  formatStatusLabel,
  getLeadDecision,
  getPublicEmail,
  isApprovalProxyConfigured,
  isWebAuthnSupported,
  openMailto,
  partitionLeads,
  proxyAuthErrorMessage,
  readDeviceEnrolled,
  readDecisionStore,
  readSessionToken,
  sessionInvalidKind,
  sessionInvalidMessage,
  statusTone,
  storeLeadDecision,
  submitLeadDecision,
  toIsoDatetime,
  unlockDevice,
  webAuthnErrorMessage,
  writeDeviceEnrolled,
} from '../../src/utils/approve';
import './approve.css';

function contactLine(lead) {
  const parts = [lead.phone, getPublicEmail(lead)].filter(Boolean);
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
  mode,
}) {
  const [callbackLocal, setCallbackLocal] = useState('');
  const doneLabel = formatDecisionLabel(decision?.action);
  const statusLabel = formatStatusLabel(doneLabel || lead.status);
  const tone = decision?.action
    ? decisionTone(decision.action)
    : statusTone(lead.status);
  const links = buildVerifyLinks(lead);
  const contact = contactLine(lead);
  const email = getPublicEmail(lead);
  const done = Boolean(decision);
  const isCall = mode === 'call';
  const callbackWhen =
    decision?.action === 'callback'
      ? formatCallbackWhen(decision.callback_at)
      : '';

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
          {lead.phone && email ? ' · ' : null}
          {email ? <a href={`mailto:${email}`}>{email}</a> : null}
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
          <div className={`approve-done-bar is-${tone}`}>
            Done — {doneLabel}
            {callbackWhen ? ` · ${callbackWhen}` : ''}
          </div>
          {mailtoHref ? (
            <p className="approve-mailto">
              Proxy is not configured, so this tap emailed Allen instead.{' '}
              <a href={mailtoHref}>Open email again</a>
            </p>
          ) : null}
        </>
      ) : isCall ? (
        <CallActions
          lead={lead}
          busy={busy}
          error={error}
          callbackLocal={callbackLocal}
          onCallbackLocalChange={setCallbackLocal}
          onDecide={onDecide}
        />
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

function CallActions({
  lead,
  busy,
  error,
  callbackLocal,
  onCallbackLocalChange,
  onDecide,
}) {
  const pickerId = `callback-${lead.id}`;
  return (
    <>
      <div className="approve-callback">
        <label htmlFor={pickerId}>Callback date and time</label>
        <input
          id={pickerId}
          type="datetime-local"
          value={callbackLocal}
          disabled={busy}
          required
          onChange={(event) => onCallbackLocalChange(event.target.value)}
        />
      </div>
      <div className="approve-actions approve-actions-call">
        <button
          type="button"
          className="approve-btn approve-btn-accept"
          disabled={busy}
          onClick={() => onDecide(lead, 'interested')}
        >
          {busy ? 'Saving…' : 'Interested'}
        </button>
        <button
          type="button"
          className="approve-btn approve-btn-callback"
          disabled={busy}
          onClick={() =>
            onDecide(lead, 'callback', { callbackAt: callbackLocal })
          }
        >
          Callback
        </button>
        <button
          type="button"
          className="approve-btn approve-btn-no-answer"
          disabled={busy}
          onClick={() => onDecide(lead, 'no_answer')}
        >
          No answer
        </button>
        <button
          type="button"
          className="approve-btn approve-btn-bad-number"
          disabled={busy}
          onClick={() => onDecide(lead, 'bad_number')}
        >
          Bad number
        </button>
        <button
          type="button"
          className="approve-btn approve-btn-remove"
          disabled={busy}
          onClick={() => onDecide(lead, 'remove')}
        >
          Remove
        </button>
      </div>
      {error ? <p className="approve-error">{error}</p> : null}
    </>
  );
}

function LockPanel({
  enrolled,
  canRegister,
  supported,
  proxyConfigured,
  busy,
  error,
  onUnlock,
  onRegister,
}) {
  const showRegister = Boolean(canRegister);
  const primaryIsRegister = showRegister && !enrolled;
  return (
    <div className="approve-lock">
      <div className="approve-lock-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none">
          <path
            d="M12 2.5c-2.4 2.6-3.6 5-3.6 7.2 0 2.1.8 3.9 3.6 6.8 2.8-2.9 3.6-4.7 3.6-6.8 0-2.2-1.2-4.6-3.6-7.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 11.2c-.7 1.1-1.1 2.2-1.1 3.3 0 2.8 2.2 5.4 4.9 6.5 2.7-1.1 4.9-3.7 4.9-6.5 0-1.1-.4-2.2-1.1-3.3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="12" cy="11.2" r="1.15" fill="currentColor" />
        </svg>
      </div>
      <h2 className="approve-lock-title">Unlock with Face ID / Touch ID</h2>
      <p className="approve-lock-copy">
        {enrolled || !showRegister
          ? "This batch stays locked until Allen's registered device confirms with a passkey."
          : 'First visit on this phone: register this device, then use Face ID or Touch ID to unlock.'}
      </p>

      {!supported ? (
        <p className="approve-error" role="alert">
          This browser does not support Face ID / Touch ID passkeys. Open
          /approve/ in Safari or Chrome on Allen's phone.
        </p>
      ) : null}

      {!proxyConfigured ? (
        <p className="approve-error" role="alert">
          Approval proxy is not configured, so this page cannot unlock or load
          leads.
        </p>
      ) : null}

      <div className="approve-lock-actions">
        {primaryIsRegister ? (
          <>
            <button
              type="button"
              className="approve-btn approve-btn-accept"
              disabled={busy || !supported || !proxyConfigured}
              onClick={onRegister}
            >
              {busy ? 'Waiting for Face ID…' : 'Register this device'}
            </button>
            <button
              type="button"
              className="approve-btn approve-btn-unlock"
              disabled={busy || !supported || !proxyConfigured}
              onClick={onUnlock}
            >
              Unlock with Face ID / Touch ID
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="approve-btn approve-btn-accept"
              disabled={busy || !supported || !proxyConfigured}
              onClick={onUnlock}
            >
              {busy ? 'Waiting for Face ID…' : 'Unlock with Face ID / Touch ID'}
            </button>
            {showRegister ? (
              <button
                type="button"
                className="approve-btn approve-btn-unlock"
                disabled={busy || !supported || !proxyConfigured}
                onClick={onRegister}
              >
                Register this device
              </button>
            ) : null}
          </>
        )}
      </div>
      {error ? (
        <p className="approve-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="approve-lock-hint">
          Only Allen's enrolled device can see lead cards or record outcomes.
        </p>
      )}
    </div>
  );
}

export default function ApproveClient() {
  const [gate, setGate] = useState('checking');
  const [batch, setBatch] = useState(null);
  const [loadState, setLoadState] = useState('idle');
  const [store, setStore] = useState({});
  const [busyId, setBusyId] = useState('');
  const [mailtoByLead, setMailtoByLead] = useState({});
  const [errorsByLead, setErrorsByLead] = useState({});
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [canRegister, setCanRegister] = useState(true);
  const [supported, setSupported] = useState(true);
  const [tab, setTab] = useState('email');
  const proxyConfigured = isApprovalProxyConfigured();

  const handleSessionInvalid = useCallback((result) => {
    clearSessionToken();
    setBatch(null);
    setLoadState('idle');
    setGate('locked');
    setTab('email');
    setEnrolled(true);
    writeDeviceEnrolled(true);
    setAuthError(sessionInvalidMessage(sessionInvalidKind(result)));
  }, []);

  const loadBatchWithToken = useCallback(async (token) => {
    setLoadState('loading');
    const result = await fetchAuthenticatedBatch(token);
    if (result.unauthorized) {
      handleSessionInvalid(result);
      return false;
    }
    if (!result.ok) {
      setBatch(null);
      setLoadState('error');
      setGate('open');
      return false;
    }
    setBatch(result.batch);
    setStore(readDecisionStore());
    setLoadState('ready');
    setGate('open');
    return true;
  }, [handleSessionInvalid]);

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
    setSupported(isWebAuthnSupported());
    setEnrolled(readDeviceEnrolled());

    const token = readSessionToken();
    let cancelled = false;
    (async () => {
      const status = await fetchEnrollmentStatus();
      if (cancelled) return;
      setCanRegister(Boolean(status.registrationAvailable));

      if (!token) {
        setGate('locked');
        return;
      }

      const result = await fetchAuthenticatedBatch(token);
      if (cancelled) return;
      if (result.unauthorized) {
        handleSessionInvalid(result);
        return;
      }
      if (!result.ok) {
        clearSessionToken();
        setGate('locked');
        return;
      }
      setBatch(result.batch);
      setStore(readDecisionStore());
      setLoadState('ready');
      setGate('open');
    })();

    return () => {
      cancelled = true;
    };
  }, [handleSessionInvalid]);

  const leads = Array.isArray(batch?.leads) ? batch.leads : [];
  const batchId = batch?.batch_id || '';
  const lists = useMemo(() => partitionLeads(leads), [leads]);
  const visibleLeads = tab === 'call' ? lists.call : lists.email;

  const stats = useMemo(() => {
    const ready = visibleLeads.filter((lead) =>
      formatStatusLabel(lead.status).includes('ready'),
    ).length;
    const researching = visibleLeads.filter((lead) =>
      formatStatusLabel(lead.status).includes('research'),
    ).length;
    const niches = countBy(visibleLeads, (lead) => lead.niche);
    const decisions = visibleLeads.map((lead) =>
      getLeadDecision(store, batchId, lead.id),
    );
    const accepted = decisions.filter((d) => d?.action === 'approve').length;
    const skipped = decisions.filter((d) => d?.action === 'skip').length;
    const interested = decisions.filter((d) => d?.action === 'interested').length;
    const callback = decisions.filter((d) => d?.action === 'callback').length;
    const noAnswer = decisions.filter((d) => d?.action === 'no_answer').length;
    const badNumber = decisions.filter((d) => d?.action === 'bad_number').length;
    const removed = decisions.filter((d) => d?.action === 'remove').length;
    const remaining = visibleLeads.length - decisions.filter(Boolean).length;
    return {
      ready,
      researching,
      niches,
      accepted,
      skipped,
      interested,
      callback,
      noAnswer,
      badNumber,
      removed,
      remaining,
    };
  }, [visibleLeads, store, batchId]);

  const runAuth = useCallback(
    async (mode) => {
      if (authBusy) return;
      setAuthBusy(true);
      setAuthError('');
      try {
        const result = mode === 'register' ? await enrollDevice() : await unlockDevice();
        if (!result.ok) {
          if (
            mode === 'register' &&
            (result.status === 403 ||
              /registration|full|closed/i.test(String(result.reason || '')))
          ) {
            setCanRegister(false);
          }
          setAuthError(proxyAuthErrorMessage(result));
          return;
        }
        if (mode === 'register') setEnrolled(true);
        const token = result.token || readSessionToken();
        if (!token) {
          setAuthError(proxyAuthErrorMessage({ reason: 'missing-session-token' }));
          return;
        }
        await loadBatchWithToken(token);
      } catch (error) {
        setAuthError(webAuthnErrorMessage(error));
      } finally {
        setAuthBusy(false);
      }
    },
    [authBusy, loadBatchWithToken],
  );

  const handleDecide = useCallback(
    async (lead, action, extra = {}) => {
      if (!batch || busyId) return;
      const allowed =
        tab === 'call' ? CALL_ACTIONS.has(action) : EMAIL_ACTIONS.has(action);
      if (!allowed) return;
      if (getLeadDecision(store, batch.batch_id, lead.id)) return;

      if (action === 'callback' && !toIsoDatetime(extra.callbackAt)) {
        setErrorsByLead((prev) => ({
          ...prev,
          [lead.id]: 'Pick a callback date and time first.',
        }));
        return;
      }

      setBusyId(lead.id);
      setErrorsByLead((prev) => {
        const next = { ...prev };
        delete next[lead.id];
        return next;
      });

      const retryHint =
        tab === 'call'
          ? 'Could not reach the approval proxy. Try the outcome again.'
          : 'Could not reach the approval proxy. Try Accept or Skip again.';

      try {
        const result = await submitLeadDecision({
          action,
          lead,
          batch,
          token: readSessionToken(),
          callbackAt: extra.callbackAt,
        });
        if (result.unauthorized) {
          handleSessionInvalid(result);
          return;
        }
        if (result.reason === 'missing-callback-at') {
          setErrorsByLead((prev) => ({
            ...prev,
            [lead.id]: 'Pick a callback date and time first.',
          }));
          return;
        }
        setStore(result.store || readDecisionStore());

        if (result.submittedToProxy) return;

        if (result.usedMailto && result.mailtoHref) {
          setMailtoByLead((prev) => ({ ...prev, [lead.id]: result.mailtoHref }));
          window.requestAnimationFrame(() => openMailto(result.mailtoHref));
          return;
        }

        setErrorsByLead((prev) => ({
          ...prev,
          [lead.id]: retryHint,
        }));
      } catch {
        if (isApprovalProxyConfigured()) {
          setErrorsByLead((prev) => ({
            ...prev,
            [lead.id]: retryHint,
          }));
          return;
        }

        const mailtoHref = buildDecisionMailto({
          action,
          lead,
          batchId: batch.batch_id,
          callbackAt: extra.callbackAt,
        });
        setStore(
          storeLeadDecision({
            batchId: batch.batch_id,
            leadId: lead.id,
            action,
            callbackAt: extra.callbackAt,
          }),
        );
        setMailtoByLead((prev) => ({ ...prev, [lead.id]: mailtoHref }));
        openMailto(mailtoHref);
      } finally {
        setBusyId('');
      }
    },
    [batch, busyId, handleSessionInvalid, store, tab],
  );

  const dateLabel = formatBatchDate(batch?.generated_at, batch?.batch_id);
  const locked = gate !== 'open';
  const subtitleParts = locked
    ? ['Unlock with Face ID / Touch ID']
    : [
        dateLabel,
        batch?.region,
        tab === 'call'
          ? 'phone-only · tap an outcome after you call'
          : 'tap Accept or Skip as you check',
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
              {locked ? (
                <>
                  {gate === 'checking'
                    ? 'Checking this device…'
                    : "Locked. Only Allen's registered device can open this batch."}
                </>
              ) : loadState === 'ready' ? (
                <SummaryText
                  stats={stats}
                  total={visibleLeads.length}
                  tab={tab}
                />
              ) : loadState === 'error' ? (
                <>
                  Could not load this batch from the approval proxy. Unlock
                  again, or ask Scout to publish the list.
                </>
              ) : (
                <>Loading this batch…</>
              )}
            </div>
            {!locked ? (
              <button
                type="button"
                className="approve-lock-again"
                onClick={() => {
                  clearSessionToken();
                  setBatch(null);
                  setLoadState('idle');
                  setGate('locked');
                  setTab('email');
                  setAuthError('');
                }}
              >
                Lock
              </button>
            ) : null}
          </header>

          {!locked && loadState === 'ready' ? (
            <div className="approve-tabs" role="tablist" aria-label="Outreach type">
              <button
                type="button"
                role="tab"
                id="approve-tab-email"
                aria-controls="approve-tabpanel"
                aria-selected={tab === 'email'}
                className={`approve-tab${tab === 'email' ? ' is-active' : ''}`}
                onClick={() => setTab('email')}
              >
                Email
                <span className="approve-tab-count">{lists.email.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                id="approve-tab-call"
                aria-controls="approve-tabpanel"
                aria-selected={tab === 'call'}
                className={`approve-tab${tab === 'call' ? ' is-active' : ''}`}
                onClick={() => setTab('call')}
              >
                Call
                <span className="approve-tab-count">{lists.call.length}</span>
              </button>
            </div>
          ) : null}

          <div
            className="approve-body"
            id="approve-tabpanel"
            role={!locked && loadState === 'ready' ? 'tabpanel' : undefined}
            aria-labelledby={
              !locked && loadState === 'ready'
                ? tab === 'call'
                  ? 'approve-tab-call'
                  : 'approve-tab-email'
                : undefined
            }
          >
            {gate === 'checking' ? (
              <div className="approve-status-msg">Checking this device…</div>
            ) : locked ? (
              <LockPanel
                enrolled={enrolled}
                canRegister={canRegister}
                supported={supported}
                proxyConfigured={proxyConfigured}
                busy={authBusy}
                error={authError}
                onUnlock={() => runAuth('unlock')}
                onRegister={() => runAuth('register')}
              />
            ) : loadState === 'error' ? (
              <div className="approve-status-msg">
                <strong>Batch unavailable</strong>
                Unlock again, or wait for Scout to publish the next pack to the
                approval proxy.
              </div>
            ) : loadState === 'loading' ? (
              <div className="approve-status-msg">Loading leads…</div>
            ) : visibleLeads.length === 0 ? (
              <EmptyTab tab={tab} />
            ) : (
              visibleLeads.map((lead, index) => (
                <LeadCard
                  key={lead.id || index}
                  lead={lead}
                  index={index}
                  decision={getLeadDecision(store, batchId, lead.id)}
                  busy={busyId === lead.id}
                  mailtoHref={mailtoByLead[lead.id]}
                  error={errorsByLead[lead.id]}
                  onDecide={handleDecide}
                  mode={tab}
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

function EmptyTab({ tab }) {
  if (tab === 'call') {
    return (
      <div className="approve-status-msg">
        <strong>No call leads in this batch</strong>
        There are no phone-only shops to call. Check the Email tab, or wait for
        Scout to publish the next pack.
      </div>
    );
  }
  return (
    <div className="approve-status-msg">
      <strong>No email leads in this batch</strong>
      None of these shops have a public email. Check the Call tab for
      phone-only shops, or wait for Scout to publish the next pack.
    </div>
  );
}

function SummaryText({ stats, total, tab }) {
  const {
    remaining,
    accepted,
    skipped,
    interested,
    callback,
    noAnswer,
    badNumber,
    removed,
    ready,
    researching,
    niches,
  } = stats;
  const nicheLine = formatCountLine(niches);

  if (tab === 'call') {
    if (total === 0) {
      return <>No phone-only shops in this batch.</>;
    }
    const topLine =
      remaining === 0
        ? `All ${total} reviewed · ${interested} interested · ${callback} callback`
        : remaining === total
          ? `${total} phone-only shop${total === 1 ? '' : 's'}`
          : `${remaining} remaining · ${interested} interested · ${callback} callback`;
    const extra = [
      noAnswer ? `${noAnswer} no answer` : '',
      badNumber ? `${badNumber} bad number` : '',
      removed ? `${removed} removed` : '',
    ].filter(Boolean);
    return (
      <>
        <strong>{topLine}</strong>
        {extra.length ? (
          <>
            <br />
            {extra.join(' · ')}
          </>
        ) : null}
        {nicheLine ? (
          <>
            <br />
            {nicheLine}
          </>
        ) : null}
        <br />
        {remaining === 0
          ? 'Call list complete on this phone.'
          : 'Tap an outcome after you call.'}
      </>
    );
  }

  if (total === 0) {
    return <>No email leads in this batch.</>;
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
