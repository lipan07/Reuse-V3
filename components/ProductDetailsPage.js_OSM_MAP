import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from './BottomNavBar';

const ProductDetails = () => {
    const [buyerId, setBuyerId] = useState(null);
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params;

    useEffect(() => {
        const loadBuyerId = async () => {
            try {
                const storedBuyerId = await AsyncStorage.getItem('userId');
                setBuyerId(storedBuyerId);
            } catch (error) {
                console.error('Failed to load buyer ID:', error);
            }
        };
        loadBuyerId();
    }, []);

    const handleChatWithSeller = () => {
        if (buyerId) {
            navigation.navigate('ChatBox', {
                sellerId: product.user_id,
                buyerId,
                postId: product.id
            });
        } else {
            console.log("Buyer ID not found");
        }
    };

    const handleCallPress = () => {
        // Ideally, this would be implemented to handle actual call logic
        console.log("Calling functionality would be implemented here.");
    };

    const handleMapPress = () => {
        navigation.navigate('FullScreenMap', {
            latitude: product.latitude || 22.680360,
            longitude: product.longitude || 88.393776,
        });
    };


    const createLeafletMapHTML = (latitude, longitude) => {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Full Screen Map</title>
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <style>
                body, html, #map { height: 100%; margin: 0; padding: 0; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <script>
                var map = L.map('map', {
                    center: [${latitude}, ${longitude}],
                    zoom: 14,
                    layers: [
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        })
                    ]
                });
    
                // var circle = L.circle([${latitude}, ${longitude}], {
                //     color: '#a7b5aa', // Border color of the circle
                //     fillColor: '#f03', // Fill color of the circle
                //     fillOpacity: 0.2, // Transparency of the circle
                //     radius: 350 // Radius in meters
                // }).addTo(map);
                map.setView([${latitude}, ${longitude}], 14); // This ensures the circle is centered perfectly
            </script>
        </body>
        </html>
        `;
        return `${htmlContent}`;
    };


    const addressDetails = (
        <View style={styles.addressContainer}>
            <Text style={styles.addressHeader}>Location Details</Text>
            <Text style={styles.addressText}>Company: {product.companyName}</Text>
            <Text style={styles.addressText}>Latitude: {product.latitude || 22.5726}</Text>
            <Text style={styles.addressText}>Longitude: {product.longitude || 88.3639}</Text>
        </View>
    );

    const mapHtml = createLeafletMapHTML(product.latitude || 22.5726, product.longitude || 88.3639);

    return (
        <View style={styles.container}>
            <ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                    {product.images.map((image, index) => (
                        <TouchableOpacity key={index} onPress={() => navigation.navigate('ImageViewer', { images: product.images, selectedImageIndex: index })}>
                            <Image source={{ uri: image }} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.detailsCard}>
                    <Text style={styles.companyName} onPress={() => navigation.navigate('CompanyDetailsPage', 'Malaq')}>
                        Company: {product.companyName}
                    </Text>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.description}>{product.post_details.description}</Text>
                    <Text style={styles.price}>Price: ${product.post_details.amount}</Text>
                </View>
                <View style={styles.detailsCard}>
                    <View style={styles.mapAddressContainer}>
                        <View style={styles.addressContainer}>
                            <Text style={styles.addressHeader}>Location Details</Text>
                            <Text style={styles.addressText}>Latitude: {product.latitude}</Text>
                            <Text style={styles.addressText}>Longitude: {product.longitude}</Text>
                        </View>
                        <TouchableOpacity onPress={handleMapPress} style={styles.mapContainer} activeOpacity={0.9}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ html: createLeafletMapHTML(product.latitude || 22.5726, product.longitude || 88.3639) }}
                                style={styles.map}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                scrollEnabled={false}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {buyerId && buyerId !== product.user_id && ( // Ensure buttons are shown only if buyer is not the seller
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={handleChatWithSeller}>
                        <Text style={styles.buttonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
                        <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                </View>
            )}

            <BottomNavBar />
        </View>
    );
};

const styles = StyleSheet.create({
    // Your styles here
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    imageContainer: { paddingVertical: 10, paddingHorizontal: 15 },
    image: { width: 250, height: 300, marginRight: 15, borderRadius: 10, resizeMode: 'cover' },
    detailsCard: {
        backgroundColor: '#ffffff', borderRadius: 10, padding: 20, margin: 15,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
    },
    companyName: { fontSize: 18, fontWeight: '600', color: '#007bff', marginBottom: 5 },
    productTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#343a40' },
    description: { fontSize: 16, color: '#6c757d', marginBottom: 15 },
    price: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
    buttonContainer: {
        flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15,
        backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#dee2e6'
    },
    chatButton: {
        backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, flex: 1, marginRight: 10, alignItems: 'center'
    },
    callButton: {
        backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, flex: 1, marginLeft: 10, alignItems: 'center',
    },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    detailsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        margin: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    mapAddressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addressContainer: {
        flex: 1,
        paddingRight: 10,
    },
    mapContainer: {
        height: 150,
        width: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden'
    },
    addressHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5
    },
    addressText: {
        fontSize: 16,
        marginBottom: 5
    },
    map: {
        height: '100%',
        width: '100%'
    },
});

export default ProductDetails;
