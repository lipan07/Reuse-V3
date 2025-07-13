import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const SomeComponent = () => {
    return (
        <ImageBackground
            source={require('../assets/images/world-map.png')} // Ensure the path is correct
            style={styles.mapBox}
            imageStyle={styles.mapBoxImage}
        >
            <View>
                {/* ...other components... */}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    mapBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapBoxImage: {
        resizeMode: 'cover',
    },
});

export default SomeComponent;
