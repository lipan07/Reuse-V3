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
  Pressable,
  Share,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { fetchPostVideosPage } from '../service/postVideosApi';
import {
  loadSharedListingFilters,
  saveSharedListingFilters,
  normalizeSharedFilters,
  getDefaultStoredLocation,
} from '../service/sharedListingFilters';
import { normalize } from '../utils/responsive';
import AnimatedFollowButton from './AnimatedFollowButton';

const PAGE_SIZE = 15;
const DOUBLE_TAP_MS = 320;

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

function reelsCategoryDisplayName(categoryId) {
  if (categoryId == null || categoryId === '') return 'Unknown';
  if (String(categoryId) === 'donate') return 'Donate';
  const chip = REELS_CATEGORY_CHIPS.find((c) => c.id != null && String(c.id) === String(categoryId));
  return chip?.label || 'Unknown';
}

async function togglePostLikeApi(postId) {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${process.env.BASE_URL}/follow-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ post_id: postId }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (e) {
    console.warn('[Reels] toggle like failed', e);
    return null;
  }
}

function formatListingLine(item) {
  const t = item.listing_type;
  if (t === 'donate') return 'Free · Donation';
  if (t === 'post_requirement') return 'Wanted';
  if (item.amount == null || item.amount === '') return '—';
  return `₹${item.amount}`;
}

const LOVE_BUBBLE_COLORS = ['#FF3B30', '#FF6B6B', '#FF8A80', '#FF5252', '#F48FB1', '#EF5350'];

/**
 * One floating heart — rises and fades like a bubble (mounted per burst).
 */
function LoveBubbleParticle({ width: screenW, viewportHeight: vh, spec }) {
  const { driftXStart, driftXEnd, size, duration, delay, color, anchorLeft, anchorTop } = spec;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(driftXStart)).current;
  const scale = useRef(new Animated.Value(0.35 + Math.random() * 0.2)).current;

  useEffect(() => {
    /* Longer rise when spawning lower — fills upward motion across the screen */
    const depth = Math.max(0, (anchorTop / vh) - 0.15);
    const rise = -(vh * (0.18 + Math.random() * 0.28 + depth * 0.22));
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: rise,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: driftXEnd,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: Math.min(200, duration * 0.12),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.55,
            delay: duration * 0.12,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.08 + Math.random() * 0.08,
            duration: duration * 0.28,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.35,
            duration: duration * 0.72,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mounted particle
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: anchorLeft,
        top: anchorTop,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      <MIcon name="heart" size={size} color={color} />
    </Animated.View>
  );
}

/**
 * Many hearts popping upward (water-bubble style) when burstKey changes.
 */
