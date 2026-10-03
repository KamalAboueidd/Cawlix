import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Pause, Play, Trash2, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';
import { startTelemetrySimulator } from '../lib/telemetrySimulator';
import { useTrackerStore } from '../store/useTrackerStore';
import type { TelemetryEvent } from '../../shared/types/index';

// ── Event type → display config ────────────────────────────────────────────

const EVENT_CONFIG: Record<
  string,
  { prefix: string; color: string; bgColor: string; badgeClass: string }
> = {
  PRICE_DROP:       { prefix: '▼ DROP     ', color: 'var(--success)', bgColor: 'var(--brand-tint)', badgeClass: 'badge-brand' },
  PRICE_SPIKE:      { prefix: '▲ SPIKE    ', color: 'var(--warn)',    bgColor: 'var(--warn-tint)',   badgeClass: 'badge-warn' },
  GHOST_FLAG:       { prefix: '⚠ GHOST    ', color: 'var(--danger)',  bgColor: 'var(--danger-tint)', badgeClass: 'badge-danger' },
  ARBITRAGE_SIGNAL: { prefix: '◆ ARB      ', color: 'var(--brand)',   bgColor: 'var(--brand-tint)', badgeClass: 'badge-brand' },
  FX_UPDATE:        { prefix: '$ FX       ', color: '#A78BFA',        bgColor: 'rgba(167,139,250,0.08)', badgeClass: 'badge-neutral' },
  RESTOCK:          { prefix: '↺ RESTOCK  ', color: 'var(--text-secondary)', bgColor: 'transparent', badgeClass: 'badge-neutral' },
  OOS:              { prefix: '✕ OOS      ', color: 'var(--danger)',  bgColor: 'var(--danger-tint)', badgeClass: 'badge-danger' },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface TelemetryRowProps {
  event: TelemetryEvent;
  isNew: boolean;
}

function TelemetryRow({ event, isNew }: TelemetryRowProps) {
  const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.RESTOCK;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 80px 1fr',
        gap: '8px',
        alignItems: 'start',
        padding: '5px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: isNew ? cfg.bgColor : 'transparent',
        transition: 'background 600ms ease',
      }}
    >
      {/* Timestamp */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          paddingTop: '1px',
          letterSpacing: '0.01em',
        }}
      >
        {formatTimestamp(event.timestamp)}
      </span>

      {/* Type prefix */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: cfg.color,
          fontWeight: 500,
          letterSpacing: '0.02em',
          paddingTop: '1px',
        }}
      >
        {cfg.prefix}
      </span>

      {/* Message */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          wordBreak: 'break-word',
        }}
      >
        {event.message}
      </span>
    </motion.div>
  );
}

// ── Main Console Component ─────────────────────────────────────────────────

export default function TelemetryConsole() {
  const pushEvent = useTrackerStore((s) => s.pushTelemetryEvent);
  const clearEvents = useTrackerStore((s) => s.clearTelemetry);
  const pauseTelemetry = useTrackerStore((s) => s.pauseTelemetry);
  const resumeTelemetry = useTrackerStore((s) => s.resumeTelemetry);
  const setConnected = useTrackerStore((s) => s.setTelemetryConnected);
  const events = useTrackerStore((s) => s.telemetry.events);
  const isPaused = useTrackerStore((s) => s.telemetry.isPaused);
  const isConnected = useTrackerStore((s) => s.telemetry.isConnected);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [eventCount, setEventCount] = useState(0);

  // Track "new" events for brief highlight flash
  const handleNewEvent = useCallback(
    (event: TelemetryEvent) => {
      pushEvent(event);
      setEventCount((n) => n + 1);
      setNewEventIds((prev) => {
        const next = new Set(prev);
        next.add(event.id);
        // Remove highlight after 800ms
        setTimeout(() => {
          setNewEventIds((s) => {
            const updated = new Set(s);
            updated.delete(event.id);
            return updated;
          });
        }, 800);
        return next;
      });
    },
    [pushEvent]
  );

  // Start simulator
  useEffect(() => {
    setConnected(true);
    const stop = startTelemetrySimulator(handleNewEvent, 1200);
    return () => {
      stop();
      setConnected(false);
    };
  }, [handleNewEvent, setConnected]);

  // Auto-scroll to top (newest events are prepended)
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length, isPaused]);

  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', height: '420px' }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={13} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Telemetry Feed
          </span>
          <span className={clsx('badge', 'badge-neutral')} style={{ fontSize: '0.55rem' }}>
            {eventCount} events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Connection status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isConnected ? (
              <Wifi size={11} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
            ) : (
              <WifiOff size={11} strokeWidth={1.5} style={{ color: 'var(--danger)' }} />
            )}
            <div
              className={`dot dot-${isConnected ? 'success' : 'danger'}${isConnected && !isPaused ? ' dot-pulse' : ''}`}
            />
            <span className="mono-label">
              {isConnected ? (isPaused ? 'PAUSED' : 'LIVE') : 'OFFLINE'}
            </span>
          </div>

          {/* Controls */}
          <button
            onClick={isPaused ? resumeTelemetry : pauseTelemetry}
            className={clsx('btn', 'btn-ghost', 'btn-sm')}
            style={{ padding: '3px 8px', gap: '4px' }}
            title={isPaused ? 'Resume feed' : 'Pause feed'}
          >
            {isPaused ? (
              <Play size={11} strokeWidth={1.5} />
            ) : (
              <Pause size={11} strokeWidth={1.5} />
            )}
          </button>

          <button
            onClick={clearEvents}
            className={clsx('btn', 'btn-ghost', 'btn-sm')}
            style={{ padding: '3px 8px' }}
            title="Clear feed"
          >
            <Trash2 size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Event stream */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}
          >
            {isPaused ? '— Feed paused —' : '— Awaiting events —'}
          </div>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {events.map((event) => (
              <TelemetryRow
                key={event.id}
                event={event}
                isNew={newEventIds.has(event.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer: event type legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '7px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(EVENT_CONFIG).slice(0, 5).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div className="dot" style={{ background: cfg.color, width: '5px', height: '5px' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {type.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
