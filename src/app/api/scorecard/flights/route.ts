import { NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/drizzle/db";
import { flightLogs } from "@/db/drizzle/schema/flightLogs";
import { getUser } from "@/lib/getUser";
import { flightColumnDefinitions, FlightColumnKey } from "@/lib/interfaces/flightColumnDefinition";
import { uuid } from "drizzle-orm/pg-core";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Get all flight logs for the user.
    const flights = await db
      .select()
      .from(flightLogs)
      .where(eq(flightLogs.userId, String(user.id)))
      .orderBy(desc(sql.identifier(FlightColumnKey.DATE_TIME)));

    return Response.json({
      success: true,
      flights, 
      availableColumns: flightColumnDefinitions,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const flightId = payload.flightId;
    const updatedFlight = payload.updatedFlight;

    if (!flightId || !updatedFlight) {
      return Response.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (updatedFlight.DATE_TIME) {
      updatedFlight.DATE_TIME = new Date(updatedFlight.DATE_TIME);
    }

    // Unset non-updatable fields
    updatedFlight.id = undefined;
    updatedFlight.userId = undefined;
    updatedFlight.createdAt = undefined;
    updatedFlight.updatedAt = undefined;

    // Update the flight log
    await db
      .update(flightLogs)
      .set(updatedFlight)
      .where(eq(flightLogs.id, flightId))
      .execute();

    return Response.json({ success: true });
  } catch (error: any) {
    console.log(error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const flightId = payload.flightId;

    if (!flightId) {
      return Response.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Delete the flight log
    await db
      .delete(flightLogs)
      .where(eq(flightLogs.id, flightId))
      .execute();

    return Response.json({ success: true });

  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}