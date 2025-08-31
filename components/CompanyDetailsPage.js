import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const normalize = (size) => Math.round((width / 375) * size);

const CompanyDetailsPage = () => {
    const [isFollowing, setIsFollowing] = useState(false);

    // Mock data
    const company = {
        name: "TechVision Solutions",
        type: "IT Services",
        about:
            "We provide cutting-edge technology solutions for businesses of all sizes, specializing in AI, cloud computing, and digital transformation.",
        address: "123 Tech Park, Silicon Valley, CA 94025",
        website: "www.techvisionsolutions.com",
        employees: "150+",
        founded: "2015",
    };

    const user = {
        name: "Sarah Johnson",
        position: "CEO & Founder",
        email: "s.johnson@techvisionsolutions.com",
        phone: "+1 (555) 123-4567",
        profile_image: null,
    };

    const handleFollow = () => setIsFollowing(!isFollowing);
    const handleCall = () => Linking.openURL(`tel:${user.phone}`);
    const handleEmail = () => Linking.openURL(`mailto:${user.email}`);
    const handleWebsite = () => Linking.openURL(`https://${company.website}`);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Left logo */}
                <View style={styles.logoWrapper}>
                    {user.profile_image ? (
                        <Image source={{ uri: user.profile_image }} style={styles.logo} />
                    ) : (
                        <View style={styles.defaultLogo}>
                            <Icon name="office-building" size={normalize(30)} color="#1a73e8" />
                        </View>
                    )}
                </View>

                {/* Right info */}
                <View style={styles.headerRight}>
                    <Text style={styles.companyName}>{company.name}</Text>
                    <Text style={styles.companyType}>{company.type}</Text>

                    {/* Actions side by side */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[
                                styles.actionBtn,
                                isFollowing ? styles.followingBtn : styles.followBtn,
                            ]}
                            onPress={handleFollow}
                        >
                            <Text
                                style={[
                                    styles.actionBtnText,
                                    isFollowing && styles.followingBtnText,
                                ]}
                            >
                                {isFollowing ? "Following ✓" : "Follow"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, styles.messageBtn]}>
                            <Icon name="message-text" size={16} color="#fff" />
                            <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                                Message
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Company Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Company Information</Text>
                    <View style={styles.infoRow}>
                        <Icon name="account-group" size={20} color="#1a73e8" />
                        <Text style={styles.infoText}>{company.employees} Employees</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="calendar" size={20} color="#1a73e8" />
                        <Text style={styles.infoText}>Founded in {company.founded}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="web" size={20} color="#1a73e8" />
                        <TouchableOpacity onPress={handleWebsite}>
                            <Text style={styles.linkText}>{company.website}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About</Text>
                    <Text style={styles.aboutText}>{company.about}</Text>
                </View>

                {/* Contact */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Primary Contact</Text>
                    <View style={styles.contactRow}>
                        <View style={styles.avatar}>
                            <Icon name="account" size={28} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.contactName}>{user.name}</Text>
                            <Text style={styles.contactPosition}>{user.position}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
                        <Icon name="email" size={20} color="#1a73e8" />
                        <Text style={styles.linkText}>{user.email}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                        <Icon name="phone" size={20} color="#1a73e8" />
                        <Text style={styles.linkText}>{user.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Location</Text>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={20} color="#1a73e8" />
                        <Text style={styles.infoText}>{company.address}</Text>
                    </View>
                    <View style={styles.mapPreview}>
                        <Icon name="google-maps" size={40} color="#1a73e8" />
                        <Text style={styles.mapText}>Open in Maps</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a73e8",
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        elevation: 3,
    },
    logoWrapper: {
        width: 65,
        height: 65,
        borderRadius: 32,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    logo: { width: 65, height: 65, borderRadius: 32 },
    defaultLogo: {
        width: 65,
        height: 65,
        borderRadius: 32,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    headerRight: { flex: 1 },
    companyName: { fontSize: 18, fontWeight: "700", color: "#fff" },
    companyType: {
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        marginBottom: 8,
    },
    headerActions: { flexDirection: "row" },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    followBtn: { backgroundColor: "#fff" },
    followingBtn: { backgroundColor: "#fff" },
    followingBtnText: { color: "#1a73e8" },
    actionBtnText: {
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 5,
        color: "#1a73e8",
    },
    messageBtn: { backgroundColor: "#0a66c2" },
    content: { padding: 15 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        color: "#202124",
    },
    infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
    infoText: { marginLeft: 10, fontSize: 14, color: "#333" },
    linkText: {
        marginLeft: 10,
        fontSize: 14,
        color: "#1a73e8",
        textDecorationLine: "underline",
    },
    aboutText: { fontSize: 14, color: "#5f6368", lineHeight: 20 },
    contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1a73e8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    contactName: { fontSize: 15, fontWeight: "600", color: "#202124" },
    contactPosition: { fontSize: 13, color: "#5f6368" },
    mapPreview: {
        height: 120,
        backgroundColor: "#f0f5ff",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },
    mapText: { fontSize: 13, color: "#1a73e8", marginTop: 5 },
});

export default CompanyDetailsPage;
