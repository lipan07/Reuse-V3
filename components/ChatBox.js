import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Animated,
  FlatList,
  ActivityIndicator,
  BackHandler,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { isMessageSeen, sameMessageId } from '../utils/chatUtils';
import { useTheme } from '../context/ThemeContext';

/** Keeps first occurrence per message id — API pages can overlap or requests can race when loading older messages. */
function dedupeMessagesById(messages) {
  const seen = new Set();
  const out = [];
  for (const m of messages) {
    const id = m?.id != null ? String(m.id) : '';
    if (id === '') {
      out.push(m);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(m);
  }
  return out;
}

/** Prepends older page results, skipping any message id already present (avoids duplicate FlatList keys). */
function prependOlderMessagesUnique(olderBatch, existing) {
  const existingIds = new Set(
    existing.map(m => (m?.id != null ? String(m.id) : '')).filter(Boolean)
  );
  const uniqueOlder = [];
  for (const m of olderBatch) {
    const id = m?.id != null ? String(m.id) : '';
    if (!id) {
      uniqueOlder.push(m);
      continue;
    }
    if (existingIds.has(id)) continue;
    existingIds.add(id);
    uniqueOlder.push(m);
  }
  return [...uniqueOlder, ...existing];
}

const ChatBox = ({ route }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();

  /** Caps scaling on tablets / large windows so text and chrome stay readable; centers a max-width column. */
  const chatLayout = useMemo(() => {
    const shortEdge = Math.min(winW, winH);
    const isLargeScreen = shortEdge >= 560 || winW >= 600;
    const maxUiScale = isLargeScreen ? 1.12 : 1.34;
    const layoutScale = Math.min(winW / 375, maxUiScale);
    const fontScale = Math.min(shortEdge / 375, maxUiScale);
    const vertScale = Math.min(winH / 812, maxUiScale);
    const n = (s) => Math.round(layoutScale * s);
    const nf = (s) => Math.round(fontScale * s);
    const nv = (s) => Math.round(vertScale * s);
    const contentMaxWidth = isLargeScreen ? Math.min(winW, 560) : winW;
    const bubbleMaxWidth = Math.min(winW * 0.82, isLargeScreen ? 440 : 340);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      outerColumn: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
      },
      chatListFlex: {
        flex: 1,
      },
      chatHistory: {
        padding: n(20),
        paddingTop: n(10),
      },
      messageContainer: {
        maxWidth: bubbleMaxWidth,
        padding: n(10),
        borderRadius: n(14),
        marginVertical: n(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      },
      messageLeft: {
        backgroundColor: '#89bed6',
        alignSelf: 'flex-start',
      },
      messageRight: {
        backgroundColor: '#007BFF',
        alignSelf: 'flex-end',
      },
      footer: {
        paddingVertical: nv(8),
        paddingHorizontal: n(16),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
      },
      iosFooter: {
        marginBottom: n(20),
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F3F4F6',
        borderRadius: n(24),
        paddingHorizontal: n(16),
        paddingVertical: n(6),
      },
      input: {
        flex: 1,
        fontSize: nf(14),
        color: '#1F2937',
        maxHeight: n(100),
        minHeight: n(36),
        paddingVertical: n(6),
        marginRight: n(8),
      },
      sendButton: {
        width: n(40),
        height: n(40),
        borderRadius: n(20),
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007BFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
      sendButtonDisabled: {
        backgroundColor: 'rgba(122, 152, 227, 1)',
      },
      sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: nf(14),
      },
      messageText: {
        color: '#fff',
        fontSize: nf(13),
        lineHeight: nf(18),
      },
      timeText: {
        color: '#eee',
        fontSize: nf(10),
        marginRight: n(4),
      },
      tickText: {
        color: '#eee',
        fontSize: nf(10),
      },
      tickTextBlue: {
        color: '#4fc3f7',
        fontSize: nf(10),
      },
      timeTickRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: n(2),
        marginLeft: n(2),
      },
      dateSeparatorContainer: {
        alignItems: 'center',
        marginVertical: n(8),
      },
      dateSeparatorText: {
        backgroundColor: '#dbeafe',
        color: '#333',
        paddingHorizontal: n(12),
        paddingVertical: n(3),
        borderRadius: n(12),
        fontSize: nf(12),
        fontWeight: 'bold',
        overflow: 'hidden',
      },
      headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: n(16),
        paddingVertical: n(12),
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
      },
      headerImage: {
        width: n(50),
        height: n(50),
        borderRadius: n(10),
        marginRight: n(12),
        backgroundColor: '#F3F4F6',
      },
      headerContent: {
        flex: 1,
      },
      headerTopSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: n(4),
        gap: n(8),
      },
      headerTitle: {
        fontSize: nf(15),
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        lineHeight: nf(20),
      },
      listingTypeBadge: {
        paddingHorizontal: n(8),
        paddingVertical: n(3),
        borderRadius: n(4),
      },
      listingTypeBadgeDonate: {
        backgroundColor: '#FEE2E2',
      },
      listingTypeBadgeSell: {
        backgroundColor: '#D1FAE5',
      },
      listingTypeBadgeRent: {
        backgroundColor: '#DBEAFE',
      },
      listingTypeBadgeYellow: {
        backgroundColor: '#FEF3C7',
      },
      listingTypeText: {
        fontSize: nf(8),
        fontWeight: '700',
        letterSpacing: 0.5,
      },
      listingTypeTextDonate: {
        color: '#DC2626',
      },
      listingTypeTextSell: {
        color: '#059669',
      },
      listingTypeTextRent: {
        color: '#2563EB',
      },
      listingTypeTextYellow: {
        color: '#D97706',
      },
      headerMetaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: n(4),
      },
      productPrice: {
        fontSize: nf(13),
        fontWeight: '600',
        color: '#059669',
      },
      metaSeparator: {
        fontSize: nf(12),
        color: '#9CA3AF',
        marginHorizontal: n(6),
      },
      productCategory: {
        fontSize: nf(12),
        color: '#6B7280',
        fontWeight: '400',
      },
      userStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: n(8),
      },
      userName: {
        fontSize: nf(12),
        color: '#374151',
        fontWeight: '500',
        marginBottom: n(2),
      },
      statusDotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: n(4),
      },
      statusDot: {
        width: n(6),
        height: n(6),
        borderRadius: n(3),
        backgroundColor: '#9CA3AF',
      },
      statusDotOnline: {
        backgroundColor: '#F97316',
      },
      statusText: {
        fontSize: nf(11),
        color: '#6B7280',
        fontWeight: '500',
      },
      statusTextOnline: {
        color: '#F97316',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      },
      loadMoreContainer: {
        padding: n(16),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      },
      loadMoreText: {
        marginLeft: n(8),
        color: '#666',
        fontSize: nf(14),
      },
      blinkText: {
        color: 'red',
        fontWeight: 'bold',
        marginLeft: n(4),
        fontSize: nf(13),
      },
      darkContainer: { backgroundColor: '#121212' },
      darkHeaderContainer: {
        backgroundColor: '#1e293b',
        borderBottomColor: '#334155',
      },
      darkHeaderTitle: { color: '#f1f5f9' },
      darkMetaSeparator: { color: '#64748b' },
      darkProductCategory: { color: '#94a3b8' },
      darkUserName: { color: '#e2e8f0' },
      darkStatusText: { color: '#94a3b8' },
      darkLoadingContainer: { backgroundColor: '#121212' },
      darkLoadMoreText: { color: '#94a3b8' },
      darkDateSeparatorText: {
        backgroundColor: '#334155',
        color: '#e2e8f0',
      },
      darkFooter: {
        backgroundColor: '#1e293b',
        borderTopColor: '#334155',
      },
      darkInputContainer: { backgroundColor: '#334155' },
      darkInput: { color: '#f1f5f9' },
    });

    return { styles, contentMaxWidth, n, nf, nv };
  }, [winW, winH]);

  const { styles, contentMaxWidth, n, nf, nv } = chatLayout;
  const p = route.params || {};
  const sellerId = p.sellerId != null ? String(p.sellerId) : '';
  const buyerId = p.buyerId != null ? String(p.buyerId) : '';
  const postId = p.postId != null ? String(p.postId) : '';
  const existingChatId = p.chatId != null ? p.chatId : null;
  const postTitle = p.postTitle || '';
  const postImage = p.postImage || '';
  const [chatId, setChatId] = useState(existingChatId ?? null);
  const [allMessages, setAllMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [channel, setChannel] = useState(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [otherPerson, setOtherPerson] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Get other user's ID from API response if available, else fallback
  const otherUserId = otherPerson?.id || (loggedInUserId === sellerId?.toString() ? buyerId : sellerId);

  // Keys must match socket state (String id) — same as Echo channel userStatus.{id}
  const otherPersonStatus =
    onlineStatuses[String(otherPerson?.id ?? '')] ||
    onlineStatuses[String(otherUserId ?? '')] ||
    otherPerson?.status ||
    'offline';

  // Get other user's name from API response
  const otherUserName = otherPerson?.name || 'User';

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
  }, []);

  // Avoid extra bottom margin when keyboard is open
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Handle device back button - navigate to Home if opened from notification
  useEffect(() => {
    const backAction = () => {
      const state = navigation.getState();

      // Check if this is the only screen in the stack (opened from notification/deep link)
      if (state.index === 0 || state.routes.length === 1) {
        // Navigate to Home instead of closing the app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return true; // Prevent default behavior (closing app)
      }

      // If there's history, let the default back action happen
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Add this function to handle incoming messages
  const handleIncomingMessage = useCallback((data) => {
    console.log('Processing incoming message:', data);
    const normalized = {
      ...data,
      is_seen: typeof data.is_seen === 'boolean' ? (data.is_seen ? 1 : 0) : data.is_seen,
    };

    setAllMessages(prev => {
      const hasMessage = prev.some(msg =>
        sameMessageId(msg.id, normalized.id) ||
        (msg.is_temp && msg.message === normalized.message)
      );

      if (hasMessage) {
        return prev.map(msg =>
          (msg.is_temp && msg.message === normalized.message) ? normalized : msg
        );
      }

      return [...prev, normalized];
    });
  }, []);

  // Also add this useEffect to debug WebSocket connection
  useEffect(() => {
    if (channel) {
      console.log('Channel created:', channel.name);
    }
  }, [channel]);

  // Add a useEffect to periodically check connection status
  useEffect(() => {
    if (!chatId) return;

    const connectionCheckInterval = setInterval(() => {
      // You could add a ping mechanism here to check if connection is alive
      console.log('Connection check - chatId:', chatId);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(connectionCheckInterval);
  }, [chatId]);

  // Add a function to manually refresh messages
  const refreshMessages = async () => {
    if (chatId) {
      await fetchChatMessages(chatId, 1, true);
    }
  };

  // Add a pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshMessages().then(() => setRefreshing(false));
  }, [chatId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId, 1, true);
    } else if (sellerId && buyerId) {
      openChat(sellerId, buyerId, postId);
    }
  }, [chatId, sellerId, buyerId, postId]);

  // Fetch product details
  useEffect(() => {
    const fetchProductInfo = async () => {
      if (!postId) return;
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${process.env.BASE_URL}/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.data) {
          setProductInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching product info:', error);
      }
    };
    fetchProductInfo();
  }, [postId]);

  const fetchChatMessages = async (id, page = 1, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setIsInitialLoad(true);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem('authToken');
      console.log(`${process.env.BASE_URL}/chats/${id}?page=${page}`);
      const response = await fetch(`${process.env.BASE_URL}/chats/${id}?page=${page}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Chat API returned non-JSON', e);
        return;
      }
      const chatsPayload = data?.chats;
      if (!chatsPayload || typeof chatsPayload !== 'object') {
        console.warn('Unexpected chat messages response:', data);
        return;
      }

      if (isInitialLoad) {
        // For initial load, set all messages (most recent first)
        setAllMessages(dedupeMessagesById(chatsPayload.data || []));
        setCurrentPage(chatsPayload.current_page);
        setLastPage(chatsPayload.last_page);
        setHasMorePages(chatsPayload.current_page < chatsPayload.last_page);
        setIsInitialLoad(false);
      } else {
        // For pagination, prepend older messages; skip ids already in state (overlapping pages / double fetch)
        const newMessages = chatsPayload.data || [];
        setAllMessages(prev => prependOlderMessagesUnique(newMessages, prev));
        setCurrentPage(chatsPayload.current_page);
        setLastPage(chatsPayload.last_page);
        setHasMorePages(chatsPayload.current_page < chatsPayload.last_page);
      }

      setOtherPerson(data.other_person);

    } catch (error) {
      console.error("Error fetching chat messages:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (chatId && hasMorePages && !loadingMore) {
      fetchChatMessages(chatId, currentPage + 1, false);
    }
  };

  const openChat = async (sellerId, buyerId, postId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      // Prepare the request body - only include post_id if it's not empty
      const requestBody = {
        seller_id: sellerId,
        buyer_id: buyerId
      };

      if (postId && postId.trim() !== '') {
        requestBody.post_id = postId;
      }

      const response = await fetch(`${process.env.BASE_URL}/open-chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!data?.chat?.id) {
        console.error('open-chat: missing chat id', data);
        return;
      }
      setChatId(data.chat.id);
      setAllMessages(dedupeMessagesById(Array.isArray(data.messages) ? data.messages : []));
      setOtherPerson(data.other_person);
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleSend = async (message) => {
    console.log('handleSend', message);
    message = message.trim();
    if (!message) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      user_id: loggedInUserId,
      message: message,
      created_at: new Date().toISOString(),
      is_seen: 0,
      is_temp: true // Flag to identify temporary messages
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      const receiverId =
        loggedInUserId != null && String(loggedInUserId) === String(sellerId)
          ? buyerId
          : sellerId;

      const payload = chatId
        ? { chat_id: chatId, message }
        : {
          receiver_id: receiverId,
          message,
          ...(postId && postId.trim() !== '' && { post_id: postId }),
        };

      // Add the temporary message to the list immediately
      setAllMessages(prev => [...prev, tempMessage]);
      setInputText('');
      console.log('send message url- ', `${process.env.BASE_URL}/send-message`);
      const response = await fetch(`${process.env.BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('send message response- ', data);
      if (!chatId && data.chat_id) {
        setChatId(data.chat_id);
      }

      // Replace the temporary message with the real one from the server
      if (data.message) {
        setAllMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? { ...data.message, is_temp: false } : msg
          )
        );
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setAllMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };


  const handleMessageText = () => {
    handleSend(inputText);
  };

  const updateMessageStatus = useCallback((messageId) => {
    setAllMessages(prev => {
      const newMessages = prev.map(msg =>
        sameMessageId(msg.id, messageId) ? { ...msg, is_seen: 1 } : msg
      );
      return newMessages;
    });

    if (p.onSeenUpdate) {
      p.onSeenUpdate(messageId);
    }
  }, [p.onSeenUpdate]);

  const handleSeeMessage = async (messageID) => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      await fetch(`${process.env.BASE_URL}/messages/${messageID}/seen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageID: messageID }),
      });

      updateMessageStatus(messageID);
    } catch (error) {
      console.error("Failed to mark message as seen:", error);
    }
  };

  useEffect(() => {
    let echoInstance;
    const channelInstances = [];
    let cancelled = false;

    const setupEcho = async () => {
      if (cancelled) return;
      // Chat channel only needs chatId; presence needs otherUserId (skip if not loaded yet)
      if (!chatId && !otherUserId) return;

      try {
        echoInstance = await createEcho();
        if (cancelled) return;

        if (otherUserId) {
          const peerId = String(otherUserId);
          const channelOne = echoInstance.channel(`userStatus.${peerId}`);
          channelOne.listen('.UserStatusChanged', (data) => {
            if (cancelled) return;
            setOnlineStatuses(prev => ({
              ...prev,
              [peerId]: data.status,
            }));
          });
          channelInstances.push(channelOne);
        }

        if (chatId) {
          const channelName = `chat.${chatId}`;
          console.log('channelName', channelName);
          try {
            echoInstance.leave(channelName);
          } catch (_) {
            /* first subscribe may have nothing to leave */
          }
          const chatChannel = echoInstance.channel(channelName);
          if (__DEV__) {
            console.log(
              '[Echo] Listening on:',
              `userStatus.${otherUserId}`,
              '|',
              channelName,
              '| events: .MessageSent, .MessageSeen'
            );
          }

          chatChannel.listen('.MessageSent', (data) => {
            console.log('New message received via .MessageSent:', data);
            if (!cancelled) handleIncomingMessage(data);
          });

          chatChannel.listen('.MessageSeen', (data) => {
            console.log('Message seen event:', data);
            if (!cancelled) updateMessageStatus(data.id);
          });

          chatChannel.error(() => {
            setTimeout(() => {
              if (!cancelled && chatId) {
                setupEcho();
              }
            }, 2000);
          });

          if (echoInstance.connector && echoInstance.connector.socket) {
            echoInstance.connector.socket.on('connect', () => {
              console.log('WebSocket connected successfully to channel:', channelName);
            });
            echoInstance.connector.socket.on('error', (error) => {
              console.log('WebSocket error:', error);
            });
          }

          channelInstances.push(chatChannel);
          if (!cancelled) setChannel(chatChannel);
        }
      } catch (error) {
        console.error('Error setting up Echo:', error);
        setTimeout(() => {
          if (!cancelled && chatId) {
            setupEcho();
          }
        }, 3000);
      }
    };

    setupEcho();

    return () => {
      cancelled = true;
      if (echoInstance && channelInstances.length) {
        channelInstances.forEach((ch) => {
          try {
            const name = ch?.name || ch?.subscription?.name;
            if (name) echoInstance.leave(name);
          } catch (err) {
            console.log('Error leaving channel:', err);
          }
        });
      }
    };
  }, [chatId, otherUserId, handleIncomingMessage, updateMessageStatus]);

  useEffect(() => {
    if (!loggedInUserId) return;
    const markMessagesAsSeen = async () => {
      const unseenMessages = allMessages.filter(
        msg =>
          String(msg.user_id) !== String(loggedInUserId) &&
          !isMessageSeen(msg.is_seen)
      );
      unseenMessages.forEach(message => {
        if (message?.id != null && !String(message.id).startsWith('temp-')) {
          handleSeeMessage(message.id);
        }
      });
    };
    markMessagesAsSeen();
  }, [allMessages, loggedInUserId]);

  // Update your getFormattedMessages function to handle inverted order:
  const getFormattedMessages = () => {
    const formattedMessages = [];
    let lastDate = null;
    let dateCounter = 0;
    let messageCounter = 0;

    const sortedMessages = [...dedupeMessagesById(allMessages)].sort((a, b) => {
      const dateA = normalizeDate(a.created_at);
      const dateB = normalizeDate(b.created_at);
      return new Date(dateA) - new Date(dateB);
    });

    sortedMessages.forEach((msg, idx) => {
      const normalizedDate = normalizeDate(msg.created_at);
      const date = normalizedDate
        ? moment.utc(normalizedDate).local().format('YYYY-MM-DD')
        : 'Invalid-Date';

      if (date !== lastDate) {
        dateCounter++;
        formattedMessages.push({
          type: 'date',
          id: `date-${date}-${dateCounter}-${idx}`,
          date,
        });
        lastDate = date;
      }

      // Stable list row id: real message id, or index-based fallback (must be unique per row)
      messageCounter++;
      const rowKey =
        msg.id != null && String(msg.id) !== ''
          ? String(msg.id)
          : `msg-${messageCounter}-${idx}`;
      formattedMessages.push({
        ...msg,
        id: rowKey,
        type: 'message',
      });
    });

    return formattedMessages.reverse();
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;

    // If already ISO format with T, return as-is
    if (dateStr.includes('T')) return dateStr;

    // Try to convert common date formats to ISO
    try {
      // Handle space-separated date time (e.g., "2023-12-31 14:30:00")
      if (dateStr.includes(' ')) {
        return dateStr.replace(' ', 'T') + 'Z';
      }

      // If it's just a date without time, add time
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr + 'T00:00:00Z';
      }

      // Try to parse with Date and convert to ISO
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const useBlink = () => {
    const opacity = useRef(new Animated.Value(1)).current;
    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, [opacity]);
    return opacity;
  };

  const BlinkText = ({ children }) => {
    const opacity = useBlink();
    return (
      <Animated.Text style={[styles.blinkText, { opacity }]}>
        {children}
      </Animated.Text>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.loadMoreText, isDarkMode && styles.darkLoadMoreText]}>Loading older messages...</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!loadingMore && !isInitialLoad) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.loadMoreText, isDarkMode && styles.darkLoadMoreText]}>
          {isInitialLoad ? 'Loading messages...' : 'Loading more messages...'}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparatorContainer}>
          <Text style={[styles.dateSeparatorText, isDarkMode && styles.darkDateSeparatorText]}
          >
            {moment(item.date).calendar(null, {
              sameDay: '[Today]',
              lastDay: '[Yesterday]',
              lastWeek: 'dddd',
              sameElse: 'MMM D, YYYY'
            })}
          </Text>
        </View>
      );
    }

    const isMe = String(item.user_id) === String(loggedInUserId);

    // Text message rendering
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <View style={styles.timeTickRow}>
          <Text style={styles.timeText}>
            {item.created_at
              ? moment.utc(normalizeDate(item.created_at) || item.created_at).local().format('hh:mm A')
              : ''}
          </Text>
          {isMe && (
            <Text style={isMessageSeen(item.is_seen) ? styles.tickTextBlue : styles.tickText}>
              {isMessageSeen(item.is_seen) ? '✔✔' : '✔'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? nv(80) : nv(100)}
    >
      <View style={[styles.outerColumn, { maxWidth: contentMaxWidth }]}>
        <TouchableOpacity
          style={[styles.headerContainer, isDarkMode && styles.darkHeaderContainer]}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('ProductDetails', {
              productDetails: { id: postId }
            });
          }}
        >
          <Image
            source={{ uri: postImage || productInfo?.images?.[0] }}
            style={styles.headerImage}
          />
          <View style={styles.headerContent}>
            <View style={styles.headerTopSection}>
              <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]} numberOfLines={1}>
                {postTitle || productInfo?.title || 'Chat'}
              </Text>
              {productInfo?.type && (
                <View style={[
                  styles.listingTypeBadge,
                  productInfo.type === 'donate' && styles.listingTypeBadgeDonate,
                  productInfo.type === 'sell' && styles.listingTypeBadgeSell,
                  productInfo.type === 'rent' && styles.listingTypeBadgeRent,
                  (productInfo.type === 'post_requirement' || productInfo.type === 'requirement') && styles.listingTypeBadgeYellow,
                ]}>
                  <Text style={[
                    styles.listingTypeText,
                    productInfo.type === 'donate' && styles.listingTypeTextDonate,
                    productInfo.type === 'sell' && styles.listingTypeTextSell,
                    productInfo.type === 'rent' && styles.listingTypeTextRent,
                    (productInfo.type === 'post_requirement' || productInfo.type === 'requirement') && styles.listingTypeTextYellow,
                  ]}>
                    {productInfo.type === 'donate' ? 'DONATE' :
                      productInfo.type === 'rent' ? 'RENT' :
                        productInfo.type === 'post_requirement' || productInfo.type === 'requirement' ? 'REQUIREMENT' :
                          'SELL'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.headerMetaInfo}>
              {productInfo && productInfo.type !== 'donate' && productInfo.amount && (
                <Text style={styles.productPrice}>₹{productInfo.amount}</Text>
              )}
              {productInfo?.category?.name && (
                <>
                  {productInfo && productInfo.type !== 'donate' && productInfo.amount && (
                    <Text style={[styles.metaSeparator, isDarkMode && styles.darkMetaSeparator]}>•</Text>
                  )}
                  <Text style={[styles.productCategory, isDarkMode && styles.darkProductCategory]}>{productInfo.category.name}</Text>
                </>
              )}
            </View>
            <View style={styles.userStatusContainer}>
              <Text style={[styles.userName, isDarkMode && styles.darkUserName]}>{otherUserName}</Text>
              <View style={styles.statusDotContainer}>
                <View style={[
                  styles.statusDot,
                  otherPersonStatus === 'online' && styles.statusDotOnline
                ]} />
                <Text style={[
                  styles.statusText,
                  otherPersonStatus === 'online' && styles.statusTextOnline,
                  isDarkMode && otherPersonStatus !== 'online' && styles.darkStatusText,
                ]}>
                  {otherPersonStatus === 'online' ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={n(26)} color={isDarkMode ? '#94a3b8' : '#888'} style={{ marginLeft: n(8) }} />
        </TouchableOpacity>

      {loading && isInitialLoad ? (
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
          <FlatList
              style={styles.chatListFlex}
            data={getFormattedMessages()}
              keyExtractor={(item, index) =>
                item?.type === 'date'
                  ? `date-${String(item.id)}`
                  : item?.id != null
                    ? `msg-${String(item.id)}`
                    : `row-${index}`
              }
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.chatHistory}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
      )}

      {/* Message input - only add bottom padding when keyboard is closed to avoid extra margin when focused */}
      <View style={[
        styles.footer,
        !keyboardVisible && Platform.OS === 'ios' && styles.iosFooter,
        isDarkMode && styles.darkFooter,
          { paddingBottom: keyboardVisible ? nv(8) : (insets?.bottom ?? 0) + nv(8) }
      ]}>
        <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? '#64748b' : '#888'}
            multiline
              maxHeight={n(100)}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleMessageText}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
                size={nf(20)}
              color={inputText.trim() ? "#fff" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatBox;