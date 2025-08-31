import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Image, Animated, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import { useNotification } from '../context/NotificationContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ModalScreen from './SupportElement/ModalScreen.js';

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
  const swipeableRefs = useRef({});

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const { resetNotificationCount } = useNotification();

  useFocusEffect(
    React.useCallback(() => {
      resetNotificationCount(); // clear badge when user enters chat screen
    }, [])
  );

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
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async () => {
    if (!chatToDelete) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Deleting chat :', `${process.env.BASE_URL}/chats/${chatToDelete.id}`);
      const response = await fetch(`${process.env.BASE_URL}/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatToDelete.id));
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 2000);
      } else {
        Alert.alert('Error', 'Failed to delete chat');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete chat');
    } finally {
      setDeleteModalVisible(false);
      setChatToDelete(null);
    }
  };

  const confirmDelete = (chatId, chatTitle) => {
    setChatToDelete({ id: chatId, title: chatTitle });
    setDeleteModalVisible(true);
  };

  const renderRightActions = (progress, dragX, chat) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          swipeableRefs.current[chat.id]?.close();
          confirmDelete(chat.id, chat.post?.title || 'Unknown');
        }}
      >
        <Animated.View
          style={[
            styles.deleteButtonContent,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <MaterialIcons name="delete" size={normalize(24)} color="#ff5252" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      getAllChat();
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
    const isFromOtherUser = true;
    const otherPersonStatusObj = onlineStatuses[chat.other_person?.id] || {};
    const otherPersonStatus = otherPersonStatusObj.status || chat.other_person?.status || 'offline';
    const isDeleted = chat.post?.status === 'deleted';

    return (
      <Swipeable
        ref={ref => (swipeableRefs.current[chat.id] = ref)}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, chat)}
        rightThreshold={40}
        enabled={!isDeleted} // Disable swipe for deleted chats
      >
        <TouchableOpacity
          style={[
            styles.chatCard,
            !isSeen && isFromOtherUser && styles.highlightedCard,
            isDeleted && styles.deletedCard
          ]}
          disabled={isDeleted}
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
      </Swipeable>
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmTitle}>Are you sure you want to delete this chat?</Text>
              <Text style={styles.confirmSubtitle}>
                This will permanently remove the chat for "{chatToDelete?.title || 'Unknown'}"
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={deleteChat}
                >
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Success Modal */}
      <ModalScreen
        visible={successModalVisible}
        type="success"
        title="Chat Deleted"
        message="The chat has been successfully deleted."
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
};

// Add these new styles to your existing styles:
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
  // New styles for delete functionality
  deleteButton: {
    // backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(30),
    height: '50%',
    borderRadius: normalize(12),
    marginTop: normalizeVertical(25),
    marginLeft: normalize(10),
    marginBottom: normalizeVertical(12),
  },
  deleteButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // New modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 15,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#ff5252',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatList;