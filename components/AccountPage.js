import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { buildAccountPageStyles } from '../assets/css/AccountPage.styles';
import CustomStatusBar from './Screens/CustomStatusBar';

const AccountPage = ({ navigation }) => {
    const { width: winW, height: winH } = useWindowDimensions();
    const { styles, nf } = useMemo(
        () => buildAccountPageStyles(winW, winH),
        [winW, winH]
    );
    const [userName, setUserName] = useState('User');
    const [userImage, setUserImage] = useState(
        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    );
    const [joinedViaInvite, setJoinedViaInvite] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const name = await AsyncStorage.getItem('userName');
            const image = await AsyncStorage.getItem('userImage');
            const joinedViaInviteValue = await AsyncStorage.getItem('joinedViaInvite');
            if (name) setUserName(name);
            if (image) setUserImage(image);
            if (joinedViaInviteValue != null) {
                setJoinedViaInvite(joinedViaInviteValue === 'true');
            }
        };
        fetchProfile();
        const unsubscribe = navigation.addListener('focus', fetchProfile);
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                await fetch(`${process.env.BASE_URL}/user/offline`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            await AsyncStorage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const renderLink = (text, icon, onPress, color) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
            <View style={styles.menuLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: color + '10' }]}>
                    <FontAwesome5 name={icon} size={nf(16)} color={color} />
                </View>
                <Text style={styles.menuText}>{text}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={nf(12)} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <>
            <CustomStatusBar
                backgroundColor="#FFFFFF"
                barStyle="dark-content"
                translucent={false}
            />
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mainContainer}>
                        <View style={styles.header}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: userImage }} style={styles.avatar} />
                                <TouchableOpacity
                                    style={styles.badgeEdit}
                                    onPress={() => navigation.navigate('EditProfilePage')}
                                >
                                    <FontAwesome5 name="pen" size={nf(10)} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.greeting}>Hello, {userName}!</Text>
                            <Text style={styles.subGreeting}>Manage your profile and settings</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Account Activity</Text>
                            {renderLink('Following', 'users', () => navigation.navigate('FollowingPage'), '#6366f1')}
                            {joinedViaInvite &&
                                renderLink('Invite Tokens', 'ticket-alt', () => navigation.navigate('InviteTokens'), '#a855f7')}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Preferences</Text>
                            {renderLink('Settings', 'cog', () => navigation.navigate('Settings'), '#64748b')}
                            {renderLink('Help & Support', 'info-circle', () => navigation.navigate('HelpSupport'), '#ef4444')}
                            {renderLink('Feedback', 'comment-alt', () => navigation.navigate('Feedback'), '#22c55e')}
                        </View>

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default AccountPage;
