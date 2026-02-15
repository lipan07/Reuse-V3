// components/SubCategoryPanel.js
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = (Dimensions.get('window').height) / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const iconMapping = {
    electronics: 'laptop',
    fashion: 'shirt',
    furniture: 'couch',
    services: 'screwdriver-wrench',
    properties: 'house',
    vehicles: 'car',
    houses_apartments: 'home',
    land_plots: 'map',
    pg_guest_houses: 'home-group',
    shop_offices: 'store',
    motorcycles: 'motorbike',
    scooters: 'scooter',
    bycycles: 'bicycle',
    accessories: 'tag',
    data_entry_back_office: 'briefcase',
    sales_marketing: 'chart-line',
    bpo_telecaller: 'phone',
    driver: 'car',
    office_assistant: 'monitor',
    delivery_collection: 'truck',
    teacher: 'school',
    cook: 'chef-hat',
    receptionist_front_office: 'deskphone',
    operator_technician: 'wrench',
    engineer_developer: 'code-tags',
    hotel_travel_executive: 'airplane',
    accountant: 'calculator',
    designer: 'palette',
    other_jobs: 'briefcase-outline',
    computers_laptops: 'laptop',
    tvs_video_audio: 'television',
    acs: 'air-conditioner',
    fridges: 'fridge',
    washing_machines: 'washing-machine',
    cameras_lenses: 'camera',
    harddisks_printers_monitors: 'printer',
    kitchen_other_appliances: 'microwave',
    sofa_dining: 'sofa',
    beds_wardrobes: 'bed',
    home_decor_garden: 'flower',
    kids_furniture: 'baby-carriage',
    other_household_items: 'home-variant',
    mens_fashion: 'tshirt-crew',
    womens_fashion: 'human-female',
    kids_fashion: 'baby-face-outline',
    books: 'book-open',
    gym_fitness: 'dumbbell',
    musical_instruments: 'music',
    sports_instrument: 'soccer',
    other_hobbies: 'gamepad-variant',
    dogs: 'dog',
    fish_aquarium: 'fish',
    pets_food_accessories: 'bowl',
    other_pets: 'paw',
    education_classes: 'school',
    tours_travels: 'airplane',
    electronics_repair_services: 'tools',
    health_beauty: 'spa',
    home_renovation_repair: 'hammer-wrench',
    cleaning_pest_control: 'broom',
    legal_documentation_services: 'gavel',
    packers_movers: 'truck-delivery',
    other_services: 'tools',
    commercial_heavy_vehicles: 'truck',
    vehicle_spare_parts: 'cog',
    commercial_heavy_machinery: 'factory',
    machinery_spare_parts: 'cog',
};

// Color mapping for subcategories - using simple primary colors
const subcategoryColorMapping = {
    // Properties
    houses_apartments: '#4CAF50', // Green
    land_plots: '#4CAF50', // Green
    pg_guest_houses: '#2196F3', // Blue
    shop_offices: '#FF9800', // Orange

    // Job
    data_entry_back_office: '#2196F3', // Blue
    sales_marketing: '#FF9800', // Orange
    bpo_telecaller: '#4CAF50', // Green
    driver: '#F44336', // Red
    office_assistant: '#2196F3', // Blue
    delivery_collection: '#FF9800', // Orange
    teacher: '#4CAF50', // Green
    cook: '#FF9800', // Orange
    receptionist_front_office: '#2196F3', // Blue
    operator_technician: '#F44336', // Red
    engineer_developer: '#F44336', // Red
    hotel_travel_executive: '#FF9800', // Orange
    accountant: '#2196F3', // Blue
    designer: '#F44336', // Red
    other_jobs: '#4CAF50', // Green

    // Bikes
    motorcycles: '#F44336', // Red
    scooters: '#4CAF50', // Green
    bycycles: '#2196F3', // Blue
    accessories: '#FF9800', // Orange

    // Electronics & Appliances
    computers_laptops: '#2196F3', // Blue
    tvs_video_audio: '#2196F3', // Blue
    acs: '#2196F3', // Blue
    fridges: '#4CAF50', // Green
    washing_machines: '#2196F3', // Blue
    cameras_lenses: '#F44336', // Red
    harddisks_printers_monitors: '#2196F3', // Blue
    kitchen_other_appliances: '#FF9800', // Orange

    // Commercial Vehicle & Spare Parts
    commercial_heavy_vehicles: '#FF9800', // Orange
    vehicle_spare_parts: '#F44336', // Red

    // Commercial Machinery & Spare Parts
    commercial_heavy_machinery: '#F44336', // Red
    machinery_spare_parts: '#F44336', // Red

    // Furniture
    sofa_dining: '#FF9800', // Orange
    beds_wardrobes: '#4CAF50', // Green
    home_decor_garden: '#4CAF50', // Green
    kids_furniture: '#2196F3', // Blue
    other_household_items: '#F44336', // Red

    // Fashion
    mens_fashion: '#2196F3', // Blue
    womens_fashion: '#F44336', // Red
    kids_fashion: '#2196F3', // Blue

    // Books, Sports & Hobbies
    books: '#2196F3', // Blue
    gym_fitness: '#4CAF50', // Green
    musical_instruments: '#FF9800', // Orange
    sports_instrument: '#4CAF50', // Green
    other_hobbies: '#F44336', // Red

    // Pets
    dogs: '#F44336', // Red
    fish_aquarium: '#2196F3', // Blue
    pets_food_accessories: '#FF9800', // Orange
    other_pets: '#4CAF50', // Green

    // Services
    education_classes: '#2196F3', // Blue
    tours_travels: '#4CAF50', // Green
    electronics_repair_services: '#F44336', // Red
    health_beauty: '#F44336', // Red
    home_renovation_repair: '#FF9800', // Orange
    cleaning_pest_control: '#4CAF50', // Green
    legal_documentation_services: '#2196F3', // Blue
    packers_movers: '#FF9800', // Orange
    other_services: '#2196F3', // Blue
};

