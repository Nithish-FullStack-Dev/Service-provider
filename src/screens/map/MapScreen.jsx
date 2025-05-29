import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
  Platform as RNPlatform,
} from 'react-native';
import {OPENCAGE_KEY} from '../../config/apiKeys';
import MapView, {Marker} from 'react-native-maps';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import MapSerach from './MapSearch';
import {useDispatch} from 'react-redux';
import {addAddress} from '../../store/DataSlice';

const Address = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const initialLat = route.params?.latitude || 17.4016;
  const initialLng = route.params?.longitude || 78.468;

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [showAnimation, setShowAnimation] = useState(true);
  const [location, setLocation] = useState({
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [loadingAddress, setLoadingAddress] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      fetchAddress(initialLat, initialLng);
    }, 2050);
    return () => clearTimeout(timer);
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const goToCurrentLocation = async () => {
    const granted = await requestPermission();
    if (!granted) return;

    setLoadingAddress(true);
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const updatedRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setSelectedLocation({latitude, longitude});
        setRegion(updatedRegion);
        fetchAddress(latitude, longitude);
        mapRef.current?.animateToRegion(updatedRegion, 1000);
      },
      error => {
        console.warn('Error getting current location:', error.message);
        setLoadingAddress(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleMapPress = async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    setSelectedLocation({latitude, longitude});
    const updatedRegion = {
      ...region,
      latitude,
      longitude,
    };
    setRegion(updatedRegion);
    setLoadingAddress(true);
    await fetchAddress(latitude, longitude);
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      setLoadingAddress(true);
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_KEY}`,
      );

      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        const formatted = response.data.results[0].formatted;
        setLocation({
          address: formatted,
          latitude,
          longitude,
        });
      } else {
        setLocation({
          address: 'Address not found',
          latitude,
          longitude,
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocation({
        address: 'Error fetching address',
        latitude,
        longitude,
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  const zoom = scale => {
    setRegion(prev => {
      const updatedRegion = {
        ...prev,
        latitudeDelta: prev.latitudeDelta * scale,
        longitudeDelta: prev.longitudeDelta * scale,
      };
      mapRef.current?.animateToRegion(updatedRegion, 500);
      return updatedRegion;
    });
  };

  // Handler from MapSerach component when user selects location
  const handleLocationSelect = ({latitude, longitude, location: address}) => {
    const updatedRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setSelectedLocation({latitude, longitude});
    setRegion(updatedRegion);
    setLocation({address, latitude, longitude});
    mapRef.current?.animateToRegion(updatedRegion, 1000);
  };

  // if (showAnimation) {
  //   return (
  //     <View style={styles.animationContainer}>
  //       <LottieView
  //         source={require('../../../assets/map-loader.json')}
  //         autoPlay
  //         loop
  //         style={styles.lottie}
  //       />
  //     </View>
  //   );
  // }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}>
      {/* Search Bar */}
      <MapSerach onLocationSelect={handleLocationSelect} />

      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}>
        <Marker
          coordinate={selectedLocation}
          title="Selected Location"
          description={location.address}
        />
      </MapView>

      {/* Zoom Buttons */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(0.5)}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(2)}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* GPS Button */}
      <View style={styles.gpsButtonContainer}>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={goToCurrentLocation}>
          <Text style={styles.gpsText}>📍</Text>
        </TouchableOpacity>
      </View>

      {loadingAddress && (
        <View style={styles.loaderOverlay}>
          <LottieView
            source={require('../../../assets/map-loader.json')}
            autoPlay
            loop
            style={{width: 150, height: 150}}
          />
        </View>
      )}

      {/* Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Selected Address:</Text>
        {loadingAddress ? (
          <Text style={[styles.addressText, {fontStyle: 'italic'}]}>
            Loading address...
          </Text>
        ) : (
          <Text style={styles.addressText}>{location.address}</Text>
        )}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            dispatch(addAddress(location));
            navigation.goBack();
          }}>
          <Text style={styles.selectButtonText}>Select this location</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Address;

const styles = StyleSheet.create({
  container: {flex: 1, marginVertical: 20},
  map: {flex: 1},
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    gap: 12,
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: '#333',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  gpsButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    zIndex: 10,
  },
  gpsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 12,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  gpsText: {
    fontSize: 20,
    color: '#fff',
  },
  addressContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 10,
    elevation: 4,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#555',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  selectButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
