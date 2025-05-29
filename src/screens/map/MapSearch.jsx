import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {OPENCAGE_KEY} from '../../config/apiKeys';

const MapSerach = ({onLocationSelect}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchPlaces = async () => {
    if (!query.trim()) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query,
        )}&key=${OPENCAGE_KEY}&limit=5`,
      );
      if (response.data && response.data.results) {
        setPredictions(response.data.results);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = place => {
    setQuery(place.formatted);
    setPredictions([]);
    Keyboard.dismiss();
    onLocationSelect({
      latitude: place.geometry.lat,
      longitude: place.geometry.lng,
      address: place.formatted,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Search location"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={fetchPlaces}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchPlaces}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.loadingText}>Loading...</Text>}

      <FlatList
        data={predictions}
        keyExtractor={item => item.annotations.geohash || item.formatted}
        keyboardShouldPersistTaps="handled"
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(item)}>
            <Text style={styles.itemText}>{item.formatted}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() =>
          !loading && query.length > 0 ? (
            <Text style={styles.noResultsText}>No results found</Text>
          ) : null
        }
      />
    </View>
  );
};

export default MapSerach;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
  },
  backIcon: {
    padding: 8,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 5,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingText: {
    marginBottom: 8,
    fontStyle: 'italic',
    color: '#555',
  },
  item: {
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  noResultsText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
