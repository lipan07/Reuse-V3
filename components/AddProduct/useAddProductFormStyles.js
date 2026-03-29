import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getAddProductFormStyles } from '../../assets/css/AddProductForm.styles.js';
import {
  getAddProductModernStyles,
  getVideoPickerTheme,
} from '../../assets/css/AddProductModern.styles.js';
import { useTheme } from '../../context/ThemeContext';

export function useAddProductFormStyles() {
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  return useMemo(() => {
    const base = getAddProductFormStyles(width, height, isDarkMode);
    const modernStyles = getAddProductModernStyles(width, height, isDarkMode);
    const videoPicker = getVideoPickerTheme(isDarkMode);
    return {
      ...base,
      modernStyles,
      placeholderColor: isDarkMode ? '#64748b' : '#999999',
      labelIconColor: isDarkMode ? '#94a3b8' : '#666666',
      videoPickerStyles: videoPicker.styles,
      videoAccent: videoPicker.accent,
      videoDanger: videoPicker.danger,
    };
  }, [width, height, isDarkMode]);
}
