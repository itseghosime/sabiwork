"use client";

import { useCallback, useEffect, useState } from "react";

export function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

/** Loads a screen's data once on mount and exposes a retry handler. Results are
 * only written from promise callbacks, so the mount effect never sets state
 * synchronously. Pass a `useCallback`-wrapped fetcher. */
export function useScreenData<T>(
  fetcher: () => Promise<T>,
  fallbackMessage: string,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(errorMessage(reason, fallbackMessage));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetcher, fallbackMessage]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => setData(result))
      .catch((reason: unknown) => setError(errorMessage(reason, fallbackMessage)))
      .finally(() => setLoading(false));
  }, [fetcher, fallbackMessage]);

  return { data, loading, error, retry };
}
