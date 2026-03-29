import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Button, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ProductForm = ({ route }) => {
  const { isDarkMode } = useTheme();
  const { category, subcategory } = route.params;
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [newImage, setNewImage] = useState('');

  const handleAddImage = () => {
    if (newImage.trim()) {
      setProductImages([...productImages, newImage]);
      setNewImage('');
    }
  };

  const handleAddProduct = () => {
    // Handle the product submission logic here
    console.log('Product Details:', {
      category: category.name,
      subcategory: subcategory?.name,
      productName,
      productDescription,
      productPrice,
      productImages,
    });

    // Clear the form fields after adding the product
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductImages([]);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        formContainer: {
          flex: 1,
          padding: 20,
          backgroundColor: isDarkMode ? '#121212' : '#fff',
        },
        formHeader: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 20,
          color: isDarkMode ? '#f1f5f9' : '#000',
        },
        inputContainer: {
          marginBottom: 15,
        },
        label: {
          fontSize: 16,
          marginBottom: 5,
          color: isDarkMode ? '#94a3b8' : '#000',
        },
        input: {
          borderWidth: 1,
          borderColor: isDarkMode ? '#475569' : '#ccc',
          borderRadius: 5,
          padding: 10,
          backgroundColor: isDarkMode ? '#1e293b' : '#fff',
          color: isDarkMode ? '#f1f5f9' : '#000',
        },
        productImage: {
          width: 100,
          height: 100,
          marginRight: 10,
          borderRadius: 5,
        },
        addButton: {
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        },
        addButtonText: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
        },
      }),
    [isDarkMode]
  );

  const ph = isDarkMode ? '#64748b' : undefined;

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formHeader}>
        Add Product - {category.name} {subcategory && `> ${subcategory.name}`}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name:</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          placeholderTextColor={ph}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          value={productDescription}
          onChangeText={setProductDescription}
          placeholder="Enter product description"
          placeholderTextColor={ph}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price:</Text>
        <TextInput
          style={styles.input}
          value={productPrice}
          onChangeText={setProductPrice}
          placeholder="Enter product price"
          placeholderTextColor={ph}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Add Images:</Text>
        <TextInput
          style={styles.input}
          value={newImage}
          onChangeText={setNewImage}
          placeholder="Enter image URL"
          placeholderTextColor={ph}
        />
        <Button title="Add Image" onPress={handleAddImage} />

        {productImages.length > 0 && (
          <ScrollView horizontal>
            {productImages.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductForm;
