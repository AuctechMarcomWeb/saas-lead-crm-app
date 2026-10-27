import { createSlice } from '@reduxjs/toolkit';

const unitSlice = createSlice({
  name: 'unit',
  initialState: {
    units: [],
    selectedUnit: null,
  },
  reducers: {
    setUnits: (state, action) => {
      state.units = action.payload;
    },
    selectUnit: (state, action) => {
      state.selectedUnit = action.payload;
    },
  },
});

export const { setUnits, selectUnit } = unitSlice.actions;
export default unitSlice.reducer;
