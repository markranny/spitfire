export interface FlightAggregatesByAircraft {
  // General Info Section
  aircraftType: string;
  totalHours: number;

  // CAT/Class Section
  totalSingleEngineHours: number;
  totalMultiEngineHours: number;
  totalHelicopterHours: number;

  // Landings Section
  totalDayLandings: number;
  totalNightLandings: number;

  // Conditions Section
  totalNightHours: number;
  totalInstrumentHours: number;
  totalSimulatedInstrumentHours: number;
  totalInstrumentApproaches: number;

  // Type Of Piloting Time Section
  totalCrossCountryHours: number;
  totalSoloHours: number;
  totalPilotInCommandHours: number;
  totalSecondInCommandHours: number;
  totalDualReceivedHours: number;
  totalInstructorHours: number;

  // Military Section
  totalSorties: number;
  totalSpecialFlightCrewHours: number;
  totalNightVisionGoggleHours: number;
};

export interface FlightAggregates {
  // Box 1
  totalFixedWingMultiEngineHours: number;
  totalMilitaryHours: number;
  totalFixedWingPilotInCommandHours: number;

  // Box 2
  totalPilotInCommandHours: number;
  totalFixedWingTurbineHours: number;
  totalHours: number;

  // Box 3
  totalFixedWingTurbinePilotInCommand1000Hours: number;
  totalTurbine1500Hours: number;
  totalFixedWingTurbine1000Hours: number;

  // Box 4
  total12MonthHours: number;
  total24MonthHours: number;
  total36MonthHours: number;

  // Misc
  earliestFlightDate: string;
  latestFlightDate: string;

  // For the Flight Aggregates by Aircraft Table
  flightAggregatesPerAircraft: FlightAggregatesByAircraft[];
}

export interface SimpleFlightAggregates {
  // Box 1
  totalHours: number;
  totalPilotInCommandHours: number;
  totalSecondInCommandHours: number;

  // Box 2
  totalCrossCountryHours: number;
  totalNightHours: number;
  totalInstrumentHours: number;
}