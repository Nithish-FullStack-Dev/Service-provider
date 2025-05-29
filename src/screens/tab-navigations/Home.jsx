import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addAdmin, addBookings} from '../../store/DataSlice';
import axios from 'axios';

const Home = () => {
  const email = useSelector(state => state.dataSlice.email);
  const dispatch = useDispatch();
  const booking = useSelector(state => state.dataSlice.bookings);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (email) {
      const fetchData = async () => {
        try {
          const adminRes = await axios.get(
            `https://services-backend-65ws.onrender.com/api/admin/${email}`,
          );
          dispatch(addAdmin(adminRes.data.admin));

          const bookingsRes = await axios.get(
            `https://services-backend-65ws.onrender.com/api/booking/getBookings`,
          );
          dispatch(addBookings(bookingsRes.data || []));
        } catch (error) {
          console.log('Error:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [email, dispatch]);

  const stats = [
    {label: 'Users', value: '1,254'},
    {label: 'Bookings', value: '320'},
    {label: 'Revenue', value: '₹12,450'},
  ];

  const renderHeader = () => (
    <View>
      <Text style={styles.header}>Welcome, Admin</Text>

      <View style={styles.statsContainer}>
        {stats.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Active Bookings</Text>
    </View>
  );

  return (
    <FlatList
      data={booking}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        loading ? (
          <Text style={styles.noBookings}>Loading bookings...</Text>
        ) : (
          <Text style={styles.noBookings}>No active bookings...</Text>
        )
      }
      renderItem={({item}) => (
        <View style={styles.bookingCard}>
          <View>
            <Text style={styles.bookingUser}>
              {item?.userId?.name || 'loading...'}
            </Text>
            <Text style={styles.bookingService}>
              {item?.bookingDetails?.serviceName || 'loading...'}
            </Text>
          </View>
          <Text
            style={[
              styles.status,
              styles[
                `status_${item.status?.replace(' ', '').toLowerCase()}` || ''
              ],
            ]}>
            {item.status}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#f5f7fa',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#222',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 14,
    elevation: 3,
    width: '30%',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },
  bookingUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  bookingService: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  status_pending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  status_completed: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  status_inprogress: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  noBookings: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default Home;
