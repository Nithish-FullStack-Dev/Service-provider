import {useNavigation} from '@react-navigation/native';
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../animations/Loader';
import axios from 'axios';

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const email = useSelector(state => state.dataSlice.email);
  const [invalid, setInvalid] = useState(false);

  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const submitOtp = async () => {
    const code = otp.join('');
    try {
      const res = await axios.post(
        'https://services-backend-65ws.onrender.com/verify-otp',
        {
          email,
          otp: code,
        },
      );

      const data = res.data;

      if (res.status === 200) {
        setLoading(true);
        await AsyncStorage.setItem('active', email);
        setTimeout(() => {
          setLoading(false);
          navigation.reset({
            index: 0,
            routes: [{name: 'HomePage'}],
          });
        }, 1500);
      } else {
        setInvalid(true);
        setOtp(['', '', '', '']);
        setTimeout(() => setInvalid(false), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying OTP');
    }
  };

  if (loading) {
    return <Loader />;
  }

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/otp.png')} style={styles.otp} />
      <Text style={styles.title}>Enter OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            textAlign="center"
          />
        ))}
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          isOtpComplete ? styles.buttonActive : styles.buttonInactive,
        ]}
        onPress={submitOtp}
        disabled={!isOtpComplete}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
      {invalid && (
        <Text style={{color: 'red', textAlign: 'center', paddingTop: 20}}>
          Invalid otp
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  otp: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  otpInput: {
    borderBottomWidth: 2,
    borderColor: '#000',
    fontSize: 24,
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  button: {
    marginTop: 40,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#000',
  },
  buttonInactive: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Otp;
