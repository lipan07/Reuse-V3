import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Image, ScrollView,
    SafeAreaView, StatusBar, useWindowDimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles, { normalize } from '../assets/css/AccountPage.styles';

const AccountPage = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [userName, setUserName] = useState('User');
    const [userImage, setUserImage] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');

    useEffect(() => {
        const fetchProfile = async () => {
            const name = await AsyncStorage.getItem('userName');
            const image = await AsyncStorage.getItem('userImage');
            if (name) setUserName(name);
            if (image) setUserImage(image);
        };
        fetchProfile();
    }, []);

    const renderLink = (text, icon, onPress, color) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
            <View style={styles.menuLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: color + '10' }]}>
                    <FontAwesome5 name={icon} size={normalize(16)} color={color} />
                </View>
                <Text style={styles.menuText}>{text}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={12} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.mainContainer, { alignSelf: 'center', width: width > 600 ? 600 : '100%' }]}>

                    {/* Modern Minimal Header */}
                    <View style={styles.header}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: userImage }} style={styles.avatar} />
                            <TouchableOpacity style={styles.badgeEdit} onPress={() => navigation.navigate('EditProfilePage')}>
                                <FontAwesome5 name="pen" size={10} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.greeting}>Hello, {userName}!</Text>
                        <Text style={styles.subGreeting}>Manage your profile and settings</Text>
                    </View>

                    {/* Menu Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Account Activity</Text>
                        {renderLink('Following', 'users', () => { }, '#6366f1')}
                        {renderLink('Invite Tokens', 'ticket-alt', () => { }, '#a855f7')}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Preferences</Text>
                        {renderLink('Settings', 'cog', () => { }, '#64748b')}
                        {renderLink('Help & Support', 'info-circle', () => { }, '#ef4444')}
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={() => { }}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AccountPage;