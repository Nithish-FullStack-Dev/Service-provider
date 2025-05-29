import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addBookings} from '../../store/DataSlice';
import {useNavigation} from '@react-navigation/native';

const Bookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(state => state.dataSlice.bookings);
  const admin = useSelector(state => state.dataSlice.admin);
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const {data} = await axios.get(
        'https://services-backend-65ws.onrender.com/api/booking/getBookings',
      );
      dispatch(addBookings(data || []));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [dispatch]);

  const handleConfirm = async bookingId => {
    const payload = {_id: bookingId, adminId: admin?._id};
    try {
      const res = await axios.put(
        'https://services-backend-65ws.onrender.com/api/booking/conformBooking',
        payload,
      );
      if (res.data.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };
  // console.log(bookings);

  const handleCancel = bookingId => {
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelReason) return alert('Please enter a reason.');

    try {
      const payload = {
        bookingId: selectedBookingId,
        adminId: admin?._id,
        reason: cancelReason,
      };

      await axios.post(
        'https://services-backend-65ws.onrender.com/api/booking/admin/cancel',
        payload,
      );
      setShowModal(false);
      setCancelReason('');
      setSelectedBookingId(null);
      fetchBookings();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel booking');
    }
  };

  const renderStatus = item => {
    const isAssignedToCurrentAdmin = item?.adminId === admin?._id;
    const isUnassigned = item?.adminId === null;
    const isConfirmed = item?.confirmBooking;
    const isCancelled = item.cancelledBy && item.cancelledBy.length > 0;

    if (isCancelled)
      return <Text style={styles.statusCancelled}>Cancelled</Text>;
    if (isConfirmed && isAssignedToCurrentAdmin)
      return <Text style={styles.statusConfirmed}>Confirmed</Text>;
    if (isUnassigned) return <Text style={styles.statusPending}>Pending</Text>;

    return <Text style={styles.statusClosed}>Closed</Text>;
  };

  const renderItem = ({item}) => {
    const isAssignedToCurrentAdmin = item?.adminId === admin?._id;
    const isUnassigned = item?.adminId === null;
    const isConfirmed = item?.confirmBooking;
    const isCancelled = item.cancelledBy && item.cancelledBy.length > 0;

    return isUnassigned || isAssignedToCurrentAdmin ? (
      <View style={styles.card}>
        <Text style={styles.name}>{item.userId?.name}</Text>
        <Text style={styles.service}>
          {item.bookingDetails?.serviceName || 'error'}
        </Text>
        <Text style={styles.date}>
          📅 {item.bookingDetails?.dateBooked || 'error'}
        </Text>
        <Text style={styles.time}>
          ⏰ {item.bookingDetails?.timeSlot || 'unable to fetch'}
        </Text>
        <Text style={styles.time}>₹ {item.payment?.amount || 0} rs</Text>
        <Text style={styles.location}>
          📍 {item.userId?.location?.address || 'not found'}
        </Text>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.time}>Status:</Text>
          <Text style={styles.time}>{renderStatus(item)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {!isCancelled ? (
            <>
              {!isConfirmed && isUnassigned && (
                <>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item._id)}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleConfirm(item._id)}>
                    <Text style={styles.btnText}>Confirm</Text>
                  </TouchableOpacity>
                </>
              )}

              {isConfirmed && isAssignedToCurrentAdmin && (
                <View style={styles.fullWidth}>
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedText}>✔ Confirmed</Text>
                  </View>
                  <View style={[styles.buttonContainer, {marginTop: 10}]}>
                    <TouchableOpacity
                      style={styles.chatBtn}
                      onPress={() =>
                        navigation.navigate('Chat', {
                          userId: item.userId?._id,
                          adminId: item.adminId,
                          adminName: item.userId?.name,
                        })
                      }>
                      <Text style={styles.btnText}>💬 Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() =>
                        Linking.openURL(`tel:${item.userId?.phone}`)
                      }>
                      <Text style={styles.btnText}>📞 Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text>This has been cancelled</Text>
          )}
        </View>
      </View>
    ) : (
      <View style={styles.card}>
        <Text style={styles.name}>Booking Status</Text>
        <Text style={styles.service}>This booking is closed.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Booking Requests</Text>

      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 20}}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bookings available.</Text>
        }
      />

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancel Reason</Text>
            <TextInput
              placeholder="Enter reason..."
              value={cancelReason}
              onChangeText={setCancelReason}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowModal(false)}>
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={submitCancellation}>
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  service: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 10,
  },
  time: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#1e40af',
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmedBadge: {
    backgroundColor: '#dbeafe',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
  fullWidth: {
    width: '100%',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    marginRight: 5,
    borderRadius: 8,
  },
  modalSubmit: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    marginLeft: 5,
    borderRadius: 8,
  },
  statusContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  statusPending: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 16,
  },
  statusConfirmed: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
  },
  statusCancelled: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
  statusClosed: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Bookings;
