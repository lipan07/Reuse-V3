import { Dimensions } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const TABLET_BREAKPOINT = 600;
const LARGE_TABLET_BREAKPOINT = 900;
const MAX_SCALE = 1.25; // Cap scale so tablet UI doesn't get too big

/**
 * Returns true if the device is tablet-sized (width >= 600)
 */
export const isTablet = (width = Dimensions.get('window').width) => width >= TABLET_BREAKPOINT;

/**
 * Number of post columns for the dashboard grid.
 * Phone: 2, Small tablet: 4, Large tablet: 5
 */
export const getNumColumns = (width = Dimensions.get('window').width) => {
  if (width >= LARGE_TABLET_BREAKPOINT) return 5;
  if (width >= TABLET_BREAKPOINT) return 4;
  return 2;
};

/**
 * Scale factor for fonts and elements. Capped so tablet doesn't show oversized text.
 */
export const getResponsiveScale = (width = Dimensions.get('window').width) => {
  const scale = width / BASE_WIDTH;
  return Math.min(scale, MAX_SCALE);
};

/**
 * Vertical scale, also capped for consistency
 */
export const getVerticalScale = (height = Dimensions.get('window').height) => {
  const scale = height / BASE_HEIGHT;
  return Math.min(scale, MAX_SCALE);
};

/**
 * Normalize size for horizontal/responsive scaling (capped on tablet)
 */
export const normalize = (size, width = Dimensions.get('window').width) =>
  Math.round(getResponsiveScale(width) * size);

/**
 * Normalize size for vertical scaling (capped on tablet)
 */
export const normalizeVertical = (size, height = Dimensions.get('window').height) =>
  Math.round(getVerticalScale(height) * size);
