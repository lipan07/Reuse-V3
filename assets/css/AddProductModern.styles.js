import { StyleSheet, Platform } from 'react-native';

/**
 * Shared "modern" add-product layout (header, fields, sticky CTA, location).
 * Mirrors the former per-file modernStyles blocks with dark mode support.
 */
export function getAddProductModernStyles(width, height, isDarkMode = false) {
  const d = isDarkMode;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
  const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
  const normalize = (size) => Math.round(scale * size);
  const normalizeVertical = (size) => Math.round(verticalScale * size);

  const pageBg = d ? '#121212' : '#F8F9FA';
  const surface = d ? '#1e293b' : '#FFFFFF';
  const surface2 = d ? '#0f172a' : '#F3F4F6';
  const border = d ? '#334155' : '#E5E7EB';
  const borderLight = d ? '#475569' : '#E5E7EB';
  const textPrimary = d ? '#f1f5f9' : '#1F2937';
  const textSecondary = d ? '#94a3b8' : '#6B7280';
  const textMuted = d ? '#cbd5e1' : '#374151';
  const shadowOpacity = d ? 0.35 : 0.05;
  const shadowOpacitySm = d ? 0.25 : 0.03;
  const predBorder = d ? '#334155' : '#E5E7EB';
  const predItemBorder = d ? '#334155' : '#F3F4F6';
  const green = d ? '#22c55e' : '#4CAF50';
  const greenShadow = d ? '#22c55e' : '#4CAF50';
  const disabledBg = d ? '#475569' : '#9CA3AF';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: pageBg,
    },
    container: {
      flex: 1,
      backgroundColor: pageBg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(20),
      paddingTop: normalizeVertical(12),
      paddingBottom: normalizeVertical(16),
      backgroundColor: surface,
      borderBottomWidth: 1,
      borderBottomColor: border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: d ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    backButton: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: normalize(20),
      backgroundColor: surface2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: normalize(12),
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: normalize(20),
      fontWeight: '700',
      color: textPrimary,
      marginBottom: normalizeVertical(2),
    },
    headerSubtitle: {
      fontSize: normalize(13),
      color: textSecondary,
      fontWeight: '400',
    },
    scrollContent: {
      padding: normalize(20),
      paddingBottom: normalizeVertical(100),
    },
    fieldContainer: {
      marginBottom: normalizeVertical(24),
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalizeVertical(10),
    },
    labelIcon: {
      marginRight: normalize(8),
    },
    label: {
      fontSize: normalize(15),
      fontWeight: '600',
      color: textMuted,
      letterSpacing: 0.2,
    },
    sectionTitle: {
      fontSize: normalize(16),
      fontWeight: '600',
      color: textMuted,
      letterSpacing: 0.2,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      backgroundColor: surface,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(16),
      paddingVertical: normalizeVertical(14),
      fontSize: normalize(15),
      color: textPrimary,
      borderWidth: 1.5,
      borderColor: borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    textArea: {
      height: normalizeVertical(100),
      paddingTop: normalizeVertical(14),
      textAlignVertical: 'top',
    },
    addressInput: {
      backgroundColor: surface,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(16),
      paddingVertical: normalizeVertical(14),
      fontSize: normalize(15),
      color: textPrimary,
      borderWidth: 1.5,
      borderColor: borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    selectButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: surface,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(16),
      paddingVertical: normalizeVertical(14),
      borderWidth: 1.5,
      borderColor: borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    selectButtonText: {
      fontSize: normalize(15),
      color: textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    toggleContainer: {
      backgroundColor: surface,
      borderRadius: normalize(12),
      padding: normalize(16),
      borderWidth: 1.5,
      borderColor: borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    toggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    toggleIcon: {
      marginRight: normalize(12),
    },
    toggleTitle: {
      fontSize: normalize(15),
      fontWeight: '600',
      color: textMuted,
      marginBottom: normalizeVertical(2),
    },
    toggleDescription: {
      fontSize: normalize(12),
      color: textSecondary,
      fontWeight: '400',
    },
    stickyButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: surface,
      paddingHorizontal: normalize(20),
      paddingTop: normalizeVertical(12),
      paddingBottom: normalizeVertical(Platform.OS === 'ios' ? 20 : 16),
      borderTopWidth: 1,
      borderTopColor: border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity,
      shadowRadius: 4,
      elevation: 5,
    },
    submitButton: {
      backgroundColor: green,
      borderRadius: normalize(12),
      paddingVertical: normalizeVertical(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: greenShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: d ? 0.35 : 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    disabledButton: {
      backgroundColor: disabledBg,
      shadowOpacity: 0.1,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: pageBg,
    },
    loaderText: {
      marginTop: normalizeVertical(12),
      fontSize: normalize(15),
      color: textSecondary,
      fontWeight: '500',
    },
    locationContainer: {
      marginBottom: 0,
      zIndex: 100,
    },
    locationInputWrapper: {
      backgroundColor: surface,
      borderRadius: normalize(12),
      borderWidth: 1.5,
      borderColor: borderLight,
      paddingLeft: normalize(16),
      paddingRight: normalize(8),
      minHeight: normalizeVertical(48),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: shadowOpacitySm,
      shadowRadius: 2,
      elevation: 1,
    },
    locationInput: {
      flex: 1,
      paddingVertical: normalizeVertical(14),
      paddingRight: normalize(8),
      fontSize: normalize(15),
      color: textPrimary,
      textAlign: 'left',
    },
    locationPredictions: {
      position: 'absolute',
      top: normalize(48),
      left: 0,
      right: 0,
      backgroundColor: surface,
      borderRadius: normalize(10),
      borderWidth: 1,
      borderColor: predBorder,
      maxHeight: normalize(180),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: d ? 0.4 : 0.15,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    locationPredictionItem: {
      paddingVertical: normalize(12),
      paddingHorizontal: normalize(14),
      borderBottomWidth: 1,
      borderBottomColor: predItemBorder,
    },
    locationPredictionText: {
      fontSize: normalize(13),
      color: textMuted,
      lineHeight: normalize(18),
    },
  });
}

/**
 * Video upload row (compress/upload progress, dashed picker, success state).
 * Returns StyleSheet styles plus accent/danger for vector icons.
 */
export function getVideoPickerTheme(isDarkMode = false) {
  const d = isDarkMode;
  const accent = d ? '#60a5fa' : '#007BFF';
  const muted = d ? '#94a3b8' : '#666666';
  const surface = d ? '#1e293b' : '#FFFFFF';
  const surfaceSoft = d ? '#0f172a' : '#F5F7FA';
  const border = d ? '#334155' : '#E5E7EB';
  const track = d ? '#334155' : '#E0E0E0';
  const danger = d ? '#f87171' : '#DC2626';
  const dangerBg = d ? 'rgba(127, 29, 29, 0.45)' : '#FEE2E2';
  const dangerBorder = d ? '#7f1d1d' : '#FECACA';
  const shadowOpacity = d ? 0.25 : 0.1;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    uploadArea: {
      width: '100%',
    },
    progressWrapper: {
      width: '100%',
    },
    progressCard: {
      width: '100%',
      backgroundColor: surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1.5,
      borderColor: border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity,
      shadowRadius: 10,
      elevation: 4,
    },
    progressContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    progressLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    progressTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    progressTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: accent,
      marginBottom: 4,
    },
    progressSubtext: {
      fontSize: 11,
      color: muted,
      fontWeight: '400',
    },
    progressRight: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      minWidth: 50,
      flexShrink: 0,
    },
    progressPercent: {
      fontSize: 13,
      fontWeight: '600',
      color: accent,
    },
    progressBarWrapper: {
      width: '100%',
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: track,
      borderRadius: 2,
      overflow: 'hidden',
      width: '100%',
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: accent,
    },
    uploadButton: {
      borderWidth: 1,
      borderColor: accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surfaceSoft,
      marginBottom: 18,
      width: '100%',
      height: 74,
      alignSelf: 'center',
      borderStyle: 'dashed',
    },
    uploadText: {
      marginTop: 5,
      fontSize: 13,
      color: accent,
      textAlign: 'center',
    },
    videoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: surfaceSoft,
      borderRadius: 12,
      marginTop: 0,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: accent,
    },
    videoInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    successIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      flexShrink: 0,
    },
    videoTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    videoUrlText: {
      color: accent,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    videoSubtext: {
      color: muted,
      fontSize: 11,
      fontWeight: '400',
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: dangerBg,
      borderWidth: 1,
      borderColor: dangerBorder,
      gap: 5,
    },
    removeButtonText: {
      color: danger,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    uploadAreaDisabled: {
      opacity: 0.6,
    },
    hintText: {
      fontSize: 11,
      color: muted,
      marginTop: 4,
      textAlign: 'center',
      fontWeight: '400',
      lineHeight: 16,
    },
  });

  return { styles, accent, danger };
}
