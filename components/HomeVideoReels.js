import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchPostVideosPage } from '../service/postVideosApi';
import { normalize } from '../utils/responsive';

const PAGE_SIZE = 15;

/** Same filter IDs as home API; short labels for reel-style chips */
const REELS_CATEGORY_CHIPS = [
  { id: null, label: 'All' },
  { id: '1', label: 'Cars' },
  { id: '2', label: 'Property' },
  { id: '7', label: 'Mobiles' },
  { id: '8', label: 'Jobs' },
  { id: '24', label: 'Bikes' },
  { id: '29', label: 'Electronics' },
  { id: '39', label: 'Commercial' },
  { id: '42', label: 'Machinery' },
  { id: '45', label: 'Furniture' },
  { id: '51', label: 'Fashion' },
  { id: '55', label: 'Books & sport' },
  { id: '61', label: 'Pets' },
  { id: '66', label: 'Services' },
  { id: '76', label: 'Others' },
];

function isChipSelected(selectedCategory, chipId) {
  if (chipId === null || chipId === undefined) {
    return selectedCategory === null || selectedCategory === undefined || selectedCategory === '';
  }
  return String(selectedCategory) === String(chipId);
}

const HomeVideoReels = ({ isActive, navigation, topInset = 0 }) => {
  const { width: rawW, height: rawH } = useWindowDimensions();
  const width = Math.max(rawW || 375, 200);
  const height = Math.max(rawH || 812, 400);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const loadingMoreRef = useRef(false);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 88 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setVisibleIndex(viewableItems[0].index);
    }
  }).current;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, width, backgroundColor: '#000' },
        listWrap: { flex: 1 },
        page: {
          width,
          justifyContent: 'center',
          backgroundColor: '#000',
        },
        video: {
          ...StyleSheet.absoluteFillObject,
        },
        topChrome: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingTop: topInset + normalize(6, width),
          paddingBottom: normalize(10, width),
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: normalize(8, width),
          marginBottom: normalize(8, width),
        },
        backHit: {
          width: normalize(44, width),
          height: normalize(44, width),
          alignItems: 'center',
          justifyContent: 'center',
        },
        chipScroll: {
          flexGrow: 0,
        },
        chipScrollContent: {
          paddingHorizontal: normalize(8, width),
          alignItems: 'center',
          flexDirection: 'row',
        },
        chip: {
          paddingVertical: normalize(8, width),
          paddingHorizontal: normalize(14, width),
          borderRadius: normalize(20, width),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.35)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          marginRight: normalize(8, width),
        },
        chipSelected: {
          backgroundColor: '#ffffff',
          borderColor: '#ffffff',
        },
        chipLabel: {
          color: 'rgba(255,255,255,0.92)',
          fontSize: normalize(13, width),
          fontWeight: '600',
        },
        chipLabelSelected: {
          color: '#000000',
        },
        overlayBottom: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: normalize(16, width),
          paddingBottom: normalize(28, width),
          paddingTop: normalize(56, width),
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: normalize(10, width),
        },
        titleText: {
          flex: 1,
          color: '#ffffff',
          fontSize: normalize(16, width),
          fontWeight: '700',
          textShadowColor: 'rgba(0,0,0,0.75)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        },
        titleChevron: {
          width: normalize(40, width),
          height: normalize(40, width),
          borderRadius: normalize(20, width),
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        centerMsg: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: normalize(24, width),
        },
        hintText: {
          color: 'rgba(255,255,255,0.65)',
          fontSize: normalize(14, width),
          textAlign: 'center',
          marginTop: normalize(8, width),
        },
      }),
    [width, topInset]
  );

  const refreshOffset = topInset + headerHeight;

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const json = await fetchPostVideosPage({
        category: selectedCategory,
        page: 1,
        limit: PAGE_SIZE,
      });
      const batch = Array.isArray(json.data) ? json.data : [];
      setItems(batch);
      setPage(1);
      setHasMore(!!json.next_page_url);
      setVisibleIndex(0);
    } catch (e) {
      console.warn('HomeVideoReels initial load failed', e);
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!isActive) return;
    loadInitial();
  }, [isActive, selectedCategory, loadInitial]);

  const loadMore = useCallback(async () => {
    if (!isActive || !hasMore || loading || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const next = page + 1;
    try {
      const json = await fetchPostVideosPage({
        category: selectedCategory,
        page: next,
        limit: PAGE_SIZE,
      });
      const batch = Array.isArray(json.data) ? json.data : [];
      setItems((prev) => [...prev, ...batch]);
      setPage(next);
      setHasMore(!!json.next_page_url);
    } catch (e) {
      console.warn('HomeVideoReels load more failed', e);
      setHasMore(false);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [isActive, hasMore, loading, page, selectedCategory]);

  const onRefresh = useCallback(() => {
    if (!isActive || loading) return;
    setRefreshing(true);
    loadInitial();
  }, [isActive, loading, loadInitial]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const playing = isActive && index === visibleIndex && !!item.video_url;
      return (
        <View style={[styles.page, { height: viewportHeight }]}>
          {item.video_url ? (
            <Video
              source={{ uri: item.video_url }}
              style={styles.video}
              resizeMode="cover"
              repeat
              paused={!playing}
              muted={false}
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              playWhenInactive={false}
              controls={false}
            />
          ) : (
            <View style={[styles.centerMsg, { height: viewportHeight }]}>
              <Icon name="videocam-off" size={normalize(48, width)} color="#64748b" />
              <Text style={styles.hintText}>No video URL</Text>
            </View>
          )}
          <View style={styles.overlayBottom} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.titleRow}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('ProductDetails', {
                  productDetails: { id: item.post_id },
                })
              }
            >
              <Text style={styles.titleText} numberOfLines={2}>
                {item.title || 'View listing'}
              </Text>
              <View style={styles.titleChevron}>
                <Icon name="chevron-right" size={normalize(28, width)} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [isActive, visibleIndex, viewportHeight, styles, width, navigation]
  );

  const keyExtractor = useCallback((item) => String(item.post_id), []);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: viewportHeight,
      offset: viewportHeight * index,
      index,
    }),
    [viewportHeight]
  );

  const listEmpty =
    !loading && items.length === 0 ? (
      <View style={[styles.centerMsg, { minHeight: viewportHeight || height * 0.5 }]}>
        <Icon name="movie" size={normalize(56, width)} color="#475569" />
        <Text style={styles.hintText}>No videos for this filter.</Text>
        <Text style={[styles.hintText, { marginTop: normalize(4, width), fontSize: normalize(12, width) }]}>
          Try another category or pull down to refresh.
        </Text>
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <View
        style={styles.listWrap}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - viewportHeight) > 1) {
            setViewportHeight(h);
          }
        }}
      >
        {viewportHeight <= 0 ? (
          <View style={styles.centerMsg}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : loading && items.length === 0 ? (
          <View style={[styles.centerMsg, { height: viewportHeight }]}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            pagingEnabled
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            snapToInterval={viewportHeight}
            snapToAlignment="start"
            disableIntervalMomentum
            getItemLayout={viewportHeight > 0 ? getItemLayout : undefined}
            onEndReached={() => loadMore()}
            onEndReachedThreshold={0.35}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListEmptyComponent={listEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
                colors={['#ffffff']}
                progressViewOffset={Math.max(refreshOffset, topInset + normalize(52, width))}
              />
            }
          />
        )}
      </View>

      <View
        style={styles.topChrome}
        pointerEvents="box-none"
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backHit} onPress={goBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="arrow-back" size={normalize(26, width)} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {REELS_CATEGORY_CHIPS.map((chip) => {
            const selected = isChipSelected(selectedCategory, chip.id);
            return (
              <TouchableOpacity
                key={chip.id === null ? 'all' : String(chip.id)}
                onPress={() => setSelectedCategory(chip.id)}
                style={[styles.chip, selected && styles.chipSelected]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeVideoReels;
