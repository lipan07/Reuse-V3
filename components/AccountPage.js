import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Header from './Screens/Header';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const AccountPage = ({ navigation }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const name = await AsyncStorage.getItem('userName');
            const image = await AsyncStorage.getItem('userImage');
            if (name) setUserName(name);
            if (image) setUserImage(image);
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
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }

            await AsyncStorage.clear();
            setIsLoggedIn(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const renderAccountLink = (text, icon, onPress, color) => (
        <TouchableOpacity style={styles.linkItem} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                <FontAwesome5 name={icon} size={normalize(20)} color={color} />
            </View>
            <Text style={styles.linkText}>{text}</Text>
            <FontAwesome5 name="chevron-right" size={normalize(16)} color="#bbb" />
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar backgroundColor="#007BFF" barStyle="light-content" translucent={true} />
            {/* Blue background for status bar area */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: statusBarHeight,
                backgroundColor: '#007BFF',
                zIndex: 1,
            }} />
            <View style={styles.container}>
                <View style={styles.profileSection}>
                    <Image source={{ uri: userImage }} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfilePage')}>
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.linksWrapper}>
                    {renderAccountLink('Following', 'users', () => navigation.navigate('FollowingPage'), '#FF9800')}
                    {/* {renderAccountLink('Buy Packages', 'shopping-cart', () => navigation.navigate('PackagePage'), '#FF9800')} */}
                    {renderAccountLink('Settings', 'cog', () => navigation.navigate('Settings'), '#2196F3')}
                    {renderAccountLink('Help and Support', 'question-circle', () => navigation.navigate('HelpSupport'), '#F44336')}
                    {renderAccountLink('Feedback', 'comment-alt', () => navigation.navigate('Feedback'), '#4CAF50')}
                    {renderAccountLink('Logout', 'sign-out-alt', handleLogout, '#607D8B')}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: normalize(50),
        paddingHorizontal: normalize(18),
        backgroundColor: '#F5F5F5',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(28),
        backgroundColor: '#fff',
        borderRadius: normalize(16),
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    profileImage: {
        width: normalize(80),
        height: normalize(80),
        borderRadius: normalize(40),
        marginRight: normalize(18),
        borderWidth: 2,
        borderColor: '#2196F3',
        backgroundColor: '#eaf1fa',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: normalize(18),
        marginBottom: normalize(6),
        color: '#222',
    },
    editButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(7),
        borderRadius: normalize(8),
        alignSelf: 'flex-start',
        marginTop: normalize(2),
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: normalize(14),
        letterSpacing: 0.2,
    },
    linksWrapper: {
        width: '100%',
        marginTop: normalize(10),
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(14),
        backgroundColor: '#FFFFFF',
        paddingVertical: normalize(14),
        paddingHorizontal: normalize(16),
        borderRadius: normalize(12),
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    iconCircle: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    linkText: {
        flex: 1,
        fontSize: normalize(16),
        color: '#222',
        fontWeight: '500',
        marginLeft: 2,
    },
});

export default AccountPage;
