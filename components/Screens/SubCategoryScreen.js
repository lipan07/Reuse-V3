// screens/SubCategoryScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SubCategoryPanel from '../SubCategoryPanel';
import BottomNavBar from '../BottomNavBar';
import { useNavigation, useRoute } from '@react-navigation/native';

const SubCategoryScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { subcategories, parentCategory, listingType } = route.params;

    const handleSubcategorySelect = (subcategory) => {
        // Use parentCategory from route params instead of selectedCategory
        const category = parentCategory;

        console.log('Selected subcategory guard_name:', subcategory?.guard_name);

        const navParams = { category, subcategory, listingType: listingType || 'sell' };
        
        switch (subcategory?.guard_name) {
            case 'houses_apartments':
                navigation.navigate('AddHousesApartments', navParams);
                break;
            case 'land_plots':
                navigation.navigate('AddLandPlots', navParams);
                break;
            case 'pg_guest_houses':
                navigation.navigate('AddPgGuestHouse', navParams);
                break;
            case 'shop_offices':
                navigation.navigate('AddShopOffices', navParams);
                break;
            // Job :: Start
            case 'data_entry_back_office':
            case 'sales_marketing':
            case 'bpo_telecaller':
            case 'driver':
            case 'office_assistant':
            case 'delivery_collection':
            case 'teacher':
            case 'cook':
            case 'receptionist_front_office':
            case 'operator_technician':
            case 'engineer_developer':
            case 'hotel_travel_executive':
            case 'accountant':
            case 'designer':
            case 'other_jobs':
                navigation.navigate('AddJob', navParams);
                break;
            // Job:: End
            case 'motorcycles':
                navigation.navigate('AddMotorcycles', navParams);
                break;
            case 'scooters':
                navigation.navigate('AddScooters', navParams);
                break;
            case 'bycycles':
                navigation.navigate('AddBycycles', navParams);
                break;
            case 'accessories':
            case 'computers_laptops':
            case 'tvs_video_audio':
            case 'acs':
            case 'fridges':
            case 'washing_machines':
            case 'cameras_lenses':
            case 'harddisks_printers_monitors':
            case 'kitchen_other_appliances':
            case 'sofa_dining':
            case 'beds_wardrobes':
            case 'home_decor_garden':
            case 'kids_furniture':
            case 'other_household_items':
            case 'mens_fashion':
            case 'womens_fashion':
            case 'kids_fashion':
            case 'books':
            case 'gym_fitness':
            case 'musical_instruments':
            case 'sports_instrument':
            case 'other_hobbies':
            case 'dogs':
            case 'fish_aquarium':
            case 'pets_food_accessories':
            case 'other_pets':
                navigation.navigate('AddOthers', navParams);
                break;
            case 'packers_movers':
                navigation.navigate('AddPackersMoversGeneral', navParams);
                break;
            case 'other_services':
                navigation.navigate('AddOtherServicesGeneral', navParams);
                break;
            case 'machinery_spare_parts':
                navigation.navigate('AddOthers', navParams);
                break;
            case 'education_classes':
                navigation.navigate('AddEducationClasses', navParams);
                break;
            case 'tours_travels':
                navigation.navigate('AddToursTravels', navParams);
                break;
            case 'electronics_repair_services':
                navigation.navigate('AddElectronicsRepairServices', navParams);
                break;
            case 'health_beauty':
                navigation.navigate('AddHealthBeauty', navParams);
                break;
            case 'home_renovation_repair':
                navigation.navigate('AddHomeRenovationRepair', navParams);
                break;
            case 'cleaning_pest_control':
                navigation.navigate('AddCleaningPestControl', navParams);
                break;
            case 'legal_documentation_services': // Fixed typo in service name
                console.log('Navigating to AddLegalServicesGeneral for guard_name:', subcategory?.guard_name);
                navigation.navigate('AddLegalServicesGeneral', navParams);
                break;
            case 'commercial_heavy_vehicles':
                navigation.navigate('AddCommercialHeavyVehicle', navParams);
                break;
            case 'vehicle_spare_parts':
                navigation.navigate('AddVehicleSpareParts', navParams);
                break;
            case 'commercial_heavy_machinery':
                navigation.navigate('AddCommercialHeavyMachinery', navParams);
                break;
            default:
                console.log('No valid guard_name found for the selected subcategory:', subcategory?.guard_name);
                // Optional: Navigate to a fallback screen
                navigation.navigate('AddOthers', navParams);
                break;
        }
    };

    return (
        <View style={styles.container}>
            <SubCategoryPanel
                subcategories={subcategories}
                onSelectSubcategory={handleSubcategorySelect}
                parentCategoryName={parentCategory.name}
                parentCategoryColor={parentCategory.color}
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

export default SubCategoryScreen;