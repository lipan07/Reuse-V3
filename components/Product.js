import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../hooks/useFollowPost';

const Product = ({ product }) => {
  const navigation = useNavigation();
  const { isLiked, likeCount, toggleFollow } = useFollowPost(product);

  const handleProductPress = () => {
    navigation.navigate('ProductDetails', { product });
  };

  const handleImagePress = (index) => {
    navigation.navigate('ImageViewer', {
      images: product.images,
      selectedImageIndex: index,
    });
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleImagePress(index)} style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity style={styles.card} onPress={handleProductPress}>
      <View style={styles.imageList}>
        <FlatList
          data={product.images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{product.post_details.titile}</Text>
        <Text style={styles.details} numberOfLines={2} ellipsizeMode="tail">{product.post_details.description}</Text>
        <Text style={styles.price}>Price: ₹{product.amount ?? product.post_details?.amount}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{product.view_count || 0}</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={toggleFollow}>
            <Icon
              name={isLiked ? "heart" : "heart-outline"}
              size={16}
              color={isLiked ? "#e74c3c" : "#666"}
            />
            <Text style={[styles.statText, isLiked && styles.likedText]}>{likeCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    width: 120,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageList: {
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 5,
  },
  details: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

export default Product;
