import { NextRequest } from "next/server";
import { and, eq, gt, gte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle/db";
import { flightLogs } from "@/db/drizzle/schema/flightLogs";
import { getUser } from "@/lib/getUser";
import { FlightColumnKey } from "@/lib/interfaces/flightColumnDefinition";
import { DateTime } from "luxon";
import { FlightAggregates, FlightAggregatesByAircraft, SimpleFlightAggregates } from "@/lib/interfaces/flightAggregates";

const mapQueryResultToDateString = (value: any) => {
  if (value[0]) {
    value = value[0];
  }
  if (value.value) {
    value = value.value;
  }
  if (value && value.toString() && value.toString()?.length > 0) {
    const date = DateTime.fromSQL(value.toString());
    if (date.isValid) {
      return date.toISODate();
    }
  }
  return value;
};

const mapQueryResultToNumber = (value: any) => {
  if (value[0]) {
    value = value[0];
  }
  if (value.value) {
    value = value.value;
  }
  if (value === null || value === undefined) {
    return 0;
  }
  const numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue;
};

const getColumnSum = async (userId: string, column: FlightColumnKey, military?: boolean): Promise<number> => {
  let query: any = db
    .select({
      value: sql`cast(sum(${sql.identifier(column)}) as decimal)`
    })
    .from(flightLogs);

  if (military === undefined) {
    query = query.where(eq(flightLogs.userId, String(userId)));
  } else if (military === true) {
    query = query.where(and(
      eq(flightLogs.userId, String(userId)),
      gt(sql.identifier(FlightColumnKey.MILITARY), 0),
    ));
  } else if (military === false) {
    query = query.where(and(
      eq(flightLogs.userId, String(userId)),
      eq(sql.identifier(FlightColumnKey.MILITARY), 0),
    ));
  }
  return query.then(mapQueryResultToNumber);
};

const getColumnGroupSum = async (userId: string, column: FlightColumnKey) => {
  const mapQueryResultToMap = (value: any) => {
    const resultMap = new Map<string, number>();
    value.forEach((item: any) => {
      const aircraftType = item?.aircraft;
      const numberValue = item?.value === null ? 0 : Number(item.value);
      if (!isNaN(numberValue)) {
        resultMap.set(aircraftType, numberValue);
      }
    });
    return resultMap;
  };
  return db
    .select({
      aircraft: sql`${sql.identifier(FlightColumnKey.AIRCRAFT_TYPE)}`,
      value: sql`cast(sum(${sql.identifier(column)}) as decimal)`
    })
    .from(flightLogs)
    .where(eq(flightLogs.userId, String(userId)))
    .groupBy(sql`${sql.identifier(FlightColumnKey.AIRCRAFT_TYPE)}`)
    .then(mapQueryResultToMap)
};

const getColumnTimeSum = async (userId: string, column: FlightColumnKey, monthsAgo: number) => {
  const pastDate = DateTime.now().minus({ months: monthsAgo });
  return db
    .select({
      value: sql<number>`cast(sum(${sql.identifier(column)}) as numeric)`
    })
    .from(flightLogs)
    .where(and(
      eq(flightLogs.userId, String(userId)),
      gte(sql.identifier(FlightColumnKey.DATE_TIME), pastDate.toISO())
    ))
    .then(mapQueryResultToNumber);
};

const getEarliestDate = async (userId: string) => {
  return db
    .select({
      value: sql`min(${sql.identifier(FlightColumnKey.DATE_TIME)})`
    })
    .from(flightLogs)
    .where(eq(flightLogs.userId, String(userId)))
    .then(mapQueryResultToDateString)
};

const getLatestDate = async (userId: string) => {
  return db
    .select({
      value: sql`max(${sql.identifier(FlightColumnKey.DATE_TIME)})`
    })
    .from(flightLogs)
    .where(eq(flightLogs.userId, String(userId)))
    .then(mapQueryResultToDateString)
};

const getSimpleAggregates = async (userId: string, military?: boolean): Promise<SimpleFlightAggregates> => {
  // Box 1
  const totalHours: number = await getColumnSum(userId, FlightColumnKey.TOTAL_TIME, military);
  const totalPilotInCommandHours: number = await getColumnSum(userId, FlightColumnKey.PIC, military);
  const totalSecondInCommandHours: number = await getColumnSum(userId, FlightColumnKey.SIC, military);

  // Box 2
  const totalCrossCountryHours: number = await getColumnSum(userId, FlightColumnKey.XC, military);
  const totalNightHours: number = await getColumnSum(userId, FlightColumnKey.NIGHT, military);
  const totalInstrumentHours: number = await getColumnSum(userId, FlightColumnKey.ACTUAL_INST, military);

  return {
    // Box 1
    totalHours: totalHours,
    totalPilotInCommandHours: totalPilotInCommandHours,
    totalSecondInCommandHours: totalSecondInCommandHours,

    // Box 2
    totalCrossCountryHours: totalCrossCountryHours,
    totalNightHours: totalNightHours,
    totalInstrumentHours: totalInstrumentHours,
  }
};

const getScorecardAggregates = async (userId: string): Promise<FlightAggregates> => {
  // Box 1
  const totalFixedWingMultiEngine: number = await getColumnSum(userId, FlightColumnKey.FIXED_WING_MULTI_ENGINE);
  const totalMilitary: number = await getColumnSum(userId, FlightColumnKey.TOTAL_TIME, true);
  const totalFixedWingPilotInCommand: number = await getColumnSum(userId, FlightColumnKey.FIXED_WING_PIC);

  // Box 2
  const totalPilotInCommand: number = await getColumnSum(userId, FlightColumnKey.PIC);
  const totalFixedWingTurbine: number = await getColumnSum(userId, FlightColumnKey.FIXED_WING_TURBINE);
  const totalFlightTime: number = await getColumnSum(userId, FlightColumnKey.TOTAL_TIME);

  // Box 3
  const totalFixedWingTurbinePilotInCommand1000: number = parseFloat(Math.max(0, (await getColumnSum(userId, FlightColumnKey.FIXED_WING_TURBINE_PIC) - 1000)).toFixed(2));
  const totalTurbine1500: number = parseFloat(Math.max(0, (await getColumnSum(userId, FlightColumnKey.TURBINE) - 1500)).toFixed(2));
  const totalFixedWingTurbine1000: number = parseFloat(Math.max(0, (await getColumnSum(userId, FlightColumnKey.FIXED_WING_TURBINE) - 1000)).toFixed(2));

  // Box 4
  const totalFlightHoursIn12Months: number = await getColumnTimeSum(userId, FlightColumnKey.TOTAL_TIME, 12);
  const totalFlightHoursIn24Months: number = await getColumnTimeSum(userId, FlightColumnKey.TOTAL_TIME, 24);
  const totalFlightHoursIn36Months: number = await getColumnTimeSum(userId, FlightColumnKey.TOTAL_TIME, 36);

  // General Section
  const totalFlightTimePerAircraft: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.TOTAL_TIME); // Total Time

  // CAT/Class Section
  const totalSingleEngineFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SINGLE_ENGINE); // ASEL
  const totalMultiEngineFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.MULTI_ENGINE); // AMEL
  const totalHelicopterFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.HELO); // HELO

  // Landings Section
  const totalDayLandings: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.DAY_LDG);
  const totalNightLandings: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.NIGHT_LDG);

  // Conditions Section
  const totalNightFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.NIGHT); // NT
  const totalInstrumentFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.ACTUAL_INST); // ACT IN
  const totalSimulatedInstrumentFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SIM_INST); // SIM IN
  const totalInstrumentApproaches: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.INSTRUMENT_APPROACH); // APP
  
  // Type Of Piloting Time Section
  const totalCrossCountryFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.XC); // XC
  const totalSoloFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SOLO);
  const totalPilotInCommandFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.PIC);
  const totalSecondInCommandFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SIC);
  const totalDualFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.DUAL_RCVD);
  const totalInstructorFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.INSTRUCTOR);

  // Military Section
  const totalSorties: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SORTIES);
  const totalSpecialFlightCrewTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.SPECIAL_CREW_TIME);
  const totalNightVisionGoggleFlightTime: Map<string, number> = await getColumnGroupSum(userId, FlightColumnKey.NVG);

  const flightAggregatesPerAircraft: FlightAggregatesByAircraft[] = [];
  totalFlightTimePerAircraft.forEach((value, key) => {
    const flightAggregatesPerAircraftItem: FlightAggregatesByAircraft = {
      // General Info Section
      aircraftType: key,
      totalHours: totalFlightTimePerAircraft.get(key) || 0,

      // CAT/Class Section
      totalSingleEngineHours: totalSingleEngineFlightTime.get(key) || 0,
      totalMultiEngineHours: totalMultiEngineFlightTime.get(key) || 0,
      totalHelicopterHours: totalHelicopterFlightTime.get(key) || 0,

      // Landings Section
      totalDayLandings: totalDayLandings.get(key) || 0,
      totalNightLandings: totalNightLandings.get(key) || 0,

      // Conditions Section
      totalNightHours: totalNightFlightTime.get(key) || 0,
      totalInstrumentHours: totalInstrumentFlightTime.get(key) || 0,
      totalSimulatedInstrumentHours: totalSimulatedInstrumentFlightTime.get(key) || 0,
      totalInstrumentApproaches: totalInstrumentApproaches.get(key) || 0,

      // Type Of Piloting Time Section
      totalCrossCountryHours: totalCrossCountryFlightTime.get(key) || 0,
      totalSoloHours: totalSoloFlightTime.get(key) || 0,
      totalPilotInCommandHours: totalPilotInCommandFlightTime.get(key) || 0,
      totalSecondInCommandHours: totalSecondInCommandFlightTime.get(key) || 0,
      totalDualReceivedHours: totalDualFlightTime.get(key) || 0,
      totalInstructorHours: totalInstructorFlightTime.get(key) || 0,

      // Military Section
      totalSorties: totalSorties.get(key) || 0,
      totalSpecialFlightCrewHours: totalSpecialFlightCrewTime.get(key) || 0,
      totalNightVisionGoggleHours: totalNightVisionGoggleFlightTime.get(key) || 0
    };
    flightAggregatesPerAircraft.push(flightAggregatesPerAircraftItem);
  });
  flightAggregatesPerAircraft.sort((a, b) => a.aircraftType.localeCompare(b.aircraftType));

  return {
    // Box 1
    totalFixedWingMultiEngineHours: totalFixedWingMultiEngine,
    totalMilitaryHours: totalMilitary,
    totalFixedWingPilotInCommandHours: totalFixedWingPilotInCommand,

    // Box 2
    totalPilotInCommandHours: totalPilotInCommand,
    totalFixedWingTurbineHours: totalFixedWingTurbine,
    totalHours: totalFlightTime,

    // Box 3
    totalFixedWingTurbinePilotInCommand1000Hours: totalFixedWingTurbinePilotInCommand1000,
    totalTurbine1500Hours: totalTurbine1500,
    totalFixedWingTurbine1000Hours: totalFixedWingTurbine1000,

    // Box 4
    total12MonthHours: totalFlightHoursIn12Months,
    total24MonthHours: totalFlightHoursIn24Months,
    total36MonthHours: totalFlightHoursIn36Months,

    // Misc
    earliestFlightDate: await getEarliestDate(userId),
    latestFlightDate: await getLatestDate(userId),

    // For the Flight Aggregates by Aircraft Table
    flightAggregatesPerAircraft: flightAggregatesPerAircraft,
  };
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }
    const url = new URL(request.url);
    const params = url.searchParams;
    const aggregateType = params.get("aggregateType");
    const military = params.get("military");
    if (aggregateType === "scorecard") {
      const scorecardAggregates = await getScorecardAggregates(user.id);
      return Response.json({
        success: true,
        aggregates: scorecardAggregates
      });
    } else {
      const militaryFlag = military === null ? undefined : military === "true" ? true : false;
      const simpleAggregates = await getSimpleAggregates(user.id, militaryFlag);
      return Response.json({
        success: true,
        aggregates: simpleAggregates
      });
    }
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
