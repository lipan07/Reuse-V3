import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Circle } from 'react-native-maps'; // Import Circle for radius
import { useNavigation } from '@react-navigation/native';

const FullScreenMap = ({ route }) => {
    const { latitude, longitude } = route.params;
    const navigation = useNavigation();

    // Close the map view
    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Google Map with only a radius circle */}
            <MapView
                style={styles.map}
                provider="google"
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                {/* Circle with a 200-meter radius around the location */}
                <Circle
                    center={{ latitude, longitude }}
                    radius={200} // Radius in meters
                    strokeColor="rgba(255, 0, 0, 0.5)" // Circle border color
                    fillColor="rgba(255, 0, 0, 0.2)" // Circle fill color
                />
            </MapView>

            {/* Close button */}
            <View style={styles.buttonWrapper}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    closeButton: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FullScreenMap;
