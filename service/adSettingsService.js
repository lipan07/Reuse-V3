import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ad_settings_client_cache_v1';
export const AD_SETTINGS_REFRESH_MS = 6 * 60 * 60 * 1000;

/** In-memory mirror for non-React code (e.g. submitForm interstitial). */
let latestFlags = {};

export function applyLatestAdFlags(flags) {
  latestFlags = flags && typeof flags === 'object' ? { ...flags } : {};
}

/**
 * Before first successful fetch, treat all placements as enabled.
 * After fetch, only explicit `false` hides an ad.
 */
export function isAdTypeEnabled(slug) {
  return latestFlags[slug] !== false;
}

function flagsFromApiData(data) {
  const map = {};
  if (!Array.isArray(data)) {
    return map;
  }
  for (const row of data) {
    if (row && typeof row.slug === 'string') {
      map[row.slug] = !!row.is_enabled;
    }
  }
  return map;
}

export async function readAdSettingsCache() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.fetchedAt !== 'number' || typeof parsed.flags !== 'object') {
      return null;
    }
    return { flags: parsed.flags, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

export async function writeAdSettingsCache(flags, fetchedAt) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ flags, fetchedAt })
    );
  } catch (e) {
    console.warn('[AdSettings] cache write failed:', e?.message || e);
  }
}

export async function fetchAdSettingsFromApi() {
  const base = process.env.BASE_URL;
  if (!base) {
    console.warn('[AdSettings] BASE_URL missing');
    return null;
  }
  const url = `${base.replace(/\/$/, '')}/ad-settings`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    console.warn('[AdSettings] HTTP', res.status);
    return null;
  }
  const body = await res.json();
  const flags = flagsFromApiData(body?.data);
  const fetchedAt = Date.now();
  return { flags, fetchedAt };
}

export function shouldRefreshAdSettings(fetchedAt) {
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt)) {
    return true;
  }
  return Date.now() - fetchedAt >= AD_SETTINGS_REFRESH_MS;
}
