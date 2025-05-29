import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addEmail} from '../../store/DataSlice';
import axios from 'axios';

const Signin = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(trimmedEmail);

  async function handleCode() {
    let showError = false;
    setLoading(true);
    try {
      if (!emailRegex.test(trimmedEmail)) {
        showError = true;
        return;
      }
      const res = await axios.post(
        'https://services-backend-65ws.onrender.com/send-otp',
        {
          email: trimmedEmail,
        },
      );
      if (res.status === 200) {
        dispatch(addEmail(trimmedEmail));
        navigation.navigate('Otp');
      } else {
        showError = true;
      }
    } catch (error) {
      console.error(error);
      showError = true;
    } finally {
      if (showError) {
        alert('Please enter a valid email or try again.');
      }
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <LottieView
          autoPlay
          loop
          source={require('../../../assets/signin-loader.json')}
          style={{width: 150, height: 150}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.decorations}>
        <Image
          source={require('../../../assets/makeup.png')}
          style={styles.topLeft}
        />
        <Image
          source={require('../../../assets/plumber.webp')}
          style={styles.topRight}
        />
      </View>

      <View style={styles.centerMode}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.field}>
          <TextInput
            placeholder="enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            style={styles.input}
            onChangeText={setEmail}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: isEmailValid ? '#000' : '#eee'},
          ]}
          disabled={!isEmailValid}
          onPress={handleCode}>
          <Text
            style={[
              styles.buttonText,
              {
                color: isEmailValid ? '#fff' : '#999',
                opacity: isEmailValid ? 1 : 0.6,
              },
            ]}>
            Get Verification Code
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row', gap: 50}}>
        <Image
          source={require('../../../assets/mop.webp')}
          style={styles.bottomLeft}
        />
        <Image
          source={require('../../../assets/electrician.webp')}
          style={styles.bottomRight}
        />
      </View>
    </View>
  );
};

export default Signin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  centerMode: {
    flex: 1,
    marginTop: '50%',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#ccc',
    borderRadius: 12,
    width: '90%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    width: '90%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },

  topLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 150,
    height: 150,
    opacity: 0.5,
  },

  topRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 150,
    height: 150,
    opacity: 0.7,
  },

  bottomLeft: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },

  bottomRight: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
