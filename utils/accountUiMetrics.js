/**
 * Shared responsive scaling for Account hub screens (Account, Following, Settings, etc.).
 * Matches ChatBox / FilterScreen: caps growth on tablets so text and UI do not balloon.
 */
export function getAccountUiMetrics(width, height) {
  const shortEdge = Math.min(width, height);
  const isLargeScreen = shortEdge >= 560 || width >= 600;
  const maxUiScale = isLargeScreen ? 1.12 : 1.34;
  const layoutScale = Math.min(width / 375, maxUiScale);
  const fontScale = Math.min(shortEdge / 375, maxUiScale);
  const vertScale = Math.min(height / 812, maxUiScale);
  const n = (s) => Math.round(layoutScale * s);
  const nf = (s) => Math.round(fontScale * s);
  const nv = (s) => Math.round(vertScale * s);
  const contentMaxWidth = isLargeScreen ? Math.min(width, 560) : width;
  return { n, nf, nv, contentMaxWidth, isLargeScreen };
}
