import { db } from "@/db/drizzle/db";
import { flightLogs, InsertFlightLog } from "@/db/drizzle/schema/flightLogs";
import { getUser } from "@/lib/getUser";
import { FlightColumnKey } from "@/lib/interfaces/flightColumnDefinition";
import { NextRequest } from "next/server";
import { AircraftModelInfo, getAircraftInfo } from "../upload/route";
import { DateTime } from "luxon";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      // Middleware should catch this first, just a safety check
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }
    const payload = await request.json();
    const uniqueAircraftTypes = new Set<string>();
    const logs: InsertFlightLog[] = payload.logs.flatMap((log: any) => {
      const dateTime = log[FlightColumnKey.DATE_TIME];
      const aircraftType = log[FlightColumnKey.AIRCRAFT_TYPE];
      if (!log || !dateTime || !aircraftType) {
        return null;
      }
      uniqueAircraftTypes.add(aircraftType);
      const { [FlightColumnKey.DATE_TIME]: _, ...rest } = log;
      return {
        userId: user.id,
        DATE_TIME: DateTime.fromISO(dateTime).toJSDate(),
        ...rest,
      };
    });

    const aircraftTypesToValidate = [...uniqueAircraftTypes];
    if (aircraftTypesToValidate.length > 100) {
      return Response.json(
        {
          success: false,
          error: "Invalid aircraft type column",
        },
        { status: 400 }
      );
    }
    const aircraftInfo = await getAircraftInfo(aircraftTypesToValidate, false, true);
    if (aircraftInfo.length !== aircraftTypesToValidate.length) {
      return Response.json(
        {
          success: false,
          error: "Not all aircraft types are valid",
          invalidAircraftTypes: aircraftTypesToValidate.filter(
            (type) => !aircraftInfo.some((info) => info.model === type)
          ),
        },
        { status: 400 }
      );
    }

    // Add generated columns based on the aircraft info
    const logsWithGeneratedColumns = addGeneratedColumns(logs, aircraftInfo);

    // Bulk insert the flight logs.
    await db.insert(flightLogs).values(logsWithGeneratedColumns);

    return Response.json({ success: true });
  } catch (error: any) {
    console.log(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};

const addGeneratedColumns = (logs: InsertFlightLog[], aircraftInfo: AircraftModelInfo[]): InsertFlightLog[] => {
  const aircraftInfoMap = new Map<string, AircraftModelInfo>();
  aircraftInfo.forEach((info) => {
    aircraftInfoMap.set(info.model, info);
    if (info.aliases) {
      info.aliases.forEach((alias) => {
        aircraftInfoMap.set(alias, info);
      });
    }
  });
  const calculateSingleEngineTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isSingleEngine = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isSingleEngine;
    return isSingleEngine ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateMultiEngineTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isMultiEngine = !aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isSingleEngine;
    return isMultiEngine ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateFixedWingTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isFixedWing = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isFixedWing;
    return isFixedWing ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateTurbineTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isTurbine = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isTurbine;
    return isTurbine ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateFixedWingMultiEngineTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isFixedWing = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isFixedWing;
    const isMultiEngine = !aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isSingleEngine;
    return isFixedWing && isMultiEngine ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateFixedWingTurbineTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isFixedWing = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isFixedWing;
    const isTurbine = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isTurbine;
    return isFixedWing && isTurbine ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateFixedWingPicTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isFixedWing = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isFixedWing;
    return isFixedWing ? log[FlightColumnKey.PIC] : 0;
  };
  const calculateFixedWingTurbinePicTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isFixedWing = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isFixedWing;
    const isTurbine = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isTurbine;
    return isFixedWing && isTurbine ? log[FlightColumnKey.PIC] : 0;
  };
  const calculateHelicopterTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isHelicopter = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isHelicopter;
    return isHelicopter ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const calculateMilitaryTime = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): number => {
    const isMilitary = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.isMilitary;
    return isMilitary ? log[FlightColumnKey.TOTAL_TIME] : 0;
  };
  const getAircraftType = (log: any, aircraftInfoMap: Map<string, AircraftModelInfo>): string => {
    const aircraftType = aircraftInfoMap.get(log[FlightColumnKey.AIRCRAFT_TYPE])?.model;
    return aircraftType ? aircraftType : log[FlightColumnKey.AIRCRAFT_TYPE];
  };

  // Add generated columns based on the aircraft info
  return logs.map((log: any) => {
    const { [FlightColumnKey.AIRCRAFT_TYPE]: _, ...logWithoutAircraftType } = log;
    const aircraftType = getAircraftType(log, aircraftInfoMap);
    return {
      ...logWithoutAircraftType,
      [FlightColumnKey.AIRCRAFT_TYPE]: aircraftType,
      [FlightColumnKey.SINGLE_ENGINE]: calculateSingleEngineTime(log, aircraftInfoMap),
      [FlightColumnKey.MULTI_ENGINE]: calculateMultiEngineTime(log, aircraftInfoMap),
      [FlightColumnKey.FIXED_WING]: calculateFixedWingTime(log, aircraftInfoMap),
      [FlightColumnKey.TURBINE]: calculateTurbineTime(log, aircraftInfoMap),
      [FlightColumnKey.FIXED_WING_MULTI_ENGINE]: calculateFixedWingMultiEngineTime(log, aircraftInfoMap),
      [FlightColumnKey.FIXED_WING_TURBINE]: calculateFixedWingTurbineTime(log, aircraftInfoMap),
      [FlightColumnKey.FIXED_WING_PIC]: calculateFixedWingPicTime(log, aircraftInfoMap),
      [FlightColumnKey.FIXED_WING_TURBINE_PIC]: calculateFixedWingTurbinePicTime(log, aircraftInfoMap),
      [FlightColumnKey.HELO]: calculateHelicopterTime(log, aircraftInfoMap),
      [FlightColumnKey.MILITARY]: calculateMilitaryTime(log, aircraftInfoMap),
    };
  });
};
