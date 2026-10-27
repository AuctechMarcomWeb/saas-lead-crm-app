import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  token: null,
  walletBalance: 0,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
    },
    updateUserInfo: (state, action) => {
      if (state.userInfo) {
        // merge the new data with existing user info
        state.userInfo = { ...state.userInfo, ...action.payload };
      } else {
        // if no user info exists yet, just set it
        state.userInfo = action.payload;
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    updateWallet: (state, action) => {
      state.walletBalance = action.payload;
    },
    logout: () => {
      return initialState;
    },
  },
});

export const { setUser, updateUserInfo, setToken, updateWallet, logout } = userSlice.actions;
export default userSlice.reducer;
