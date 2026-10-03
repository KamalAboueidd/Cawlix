// ─────────────────────────────────────────────────────────────────────────────
// Cawlix Tracker — Zustand Store
// Manages user preferences, payment config, and telemetry feed state.
// Zero global re-renders: stores are sliced; components subscribe to exact
// slices they need via selector pattern.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { BankCard, TelemetryEvent, RetailerId, Session } from '../../shared/types/index';

// ── Filter Preferences ────────────────────────────────────────────────────────

export interface FilterPreferences {
  activeRetailers: RetailerId[];
  currency: 'EGP' | 'USD';
  priceRange: [number, number];
  inStockOnly: boolean;
  showGhostDeals: boolean;
}

// ── Payment Config ────────────────────────────────────────────────────────────

export interface PaymentConfig {
  cards: BankCard[];
  activeCardId: string | null;
  installmentMonths: number;
}

// ── Telemetry State ───────────────────────────────────────────────────────────

export interface TelemetryState {
  events: TelemetryEvent[];
  isConnected: boolean;
  lastHeartbeat: string | null;
  isPaused: boolean;
  maxBufferSize: number;
}

// ── UI State ──────────────────────────────────────────────────────────────────

export interface UIState {
  sidebarOpen: boolean;
  activeTab: 'overview' | 'catalog' | 'telemetry' | 'landed-cost' | 'ghost-auditor';
  commandPaletteOpen: boolean;
}

// ── Full Store ─────────────────────────────────────────────────────────────────

export interface TrackerStore {
  // Auth
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Filters
  filters: FilterPreferences;
  setFilter: <K extends keyof FilterPreferences>(
    key: K,
    value: FilterPreferences[K]
  ) => void;
  resetFilters: () => void;

  // Payment
  payment: PaymentConfig;
  addCard: (card: BankCard) => void;
  removeCard: (cardId: string) => void;
  setActiveCard: (cardId: string | null) => void;
  setInstallmentMonths: (months: number) => void;

  // Telemetry
  telemetry: TelemetryState;
  pushTelemetryEvent: (event: TelemetryEvent) => void;
  clearTelemetry: () => void;
  setTelemetryConnected: (connected: boolean) => void;
  pauseTelemetry: () => void;
  resumeTelemetry: () => void;

  // UI
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

// ── Default values ─────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterPreferences = {
  activeRetailers: [
    'amazon_eg', 'btech', 'noon_eg', 'tradeline',
    'carrefour_eg', 'jumia_eg', 'raneen', '2b',
  ],
  currency: 'EGP',
  priceRange: [0, 100_000],
  inStockOnly: false,
  showGhostDeals: true,
};

const DEFAULT_PAYMENT: PaymentConfig = {
  cards: [],
  activeCardId: null,
  installmentMonths: 1,
};

const DEFAULT_TELEMETRY: TelemetryState = {
  events: [],
  isConnected: false,
  lastHeartbeat: null,
  isPaused: false,
  maxBufferSize: 200,
};

const DEFAULT_UI: UIState = {
  sidebarOpen: true,
  activeTab: 'overview',
  commandPaletteOpen: false,
};

// ── Store Creation ─────────────────────────────────────────────────────────────

export const useTrackerStore = create<TrackerStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      // ── Auth ───────────────────────────────────────────────────────────────
      session: null,
      setSession: (session) => set({ session }, false, 'setSession'),

      // ── Filters ────────────────────────────────────────────────────────────
      filters: DEFAULT_FILTERS,

      setFilter: (key, value) =>
        set(
          (state) => ({ filters: { ...state.filters, [key]: value } }),
          false,
          `setFilter/${key}`
        ),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'resetFilters'),

      // ── Payment ────────────────────────────────────────────────────────────
      payment: DEFAULT_PAYMENT,

      addCard: (card) =>
        set(
          (state) => ({
            payment: {
              ...state.payment,
              cards: [...state.payment.cards.filter((c) => c.id !== card.id), card],
            },
          }),
          false,
          'addCard'
        ),

      removeCard: (cardId) =>
        set(
          (state) => ({
            payment: {
              ...state.payment,
              cards: state.payment.cards.filter((c) => c.id !== cardId),
              activeCardId:
                state.payment.activeCardId === cardId
                  ? null
                  : state.payment.activeCardId,
            },
          }),
          false,
          'removeCard'
        ),

      setActiveCard: (cardId) =>
        set(
          (state) => ({ payment: { ...state.payment, activeCardId: cardId } }),
          false,
          'setActiveCard'
        ),

      setInstallmentMonths: (months) =>
        set(
          (state) => ({
            payment: { ...state.payment, installmentMonths: months },
          }),
          false,
          'setInstallmentMonths'
        ),

      // ── Telemetry ──────────────────────────────────────────────────────────
      telemetry: DEFAULT_TELEMETRY,

      pushTelemetryEvent: (event) =>
        set(
          (state) => {
            if (state.telemetry.isPaused) return state;
            const events = [
              event,
              ...state.telemetry.events,
            ].slice(0, state.telemetry.maxBufferSize);
            return {
              telemetry: {
                ...state.telemetry,
                events,
                lastHeartbeat: new Date().toISOString(),
              },
            };
          },
          false,
          'pushTelemetryEvent'
        ),

      clearTelemetry: () =>
        set(
          (state) => ({ telemetry: { ...state.telemetry, events: [] } }),
          false,
          'clearTelemetry'
        ),

      setTelemetryConnected: (connected) =>
        set(
          (state) => ({
            telemetry: { ...state.telemetry, isConnected: connected },
          }),
          false,
          'setTelemetryConnected'
        ),

      pauseTelemetry: () =>
        set(
          (state) => ({ telemetry: { ...state.telemetry, isPaused: true } }),
          false,
          'pauseTelemetry'
        ),

      resumeTelemetry: () =>
        set(
          (state) => ({ telemetry: { ...state.telemetry, isPaused: false } }),
          false,
          'resumeTelemetry'
        ),

      // ── UI ─────────────────────────────────────────────────────────────────
      ui: DEFAULT_UI,

      setSidebarOpen: (open) =>
        set(
          (state) => ({ ui: { ...state.ui, sidebarOpen: open } }),
          false,
          'setSidebarOpen'
        ),

      setActiveTab: (tab) =>
        set(
          (state) => ({ ui: { ...state.ui, activeTab: tab } }),
          false,
          'setActiveTab'
        ),

      setCommandPaletteOpen: (open) =>
        set(
          (state) => ({ ui: { ...state.ui, commandPaletteOpen: open } }),
          false,
          'setCommandPaletteOpen'
        ),
    })),
    { name: 'CawlixTrackerStore' }
  )
);

// ── Typed selectors (zero unnecessary re-renders) ──────────────────────────────

export const useSession = () => useTrackerStore((s) => s.session);
export const useFilters = () => useTrackerStore((s) => s.filters);
export const usePayment = () => useTrackerStore((s) => s.payment);
export const useTelemetryState = () => useTrackerStore((s) => s.telemetry);
export const useTelemetryEvents = () => useTrackerStore((s) => s.telemetry.events);
export const useUIState = () => useTrackerStore((s) => s.ui);
export const useActiveTab = () => useTrackerStore((s) => s.ui.activeTab);
