import { createSlice, PayloadAction } from "@reduxjs/toolkit";



// Define the initial state
const initialState: InitialStateTypes = {
  activePage: "addDigitalFlightLogs",
  flightData: [], 
  columnMappings: [],
};


// Create the scorecard slice
export const scorecardSlice = createSlice({
  name: "scorecard",
  initialState,
  reducers: {
    // Reducer to set the active page
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePage = action.payload;
    },
    // Reducer to save flight data and column mappings
    saveFlightData: (
      state,
      action: PayloadAction<{ flightData: FlightData[]; columnMappings: ColumnMappings[] }>
    ) => {
      state.flightData = action.payload.flightData;
      state.columnMappings = action.payload.columnMappings;
    },
  },
});

// Export the action creators
export const { setActivePage, saveFlightData } = scorecardSlice.actions;

export default scorecardSlice.reducer;