import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '@env';
import Header from './Header';

const INVITE_BASE_URL = 'https://nearx.co';
const getInviteUrl = (inviteToken) => `${INVITE_BASE_URL}/invite/${inviteToken}`;

const InviteTokens = ({ navigation }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${BASE_URL}/invite-tokens`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
      } else {
        Alert.alert('Error', 'Failed to fetch invite tokens');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      Alert.alert('Error', 'Failed to load invite tokens');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTokens();
  };

  const copyToken = (token) => {
    Clipboard.setString(token);
    Alert.alert('Copied!', 'Invite token copied to clipboard');
  };

  const copyInviteUrl = async (token) => {
    const url = getInviteUrl(token);
    Clipboard.setString(url);
    Alert.alert('Copied!', 'Invite URL copied to clipboard');
  };

  const shareInviteUrl = async (token) => {
    try {
      const url = getInviteUrl(token);
      await Share.share({
        message: `Join me on nearX! Use my invite code: ${token}\n\nOr click this link: ${url}`,
        title: 'Invite to nearX',
      });
    } catch (error) {
      console.error('Error sharing invite URL:', error);
    }
  };

  const getTokenStatus = (token) => {
    if (token.is_used) {
      return { text: 'Used', color: '#9E9E9E' };
    }
    if (!token.is_active) {
      return { text: 'Inactive', color: '#FF9800' };
    }
    if (!token.is_valid) {
      return { text: 'Expired', color: '#F44336' };
    }
    return { text: 'Active', color: '#4CAF50' };
  };

  const hasInactiveTokens = tokens.some((t) => !t.is_used && !t.is_active);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Invite Tokens" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0984e3" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Invite Tokens" navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color="#0984e3" />
          <Text style={styles.infoText}>
            Share your invite tokens with friends! Each token is valid for 24 hours and can be used once.
          </Text>
        </View>

        {hasInactiveTokens ? (
          <View style={styles.inactiveBanner}>
            <MaterialIcons name="info" size={20} color="#E65100" />
            <Text style={styles.inactiveBannerText}>
              Complete a purchase and get payment confirmed by admin to activate your invite tokens. Until then, others cannot use your tokens for registration.
            </Text>
          </View>
        ) : null}

        {tokens.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="card-giftcard" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No invite tokens found</Text>
          </View>
        ) : (
          tokens.map((token) => {
            const status = getTokenStatus(token);
            return (
              <View key={token.id} style={styles.tokenCard}>
                <View style={styles.tokenHeader}>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenLabel}>Token</Text>
                    <Text style={styles.tokenValue}>{token.token}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                </View>

                <View style={styles.tokenDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Expires: {formatDate(token.expires_at)}
                    </Text>
                  </View>
                  {token.is_used && token.used_by && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="person" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Used by: {token.used_by.name} ({token.used_by.email})
                      </Text>
                    </View>
                  )}
                  {token.is_used && token.used_at && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="check-circle" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Used on: {formatDate(token.used_at)}
                      </Text>
                    </View>
                  )}
                </View>

                {token.is_valid ? (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.copyButton]}
                      onPress={() => copyToken(token.token)}
                    >
                      <MaterialIcons name="content-copy" size={18} color="#0984e3" />
                      <Text style={styles.actionButtonText}>Copy Token</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.urlButton]}
                      onPress={() => copyInviteUrl(token.token)}
                    >
                      <MaterialIcons name="link" size={18} color="#0984e3" />
                      <Text style={styles.actionButtonText}>Copy URL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.shareButton]}
                      onPress={() => shareInviteUrl(token.token)}
                    >
                      <MaterialIcons name="share" size={18} color="#0984e3" />
                      <Text style={styles.actionButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                ) : !token.is_used && !token.is_active ? (
                  <Text style={styles.inactiveHint}>
                    Activate by completing a purchase and getting it confirmed by admin.
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  inactiveBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  inactiveBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  inactiveHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tokenDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  copyButton: {},
  urlButton: {},
  shareButton: {},
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#0984e3',
    fontWeight: '600',
  },
});

export default InviteTokens;
