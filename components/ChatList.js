import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const ChatList = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
  }, []);

  // Get the other user's ID in the chat
  const getOtherUserId = useCallback((chat) => {
    if (!loggedInUserId) return null;
    return chat.other_person?.id;
  }, [loggedInUserId]);

  useEffect(() => {
    let echoInstance;
    let channelInstances = [];

    const setupEcho = async () => {
      const userId = await AsyncStorage.getItem('userId');
      echoInstance = await createEcho();

      // Subscribe to all chat channels in the list
      chats.forEach(chat => {
        const otherUserId = getOtherUserId(chat);

        // Listen for user status updates
        if (otherUserId) {
          const channelOne = echoInstance.channel(`userStatus.${otherUserId}`);
          channelOne.listen('.UserStatusChanged', (data) => {
            setOnlineStatuses(prev => ({
              ...prev,
              [otherUserId]: {
                status: data.status,
              }
            }));
          });
          channelInstances.push(channelOne);
        }

        const channel = echoInstance.channel(`chat.${chat.id}`);
        // Listen for new messages
        channel.listen('.MessageSent', (data) => {
          setChats(prevChats =>
            prevChats.map(c =>
              c.id === chat.id
                ? { ...c, last_message: data }
                : c
            )
          );
        });
        // Listen for seen updates
        channel.listen('.MessageSeen', (data) => {
          setChats(prevChats =>
            prevChats.map(c =>
              c.id === chat.id && c.last_message?.id === data.id
                ? {
                  ...c,
                  last_message: {
                    ...c.last_message,
                    is_seen: 1,
                  },
                }
                : c
            )
          );
        });
        channelInstances.push(channel);
      });
    };

    if (chats.length > 0) {
      setupEcho();
    }

    return () => {
      if (echoInstance && channelInstances.length) {
        channelInstances.forEach((channel) => {
          echoInstance.leave(channel.name);
        });
      }
    };
  }, [chats, getOtherUserId]);

  const getAllChat = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const token = await AsyncStorage.getItem('authToken');
      // console.log("Fetching chats with token:", token);
      const response = await fetch(`${process.env.BASE_URL}/chats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setChats(data.data);
    } catch (error) {
      // console.error("Error fetching chats:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getAllChat(); // or your function to refresh the chat list
    }, [])
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <ActivityIndicator
        size="large"
        color="#007BFF"
        style={styles.loadingIndicator}
      />
    );
  };

  const formatTimeAgo = (utcDate) => {
    const localTime = moment.utc(utcDate).local();
    const now = moment();
    const diffMins = now.diff(localTime, 'minutes');
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = now.diff(localTime, 'hours');
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = now.diff(localTime, 'days');
    return `${diffDays}d ago`;
  };

  const useBlink = () => {
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [opacity]);
    return opacity;
  };

  const BlinkText = ({ children }) => {
    const opacity = useBlink();
    return (
      <Animated.Text
        style={{
          fontSize: normalize(12),
          color: 'red',
          fontWeight: '500',
          opacity,
        }}
      >
        {children}
      </Animated.Text>
    );
  };

  const renderChatItem = ({ item: chat }) => {
    const postImage =
      chat.post?.image?.url ||
      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

    const isSeen = chat.last_message?.is_seen === 1;
    const isFromOtherUser = true; // Always true, since you are always chatting with other_person

    // Use real-time status if available, otherwise fallback to API status
    const otherPersonStatusObj = onlineStatuses[chat.other_person?.id] || {};
    const otherPersonStatus = otherPersonStatusObj.status || chat.other_person?.status || 'offline';
    const lastActivity = chat.other_person?.last_activity;
    const isDeleted = chat.post?.status === 'deleted';

    return (
      <TouchableOpacity
        style={[
          styles.chatCard,
          !isSeen && isFromOtherUser && styles.highlightedCard,
          isDeleted && styles.deletedCard
        ]}
        disabled={isDeleted} // Optionally disable tap
        onPress={() => {
          if (!isDeleted) {
            navigation.navigate('ChatBox', {
              chatId: chat.id,
              postId: chat.post_id,
              postTitle: chat.post.title,
              postImage: postImage,
              otherUserId: chat.other_person?.id,
              otherUserName: chat.other_person?.name,
            });
          }
        }}
      >
        {isDeleted && (
          <View style={styles.deletedOverlay}>
            <MaterialIcons name="block" size={18} color="#fff" />
          </View>
        )}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: postImage }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text
              style={[
                styles.chatTitle,
                isSeen ? styles.dimmedText : styles.highlightedText
              ]}
              numberOfLines={1}
            >
              {chat.post?.title || 'No Title'}
            </Text>
          </View>
          {chat.last_message?.message && (
            <View style={styles.chatDetails}>
              <MaterialIcons name="chat" size={normalize(14)} color={isSeen ? "#b0b0b0" : "#666"} />
              <Text
                style={[
                  styles.chatUser,
                  isSeen ? styles.dimmedText : styles.highlightedText
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chat.last_message.message}
              </Text>
              {typeof chat.last_message.is_seen !== 'undefined' && (
                <MaterialIcons
                  name={chat.last_message.is_seen ? 'done-all' : 'done'}
                  size={normalize(14)}
                  color={chat.last_message.is_seen ? '#4fc3f7' : '#999'}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          )}
          <View style={styles.chatDetails}>
            <MaterialIcons name="person" size={normalize(14)} color={isSeen ? "#b0b0b0" : "#666"} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.chatUser,
                  isSeen ? styles.dimmedText : styles.highlightedText
                ]}
                numberOfLines={1}
              >
                {chat.other_person?.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: otherPersonStatus === 'online' ? 'red' : '#b0b0b0',
                    marginRight: 4,
                  }}
                />
                {otherPersonStatus === 'online' ? (
                  <BlinkText>Online</BlinkText>
                ) : (
                  <Text style={{
                    fontSize: normalize(12),
                    color: '#b0b0b0',
                    fontWeight: '500',
                  }}>
                    Offline
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={normalize(20)} color={isSeen ? "#b0b0b0" : "#999"} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(chat) => chat.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
              <MaterialIcons name="forum" size={normalize(60)} color="#007BFF" />
              <Text style={styles.emptyTitle}>
                {isError ? 'Connection Error' : 'No Chats Yet'}
              </Text>
              <Text style={styles.emptyText}>
                {isError ?
                  'Failed to load conversations. Please check your connection.' :
                  'Start a conversation by contacting sellers about their items!'
                }
              </Text>
              {isError && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={getAllChat}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalizeVertical(16),
  },
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalizeVertical(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: normalize(12),
  },
  avatar: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(10),
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  chatContent: {
    flex: 1,
    marginRight: normalize(12),
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalizeVertical(4),
  },
  chatTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#2D3436',
    maxWidth: '90%',
  },
  chatTime: {
    fontSize: normalize(12),
    color: '#999999',
  },
  chatDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalizeVertical(4),
  },
  chatUser: {
    fontSize: normalize(14),
    color: '#666666',
    marginLeft: normalize(6),
    maxWidth: '80%',
  },
  chatLocation: {
    fontSize: normalize(12),
    color: '#999999',
    marginLeft: normalize(6),
    maxWidth: '80%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(24),
    marginTop: normalizeVertical(100),
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#2D3436',
    marginVertical: normalizeVertical(12),
  },
  emptyText: {
    fontSize: normalize(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: normalizeVertical(20),
  },
  retryButton: {
    marginTop: normalizeVertical(20),
    backgroundColor: '#007BFF',
    paddingHorizontal: normalize(24),
    paddingVertical: normalizeVertical(12),
    borderRadius: normalize(8),
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
    fontSize: normalize(14),
  },
  loadingIndicator: {
    marginVertical: normalizeVertical(20),
  },
  highlightedCard: {
    // backgroundColor: '#FFF8E1',
  },
  dimmedText: {
    color: '#b0b0b0',
  },
  highlightedText: {
    color: '#2D3436',
    fontWeight: 'bold',
  },
  deletedCard: {
    opacity: 0.5,
    borderWidth: 1,
    borderColor: '#ff5252',
    backgroundColor: '#fff0f0',
    position: 'relative',
  },
  deletedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff5252',
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
});

export default ChatList;