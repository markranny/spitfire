import { db } from "@/db/drizzle/db";
import { flightLogs } from "@/db/drizzle/schema/flightLogs";
import { getUser } from "@/lib/getUser";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Delete all flight logs
    await db
      .delete(flightLogs)
      .where(eq(flightLogs.userId, user.id))
      .execute();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
