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
      className="telemetry-log-row"
      style={{
        display: 'grid',
        gap: '6px',
        alignItems: 'start',
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
          whiteSpace: 'nowrap',
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
          lineHeight: 1.45,
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '420px',
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
      }}
    >
      {/* Header bar */}
      <div
        className="telemetry-header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          flexShrink: 0,
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Terminal size={12} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span className="telemetry-feed-title">
            Telemetry Feed
          </span>
          {/* Active events counter - Pure green text directly on screen, no background box */}
          <span className="telemetry-events-count">
            {eventCount} events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Connection status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isConnected ? (
              <Wifi size={10} strokeWidth={1.5} style={{ color: '#3ECF8E', flexShrink: 0 }} />
            ) : (
              <WifiOff size={10} strokeWidth={1.5} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            )}
            <div
              className={`dot dot-${isConnected ? 'success' : 'danger'}`}
              style={{ width: '4px', height: '4px', flexShrink: 0 }}
            />
            <span className="telemetry-response-label">
              {isConnected ? (isPaused ? 'Paused' : '142ms avg response') : 'Offline'}
            </span>
          </div>

          {/* Controls: Transparent background, NO background on hover */}
          <button
            type="button"
            onClick={isPaused ? resumeTelemetry : pauseTelemetry}
            className="telemetry-action-btn"
            title={isPaused ? 'Resume feed' : 'Pause feed'}
            aria-label={isPaused ? 'Resume feed' : 'Pause feed'}
          >
            {isPaused ? (
              <Play size={10} strokeWidth={1.5} />
            ) : (
              <Pause size={10} strokeWidth={1.5} />
            )}
          </button>

          <button
            type="button"
            onClick={clearEvents}
            className="telemetry-action-btn"
            title="Clear feed"
            aria-label="Clear feed"
          >
            <Trash2 size={10} strokeWidth={1.5} />
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
          padding: '8px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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
      <style>{`
        .telemetry-feed-title {
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Active events counter - Pure green text directly on screen, no background box */
        .telemetry-events-count {
          background: transparent !important;
          color: #3ECF8E !important;
          font-family: var(--font-mono, monospace);
          font-size: 0.60rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          white-space: nowrap;
        }

        /* 142ms avg response - Micro crisp font */
        .telemetry-response-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.58rem;
          color: #737373;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        /* Delete and Pause buttons: Pure transparent background, NO background on hover */
        .telemetry-action-btn {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #737373 !important;
          padding: 2px 4px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          transition: color 120ms ease;
          border-radius: 4px;
        }
        .telemetry-action-btn:hover {
          background: transparent !important;
          color: #FFFFFF !important;
        }
        .telemetry-action-btn:active {
          background: transparent !important;
          color: #3ECF8E !important;
        }

        .telemetry-log-row {
          grid-template-columns: 72px 80px 1fr;
          padding: 5px 16px;
        }
        @media (max-width: 640px) {
          .telemetry-header-bar {
            padding: 6px 0 !important;
          }
          .telemetry-feed-title {
            font-size: 0.5625rem !important;
          }
          .telemetry-events-count {
            font-size: 0.54rem !important;
          }
          .telemetry-response-label {
            font-size: 0.52rem !important;
          }
          .telemetry-log-row {
            grid-template-columns: 54px 60px 1fr !important;
            padding: 4px 8px !important;
            font-size: 9px !important;
          }
          .telemetry-log-row span {
            font-size: 0.56rem !important;
          }
        }
      `}</style>
    </div>
  );
}
