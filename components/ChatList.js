import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from './BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { createEcho } from '../service/echo';
import { useNotification } from '../context/NotificationContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ModalScreen from './SupportElement/ModalScreen.js';

const ChatList = ({ navigation }) => {
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

  // 1. DYNAMIC CENTERING LOGIC
  // If screen is wide, we cap the width to 600px and center it.
  const isLargeScreen = width > 768;
  const contentWidth = isLargeScreen ? 600 : '100%';
  const bottomSpacing = isLargeScreen ? height * 0.15 : 0; // 15-20% bottom margin for tablets

  useFocusEffect(
    React.useCallback(() => {
      resetNotificationCount();
      getAllChat();
    }, [])
  );

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setLoggedInUserId);
  }, []);

  const getOtherUserId = useCallback((chat) => {
    if (!loggedInUserId) return null;
    return chat.other_person?.id;
  }, [loggedInUserId]);

  // ECHO LISTENERS (No changes to your original logic)
  useEffect(() => {
    let echoInstance;
    let channelInstances = [];
    const setupEcho = async () => {
      echoInstance = await createEcho();
      chats.forEach(chat => {
        const otherUserId = getOtherUserId(chat);
        if (otherUserId) {
          const ch1 = echoInstance.channel(`userStatus.${otherUserId}`);
          ch1.listen('.UserStatusChanged', (d) => setOnlineStatuses(p => ({ ...p, [otherUserId]: { status: d.status } })));
          channelInstances.push(ch1);
        }
        const ch2 = echoInstance.channel(`chat.${chat.id}`);
        ch2.listen('.MessageSent', (d) => setChats(prev => prev.map(c => c.id === chat.id ? { ...c, last_message: d } : c)));
        ch2.listen('.MessageSeen', (d) => setChats(prev => prev.map(c => (c.id === chat.id && c.last_message?.id === d.id) ? { ...c, last_message: { ...c.last_message, is_seen: 1 } } : c)));
        channelInstances.push(ch2);
      });
    };
    if (chats.length > 0) setupEcho();
    return () => {
      if (echoInstance && channelInstances.length) channelInstances.forEach(ch => echoInstance.leave(ch.name));
    };
  }, [chats, getOtherUserId]);

  const getAllChat = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${process.env.BASE_URL}/chats`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setChats(data.data || []);
    } catch (e) { setIsError(true); } finally { setIsLoading(false); }
  };

  const deleteChat = async () => {
    if (!chatToDelete) return;
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${process.env.BASE_URL}/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setChats(prev => prev.filter(c => c.id !== chatToDelete.id));
        setSuccessModalVisible(true);
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
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
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
    const isSeen = chat.last_message?.is_seen === 1;
    const status = onlineStatuses[chat.other_person?.id]?.status || chat.other_person?.status || 'offline';
    const isDeleted = chat.post?.status === 'deleted';

    return (
      <Swipeable
        ref={ref => (swipeableRefs.current[chat.id] = ref)}
        renderRightActions={(p, d) => renderRightActions(p, d, chat)}
        enabled={!isDeleted}
      >
        <TouchableOpacity
          style={[styles.chatCard, isDeleted && styles.deletedCard]}
          onPress={() => !isDeleted && navigation.navigate('ChatBox', {
            chatId: chat.id, postId: chat.post_id, postTitle: chat.post.title, postImage, otherUserId: chat.other_person?.id, otherUserName: chat.other_person?.name,
          })}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: postImage }} style={styles.avatar} />
            <View style={[styles.statusDot, { backgroundColor: status === 'online' ? '#22c55e' : '#cbd5e1' }]} />
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={[styles.chatTitle, !isSeen ? styles.boldTxt : styles.dimTxt]} numberOfLines={1}>{chat.post?.title || 'No Title'}</Text>
              <Text style={styles.timeText}>{chat.last_message ? moment(chat.last_message.created_at).fromNow(true) : ''}</Text>
            </View>
            <View style={styles.msgRow}>
              <Text style={[styles.msgText, !isSeen ? styles.boldTxt : styles.dimTxt]} numberOfLines={1}>{chat.last_message?.message || 'New inquiry'}</Text>
              {chat.last_message && <MaterialIcons name={chat.last_message.is_seen ? 'done-all' : 'done'} size={14} color={chat.last_message.is_seen ? '#6366f1' : '#94a3b8'} style={{ marginLeft: 4 }} />}
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.userName}>{chat.other_person?.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.miniDot, { backgroundColor: status === 'online' ? '#22c55e' : '#b0b0b0' }]} />
                {status === 'online' ? <BlinkText>Online</BlinkText> : <Text style={styles.offlineText}>Offline</Text>}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER CENTERING */}
      <View style={[styles.header, { width: contentWidth, alignSelf: 'center' }]}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        // LIST CENTERING AND BOTTOM MARGIN
        contentContainerStyle={[
          styles.listContainer,
          { width: contentWidth, alignSelf: 'center', paddingBottom: bottomSpacing + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isLoading && <ActivityIndicator color="#6366f1" style={{ marginVertical: 20 }} />}
      />
      <BottomNavBar />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>Delete this chat?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cBtn} onPress={() => setDeleteModalVisible(false)}><Text style={styles.cBtnTxt}>Cancel</Text></TouchableOpacity>
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
});

export default ChatList;