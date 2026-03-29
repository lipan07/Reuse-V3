import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions,
  ActivityIndicator, Image, Animated, Alert, Modal,
  TouchableWithoutFeedback, SafeAreaView, StatusBar, useWindowDimensions, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import { isMessageSeen, sameMessageId } from '../utils/chatUtils';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ModalScreen from './SupportElement/ModalScreen.js';

const ChatList = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const { width, height } = useWindowDimensions();
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

  // Tablet Centering Logic
  const isLargeScreen = width > 768;
  const contentWidth = isLargeScreen ? 600 : '100%';
  const bottomSpacing = isLargeScreen ? height * 0.15 : 0;

  useFocusEffect(
    React.useCallback(() => {
      resetNotificationCount(); 
    }, [])
  );

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
  }, []);

  const getOtherUserId = useCallback((chat) => {
    if (!loggedInUserId) return null;
    return chat.other_person?.id;
  }, [loggedInUserId]);

  // RESTORED REALTIME LOGIC FROM FIRST SCRIPT
  useEffect(() => {
    let echoInstance;
    let channelInstances = [];

    const setupEcho = async () => {
      const userId = await AsyncStorage.getItem('userId');
      echoInstance = await createEcho();

      chats.forEach(chat => {
        const otherUserId = getOtherUserId(chat);

        // Listen for user status updates
        if (otherUserId) {
          const peerId = String(otherUserId);
          const channelOne = echoInstance.channel(`userStatus.${peerId}`);
          channelOne.listen('.UserStatusChanged', (data) => {
            setOnlineStatuses(prev => ({
              ...prev,
              [peerId]: { status: data.status },
            }));
          });
          channelInstances.push(channelOne);
        }

        const channel = echoInstance.channel(`chat.${String(chat.id)}`);
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
            prevChats.map(c => {
              if (c.id !== chat.id || !c.last_message) return c;
              if (!sameMessageId(c.last_message.id, data.id)) return c;
              return {
                ...c,
                last_message: {
                  ...c.last_message,
                  is_seen: 1,
                },
              };
            })
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

  useFocusEffect(
    React.useCallback(() => {
      getAllChat();
    }, [])
  );

  const deleteChat = async () => {
    if (!chatToDelete) return;
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${process.env.BASE_URL}/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setChats(prev => prev.filter(c => c.id !== chatToDelete.id));
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 2000);
      }
    } finally {
      setDeleteModalVisible(false);
      setChatToDelete(null);
    }
  };

  const renderRightActions = (progress, dragX, chat) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRefs.current[chat.id]?.close();
          setChatToDelete({ id: chat.id, title: chat.post?.title });
          setDeleteModalVisible(true);
        }}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <MaterialIcons name="delete-outline" size={24} color="#FFF" />
          <Text style={styles.deleteLabel}>DELETE</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const useBlink = () => {
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])).start();
    }, [opacity]);
    return opacity;
  };

  const BlinkText = ({ children }) => {
    const opacity = useBlink();
    return <Animated.Text style={[styles.onlineText, { opacity }]}>{children}</Animated.Text>;
  };

  const renderChatItem = ({ item: chat }) => {
    const postImage = chat.post?.image?.url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    const isSeen = isMessageSeen(chat.last_message?.is_seen);

    // Exact status logic from script 1
    const otherPersonStatusObj = onlineStatuses[chat.other_person?.id] || {};
    const otherPersonStatus = otherPersonStatusObj.status || chat.other_person?.status || 'offline';
    const isDeleted = chat.post?.status === 'deleted';

    return (
      <Swipeable
        ref={ref => (swipeableRefs.current[chat.id] = ref)}
        renderRightActions={(p, d) => renderRightActions(p, d, chat)}
        enabled={!isDeleted}
      >
        <TouchableOpacity
          style={[styles.chatCard, isDeleted && styles.deletedCard, isDarkMode && styles.darkChatCard]}
          onPress={() => !isDeleted && navigation.navigate('ChatBox', {
            chatId: chat.id,
            postId: chat.post_id,
            postTitle: chat.post.title,
            postImage,
            otherUserId: chat.other_person?.id,
            otherUserName: chat.other_person?.name,
          })}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: postImage }} style={[styles.avatar, isDarkMode && styles.darkAvatar]} />
            <View style={[styles.statusDot, { backgroundColor: otherPersonStatus === 'online' ? '#22c55e' : '#cbd5e1' }]} />
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text
                style={[
                  styles.chatTitle,
                  !isSeen ? styles.boldTxt : styles.dimTxt,
                  isDarkMode && (!isSeen ? styles.darkBoldTxt : styles.darkDimTxt),
                ]}
                numberOfLines={1}
              >
                {chat.post?.title || 'No Title'}
              </Text>
              <Text style={[styles.timeText, isDarkMode && styles.darkTimeText]}>
                {chat.last_message ? moment(chat.last_message.created_at).fromNow(true) : ''}
              </Text>
            </View>
            <View style={styles.msgRow}>
              <Text
                style={[
                  styles.msgText,
                  !isSeen ? styles.boldTxt : styles.dimTxt,
                  isDarkMode && (!isSeen ? styles.darkBoldTxt : styles.darkDimTxt),
                ]}
                numberOfLines={1}
              >
                {chat.last_message?.message || 'New inquiry'}
              </Text>
              {chat.last_message && (
                <MaterialIcons
                  name={isMessageSeen(chat.last_message.is_seen) ? 'done-all' : 'done'}
                  size={14}
                  color={isMessageSeen(chat.last_message.is_seen) ? '#6366f1' : '#94a3b8'}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <View style={styles.footerRow}>
              <Text style={[styles.userName, isDarkMode && styles.darkUserName]}>{chat.other_person?.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.miniDot, { backgroundColor: otherPersonStatus === 'online' ? '#22c55e' : '#cbd5e1' }]} />
                {otherPersonStatus === 'online' ? <BlinkText>Online</BlinkText> : <Text style={[styles.offlineText, isDarkMode && styles.darkOfflineText]}>Offline</Text>}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />
      <View style={[styles.header, { width: contentWidth, alignSelf: 'center' }]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Messages</Text>
      </View>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContainer, { width: contentWidth, alignSelf: 'center', paddingBottom: bottomSpacing + 100 }]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isLoading && <ActivityIndicator color="#6366f1" style={{ marginVertical: 20 }} />}
      />
      <BottomNavBar />
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmBox, isDarkMode && styles.darkConfirmBox]}>
              <Text style={[styles.confirmTitle, isDarkMode && styles.darkConfirmTitle]}>Delete this chat?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.cBtn, isDarkMode && styles.darkCBtn]} onPress={() => setDeleteModalVisible(false)}><Text style={[styles.cBtnTxt, isDarkMode && styles.darkCBtnTxt]}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.dBtn} onPress={deleteChat}><Text style={styles.dBtnTxt}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ModalScreen visible={successModalVisible} type="success" title="Deleted" message="Chat removed." onClose={() => setSuccessModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 24, paddingVertical: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  listContainer: { paddingHorizontal: 20 },
  chatCard: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginRight: 16 },
  avatar: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#f1f5f9' },
  statusDot: { position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: '#FFF', zIndex: 5 },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chatTitle: { fontSize: 15, flex: 1, marginRight: 10 },
  boldTxt: { color: '#0f172a', fontWeight: '800' },
  dimTxt: { color: '#94a3b8', fontWeight: '500' },
  timeText: { fontSize: 11, color: '#94a3b8' },
  msgRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  msgText: { fontSize: 14, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { fontSize: 12, color: '#6366f1', fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  miniDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  onlineText: { fontSize: 10, color: '#22c55e', fontWeight: '800', textTransform: 'uppercase' },
  offlineText: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  deleteAction: { backgroundColor: '#ef4444', width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginLeft: 10 },
  deleteLabel: { color: '#FFF', fontSize: 9, fontWeight: '900', marginTop: 4 },
  deletedCard: { opacity: 0.4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmBox: { backgroundColor: '#FFF', padding: 24, borderRadius: 28, width: 320, alignItems: 'center' },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
  dBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#ef4444', borderRadius: 12, alignItems: 'center' },
  cBtnTxt: { color: '#475569', fontWeight: '700' },
  dBtnTxt: { color: '#FFF', fontWeight: '700' },
  darkContainer: { backgroundColor: '#121212' },
  darkHeaderTitle: { color: '#f1f5f9' },
  darkChatCard: { borderBottomColor: '#334155' },
  darkAvatar: { backgroundColor: '#334155' },
  darkBoldTxt: { color: '#f1f5f9' },
  darkDimTxt: { color: '#94a3b8' },
  darkTimeText: { color: '#64748b' },
  darkUserName: { color: '#a5b4fc' },
  darkOfflineText: { color: '#64748b' },
  darkConfirmBox: { backgroundColor: '#1e293b' },
  darkConfirmTitle: { color: '#f1f5f9' },
  darkCBtn: { backgroundColor: '#334155' },
  darkCBtnTxt: { color: '#e2e8f0' },
});

export default ChatList;