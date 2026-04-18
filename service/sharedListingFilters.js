import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reuse_shared_listing_filters_v1';

export function normalizeSharedFilters(f = {}) {
  return {
    search: f.search ?? '',
    category: f.category ?? null,
    priceRange: Array.isArray(f.priceRange) ? f.priceRange : [],
    sortBy: f.sortBy ?? null,
    distance: f.distance ?? 5,
    listingType: f.listingType ?? null,
    latitude: f.latitude ?? null,
    longitude: f.longitude ?? null,
    address: f.address ?? '',
  };
}

export async function saveSharedListingFilters(filters) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters ?? {}));
  } catch (e) {
    console.warn('[sharedListingFilters] save failed', e);
  }
}

export async function loadSharedListingFilters() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** Same source as Home (`defaultLocation` from FilterScreen / LocationPicker). */
export async function getDefaultStoredLocation() {
  try {
    const locationString = await AsyncStorage.getItem('defaultLocation');
    if (!locationString) return null;
    const location = JSON.parse(locationString);
    if (location?.latitude && location?.longitude) {
      return location;
    }
    return null;
  } catch (e) {
    return null;
  }
}
