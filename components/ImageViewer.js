import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Animated,
    FlatList, StatusBar
} from 'react-native';
import {
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ImageViewer = ({ route }) => {
    const { images, selectedIndex } = route.params; // Get the selected index from the route params
    const navigation = useNavigation();
    const scales = useRef(images.map(() => new Animated.Value(1)));

    const flatListRef = useRef(null); // Reference to FlatList

    return (
        <>
            <StatusBar
                backgroundColor="#000000"
                barStyle="dark-content"
                translucent={Platform.OS === 'android'}
            />
            <GestureHandlerRootView style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={selectedIndex} // Start with the selected image
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })} // Optimize scrolling to the selected index
                    renderItem={({ item, index }) => (
                        <Animated.View style={styles.imageContainer}>
                            <Animated.Image
                                source={{ uri: item }}
                                style={[
                                    styles.image,
                                    { transform: [{ scale: scales.current[index] }] },
                                ]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    )}
                    keyExtractor={(_, index) => String(index)}
                />
            </GestureHandlerRootView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default ImageViewer;