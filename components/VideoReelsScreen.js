import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeVideoReels from './HomeVideoReels';

/**
 * Full-screen vertical reels: no app header, no bottom tab bar on this screen.
 */
const VideoReelsScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      <HomeVideoReels
        isActive={isFocused}
        navigation={navigation}
        topInset={insets.top ?? 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default VideoReelsScreen;
