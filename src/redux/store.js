import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
// import unitReducer from './slices/unitSlice';
// import billingReducer from './slices/billingSlice';
// import complaintReducer from './slices/complaintSlice';
// import inventoryReducer from './slices/inventorySlice';
// import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    // unit: unitReducer,
    // billing: billingReducer,
    // complaint: complaintReducer,
    // inventory: inventoryReducer,
    // notification: notificationReducer,
  },
});

export default store;
