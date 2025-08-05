"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useGetFlightLogsQuery } from "@/state/api";
import { AllFlights } from "./AllFlights";
import AddDigitalFlights from "./AddDigitalFlights";
import AddManualFlights from "./AddManualFLightLogs";
import ScoreCard from "./ScoreCard";
import { saveFlightData } from "@/state/reducers/ScoreCardReducer";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activePage = useAppSelector((state) => state.scorecard.activePage); // Get active page from Redux

  // Fetch flight logs using the query hook
  const { data, isLoading, error } = useGetFlightLogsQuery();

  // Log the data when it changes
  useEffect(() => {
    if (isLoading) {
      console.log("Fetching flight logs...");
    } else if (error) {
      console.error("Error fetching flight logs:", error);
    } else if (data) {
      const { availableColumns, flights } = data;
      dispatch(saveFlightData({ flightData: flights, columnMappings: availableColumns }));
      console.log("Flight logs data:", data);
    }
  }, [data, isLoading, error]);

  // Function to render content based on activePage
  const renderPageContent = () => {
    switch (activePage) {
      case "allFlights":
        return <AllFlights isLoading={isLoading} isMilitary={undefined} />;
      case "military":
        return <AllFlights isLoading={isLoading} isMilitary={true} />;
      case "civilian":
        return <AllFlights isLoading={isLoading} isMilitary={false} />;
      case "addDigitalFlightLogs":
        return <AddDigitalFlights />;
      case "addManualFlightLogs":
        return <AddManualFlights />;
      case "scorecard":
        return <ScoreCard />;
      default:
        return <AddDigitalFlights />;
    }
  };

  return <div className="w-full h-full bg-white-50 p-10">{renderPageContent()}</div>;
}
