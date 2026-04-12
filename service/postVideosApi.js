import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Build query string without URLSearchParams.set — Hermes/RN often lacks full URLSearchParams.
 */
function buildVideosQueryString({ category, page, limit, search }) {
  const pairs = [
    ['limit', String(limit)],
    ['page', String(page)],
  ];
  if (category != null && category !== '') {
    pairs.push(['category', String(category)]);
  }
  if (search != null && String(search).trim() !== '') {
    pairs.push(['search', String(search).trim()]);
  }
  return pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * GET /posts/videos — Laravel paginate (data, next_page_url, etc.)
 */
export async function fetchPostVideosPage({ category, page = 1, limit = 15, search } = {}) {
  const token = await AsyncStorage.getItem('authToken');
  const qs = buildVideosQueryString({ category, page, limit, search });
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