function LoveBubbleBurst({ burstKey, width: screenW, viewportHeight: vh }) {
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    if (!burstKey) {
      setSpecs([]);
      return;
    }
    const n = 48 + Math.floor(Math.random() * 28);
    const next = Array.from({ length: n }, (_, i) => {
      const size = normalize(8 + Math.random() * 16, screenW);
      const maxLeft = Math.max(0, screenW - size - 2);
      const anchorLeft = maxLeft > 0 ? Math.random() * maxLeft : 0;
      const anchorTop = vh * (0.04 + Math.random() * 0.92);
      return {
        id: `${burstKey}-${i}`,
        anchorLeft,
        anchorTop,
        driftXStart: (Math.random() - 0.5) * normalize(36, screenW),
        driftXEnd: (Math.random() - 0.5) * normalize(160, screenW),
        size,
        duration: 1600 + Math.random() * 900,
        delay: i * 10 + Math.random() * 120,
        color: LOVE_BUBBLE_COLORS[i % LOVE_BUBBLE_COLORS.length],
      };
    });
    setSpecs(next);
    const t = setTimeout(() => setSpecs([]), 5200);
    return () => clearTimeout(t);
  }, [burstKey, screenW]);

  if (!burstKey || specs.length === 0) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 5 }]} pointerEvents="none">
      {specs.map((s) => (
        <LoveBubbleParticle
          key={s.id}
          width={screenW}
          viewportHeight={vh}
          spec={{
            anchorLeft: s.anchorLeft,
            anchorTop: s.anchorTop,
            driftXStart: s.driftXStart,
            driftXEnd: s.driftXEnd,
            size: s.size,
            duration: s.duration,
            delay: s.delay,
            color: s.color,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Single reel: video, double-tap like burst, right rail (like / comment / share), bottom title + price.
 */
function ReelSlide({
  item,
  playing,
  viewportHeight,
  width,
  navigation,
  buyerId,
  onLikeUpdated,
  styles,
}) {
  const isLiked = !!item.is_liked;
  const likeCount = Math.max(0, Number(item.like_count) || 0);
  const isOwnPost = buyerId != null && String(buyerId) === String(item.user_id);

  const lastTapRef = useRef(0);
  const [loveBurstId, setLoveBurstId] = useState(0);

  const fireLoveBubbles = useCallback(() => {
    setLoveBurstId((n) => n + 1);
  }, []);

  const applyLikeFromApi = useCallback(
    async (json) => {
      if (!json || json.is_liked === undefined) return;
      onLikeUpdated(item.post_id, !!json.is_liked, Math.max(0, Number(json.like_count) || 0));
    },
    [item.post_id, onLikeUpdated]
  );

  const handleIconLike = useCallback(async () => {
    if (isOwnPost || !item.post_id) return;
    const json = await togglePostLikeApi(item.post_id);
    await applyLikeFromApi(json);
    if (json && json.is_liked) {
      fireLoveBubbles();
    }
  }, [isOwnPost, item.post_id, applyLikeFromApi, fireLoveBubbles]);

  const handleDoubleTapLayer = useCallback(() => {
    if (isOwnPost) return;
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      (async () => {
        if (!isLiked) {
          const json = await togglePostLikeApi(item.post_id);
          await applyLikeFromApi(json);
          if (json && json.is_liked) {
            fireLoveBubbles();
          }
        } else {
          fireLoveBubbles();
        }
      })();
    } else {
      lastTapRef.current = now;
    }
  }, [isOwnPost, isLiked, item.post_id, applyLikeFromApi, fireLoveBubbles]);

  const handleShare = useCallback(async () => {
    try {
      let baseUrl = process.env.APP_URL || process.env.BASE_URL || 'https://nearx.co';
      baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
      if (!baseUrl) baseUrl = 'https://nearx.co';
      const webLink = `${baseUrl}/product/${item.post_id}`;
      const productLink = `reuseapp://product/${item.post_id}`;
      const priceText =
        item.listing_type === 'donate'
          ? 'Free (Donation)'
          : `Price: ${formatListingLine(item)}`;
      const shareMessage =
        `Check out this ${item.title || 'listing'} on Reuse!\n\n` +
        `${priceText}\n\n` +
        `View details: ${webLink}\n` +
        `Or open in app: ${productLink}`;

      await Share.share({
        message: shareMessage,
        url: webLink,
        title: item.title || 'Reuse listing',
      });
    } catch (e) {
      console.warn('[Reels] share failed', e);
      Alert.alert('Error', 'Could not share this listing.');
    }
  }, [item]);

  const openChat = useCallback(() => {
    if (!buyerId || !item.user_id || !item.post_id) {
      Alert.alert('Sign in required', 'Please log in to message the seller.');
      return;
    }
    navigation.navigate('ChatBox', {
      sellerId: item.user_id,
      buyerId,
      postId: item.post_id,
      postTitle: item.title,
      postImage: null,
      chatId: null,
    });
  }, [navigation, buyerId, item]);

  const openProduct = useCallback(() => {
    navigation.navigate('ProductDetails', {
      productDetails: { id: item.post_id },
    });
  }, [navigation, item.post_id]);

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

      <Pressable
        style={styles.tapLayer}
        onPress={handleDoubleTapLayer}
        accessibilityLabel="Double tap to like"
      />

      <LoveBubbleBurst burstKey={loveBurstId} width={width} viewportHeight={viewportHeight} />

      {/* Right rail — like, comment, share (matches product details actions) */}
      <View style={styles.rightRail} pointerEvents="box-none">
        {!isOwnPost && (
          <View style={styles.railCol}>
            <AnimatedFollowButton isLiked={isLiked} onPress={handleIconLike} size={28} />
            <Text style={styles.railCount}>{likeCount}</Text>
          </View>
        )}
        {isOwnPost && (
          <View style={styles.railCol}>
            <MIcon name="heart" size={normalize(30, width)} color="rgba(255,255,255,0.35)" />
            <Text style={styles.railCount}>{likeCount}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.railBtn} onPress={openChat} activeOpacity={0.85}>
          <MIcon name="comment-outline" size={normalize(30, width)} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn} onPress={handleShare} activeOpacity={0.85}>
          <MIcon name="share-variant" size={normalize(26, width)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom: full-width text over video — no card box; larger transparent tap target */}
      <View style={styles.bottomInfo} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.productTapArea}
          onPress={openProduct}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`${item.title || 'Listing'}, ${formatListingLine(item)}`}
          accessibilityHint="Opens full product details"
        >
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title || 'View listing'}
          </Text>
          <Text style={styles.productAmount}>{formatListingLine(item)}</Text>
          <View style={styles.productTapFooterRow}>
            <Text style={styles.productTapHint} numberOfLines={1}>
              Tap to view details
            </Text>
            <View style={styles.productChevronHit}>
              <Icon name="chevron-right" size={normalize(24, width)} color="rgba(255,255,255,0.92)" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HomeVideoReels = ({ isActive, navigation, topInset = 0 }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { width: rawW, height: rawH } = useWindowDimensions();
  const width = Math.max(rawW || 375, 200);
  const height = Math.max(rawH || 812, 400);

  const [listingFilters, setListingFilters] = useState(() => normalizeSharedFilters({}));
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [buyerId, setBuyerId] = useState(null);

  const loadingMoreRef = useRef(false);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 88 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setVisibleIndex(viewableItems[0].index);
    }
  }).current;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const stored = await loadSharedListingFilters();
        if (!cancelled) {
          setListingFilters(normalizeSharedFilters(stored || {}));
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [route.params?.filters])
  );

  useEffect(() => {
    (async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setBuyerId(id);
      } catch (e) {
        setBuyerId(null);
      }
    })();
  }, []);

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
        tapLayer: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 1,
        },
        rightRail: {
          position: 'absolute',
          right: normalize(10, width),
          /* Slightly higher so it clears the full-width title strip */
          bottom: normalize(132, width),
          zIndex: 4,
          alignItems: 'center',
        },
        railCol: {
          alignItems: 'center',
          marginBottom: normalize(6, width),
        },
        railCount: {
          color: '#fff',
          fontSize: normalize(12, width),
          fontWeight: '700',
          marginTop: normalize(4, width),
          textShadowColor: 'rgba(0,0,0,0.75)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
        railBtn: {
          marginTop: normalize(14, width),
          padding: normalize(6, width),
          alignItems: 'center',
          justifyContent: 'center',
        },
        bottomInfo: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          paddingHorizontal: 0,
        },
        productTapArea: {
          alignSelf: 'stretch',
          width: '100%',
          paddingTop: normalize(10, width),
          paddingBottom: normalize(20, width) + (insets.bottom ?? 0),
          paddingHorizontal: normalize(12, width),
        },
        productTapFooterRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: normalize(8, width),
          width: '100%',
        },
        productChevronHit: {
          paddingVertical: normalize(4, width),
          paddingLeft: normalize(8, width),
          justifyContent: 'center',
        },
        productTapHint: {
          flex: 1,
          fontSize: normalize(12, width),
          fontWeight: '600',
          color: 'rgba(255,255,255,0.72)',
          letterSpacing: 0.2,
        },
        productTitle: {
          color: '#ffffff',
          fontSize: normalize(16, width),
          fontWeight: '700',
          textShadowColor: 'rgba(0,0,0,0.75)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        },
        productAmount: {
          marginTop: normalize(6, width),
          color: 'rgba(255,255,255,0.95)',
          fontSize: normalize(15, width),
          fontWeight: '600',
          textShadowColor: 'rgba(0,0,0,0.65)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
        topChrome: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingTop: topInset + normalize(6, width),
          paddingBottom: normalize(10, width),
          paddingHorizontal: normalize(12, width),
          backgroundColor: 'rgba(0,0,0,0.45)',
        },
        searchBar: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: normalize(40, width),
          marginBottom: normalize(8, width),
          paddingHorizontal: normalize(10, width),
          paddingVertical: normalize(6, width),
          borderRadius: normalize(12, width),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        searchInput: {
          flex: 1,
          marginLeft: normalize(6, width),
          paddingVertical: normalize(2, width),
          fontSize: normalize(14, width),
          color: '#fff',
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
        /** Same glass treatment as `searchBar` / chips — no solid white card on video */
        filterBarContainer: {
          marginBottom: normalize(8, width),
          paddingHorizontal: normalize(10, width),
          paddingVertical: normalize(8, width),
          borderRadius: normalize(12, width),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        activeFiltersContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
        },
        activeFiltersText: {
          fontSize: normalize(12, width),
          color: 'rgba(255,255,255,0.72)',
          fontWeight: '600',
          marginRight: normalize(6, width),
        },
        filterPill: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderRadius: normalize(12, width),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.32)',
          paddingVertical: normalize(4, width),
          paddingHorizontal: normalize(8, width),
          margin: normalize(3, width),
        },
        filterPillText: {
          color: 'rgba(255,255,255,0.95)',
          fontSize: normalize(10, width),
          fontWeight: '600',
          marginRight: normalize(4, width),
          flexShrink: 1,
        },
        quickFilterButton: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: normalize(6, width),
        },
        quickFilterText: {
          color: 'rgba(255,255,255,0.92)',
          fontSize: normalize(12, width),
          fontWeight: '600',
          marginLeft: normalize(4, width),
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
    [width, topInset, insets.bottom]
  );

  const refreshOffset = topInset + headerHeight;

  const handleLikeUpdated = useCallback((postId, is_liked, like_count) => {
    setItems((prev) =>
      prev.map((it) => (it.post_id === postId ? { ...it, is_liked, like_count } : it))
    );
  }, []);

  const buildVideoRequestBase = useCallback(async () => {
    const f = normalizeSharedFilters(listingFilters);
    if (!f.latitude || !f.longitude) {
      const loc = await getDefaultStoredLocation();
      if (loc) {
        f.latitude = loc.latitude;
        f.longitude = loc.longitude;
        f.distance = f.distance ?? 5;
      }
    }
    return {
      category: f.category,
      search: f.search,
      latitude: f.latitude,
      longitude: f.longitude,
      distance: f.distance,
      listingType: f.listingType,
      priceRange: f.priceRange,
      sortBy: f.sortBy,
    };
  }, [listingFilters]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const req = await buildVideoRequestBase();
      const json = await fetchPostVideosPage({
        ...req,
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
  }, [buildVideoRequestBase]);

  useEffect(() => {
    if (!isActive) return;
    loadInitial();
  }, [isActive, loadInitial]);

  const loadMore = useCallback(async () => {
    if (!isActive || !hasMore || loading || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const next = page + 1;
    try {
      const req = await buildVideoRequestBase();
      const json = await fetchPostVideosPage({
        ...req,
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
  }, [isActive, hasMore, loading, page, buildVideoRequestBase]);

  const onRefresh = useCallback(() => {
    if (!isActive || loading) return;
    setRefreshing(true);
    loadInitial();
  }, [isActive, loading, loadInitial]);

  const reelsActiveFilterCount = useMemo(() => {
    const f = listingFilters;
    let c = 0;
    if (f.search?.trim()) c++;
    if (f.category) c++;
    if (f.distance != null && Number(f.distance) !== 5) c++;
    if (f.listingType != null) c++;
    if (f.priceRange?.[0] || f.priceRange?.[1]) c++;
    if (f.sortBy) c++;
    return c;
  }, [listingFilters]);

  const handleRemoveReelFilter = useCallback((filterType) => {
    setListingFilters((prev) => {
      const next = { ...prev };
      switch (filterType) {
        case 'search':
          next.search = '';
          break;
        case 'category':
          next.category = null;
          break;
        case 'distance':
          next.distance = 5;
          break;
        case 'listingType':
          next.listingType = null;
          break;
        case 'priceRange':
          next.priceRange = [];
          break;
        case 'sortBy':
          next.sortBy = null;
          break;
        default:
          break;
      }
      const normalized = normalizeSharedFilters(next);
      saveSharedListingFilters(normalized);
      return normalized;
    });
  }, []);

  const resetAllReelFilters = useCallback(() => {
    const reset = normalizeSharedFilters({
      search: '',
      category: null,
      priceRange: [],
      sortBy: null,
      distance: 5,
      listingType: null,
      latitude: null,
      longitude: null,
      address: '',
    });
    setListingFilters(reset);
    saveSharedListingFilters(reset);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      const playing = isActive && index === visibleIndex && !!item.video_url;
      return (
        <ReelSlide
          item={item}
          playing={playing}
          viewportHeight={viewportHeight}
          width={width}
          navigation={navigation}
          buyerId={buyerId}
          onLikeUpdated={handleLikeUpdated}
          styles={styles}
        />
      );
    },
    [isActive, visibleIndex, viewportHeight, width, navigation, buyerId, handleLikeUpdated, styles]
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
          Try another category, adjust search, or pull down to refresh.
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
        <View style={styles.searchBar}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}
            onPress={() =>
              navigation.navigate('FilterScreen', {
                initialFilters: { ...listingFilters },
                filterReturnScreen: 'VideoReels',
              })
            }
            activeOpacity={0.85}
          >
            <Icon name="search" size={normalize(20, width)} color="rgba(255,255,255,0.75)" />
            <Text
              style={[
                styles.searchInput,
                !listingFilters.search?.trim() ? { color: 'rgba(255,255,255,0.45)' } : null,
              ]}
              numberOfLines={1}
            >
              {listingFilters.search?.trim() ? listingFilters.search : 'Search by title…'}
            </Text>
          </TouchableOpacity>
          {listingFilters.search?.trim() ? (
            <TouchableOpacity
              onPress={() => {
                setListingFilters((prev) => {
                  const next = normalizeSharedFilters({ ...prev, search: '' });
                  saveSharedListingFilters(next);
                  return next;
                });
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={normalize(20, width)} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {reelsActiveFilterCount > 0 ? (
          <View style={styles.filterBarContainer}>
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersText}>Filters:</Text>
              {listingFilters.search?.trim() ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('search')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText} numberOfLines={1}>
                    Search: {listingFilters.search}
                  </Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              {listingFilters.category ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('category')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText} numberOfLines={1}>
                    Category: {reelsCategoryDisplayName(listingFilters.category)}
                  </Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              {listingFilters.distance != null && Number(listingFilters.distance) !== 5 ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('distance')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText}>Radius: {listingFilters.distance}km</Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              {listingFilters.listingType != null ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('listingType')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText} numberOfLines={1}>
                    Type:{' '}
                    {listingFilters.listingType
                      ? listingFilters.listingType.charAt(0).toUpperCase() + listingFilters.listingType.slice(1)
                      : 'All'}
                  </Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              {(listingFilters.priceRange?.[0] || listingFilters.priceRange?.[1]) ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('priceRange')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText} numberOfLines={2}>
                    Price: {listingFilters.priceRange?.[0] ? `₹${listingFilters.priceRange[0]}` : 'Any'} -
                    {listingFilters.priceRange?.[1] ? `₹${listingFilters.priceRange[1]}` : 'Any'}
                  </Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              {listingFilters.sortBy != null ? (
                <TouchableOpacity style={styles.filterPill} onPress={() => handleRemoveReelFilter('sortBy')} activeOpacity={0.85}>
                  <Text style={styles.filterPillText} numberOfLines={1}>
                    Sort: {listingFilters.sortBy}
                  </Text>
                  <Icon name="close" size={normalize(10, width)} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.quickFilterButton} onPress={resetAllReelFilters} activeOpacity={0.85}>
                <Icon name="refresh" size={normalize(16, width)} color="#FF9800" />
                <Text style={styles.quickFilterText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {REELS_CATEGORY_CHIPS.map((chip) => {
            const selected = isChipSelected(listingFilters.category, chip.id);
            return (
              <TouchableOpacity
                key={chip.id === null ? 'all' : String(chip.id)}
                onPress={() => {
                  setListingFilters((prev) => {
                    const next = normalizeSharedFilters({ ...prev, category: chip.id });
                    saveSharedListingFilters(next);
                    return next;
                  });
                }}
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
