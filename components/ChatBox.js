import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Animated, FlatList
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
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [channel, setChannel] = useState(null);
  const scrollViewRef = useRef(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [otherPerson, setOtherPerson] = useState(null);

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

      // Listen for chat events
      if (chatId) {
        const channel = echoInstance.channel(`chat.${chatId}`);
        // console.log('Joining chat channel:', channel.name);
        setChannel(channel);

        channel.listen('.MessageSent', (data) => {
          setChatHistory(prev => {
            if (prev.some(msg => msg.id === data.id)) return prev;
            return [...prev, data];
          });
        });

        channel.listen('.MessageSeen', (data) => {
          updateMessageStatus(data.id);
        });

        channelInstances.push(channel);

        channel.error((error) => {
          console.log('Channel error:', error);
        });
      }
    };

    setupEcho();

    return () => {
      if (echoInstance && channelInstances.length) {
        channelInstances.forEach((channel) => {
          echoInstance.leave(channel.name);
        });
      }
    };
  }, [chatId, loggedInUserId, otherUserId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    } else {
      openChat(sellerId, buyerId, postId);
    }
  }, [chatId]);

  const fetchChatMessages = async (id) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${process.env.BASE_URL}/chats/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setChatHistory(data.chats);
      setOtherPerson(data.other_person); // <-- set other_person from response

    } catch (error) {
      console.error("Error fetching chat messages:", error);
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
      setChatHistory(data.messages);
      setOtherPerson(data.other_person); // <-- set other_person from response
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

      console.log(`${process.env.BASE_URL}/send-message`);

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
      // console.log("Message sent:", data);

      if (!chatId && data.chat_id) {
        // console.log("First message sent, new chat created with ID:", data.chat_id);
        setChatId(data.chat_id); // ✅ Set the new chat ID
      }

      setInputText('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  const handleMessageOption = (message) => {
    if (message.trim()) {
      handleSend(message);
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
    setChatHistory(prev => {
      const newMessages = prev.map(msg =>
        msg.id === messageId ? { ...msg, is_seen: 1 } : msg
      );
      return newMessages;
    });

    // Notify ChatList to update seen status
    if (route.params?.onSeenUpdate) {
      route.params.onSeenUpdate(messageId);
    }
  };

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      const unseenMessages = chatHistory.filter(msg => msg.user_id !== loggedInUserId && msg.is_seen !== 1);
      unseenMessages.forEach(message => {
        handleSeeMessage(message.id);
      });
    };
    markMessagesAsSeen();
  }, [chatHistory]);

  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = moment.utc(message.created_at).local().format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  };

  const grouped = groupMessagesByDate(chatHistory);
  const sortedDates = Object.keys(grouped).sort((a, b) => moment(a).diff(moment(b)));

  const getGroupedMessages = (messages) => {
    const grouped = [];
    let lastDate = null;
    messages.forEach((msg, idx) => {
      const date = moment.utc(msg.created_at).local().format('YYYY-MM-DD');
      if (date !== lastDate) {
        grouped.push({
          type: 'date',
          id: `date-${date}-${idx}`,
          date,
        });
        lastDate = date;
      }
      grouped.push({
        ...msg,
        type: 'message',
      });
    });
    return grouped.reverse(); // Reverse at the end for inverted FlatList
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
              {postTitle || post?.title || 'Chat'}
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

      <FlatList
        data={getGroupedMessages(chatHistory)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
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
                {isMe && <MessageTick status={item.is_seen} />}
              </View>
            </View>
          );
        }}
        inverted
        contentContainerStyle={styles.chatHistory}
      />

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

const MessageTick = ({ status }) => {
  switch (status) {
    case 1:
      return <Text style={styles.tickTextBlue}>✔✔</Text>;
    default:
      return <Text style={styles.tickText}>✔</Text>;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f0f7',
  },
  chatHistory: { padding: 20 },
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
    marginBottom: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.11)', // transparent black
    padding: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)', // subtle border
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
    margitTop: 2
  },
});

export default ChatBox;