import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Animated,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Get other user's ID from API response if available, else fallback
  const otherUserId = otherPerson?.id || (loggedInUserId === sellerId?.toString() ? buyerId : sellerId);

  // Get online status for the other user: first from socket, fallback to API response
  const otherPersonStatus = onlineStatuses[otherPerson?.id] || otherPerson?.status || 'offline';

  // Get other user's name from API response
  const otherUserName = otherPerson?.name || 'User';

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
  }, []);

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
        const chatChannel = echoInstance.channel(channelName);

        // Remove any existing listeners first to avoid duplicates
        echoInstance.leave(channelName);

        // Set up new listeners
        chatChannel.listen('.MessageSent', (data) => {
          console.log('New message received:', data);
          setAllMessages(prev => {
        // Check if message already exists to prevent duplicates
            if (prev.some(msg => msg.id === data.id)) return prev;
            return [...prev, data];
          });
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

  const fetchChatMessages = async (id, page = 1, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem('authToken');
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
        // For initial load, set all messages
        setAllMessages(data.chats.data || []);
        setCurrentPage(data.chats.current_page);
        setLastPage(data.chats.last_page);
        setHasMorePages(data.chats.current_page < data.chats.last_page);
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
      const response = await fetch(`${process.env.BASE_URL}/open-chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ seller_id: sellerId, buyer_id: buyerId, post_id: postId }),
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
          post_id: postId,
          message,
        };

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

    } catch (error) {
      console.error("Error sending message:", error);
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

  // Format messages with date separators
  const getFormattedMessages = () => {
    const formattedMessages = [];
    let lastDate = null;

    // Sort messages by created_at (oldest first)
    const sortedMessages = [...allMessages].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );

    sortedMessages.forEach((msg, idx) => {
      const date = moment.utc(msg.created_at).local().format('YYYY-MM-DD');
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
      <Animated.Text style={{ color: 'red', fontWeight: 'bold', opacity, marginLeft: 4 }}>
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
            source={{ uri: postImage }}
            style={styles.headerImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {postTitle || 'Chat'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>
                {otherUserName}
              </Text>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: otherPersonStatus === 'online' ? 'red' : '#b0b0b0',
                  marginLeft: 10,
                  marginRight: 4,
                }}
              />
              {otherPersonStatus === 'online' ? (
                <BlinkText>Online</BlinkText>
              ) : (
                <Text style={{ fontSize: 13, color: '#b0b0b0', fontWeight: '500' }}>
                  Offline
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {loading ? (
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
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
      )}

      <View style={[styles.footer, Platform.OS === 'ios' && { marginBottom: 20 }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleMessageText}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f7',
  },
  chatHistory: {
    padding: 20,
    paddingTop: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  messageLeft: {
    backgroundColor: '#89bed6',
    alignSelf: 'flex-start',
  },
  messageRight: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
    fontSize: 17,
  },
  timeText: {
    color: '#eee',
    fontSize: 11,
    marginRight: 4,
  },
  tickText: {
    color: '#eee',
    fontSize: 11,
  },
  tickTextBlue: {
    color: '#4fc3f7',
    fontSize: 11,
  },
  timeTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 2,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorText: {
    backgroundColor: '#dbeafe',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginTop: 2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default ChatBox;