import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  Animated,
  FlatList,
  ActivityIndicator,
  BackHandler,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const ChatBox = ({ route }) => {
  const navigation = useNavigation();
  const { sellerId, buyerId, postId, chatId: existingChatId, postTitle, postImage } = route.params;
  const [chatId, setChatId] = useState(existingChatId || null);
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

  // Get other user's ID from API response if available, else fallback
  const otherUserId = otherPerson?.id || (loggedInUserId === sellerId?.toString() ? buyerId : sellerId);

  // Get online status for the other user: first from socket, fallback to API response
  const otherPersonStatus = onlineStatuses[otherPerson?.id] || otherPerson?.status || 'offline';

  // Get other user's name from API response
  const otherUserName = otherPerson?.name || 'User';

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
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

  // Replace your useEffect for WebSocket setup with this:
  useEffect(() => {
    let echoInstance;
    let channelInstances = [];

    const setupEcho = async () => {
      if (!otherUserId) return;

      try {
      echoInstance = await createEcho();

      // Listen for user status
      const channelOne = echoInstance.channel(`userStatus.${otherUserId}`);
      channelOne.listen('.UserStatusChanged', (data) => {
        setOnlineStatuses(prev => ({
          ...prev,
          [otherUserId]: data.status
        }));
      });
      channelInstances.push(channelOne);

        // Listen for chat events - only if we have a chatId
      if (chatId) {
        const channelName = `chat.${chatId}`;

        // Remove any existing listeners first to avoid duplicates
        echoInstance.leave(channelName);

        // Use channel() instead of private() - this matches your working script
        const chatChannel = echoInstance.channel(channelName);


        chatChannel.listen('.MessageSent', (data) => {
          console.log('New message received via .MessageSent:', data);
          handleIncomingMessage(data);
        });

        chatChannel.listen('.MessageSeen', (data) => {
          console.log('Message seen event:', data);
          updateMessageStatus(data.id);
        });

        // Error handling for the channel
        chatChannel.error((error) => {
          console.log('Channel error:', error);
          // Try to reconnect on error
          setTimeout(() => {
            if (chatId) {
              setupEcho();
            }
          }, 2000);
        });

        // Listen for connection events for debugging
        if (echoInstance.connector && echoInstance.connector.socket) {
          echoInstance.connector.socket.on('connect', () => {
            console.log('WebSocket connected successfully to channel:', channelName);
          });

          echoInstance.connector.socket.on('error', (error) => {
            console.log('WebSocket error:', error);
          });
        }

          channelInstances.push(chatChannel);
          setChannel(chatChannel);
        }
      } catch (error) {
        console.error('Error setting up Echo:', error);
        // Retry connection after a delay
        setTimeout(() => {
          if (chatId) {
            setupEcho();
          }
        }, 3000);
      }
    };

    setupEcho();

    // Cleanup function
    return () => {
      if (echoInstance && channelInstances.length) {
        channelInstances.forEach((channel) => {
          try {
          echoInstance.leave(channel.name);
          } catch (error) {
            console.log('Error leaving channel:', error);
          }
        });
      }
    };
  }, [chatId, loggedInUserId, otherUserId]);

  // Add this function to handle incoming messages
  const handleIncomingMessage = useCallback((data) => {
    console.log('Processing incoming message:', data);

    setAllMessages(prev => {
      // Check if message already exists to prevent duplicates
      const hasMessage = prev.some(msg =>
        msg.id === data.id ||
        (msg.is_temp && msg.message === data.message)
      );

      if (hasMessage) {
        // Replace temporary message with real one
        return prev.map(msg =>
          (msg.is_temp && msg.message === data.message) ? data : msg
        );
      }

      // Add new message
      return [...prev, data];
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
    } else {
      openChat(sellerId, buyerId, postId);
    }
  }, [chatId]);

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

      const data = await response.json();

      if (isInitialLoad) {
        // For initial load, set all messages (most recent first)
        setAllMessages(data.chats.data || []);
        setCurrentPage(data.chats.current_page);
        setLastPage(data.chats.last_page);
        setHasMorePages(data.chats.current_page < data.chats.last_page);
        setIsInitialLoad(false);
      } else {
        // For pagination, append older messages to the beginning
        const newMessages = data.chats.data || [];
        setAllMessages(prev => [...newMessages, ...prev]);
        setCurrentPage(data.chats.current_page);
        setLastPage(data.chats.last_page);
        setHasMorePages(data.chats.current_page < data.chats.last_page);
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
      setChatId(data.chat.id);
      setAllMessages(data.messages);
      setOtherPerson(data.other_person);
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleSend = async (message) => {
    message = message.trim();
    if (!message) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      const payload = chatId
        ? { chat_id: chatId, message }
        : {
          receiver_id: sellerId,
          message,
          ...(postId && postId.trim() !== '' && { post_id: postId }),
        };

      // Create a temporary message object to show immediately
      const tempMessage = {
        id: `temp-${Date.now()}`,
        user_id: loggedInUserId,
        message: message,
        created_at: new Date().toISOString(),
        is_seen: 0,
        is_temp: true // Flag to identify temporary messages
      };

      // Add the temporary message to the list immediately
      setAllMessages(prev => [...prev, tempMessage]);
      setInputText('');

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
      // Remove the temporary message if there was an error
      setAllMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };


  const handleMessageText = () => {
    handleSend(inputText);
  };

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

  const updateMessageStatus = (messageId) => {
    setAllMessages(prev => {
      const newMessages = prev.map(msg =>
        msg.id === messageId ? { ...msg, is_seen: 1 } : msg
      );
      return newMessages;
    });

    if (route.params?.onSeenUpdate) {
      route.params.onSeenUpdate(messageId);
    }
  };

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      const unseenMessages = allMessages.filter(msg => msg.user_id !== loggedInUserId && msg.is_seen !== 1);
      unseenMessages.forEach(message => {
        handleSeeMessage(message.id);
      });
    };
    markMessagesAsSeen();
  }, [allMessages]);

  // Update your getFormattedMessages function to handle inverted order:
  const getFormattedMessages = () => {
    const formattedMessages = [];
    let lastDate = null;

    const sortedMessages = [...allMessages].sort((a, b) =>
      new Date(normalizeDate(a.created_at)) - new Date(normalizeDate(b.created_at))
    );

    sortedMessages.forEach((msg, idx) => {
      const date = moment.utc(normalizeDate(msg.created_at)).local().format('YYYY-MM-DD');
      if (date !== lastDate) {
        formattedMessages.push({
          type: 'date',
          id: `date-${date}-${idx}`,
          date,
        });
        lastDate = date;
      }
      formattedMessages.push({
        ...msg,
        type: 'message',
      });
    });

    return formattedMessages.reverse();
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr; // Already ISO
    return dateStr.replace(' ', 'T') + 'Z'; // Convert to ISO
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
      <Animated.Text style={{
        color: 'red',
        fontWeight: 'bold',
        opacity,
        marginLeft: normalize(4),
        fontSize: normalize(13)
      }}>
        {children}
      </Animated.Text>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadMoreText}>Loading older messages...</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!loadingMore && !isInitialLoad) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadMoreText}>
          {isInitialLoad ? 'Loading messages...' : 'Loading more messages...'}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparatorContainer}>
          <Text style={styles.dateSeparatorText}>
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

    const isMe = item.user_id === loggedInUserId;

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
              ? moment.utc(item.created_at).local().format('hh:mm A')
              : ''}
          </Text>
          {isMe && (
            <Text style={item.is_seen === 1 ? styles.tickTextBlue : styles.tickText}>
              {item.is_seen === 1 ? '✔✔' : '✔'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}
    >
      <View>
        <TouchableOpacity
          style={styles.headerContainer}
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
              <Text style={styles.headerTitle} numberOfLines={1}>
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
                    <Text style={styles.metaSeparator}>•</Text>
                  )}
                  <Text style={styles.productCategory}>{productInfo.category.name}</Text>
                </>
              )}
            </View>
            <View style={styles.userStatusContainer}>
              <Text style={styles.userName}>{otherUserName}</Text>
              <View style={styles.statusDotContainer}>
                <View style={[
                  styles.statusDot,
                  otherPersonStatus === 'online' && styles.statusDotOnline
                ]} />
                <Text style={[
                  styles.statusText,
                  otherPersonStatus === 'online' && styles.statusTextOnline
                ]}>
                  {otherPersonStatus === 'online' ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {loading && isInitialLoad ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
          <FlatList
            data={getFormattedMessages()}
            keyExtractor={item => item.id}
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

      {/* Replace your footer JSX with this: */}
      <View style={[styles.footer, Platform.OS === 'ios' && styles.iosFooter]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleMessageText}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={normalize(20)}
              color={inputText.trim() ? "#fff" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHistory: {
    padding: normalize(20),
    paddingTop: normalize(10),
  },
  messageContainer: {
    maxWidth: '80%',
    padding: normalize(10),
    borderRadius: normalize(14),
    marginVertical: normalize(3),
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
    paddingVertical: normalizeVertical(8),
    paddingHorizontal: normalize(16),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  iosFooter: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: normalize(24),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
  },
  input: {
    flex: 1,
    fontSize: normalize(14),
    color: '#1F2937',
    maxHeight: normalize(100),
    minHeight: normalize(36),
    paddingVertical: normalize(6),
    marginRight: normalize(8),
  },
  sendButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
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
    fontSize: normalize(14),
  },
  messageText: {
    color: '#fff',
    fontSize: normalize(13),
    lineHeight: normalize(18),
  },
  timeText: {
    color: '#eee',
    fontSize: normalize(10),
    marginRight: normalize(4),
  },
  tickText: {
    color: '#eee',
    fontSize: normalize(10),
  },
  tickTextBlue: {
    color: '#4fc3f7',
    fontSize: normalize(10),
  },
  timeTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(2),
    marginLeft: normalize(2),
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: normalize(8),
  },
  dateSeparatorText: {
    backgroundColor: '#dbeafe',
    color: '#333',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(3),
    borderRadius: normalize(12),
    fontSize: normalize(12),
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  headerImage: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(10),
    marginRight: normalize(12),
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
    gap: normalize(8),
  },
  headerTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    lineHeight: normalize(20),
  },
  listingTypeBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(4),
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
    fontSize: normalize(8),
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
    marginBottom: normalize(4),
  },
  productPrice: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: '#059669',
  },
  metaSeparator: {
    fontSize: normalize(12),
    color: '#9CA3AF',
    marginHorizontal: normalize(6),
  },
  productCategory: {
    fontSize: normalize(12),
    color: '#6B7280',
    fontWeight: '400',
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  userName: {
    fontSize: normalize(12),
    color: '#374151',
    fontWeight: '500',
    marginBottom: normalize(2),
  },
  statusDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  statusDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#9CA3AF',
  },
  statusDotOnline: {
    backgroundColor: '#F97316',
  },
  statusText: {
    fontSize: normalize(11),
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
    padding: normalize(16),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreText: {
    marginLeft: normalize(8),
    color: '#666',
    fontSize: normalize(14),
  },
});

export default ChatBox;