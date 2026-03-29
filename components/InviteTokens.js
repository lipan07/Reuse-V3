import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '@env';
import Header from './Header';
import { buildInviteTokensStyles } from '../assets/css/InviteTokens.styles';
import { useTheme } from '../context/ThemeContext';

const INVITE_BASE_URL = 'https://nearx.co';
const getInviteUrl = (inviteToken) => `${INVITE_BASE_URL}/invite/${inviteToken}`;

const InviteTokens = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const { styles, nf } = useMemo(
    () => buildInviteTokensStyles(width, height),
    [width, height]
  );
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
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Header title="My Invite Tokens" navigation={navigation} />
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#0984e3" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Header title="My Invite Tokens" navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.infoBox, isDarkMode && styles.darkInfoBox]}>
          <MaterialIcons name="info-outline" size={nf(20)} color="#0984e3" />
          <Text style={[styles.infoText, isDarkMode && styles.darkInfoText]}>
            Share your invite tokens with friends! Each token is valid for 24 hours and can be used once.
          </Text>
        </View>

        {hasInactiveTokens ? (
          <View style={[styles.inactiveBanner, isDarkMode && styles.darkInactiveBanner]}>
            <MaterialIcons name="info" size={nf(20)} color="#E65100" />
            <Text style={[styles.inactiveBannerText, isDarkMode && styles.darkInactiveBannerText]}>
              Complete a purchase and get payment confirmed by admin to activate your invite tokens. Until then, others cannot use your tokens for registration.
            </Text>
          </View>
        ) : null}

        {tokens.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="card-giftcard" size={nf(64)} color={isDarkMode ? '#475569' : '#BDBDBD'} />
            <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>No invite tokens found</Text>
          </View>
        ) : (
          tokens.map((token) => {
            const status = getTokenStatus(token);
            return (
              <View key={token.id} style={[styles.tokenCard, isDarkMode && styles.darkTokenCard]}>
                <View style={styles.tokenHeader}>
                  <View style={styles.tokenInfo}>
                    <Text style={[styles.tokenLabel, isDarkMode && styles.darkTokenLabel]}>Token</Text>
                    <Text style={[styles.tokenValue, isDarkMode && styles.darkTokenValue]}>{token.token}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                </View>

                <View style={[styles.tokenDetails, isDarkMode && styles.darkTokenDetails]}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={nf(16)} color={isDarkMode ? '#94a3b8' : '#666'} />
                    <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                      Expires: {formatDate(token.expires_at)}
                    </Text>
                  </View>
                  {token.is_used && token.used_by && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="person" size={nf(16)} color={isDarkMode ? '#94a3b8' : '#666'} />
                      <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                        Used by: {token.used_by.name} ({token.used_by.email})
                      </Text>
                    </View>
                  )}
                  {token.is_used && token.used_at && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="check-circle" size={nf(16)} color={isDarkMode ? '#94a3b8' : '#666'} />
                      <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                        Used on: {formatDate(token.used_at)}
                      </Text>
                    </View>
                  )}
                </View>

                {token.is_valid ? (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.copyButton, isDarkMode && styles.darkActionButton]}
                      onPress={() => copyToken(token.token)}
                    >
                      <MaterialIcons name="content-copy" size={nf(18)} color={isDarkMode ? '#7dd3fc' : '#0984e3'} />
                      <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>Copy Token</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.urlButton, isDarkMode && styles.darkActionButton]}
                      onPress={() => copyInviteUrl(token.token)}
                    >
                      <MaterialIcons name="link" size={nf(18)} color={isDarkMode ? '#7dd3fc' : '#0984e3'} />
                      <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>Copy URL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.shareButton, isDarkMode && styles.darkActionButton]}
                      onPress={() => shareInviteUrl(token.token)}
                    >
                      <MaterialIcons name="share" size={nf(18)} color={isDarkMode ? '#7dd3fc' : '#0984e3'} />
                      <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>Share</Text>
                    </TouchableOpacity>
                  </View>
                ) : !token.is_used && !token.is_active ? (
                  <Text style={[styles.inactiveHint, isDarkMode && styles.darkInactiveHint]}>
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

export default InviteTokens;
