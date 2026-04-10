import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import {
  AD_SETTINGS_REFRESH_MS,
  applyLatestAdFlags,
  fetchAdSettingsFromApi,
  readAdSettingsCache,
  shouldRefreshAdSettings,
  writeAdSettingsCache,
} from '../service/adSettingsService';

const AdSettingsContext = createContext({
  isAdEnabled: () => true,
  flags: {},
  lastFetchedAt: null,
  refresh: async () => {},
});

export function AdSettingsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const appState = useRef(AppState.currentState);

  const applyAndPersist = useCallback(async (nextFlags, fetchedAt) => {
    setFlags(nextFlags);
    setLastFetchedAt(fetchedAt);
    applyLatestAdFlags(nextFlags);
    await writeAdSettingsCache(nextFlags, fetchedAt);
  }, []);

  const refresh = useCallback(async () => {
    const remote = await fetchAdSettingsFromApi();
    if (remote) {
      await applyAndPersist(remote.flags, remote.fetchedAt);
    }
  }, [applyAndPersist]);

  const maybeRefresh = useCallback(async () => {
    const cached = await readAdSettingsCache();
    if (cached && !shouldRefreshAdSettings(cached.fetchedAt)) {
      await applyAndPersist(cached.flags, cached.fetchedAt);
      return;
    }
    await refresh();
  }, [applyAndPersist, refresh]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = await readAdSettingsCache();
      if (cancelled) return;
      if (cached) {
        await applyAndPersist(cached.flags, cached.fetchedAt);
      }
      if (cancelled) return;
      if (!cached || shouldRefreshAdSettings(cached.fetchedAt)) {
        await refresh();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAndPersist, refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      maybeRefresh();
    }, AD_SETTINGS_REFRESH_MS);
    return () => clearInterval(id);
  }, [maybeRefresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        maybeRefresh();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [maybeRefresh]);

  const isAdEnabled = useCallback(
    (slug) => flags[slug] !== false,
    [flags]
  );

  const value = useMemo(
    () => ({
      isAdEnabled,
      flags,
      lastFetchedAt,
      refresh,
    }),
    [isAdEnabled, flags, lastFetchedAt, refresh]
  );

  return (
    <AdSettingsContext.Provider value={value}>
      {children}
    </AdSettingsContext.Provider>
  );
}

export function useAdSettings() {
  return useContext(AdSettingsContext);
}
