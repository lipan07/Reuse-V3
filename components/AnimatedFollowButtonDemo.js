import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import AnimatedFollowButton from './AnimatedFollowButton';

const AnimatedFollowButtonDemo = () => {
    const [isFollowing1, setIsFollowing1] = useState(false);
    const [isFollowing2, setIsFollowing2] = useState(true);
    const [isFollowing3, setIsFollowing3] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Animated Follow Button Demo</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Default Size (24px)</Text>
                    <View style={styles.buttonRow}>
                        <AnimatedFollowButton
                            isFollowing={isFollowing1}
                            onPress={() => setIsFollowing1(!isFollowing1)}
                        />
                        <Text style={styles.statusText}>
                            {isFollowing1 ? 'Following' : 'Not Following'}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Large Size (32px)</Text>
                    <View style={styles.buttonRow}>
                        <AnimatedFollowButton
                            isFollowing={isFollowing2}
                            onPress={() => setIsFollowing2(!isFollowing2)}
                            size={32}
                        />
                        <Text style={styles.statusText}>
                            {isFollowing2 ? 'Following' : 'Not Following'}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Small Size (18px)</Text>
                    <View style={styles.buttonRow}>
                        <AnimatedFollowButton
                            isFollowing={isFollowing3}
                            onPress={() => setIsFollowing3(!isFollowing3)}
                            size={18}
                        />
                        <Text style={styles.statusText}>
                            {isFollowing3 ? 'Following' : 'Not Following'}
                        </Text>
                    </View>
                </View>

                <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Features:</Text>
                    <Text style={styles.featureItem}>• Scale animation on press</Text>
                    <Text style={styles.featureItem}>• Rotation animation</Text>
                    <Text style={styles.featureItem}>• Particle effects (12 hearts)</Text>
                    <Text style={styles.featureItem}>• Ripple effect</Text>
                    <Text style={styles.featureItem}>• Haptic feedback</Text>
                    <Text style={styles.featureItem}>• Smooth transitions</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    featuresSection: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    featureItem: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        paddingLeft: 10,
    },
});

export default AnimatedFollowButtonDemo;
