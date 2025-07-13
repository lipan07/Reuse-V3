import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyNetwork = () => {
  const [activeTab, setActiveTab] = useState('Following'); // Tab selection state
  const [followingFilter, setFollowingFilter] = useState('Post'); // Sub-selection for Following
  const [followersFilter, setFollowersFilter] = useState('Post'); // Sub-selection for Followers
  const [data, setData] = useState([]); // Fetched data
  const [isUnfollowModalVisible, setIsUnfollowModalVisible] = useState(false); // Modal state
  const [selectedPost, setSelectedPost] = useState(null); // Post to unfollow

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Reset filter to "Post" whenever tab changes
    if (tabName === 'Following') {
      setFollowingFilter('Post');
    } else {
      setFollowersFilter('Post');
    }
  };

  const fetchData = async () => {
    let endpoint = '';
    const filter = activeTab === 'Following' ? followingFilter : followersFilter;

    // Set endpoint based on active tab and filter
    if (activeTab === 'Following') {
      endpoint = filter === 'Post' ? '/post/following' : '/user/following';
    } else {
      endpoint = filter === 'Post' ? '/post/followers' : '/user/followers';
    }

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch data:', response.status);
        return;
      }

      const result = await response.json();

      if (filter === 'Company') {
        const formattedData = (result.following || result.followers || []).map((item) => ({
          id: item.id,
          title: item.name || 'No Name',
          images: item.images || [],
          address: item.address || 'No Address',
          distance: '5km' || '10km',
        }));
        setData(formattedData);
      } else {
        console.log(activeTab);
        const formattedData = result.map((item) => {
          const source = activeTab === 'Followers' ? item.user : item.post;
          if (activeTab === 'Followers' && filter === 'Post') {
            return {
              id: item.id,
              userId: item.user_id,
              title: source.name,
              address: source.address,
              images: source.images || [],
              distance: '5km' || '10km',
              createdAt: source.created_at,
            };
          } else {

            console.log(source);
            return {
              id: source.id,
              userId: source.user_id,
              title: source.title,
              address: source.address,
              images: source.images || [],
              distance: '5km' || '10km',
              createdAt: source.created_at,
            };
          }
        });
        setData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [activeTab, followingFilter, followersFilter]); // Re-fetch when tab or filter changes

  const handleUnfollow = (post) => {
    setSelectedPost(post); // Set the selected post to unfollow
    setIsUnfollowModalVisible(true); // Show modal
  };

  const confirmUnfollow = async () => {
    setIsUnfollowModalVisible(false);
    try {
      const response = await fetch(`${process.env.BASE_URL}/follow-post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: selectedPost.id }), // Pass the selected post ID
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.id !== selectedPost.id)); // Remove post from the list
      } else {
        Alert.alert('Error', 'Failed to unfollow this post.');
      }
    } catch (error) {
      console.error('Failed to unfollow:', error);
      Alert.alert('Error', 'Failed to unfollow. Please try again.');
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Image
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/50' }}
        style={styles.userImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.title || 'No Name'}</Text>
        <Text style={styles.userPhone}>{item.address || 'No Address'}</Text>
        <Text style={styles.userStatus}>{`Distance: ${item.distance}`}</Text>
      </View>
      {activeTab === 'Following' ? (
        <TouchableOpacity style={styles.unfollowButton} onPress={() => handleUnfollow(item)}>
          <Text style={styles.buttonText}>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.blockButton}>
          <Text style={styles.buttonText}>Block</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Following' && styles.activeTab]}
          onPress={() => handleTabChange('Following')}
        >
          <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Followers' && styles.activeTab]}
          onPress={() => handleTabChange('Followers')}
        >
          <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>
            Followers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-selection Links */}
      <View style={styles.subTabContainer}>
        {activeTab === 'Following' && (
          <>
            <TouchableOpacity
              style={[styles.subTabButton, followingFilter === 'Post' && styles.activeSubTabButton]}
              onPress={() => setFollowingFilter('Post')}
            >
              <Text style={[styles.subTabButtonText, followingFilter === 'Post' && styles.activeSubTabButtonText]}>
                Post-wise
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTabButton, followingFilter === 'Company' && styles.activeSubTabButton]}
              onPress={() => setFollowingFilter('Company')}
            >
              <Text style={[styles.subTabButtonText, followingFilter === 'Company' && styles.activeSubTabButtonText]}>
                Company-wise
              </Text>
            </TouchableOpacity>
          </>
        )}
        {activeTab === 'Followers' && (
          <>
            <TouchableOpacity
              style={[styles.subTabButton, followersFilter === 'Post' && styles.activeSubTabButton]}
              onPress={() => setFollowersFilter('Post')}
            >
              <Text style={[styles.subTabButtonText, followersFilter === 'Post' && styles.activeSubTabButtonText]}>
                Post-wise
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTabButton, followersFilter === 'Company' && styles.activeSubTabButton]}
              onPress={() => setFollowersFilter('Company')}
            >
              <Text style={[styles.subTabButtonText, followersFilter === 'Company' && styles.activeSubTabButtonText]}>
                Company-wise
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* User List */}
      <View style={styles.contentContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.userList}
        />
      </View>

      {/* Unfollow Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isUnfollowModalVisible}
        onRequestClose={() => setIsUnfollowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Unfollow</Text>
            <Text style={styles.modalText}>Are you sure you want to unfollow this post?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsUnfollowModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmUnfollow}>
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#333' },
  activeTabText: { color: '#007bff' },
  subTabContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
  subTabButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  activeSubTabButton: { backgroundColor: '#007bff' },
  subTabButtonText: { color: '#333', fontWeight: '500' },
  activeSubTabButtonText: { color: '#fff' },
  contentContainer: { flex: 1 },
  userList: { padding: 8 },
  userItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  userImage: { width: 50, height: 50, borderRadius: 25 },
  userInfo: { flex: 1, marginLeft: 10 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userPhone: { fontSize: 14, color: '#777' },
  userStatus: { fontSize: 12, color: '#999' },
  unfollowButton: { backgroundColor: '#ff3333', padding: 10, borderRadius: 8 },
  blockButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelButton: { flex: 1, padding: 10, margin: 4, backgroundColor: '#ccc', borderRadius: 8 },
  cancelButtonText: { textAlign: 'center', fontWeight: '600', color: '#333' },
  confirmButton: { flex: 1, padding: 10, margin: 4, backgroundColor: '#007bff', borderRadius: 8 },
  confirmButtonText: { textAlign: 'center', fontWeight: '600', color: '#fff' },
});

export default MyNetwork;