const SubCategoryPanel = memo(({ subcategories, onSelectSubcategory, parentCategoryName, parentCategoryColor, listBottomPadding = 0 }) => {
    const getIconName = (guardName) => {
        return iconMapping[guardName] || 'tag';
    };

    const getCategoryColor = (guardName, index) => {
        // First try to get color from mapping
        if (subcategoryColorMapping[guardName]) {
            return subcategoryColorMapping[guardName];
        }

        // Default fallback colors - using simple primary colors
        const defaultColors = ['#F44336', '#4CAF50', '#FF9800', '#2196F3']; // Red, Green, Orange, Blue
        return defaultColors[index % defaultColors.length];
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{parentCategoryName}</Text>
                <Text style={styles.headerSubtext}>Choose a subcategory</Text>
            </View>

            <ScrollView 
                contentContainerStyle={[styles.scrollContent, listBottomPadding > 0 && { paddingBottom: listBottomPadding }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.gridContainer}>
                    {subcategories.map((item, index) => {
                        const iconName = getIconName(item.guard_name);
                        const categoryColor = getCategoryColor(item.guard_name, index);

                        return (
                            <TouchableOpacity
                                key={item.id.toString()}
                                style={[styles.optionCard, { borderColor: `${categoryColor}20` }]}
                                onPress={() => onSelectSubcategory(item)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, {
                                    backgroundColor: `${categoryColor}12`,
                                    borderColor: `${categoryColor}25`
                                }]}>
                                    <MCIcon
                                        name={iconName}
                                        size={normalize(26)}
                                        color={categoryColor}
                                    />
                                </View>
                                <Text style={[styles.optionTitle, { color: categoryColor }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <View style={[styles.arrowContainer, { backgroundColor: `${categoryColor}10` }]}>
                                    <Icon name="chevron-forward" size={normalize(16)} color={categoryColor} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: normalize(20),
        paddingTop: normalizeVertical(12),
        paddingBottom: normalizeVertical(12),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerText: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: normalizeVertical(3),
        letterSpacing: -0.3,
    },
    headerSubtext: {
        fontSize: normalize(12),
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '400',
    },
    scrollContent: {
        padding: normalize(12),
        paddingTop: normalizeVertical(16),
        paddingBottom: normalizeVertical(16),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(4),
    },
    optionCard: {
        width: (width - normalize(40)) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        padding: normalize(14),
        marginBottom: normalizeVertical(10),
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: normalize(52),
        height: normalize(52),
        borderRadius: normalize(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalizeVertical(8),
        borderWidth: 1,
    },
    optionTitle: {
        fontSize: normalize(14),
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.2,
        lineHeight: normalize(18),
    },
    arrowContainer: {
        position: 'absolute',
        top: normalize(8),
        right: normalize(8),
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SubCategoryPanel;