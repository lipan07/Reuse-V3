import AsyncStorage from '@react-native-async-storage/async-storage';

/** Aligns with `SORT_MAPPING` in `Home.js` (display label → API value). */
const SORT_MAPPING = {
  Relevance: null,
  'Recently Added': 'createdAt_desc',
  'Price: Low to High': 'price_asc',
  'Price: High to Low': 'price_desc',
};

function appendPair(pairs, key, value) {
  if (value === null || value === undefined || value === '') return;
  pairs.push([key, String(value)]);
}

/**
 * Build query string (no URLSearchParams#set — Hermes-friendly).
 */
export function buildVideosQueryString(params = {}) {
  const {
    category,
    page = 1,
    limit = 15,
    search,
    latitude,
    longitude,
    distance,
    listingType,
    priceRange,
    sortBy,
  } = params;

  let sortParam = sortBy;
  if (sortParam != null && typeof sortParam === 'string') {
    sortParam = Object.prototype.hasOwnProperty.call(SORT_MAPPING, sortParam)
      ? SORT_MAPPING[sortParam]
      : sortParam;
  }

  const pairs = [
    ['limit', String(limit)],
    ['page', String(page)],
  ];

  appendPair(pairs, 'category', category);
  appendPair(pairs, 'search', search != null ? String(search).trim() : '');
  appendPair(pairs, 'latitude', latitude);
  appendPair(pairs, 'longitude', longitude);
  appendPair(pairs, 'distance', distance);
  appendPair(pairs, 'listingType', listingType);
  appendPair(pairs, 'sortBy', sortParam);

  if (Array.isArray(priceRange)) {
    priceRange.forEach((item) => {
      if (item !== null && item !== undefined && item !== '') {
        pairs.push(['priceRange[]', String(item)]);
      }
    });
  }

  return pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * GET /posts/videos — Laravel simplePaginate (data, next_page_url, etc.)
 */
export async function fetchPostVideosPage(params = {}) {
  const token = await AsyncStorage.getItem('authToken');
  const qs = buildVideosQueryString(params);
  const url = `${process.env.BASE_URL}/posts/videos?${qs}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`posts/videos ${response.status}: ${text}`);
  }
  return response.json();
}
