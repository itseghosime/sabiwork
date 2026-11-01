"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface DeviceStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: Listener) => () => void;
  write: (value: T) => void;
}

/** Preferences and read-state have no server record yet, so they live in
 * localStorage. Reading through an external store keeps the value out of an
 * effect body, and gives the same snapshot on the server and at hydration. */
function createDeviceStore<T>(key: string, fallback: T): DeviceStore<T> {
  const listeners = new Set<Listener>();
  let cache: T = fallback;
  let loaded = false;

  function read(): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  function getSnapshot(): T {
    if (!loaded) {
      cache = read();
      loaded = true;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      loaded = false;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function write(value: T) {
    cache = value;
    loaded = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be blocked or full; the in-memory value still applies.
    }
    listeners.forEach((listener) => listener());
  }

  return { getSnapshot, getServerSnapshot, subscribe, write };
}

export const notificationReadStore = createDeviceStore<string[]>(
  "sabiwork.notifications.read",
  [],
);

export interface CustomerPreferences {
  bookingUpdates: boolean;
  quoteAlerts: boolean;
  paymentReminders: boolean;
  productNews: boolean;
  preferredArea: string;
}

export const defaultPreferences: CustomerPreferences = {
  bookingUpdates: true,
  quoteAlerts: true,
  paymentReminders: true,
  productNews: false,
  preferredArea: "GRA",
};

export const preferenceStore = createDeviceStore<CustomerPreferences>(
  "sabiwork.customer.preferences",
  defaultPreferences,
);

export function useDeviceValue<T>(store: DeviceStore<T>): T {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}
