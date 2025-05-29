import {createSlice} from '@reduxjs/toolkit';

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    email: '',
    bookings: [],
    location: {},
    admin: {},
    bookingsLength: 0,
  },
  reducers: {
    addEmail: (state, action) => {
      state.email = action.payload;
    },
    addBookings: (state, action) => {
      state.bookings = action.payload;
      state.bookingsLength = action.payload.length;
    },
    addAddress: (state, action) => {
      state.location = action.payload;
    },
    addAdmin: (state, action) => {
      state.admin = action.payload;
    },
    resetState: state => {
      state.email = '';
      state.bookings = [];
      state.address = '';
      state.admin = {};
      state.bookingsLength = 0;
    },
  },
});

export default dataSlice.reducer;
export const {addEmail, addBookings, addAddress, addAdmin, resetState} =
  dataSlice.actions;
