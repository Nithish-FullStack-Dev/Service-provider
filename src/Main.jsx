import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Signin from './screens/credentials/Signin';
import Otp from './screens/credentials/Otp';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './screens/tab-navigations/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bookings from './screens/tab-navigations/Bookings';
import Profile from './screens/tab-navigations/Profile';
import Loader from './screens/animations/Loader';
import UpdateProfile from './screens/credentials/UpdateProfile';
import MapScreen from './screens/map/MapScreen';
import {useDispatch} from 'react-redux';
import axios from 'axios';
import {addAdmin} from './store/DataSlice';
import Chat from './screens/chat/Chat';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomePage = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={Bookings}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon size={size} color={color} name="account-circle" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Main = () => {
  const [logged, setLogged] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const hasUser = await AsyncStorage.getItem('active');

        if (!hasUser) {
          setLogged(false);
          return;
        }

        const {data} = await axios.get(
          `https://services-backend-65ws.onrender.com/api/admin/${hasUser}`,
        );
        dispatch(addAdmin(data.admin));
        setTimeout(() => {
          setLogged(true);
        }, 1500);
      } catch (err) {
        console.error('Error fetching user:', err);
        setLogged(false);
      }
    };

    getUser();
  }, [dispatch]);

  if (logged === null) {
    return <Loader />;
  }

  const initialRoute = logged ? 'HomePage' : 'Signin';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
            animationTypeForReplace: 'fade',
          }}>
          <Stack.Screen name="Signin" component={Signin} />
          <Stack.Screen name="Otp" component={Otp} />
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen
            name="UpdateProfile"
            component={UpdateProfile}
            options={{headerShown: true, headerShadowVisible: false}}
          />
          <Stack.Screen name="MapScreen" component={MapScreen} />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({route}) => ({
              headerShown: true,
              title: route.params?.adminName || 'Chat',
              headerStyle: {
                backgroundColor: '#0084FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default Main;
