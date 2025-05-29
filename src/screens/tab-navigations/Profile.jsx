import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppContext} from '../../store/AppContext';
import {addAdmin, resetState} from '../../store/DataSlice';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const admin = useSelector(state => state.dataSlice.admin);
  const {restartApp} = useContext(AppContext);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        try {
          if (admin && Object.keys(admin).length > 0) {
            setUser(admin);
            return;
          }
          const email = await AsyncStorage.getItem('active');
          const {data} = await axios.get(
            `https://services-backend-65ws.onrender.com/api/admin/${email}`,
          );
          setUser(data.admin);
          dispatch(addAdmin(data.admin));
        } catch (error) {
          console.log(error);
        }
      };
      getUser();
    }, [admin, dispatch]),
  );

  useEffect(() => {
    if (user && (!user.name || !user.phone || !user.adhaarNumber)) {
      setModalVisible(true);
    }
  }, [user]);

  const saveProfile = () => {
    setModalVisible(false);
    navigation.navigate('UpdateProfile', {data: user});
  };

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('active');
      dispatch(resetState());
      restartApp();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <View style={styles.container}>
      {user && (
        <>
          <View style={styles.header}>
            <Image
              source={{uri: user.photo || 'https://i.pravatar.cc/150?img=12'}}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user.name || 'Admin Name'}</Text>
            <Text style={styles.role}>{user.email}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone || 'Not provided'}</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'red'}]}
            onPress={handleLogout}>
            <Text style={[styles.buttonText, {fontWeight: 700}]}>Logout</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Your Profile</Text>
            <TouchableOpacity style={styles.modalButton} onPress={saveProfile}>
              <Text style={styles.modalButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  header: {alignItems: 'center', marginBottom: 20},
  avatar: {width: 100, height: 100, borderRadius: 50, marginBottom: 10},
  name: {fontSize: 20, fontWeight: 'bold'},
  role: {fontSize: 14, color: 'gray'},
  infoBox: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {fontSize: 12, color: '#555', marginTop: 10},
  value: {fontSize: 14, fontWeight: '600'},
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {color: '#fff', textAlign: 'center', fontWeight: '600'},

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '20%',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Profile;
