// components/SubCategoryPanel.js
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
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
    pg_guest_houses: 'hotel',
    shop_offices: 'store',
    motorcycles: 'motorbike',
    scooters: 'scooter',
    bycycles: 'bicycle',
    accessories: 'tag',
    data_entry_back_office: 'briefcase',
    sales_marketing: 'chart-line',
    bpo_telecaller: 'phone',
    driver: 'car',
    office_assistant: 'desktop',
    delivery_collection: 'truck',
    teacher: 'school',
    cook: 'chef-hat',
    receptionist_front_office: 'deskphone',
    operator_technician: 'wrench',
    engineer_developer: 'code',
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
    womens_fashion: 'dress',
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

const SubCategoryPanel = memo(({ subcategories, onSelectSubcategory, parentCategoryName }) => {
    const getIconName = (guardName) => {
        return iconMapping[guardName] || 'tag';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{parentCategoryName}</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.gridContainer}>
                    {subcategories.map((item) => {
                        const iconName = getIconName(item.guard_name);
                        const categoryColor = '#2196F3'; // Default color, can be customized

                        return (
                            <TouchableOpacity
                                key={item.id.toString()}
                                style={[styles.optionCard, { borderColor: `${categoryColor}30` }]}
                                onPress={() => onSelectSubcategory(item)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
                                    <MCIcon
                                        name={iconName}
                                        size={normalize(28)}
                                        color={categoryColor}
                                    />
                                </View>
                                <Text style={[styles.optionTitle, { color: categoryColor }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: normalize(20),
        paddingTop: normalizeVertical(15),
        paddingBottom: normalizeVertical(15),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerText: {
        fontSize: normalize(22),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    scrollContent: {
        padding: normalize(12),
        paddingTop: normalizeVertical(20),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(4),
    },
    optionCard: {
        width: (width - normalize(48)) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        padding: normalize(16),
        marginBottom: normalizeVertical(12),
        borderWidth: 1.5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: normalize(56),
        height: normalize(56),
        borderRadius: normalize(28),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalizeVertical(10),
    },
    optionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default SubCategoryPanel;