import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ParentCategoryPanel from '../components/ParentCategoryPanel';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const staticCategories = [
  {
    id: 1,
    parent_id: null,
    guard_name: "cars",
    name: "Cars",
    color: "#dc2626", // Red
    children: [],
  },
  {
    id: 2,
    parent_id: null,
    guard_name: "properties",
    name: "Properties",
    color: "#16a34a", // Green
    children: [
      {
        id: 3,
        parent_id: 2,
        guard_name: "houses_apartments",
        name: "Houses & Apartments",
      },
      {
        id: 4,
        parent_id: 2,
        guard_name: "land_plots",
        name: "Land & Plots",
      },
      {
        id: 5,
        parent_id: 2,
        guard_name: "pg_guest_houses",
        name: "PG & Guest Houses",
      },
      {
        id: 6,
        parent_id: 2,
        guard_name: "shop_offices",
        name: "Shop & Offices",
      },
    ],
  },
  {
    id: 7,
    parent_id: null,
    guard_name: "mobiles",
    name: "Mobiles",
    color: "#f59e0b", // Amber
    children: [],
  },
  {
    id: 8,
    parent_id: null,
    guard_name: "job",
    name: "Job",
    color: "#84cc16", // Lime
    children: [
      { id: 9, parent_id: 8, guard_name: "data_entry_back_office", name: "Data entry and Back office" },
      { id: 10, parent_id: 8, guard_name: "sales_marketing", name: "Sales & Marketing" },
      { id: 11, parent_id: 8, guard_name: "bpo_telecaller", name: "BPO & Telecaller" },
      { id: 12, parent_id: 8, guard_name: "driver", name: "Driver" },
      { id: 13, parent_id: 8, guard_name: "office_assistant", name: "Office Assistant" },
      { id: 14, parent_id: 8, guard_name: "delivery_collection", name: "Delivery & Collection" },
      { id: 15, parent_id: 8, guard_name: "teacher", name: "Teacher" },
      { id: 16, parent_id: 8, guard_name: "cook", name: "Cook" },
      { id: 17, parent_id: 8, guard_name: "receptionist_front_office", name: "Receptionist & Front office" },
      { id: 18, parent_id: 8, guard_name: "operator_technician", name: "Operator & Technician" },
      { id: 19, parent_id: 8, guard_name: "engineer_developer", name: "IT Engineer & Developer" },
      { id: 20, parent_id: 8, guard_name: "hotel_travel_executive", name: "Hotel & Travel Executive" },
      { id: 21, parent_id: 8, guard_name: "accountant", name: "Accountant" },
      { id: 22, parent_id: 8, guard_name: "designer", name: "Designer" },
      { id: 23, parent_id: 8, guard_name: "other_jobs", name: "Other Jobs" },
    ],
  },
  {
    id: 24,
    parent_id: null,
    guard_name: "bikes",
    name: "Bikes",
    color: "#8b5cf6", // Violet
    children: [
      { id: 25, parent_id: 24, guard_name: "motorcycles", name: "Motorecycles" },
      { id: 26, parent_id: 24, guard_name: "scooters", name: "Scooters" },
      { id: 27, parent_id: 24, guard_name: "bycycles", name: "Bycycles" },
      { id: 28, parent_id: 24, guard_name: "accessories", name: "Accessories" },
    ],
  },
  {
    id: 29,
    parent_id: null,
    guard_name: "electronics_appliances",
    name: "Electronics & Appliances",
    color: "#0ea5e9", // Sky blue
    children: [
      { id: 30, parent_id: 29, guard_name: "computers_laptops", name: "Computers & Laptops" },
      { id: 31, parent_id: 29, guard_name: "tvs_video_audio", name: "TVs, Video & Audio" },
      { id: 32, parent_id: 29, guard_name: "acs", name: "ACs" },
      { id: 33, parent_id: 29, guard_name: "fridges", name: "Fridges" },
      { id: 34, parent_id: 29, guard_name: "washing_machines", name: "Washing Machines" },
      { id: 35, parent_id: 29, guard_name: "cameras_lenses", name: "Cameras & Lenses" },
      { id: 36, parent_id: 29, guard_name: "harddisks_printers_monitors", name: "Harddisks. Printers & Monitors" },
      { id: 37, parent_id: 29, guard_name: "kitchen_other_appliances", name: "Kitchen & Other Appliances" },
      { id: 38, parent_id: 29, guard_name: "accessories", name: "Accessories" },
    ],
  },
  {
    id: 39,
    parent_id: null,
    guard_name: "commercial_vehicle_spare_part",
    name: "Commercial Vehicle & Spare Parts",
    color: "#f97316", // Orange
    children: [
      { id: 40, parent_id: 39, guard_name: "commercial_heavy_vehicles", name: "Commercial & Heavy Vehicles" },
      { id: 41, parent_id: 39, guard_name: "vehicle_spare_parts", name: "Spare Parts" },
    ],
  },
  {
    id: 42,
    parent_id: null,
    guard_name: "commercial_mechinery_spare_parts",
    name: "Commercial Machinery & Spare Parts",
    color: "#8b5cf6", // Purple
    children: [
      { id: 43, parent_id: 42, guard_name: "commercial_heavy_machinery", name: "Commercial & Heavy Machinery" },
      { id: 44, parent_id: 42, guard_name: "machinery_spare_parts", name: "Spare Parts" },
    ],
  },
  {
    id: 45,
    parent_id: null,
    guard_name: "furniture",
    name: "Furniture",
    color: "#d97706", // Warm yellow-brown
    children: [
      { id: 46, parent_id: 45, guard_name: "sofa_dining", name: "Sofa & Dining" },
      { id: 47, parent_id: 45, guard_name: "beds_wardrobes", name: "Beds & Wardrobes" },
      { id: 48, parent_id: 45, guard_name: "home_decor_garden", name: "Home Decor and Garden" },
      { id: 49, parent_id: 45, guard_name: "kids_furniture", name: "Kids Furniture" },
      { id: 50, parent_id: 45, guard_name: "other_household_items", name: "Other Household Items" },
    ],
  },
  {
    id: 51,
    parent_id: null,
    guard_name: "fashion",
    name: "Fashion",
    color: "#ec4899", // Pink
    children: [
      { id: 52, parent_id: 51, guard_name: "mens_fashion", name: "Men" },
      { id: 53, parent_id: 51, guard_name: "womens_fashion", name: "Women" },
      { id: 54, parent_id: 51, guard_name: "kids_fashion", name: "Kids" },
    ],
  },
  {
    id: 55,
    parent_id: null,
    guard_name: "books_sports_hobbies",
    name: "Books, Sports & Hobbies",
    color: "#14b8a6", // Teal
    children: [
      { id: 56, parent_id: 55, guard_name: "books", name: "Books" },
      { id: 57, parent_id: 55, guard_name: "gym_fitness", name: "Gym & Fitness" },
      { id: 58, parent_id: 55, guard_name: "musical_instruments", name: "Musical Instruments" },
      { id: 59, parent_id: 55, guard_name: "sports_instrument", name: "Sports Equipment" },
      { id: 60, parent_id: 55, guard_name: "other_hobbies", name: "Other Hobbies" },
    ],
  },
  {
    id: 61,
    parent_id: null,
    guard_name: "pets",
    name: "Pets",
    color: "#f97316", // Orange
    children: [
      { id: 62, parent_id: 61, guard_name: "dogs", name: "Dogs" },
      { id: 63, parent_id: 61, guard_name: "fish_aquarium", name: "Fish & Aquarium" },
      { id: 64, parent_id: 61, guard_name: "pets_food_accessories", name: "Pets Food & Accessories" },
      { id: 65, parent_id: 61, guard_name: "other_pets", name: "Other Pets" },
    ],
  },
  {
    id: 66,
    parent_id: null,
    guard_name: "services",
    name: "Services",
    color: "#06b6d4", // Cyan
    children: [
      { id: 67, parent_id: 66, guard_name: "education_classes", name: "Education & Classes" },
      { id: 68, parent_id: 66, guard_name: "tours_travels", name: "Tours & Travels" },
      { id: 69, parent_id: 66, guard_name: "electronics_repair_services", name: "Electronics Repair and Services" },
      { id: 70, parent_id: 66, guard_name: "health_beauty", name: "Health & Beauty" },
      { id: 71, parent_id: 66, guard_name: "home_renovation_repair", name: "Home Renovation and Repair" },
      { id: 72, parent_id: 66, guard_name: "cleaning_pest_control", name: "Cleaning & Pest Control" },
      { id: 73, parent_id: 66, guard_name: "legal_documentation_services", name: "Legal & Documentation Services" },
      { id: 74, parent_id: 66, guard_name: "packers_movers", name: "Packers and Movers" },
      { id: 75, parent_id: 66, guard_name: "other_services", name: "Other Services" },
    ],
  },
  {
    id: 76,
    parent_id: null,
    guard_name: "others",
    name: "Others",
    color: "#6b7280", // Gray
    children: [],
  },
];

const ProductAddPage = () => {
  // const [categories, setCategories] = useState([]);
  const [categories] = useState(staticCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigation = useNavigation();

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setIsLoading(true);
  //     setIsError(false);
  //     try {
  //       const token = await AsyncStorage.getItem('authToken');
  //       const response = await fetch(`${process.env.BASE_URL}/category`, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  //       const data = await response.json();
  //       data.categories.forEach((category) => {
  //         console.log(category.parent_id, category.name);
  //         if (category.parent_id === null) {
  //           console.log(category.guard_name, category.name);
  //         }
  //       });
  //       setCategories(data.categories);
  //     } catch (error) {
  //       setIsError(true);
  //       setCategories([]);
  //       console.error('Error fetching categories:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchCategories();
  // }, []);

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
        case 'others':
          navigation.navigate('AddOthers', {
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