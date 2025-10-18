import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Header';
import CustomStatusBar from './Screens/CustomStatusBar';

// Import all necessary components
import Home from './Home';
import FilterScreen from './FilterScreen';
import ProductDetails from './ProductDetailsPage';
import FullScreenMap from './FullScreenMap';
import ImageZoomViewerScreen from './ImageZoomViewerScreen';
import ChatBox from './ChatBox';
import ChatList from './ChatList';
import MyAdsPage from './MyAdsPage';
import Profile from './Profile';
import Login from './Login';
import EditProfilePage from './EditProfilePage';
import AccountPage from './AccountPage';
import FollowersPage from './FollowersPage';
import MyFollowersPage from './MyFollowersPage';
import FollowingPage from './FollowingPage';
import MyNetwork from './MyNetwork';
import PackagePage from './PackagePage';
import Settings from './Settings';
import CompanyDetailsPage from './CompanyDetailsPage';
import ProductAddPage from './ProductAddPage';
import ProductForm from './ProductForm';
import AddCarForm from './AddProduct/AddCarForm';
import AddHousesApartments from './AddProduct/AddHousesApartments';
import AddLandPlots from './AddProduct/AddLandPlots';
import AddPgGuestHouse from './AddProduct/AddPgGuestHouse';
import AddShopOffices from './AddProduct/AddShopOffices';
import AddMobileTablets from './AddProduct/AddMobileTablets';
import AddJob from './AddProduct/AddJob';
import AddMotorcycles from './AddProduct/AddMotorcycles';
import AddScooters from './AddProduct/AddScooters';
import AddBycycles from './AddProduct/AddBycycles';
import AddOthers from './AddProduct/AddOthers';
import AddEducationClasses from './AddProduct/AddEducationClasses';
import AddToursTravels from './AddProduct/AddToursTravels';
import AddElectronicsRepairServices from './AddProduct/AddElectronicsRepairServices';
import AddHealthBeauty from './AddProduct/AddHealthBeauty';
import AddHomeRenovationRepair from './AddProduct/AddHomeRenovationRepair';
import AddCleaningPestControl from './AddProduct/AddCleaningPestControl';
import AddLegalDocumentationServices from './AddProduct/AddLegalDocumentationServices';
import AddVehicleSpareParts from './AddProduct/AddVehicleSpareParts';
import AddCommercialHeavyVehicle from './AddProduct/AddCommercialHeavyVehicle';
import AddCommercialHeavyMachinery from './AddProduct/AddCommercialHeavyMachinery';
import LocationPicker from './LocationPicker';
import ChangePassword from './ChangePassword';
import SubCategoryScreen from './Screens/SubCategoryScreen';
import HelpSupport from './HelpSupport';
import Feedback from './Feedback';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      setCheckingAuth(false);
    };
    checkLoginStatus();
  }, []);

  if (checkingAuth) return null; // You can replace this with a splash screen or loader

  const initialRouteName = isLoggedIn ? 'Home' : 'Login';

  return (
    <>
      <Stack.Navigator initialRouteName={initialRouteName}
        screenOptions={{
          // Default: show custom header
          header: (props) => <Header {...props} />
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ImageViewer"
          component={ImageZoomViewerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfilePage"
          component={EditProfilePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountPage"
          component={AccountPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LocationPicker"
          component={LocationPicker}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PackagePage"
          component={PackagePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Feedback"
          component={Feedback}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpSupport"
          component={HelpSupport}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FollowingPage"
          component={FollowingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyDetailsPage"
          component={CompanyDetailsPage}
          options={{ headerShown: false }}
        />

        {/* <Stack.Screen name="Login" component={Login} /> */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} />
        <Stack.Screen name="FullScreenMap" component={FullScreenMap} />
        {/* <Stack.Screen name="ImageViewer" component={ImageViewer} /> */}
        <Stack.Screen name="ChatBox" component={ChatBox} />
        <Stack.Screen name="ChatList" component={ChatList} />
        <Stack.Screen name="MyAdsPage" component={MyAdsPage} />
        <Stack.Screen name="Profile" component={Profile} />
        {/* <Stack.Screen name="EditProfilePage" component={EditProfilePage} /> */}
        {/* <Stack.Screen name="AccountPage" component={AccountPage} /> */}
        <Stack.Screen name="MyNetwork" component={MyNetwork} />
        <Stack.Screen name="FollowersPage" component={FollowersPage} />
        <Stack.Screen name="MyFollowersPage" component={MyFollowersPage} />
        {/* <Stack.Screen name="FollowingPage" component={FollowingPage} /> */}
        {/* <Stack.Screen name="PackagePage" component={PackagePage} /> */}
        {/* <Stack.Screen name="Settings" component={Settings} /> */}
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        {/* <Stack.Screen name="CompanyDetailsPage" component={CompanyDetailsPage} /> */}
        {/* <Stack.Screen name="LocationPicker" component={LocationPicker} /> */}
        {/* Add product section */}
        <Stack.Screen name="ProductAddPage" component={ProductAddPage} />
        <Stack.Screen name="ProductForm" component={ProductForm} />
        <Stack.Screen name="AddCarForm" component={AddCarForm} />
        <Stack.Screen name="AddHousesApartments" component={AddHousesApartments} />
        <Stack.Screen name="AddLandPlots" component={AddLandPlots} />
        <Stack.Screen name="AddPgGuestHouse" component={AddPgGuestHouse} />
        <Stack.Screen name="AddShopOffices" component={AddShopOffices} />
        <Stack.Screen name="AddMobileTablets" component={AddMobileTablets} />
        <Stack.Screen name="AddJob" component={AddJob} />
        <Stack.Screen name="AddMotorcycles" component={AddMotorcycles} />
        <Stack.Screen name="AddScooters" component={AddScooters} />
        <Stack.Screen name="AddBycycles" component={AddBycycles} />
        <Stack.Screen name="AddOthers" component={AddOthers} />
        <Stack.Screen name="AddEducationClasses" component={AddEducationClasses} />
        <Stack.Screen name="AddToursTravels" component={AddToursTravels} />
        <Stack.Screen name="AddElectronicsRepairServices" component={AddElectronicsRepairServices} />
        <Stack.Screen name="AddHealthBeauty" component={AddHealthBeauty} />
        <Stack.Screen name="AddHomeRenovationRepair" component={AddHomeRenovationRepair} />
        <Stack.Screen name="AddCleaningPestControl" component={AddCleaningPestControl} />
        <Stack.Screen name="AddLegalDocumentationServices" component={AddLegalDocumentationServices} />
        <Stack.Screen name="AddVehicleSpareParts" component={AddVehicleSpareParts} />
        <Stack.Screen name="AddCommercialHeavyVehicle" component={AddCommercialHeavyVehicle} />
        <Stack.Screen name="AddCommercialHeavyMachinery" component={AddCommercialHeavyMachinery} />

        <Stack.Screen name="SubCategories" component={SubCategoryScreen} />
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
