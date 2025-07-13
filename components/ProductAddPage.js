import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ParentCategoryPanel from '../components/ParentCategoryPanel';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProductAddPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${process.env.BASE_URL}/category`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        data.categories.forEach((category) => {
          console.log(category.parent_id, category.name);
          if (category.parent_id === null) {
            console.log(category.guard_name, category.name);
          }
        });
        setCategories(data.categories);
      } catch (error) {
        setIsError(true);
        setCategories([]);
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (category) => {
    if (category.children && category.children.length > 0) {
      navigation.navigate('SubCategories', {
        parentCategory: category,
        subcategories: category.children
      });
    } else {
      switch (category.guard_name) {
        case 'cars':
          navigation.navigate('AddCarForm', {
            category: category,
            subcategory: category
          });
          break;
        case 'mobiles':
          navigation.navigate('AddMobileTablets', {
            category: category,
            subcategory: category
          });
          break;
        default:
          navigation.navigate('AddOthers', {
            category: category,
            subcategory: category
          });
          break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <ParentCategoryPanel
        categories={categories}
        onSelectCategory={handleCategorySelect}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={false}
      />
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default ProductAddPage;