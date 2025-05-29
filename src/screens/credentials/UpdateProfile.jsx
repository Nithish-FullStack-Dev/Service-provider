import axios from 'axios';
import LottieView from 'lottie-react-native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {useSelector} from 'react-redux';

const UpdateProfile = ({route, navigation}) => {
  const userData = route.params.data;
  const locationAdd = useSelector(state => state.dataSlice.location);
  const [step, setStep] = useState(1);

  // Personal details states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [adhaarNumber, setAdhaarNumber] = useState('');
  const [phone, setPhone] = useState('');

  // Services
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([
    {label: 'Electrician', value: 'Electrician'},
    {label: 'Plumber', value: 'Plumber'},
    {label: 'Water Repair', value: 'Water Repair'},
    {label: 'AC Repair', value: 'AC Repair'},
    {label: 'Beauty Parlor (Men)', value: 'Beauty Parlor (Men)'},
    {label: 'Beauty Parlor (Women)', value: 'Beauty Parlor (Women)'},
    {label: 'House Cleaning', value: 'House Cleaning'},
    {label: 'Painting', value: 'Painting'},
  ]);
  const [open, setOpen] = useState(false);

  // Loading for API call
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(userData.name || '');
    setAge(userData.age ? String(userData.age) : '');
    setGender(userData.gender || '');
    setAdhaarNumber(userData.adhaarNumber || '');
    setPhone(userData.phone || '');
    setServices(userData.service || []);
  }, [userData]);

  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return false;
    }
    if (age && isNaN(age)) {
      Alert.alert('Validation Error', 'Age must be a number.');
      return false;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      Alert.alert('Validation Error', 'Phone must be 10 digits.');
      return false;
    }
    if (adhaarNumber && !/^\d{12}$/.test(adhaarNumber)) {
      Alert.alert('Validation Error', 'Aadhaar must be 12 digits.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (services.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one service.');
      return false;
    }
    return true;
  };

  const onNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const onBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const validateAndSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        'https://services-backend-65ws.onrender.com/api/admin/updateAdmin',
        {
          name,
          age: age ? Number(age) : undefined,
          gender,
          adhaarNumber,
          phone,
          service: services,
          email: userData.email,
          location: locationAdd || {},
        },
      );
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* Step indicator */}
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3].map(num => (
              <View
                key={num}
                style={[
                  styles.stepIndicator,
                  step === num && styles.stepIndicatorActive,
                ]}>
                <Text
                  style={[
                    styles.stepIndicatorText,
                    step === num && styles.stepIndicatorTextActive,
                  ]}>
                  {num}
                </Text>
              </View>
            ))}
          </View>

          {step === 1 && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroup}>
                {['Male', 'Female', 'Other'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.radioButton,
                      gender === option && styles.radioButtonSelected,
                    ]}
                    onPress={() => setGender(option)}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.radioCircle,
                        gender === option && styles.radioCircleSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.radioText,
                        gender === option && styles.radioTextSelected,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Email (readonly)</Text>
              <TextInput
                style={[styles.input, styles.readonlyInput]}
                value={userData.email}
                editable={false}
                selectTextOnFocus={false}
              />

              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                placeholder="12 digit Aadhaar Number"
                value={adhaarNumber}
                onChangeText={setAdhaarNumber}
                keyboardType="number-pad"
                maxLength={12}
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="10 digit phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Services You Offer</Text>
              <DropDownPicker
                open={open}
                value={services}
                items={items}
                setOpen={setOpen}
                setValue={setServices}
                setItems={setItems}
                multiple={true}
                max={5}
                placeholder="Select services you offer"
                style={styles.dropdown}
                dropDownContainerStyle={{borderColor: '#ccc'}}
                listMode="SCROLLVIEW"
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.label}>Current Location</Text>
              <Text style={styles.locationText}>
                {locationAdd.address || 'No location selected'}
              </Text>

              <TouchableOpacity
                style={[styles.button, {backgroundColor: '#555'}]}
                onPress={() => navigation.navigate('MapScreen')}>
                <Text style={styles.buttonText}>Get Current Location</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Navigation buttons */}
          <View style={styles.navigationButtonsContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={onBack}>
                <Text style={[styles.buttonText, styles.backButtonText]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity style={styles.button} onPress={onNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={validateAndSubmit}>
                <Text style={styles.buttonText}>Update Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require('../../../assets/spinner.json')}
            autoPlay
            loop
            style={{width: 100, height: 100}}
          />
        </View>
      )}
    </>
  );
};

export default UpdateProfile;

const violet = '#6C63FF';
const violetLight = '#E6E6FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: violet,
    marginBottom: 30,
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: violetLight,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepIndicatorActive: {
    backgroundColor: violet,
    borderColor: violet,
  },
  stepIndicatorText: {
    color: violetLight,
    fontWeight: '700',
    fontSize: 18,
  },
  stepIndicatorTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: violetLight,
    backgroundColor: violetLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    color: '#222',
  },
  readonlyInput: {
    backgroundColor: '#f2f2f2',
    color: '#888',
  },
  dropdown: {
    borderColor: violetLight,
    backgroundColor: violetLight,
    marginBottom: 18,
  },
  locationText: {
    fontSize: 16,
    padding: 14,
    borderColor: violetLight,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: violetLight,
    color: '#333',
    marginBottom: 20,
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: violet,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#ccc',
  },
  backButtonText: {
    color: '#333',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.7)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  radioButtonSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#E6E6FF',
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#aaa',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF',
  },
  radioText: {
    fontSize: 14,
    color: '#555',
  },
  radioTextSelected: {
    color: '#6C63FF',
    fontWeight: '700',
  },
});
