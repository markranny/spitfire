import { flightColumnDefinitions } from "@/lib/interfaces/flightColumnDefinition";

export async function GET(request: Request) {
  return Response.json({
    success: true,
    availableColumns: flightColumnDefinitions,
  });
}
