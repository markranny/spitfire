"use client";

import React, { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Document, Page, StyleSheet, Text, View, Font, Image } from "@react-pdf/renderer";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetScorecardFlightAggregatesQuery } from "@/state/api";
import { FlightAggregates, FlightAggregatesByAircraft } from "@/lib/interfaces/flightAggregates";
import GenerateScorecardModal from "./GenerateScorecardModal";
import { Button } from "@/components/ui/button";
import { mockAggregates } from "./mock";

Font.register({ family: "Bebas Neue", src: "/fonts/BebasNeue-Regular.ttf" });

const formatCellValue = (value: any) => {
  if (typeof value === "number") {
    return value.toFixed(1);
  }
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return value;
};

export interface ScoreCardPDFColorConfig {
  backgroundColor: string;
  textColor: string;
  themeColor: string;
  secondaryColor?: string;
  tableBackgroundColor: string;
  totalsBackgroundColor?: string;
  totalsTextColor?: string;
  totalsBorderColor?: string;
  firstHeaderRowBackgroundColor?: string;
  firstHeaderRowTextColor?: string;
  secondHeaderRowBackgroundColor?: string;
  secondHeaderRowTextColor?: string;
  totalRowBackgroundColor?: string;
  totalRowTextColor?: string;
  firstColumnBackgroundColor?: string;
  firstColumnTextColor?: string;
  logoSrc?: string;
  logoHeight?: number;
  logoWidth?: number;
}

export enum ScorecardTemplateOptions {
  UNITED_AIRLINES = "United Airlines",
  DELTA_AIRLINES = "Delta",
  SOUTHWEST_AIRLINES = "Southwest",
  SPIRIT_AIRLINES = "Spirit Airlines",
  PSA = "PSA",
  PIEDMONT = "Piedmont",
  Envoy = "Envoy",
  OTHER = "Other",
}

export const scorecardTemplates: Record<ScorecardTemplateOptions, ScoreCardPDFColorConfig> = {
  [ScorecardTemplateOptions.UNITED_AIRLINES]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#005DAA",
    tableBackgroundColor: "#f0f0f0",
    firstHeaderRowBackgroundColor: "#005DAA",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#ffffff",
    secondHeaderRowTextColor: "#003DA5",
    totalRowBackgroundColor: "#A7A8AC",
    logoSrc: "/scorecard/logo/united.png",
    logoHeight: 40,
    logoWidth: 200,
  },
  [ScorecardTemplateOptions.DELTA_AIRLINES]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#003366",
    secondaryColor: "#C8102E",
    firstHeaderRowBackgroundColor: "#C8102E",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#003366",
    secondHeaderRowTextColor: "#ffffff",
    tableBackgroundColor: "#f0f0f0",
    logoSrc: "/scorecard/logo/delta.png",
    logoHeight: 22,
    logoWidth: 200,
  },
  [ScorecardTemplateOptions.SOUTHWEST_AIRLINES]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    totalsTextColor: "#ffffff",
    themeColor: "#FFB612",
    secondaryColor: "#304CB2",
    totalsBackgroundColor: "#304CB2",
    totalsBorderColor: "#304CB2",
    tableBackgroundColor: "#f0f0f0",
    firstHeaderRowBackgroundColor: "#FFB612",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#304CB2",
    secondHeaderRowTextColor: "#FFB612",
    logoSrc: "/scorecard/logo/southwest.png",
    logoHeight: 30,
    logoWidth: 180,
  },
  [ScorecardTemplateOptions.SPIRIT_AIRLINES]: {
    backgroundColor: "#FFD100",
    textColor: "#000000",
    themeColor: "#000000",
    totalsBackgroundColor: "#FFD100",
    tableBackgroundColor: "#FFD100",
    firstHeaderRowBackgroundColor: "#000000",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#FFD100",
    secondHeaderRowTextColor: "#000000",
    logoSrc: "/scorecard/logo/spirit.png",
    logoHeight: 60,
    logoWidth: 120,
  },
  [ScorecardTemplateOptions.PSA]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#005DAA",
    secondaryColor: "#E31837",
    firstHeaderRowBackgroundColor: "#005DAA",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#E31837",
    secondHeaderRowTextColor: "#ffffff",
    tableBackgroundColor: "#f0f0f0",
    logoSrc: "/scorecard/logo/psa.png",
    logoHeight: 30,
    logoWidth: 100,
  },
  [ScorecardTemplateOptions.PIEDMONT]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#045C9C",
    secondaryColor: "#C42324",
    firstHeaderRowBackgroundColor: "#045C9C",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#C42324",
    secondHeaderRowTextColor: "#ffffff",
    tableBackgroundColor: "#f0f0f0",
    logoSrc: "/scorecard/logo/piedmont.png",
    logoHeight: 50,
    logoWidth: 92,
  },
  [ScorecardTemplateOptions.Envoy]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#3F0077",
    secondaryColor: "#AF1E2D",
    firstHeaderRowBackgroundColor: "#3F0077",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowBackgroundColor: "#AF1E2D",
    secondHeaderRowTextColor: "#ffffff",
    tableBackgroundColor: "#f0f0f0",
    logoSrc: "/scorecard/logo/envoy.png",
    logoHeight: 22,
    logoWidth: 140,
  },
  [ScorecardTemplateOptions.OTHER]: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    themeColor: "#000000",
    tableBackgroundColor: "#f0f0f0",
    firstHeaderRowTextColor: "#ffffff",
    secondHeaderRowTextColor: "#ffffff",
  },
};

export interface ScoreCardPDFDocumentProps {
  fullName: string;
  fromDate: DateTime;
  toDate: DateTime;
  colorConfig: ScoreCardPDFColorConfig;
  aggregates: FlightAggregates;
  aggregatesPerAircraft: FlightAggregatesByAircraft[];
  columns: ColumnDef<FlightAggregatesByAircraft>[];
  airlineLogo: boolean;
}

export const ScoreCardPDFDocument = ({
  fullName,
  fromDate,
  toDate,
  colorConfig,
  aggregates,
  aggregatesPerAircraft,
  columns,
  airlineLogo,
}: ScoreCardPDFDocumentProps) => {
  const dateRange = `${fromDate.toFormat("MM/dd/yyyy")} - ${toDate.toFormat("MM/dd/yyyy")}`;
  const table = useReactTable<FlightAggregatesByAircraft>({
    data: aggregatesPerAircraft,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const color: ScoreCardPDFColorConfig = {
    backgroundColor: colorConfig.backgroundColor,
    textColor: colorConfig.textColor,
    themeColor: colorConfig.themeColor,
    secondaryColor: colorConfig.secondaryColor,
    tableBackgroundColor: colorConfig.tableBackgroundColor,
    totalsBackgroundColor: colorConfig.totalsBackgroundColor || "#f0f0f0",
    totalsTextColor: colorConfig.totalsTextColor || colorConfig.textColor,
    totalsBorderColor: colorConfig.totalsBorderColor || "#000000",
    firstHeaderRowBackgroundColor: colorConfig.firstHeaderRowBackgroundColor || colorConfig.themeColor,
    firstHeaderRowTextColor: colorConfig.firstHeaderRowTextColor || colorConfig.textColor,
    secondHeaderRowBackgroundColor: colorConfig.secondHeaderRowBackgroundColor || colorConfig.themeColor,
    secondHeaderRowTextColor: colorConfig.secondHeaderRowTextColor || colorConfig.textColor,
    totalRowBackgroundColor: colorConfig.totalRowBackgroundColor || colorConfig.tableBackgroundColor,
    totalRowTextColor: colorConfig.totalRowTextColor || colorConfig.textColor,
    firstColumnBackgroundColor: colorConfig.firstColumnBackgroundColor || colorConfig.tableBackgroundColor,
    firstColumnTextColor: colorConfig.firstColumnTextColor || colorConfig.textColor,
    logoSrc: colorConfig.logoSrc,
    logoHeight: colorConfig?.logoHeight || 50,
    logoWidth: colorConfig?.logoWidth || 200,
  };
  const styles = StyleSheet.create({
    text: {
      fontFamily: "Bebas Neue",
      fontSize: 12,
      color: color.textColor,
    },
  });
  return (
    <Document>
      <Page size={{ width: 1100, height: 850 }} style={{ padding: 20, backgroundColor: color.backgroundColor }}>
        {airlineLogo && color?.logoSrc && (
          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Image src={color.logoSrc} style={{ width: color.logoWidth, height: color.logoHeight, margin: 20 }} />
          </View>
        )}
        <Text
          style={{ ...styles.text, fontSize: 24, fontWeight: "bold", textAlign: "center", color: color.themeColor }}
        >
          {fullName.toUpperCase()}
        </Text>
        <Text
          style={{
            ...styles.text,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: color.secondaryColor || color.themeColor,
          }}
        >
          FLIGHT TIME SUMMARY
        </Text>
        <Text style={{ ...styles.text, fontSize: 20, fontWeight: "bold", textAlign: "center" }}>{dateRange}</Text>
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 24, paddingTop: 40, width: "100%" }}>
          <View
            style={{
              backgroundColor: color.totalsBackgroundColor,
              padding: 16,
              flex: 1,
              border: `1px solid ${color.totalsBorderColor}`,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>FW Mult-Eng</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalFixedWingMultiEngineHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>Military</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalMilitaryHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>FW PIC</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalFixedWingPilotInCommandHours.toFixed(1)}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: color.totalsBackgroundColor,
              padding: 16,
              flex: 1,
              border: `1px solid ${color.totalsBorderColor}`,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>Hrs PIC</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates?.totalPilotInCommandHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>FW Turbine</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalFixedWingTurbineHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>Total Time</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalHours.toFixed(1)}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: color.totalsBackgroundColor,
              padding: 16,
              flex: 1,
              border: `1px solid ${color.totalsBorderColor}`,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>1000 FW Turb PIC</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates?.totalFixedWingTurbinePilotInCommand1000Hours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>1500 Turbine</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalTurbine1500Hours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>1000 FW Turbine</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.totalFixedWingTurbine1000Hours.toFixed(1)}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: color.totalsBackgroundColor,
              padding: 16,
              flex: 1,
              border: `1px solid ${color.totalsBorderColor}`,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>1 Yr History</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates?.total12MonthHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>2 Yr History</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.total24MonthHours.toFixed(1)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>3 Yr History</Text>
              <Text style={{ ...styles.text, fontWeight: "bold", color: color.totalsTextColor }}>
                {aggregates.total36MonthHours.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 20, width: "100%" }}>
          <View style={{ flexDirection: "row", backgroundColor: color.firstHeaderRowBackgroundColor }}>
            {table.getHeaderGroups()[0].headers.map((header: any) => (
              <Text
                key={header.id}
                style={{
                  flex: header.subHeaders ? header.subHeaders.length : 1,
                  color: color.firstHeaderRowTextColor,
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: 10,
                  fontSize: 10,
                }}
              >
                {header.column.columnDef.header}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", backgroundColor: color.secondHeaderRowBackgroundColor }}>
            {table
              .getHeaderGroups()[0]
              .headers.flatMap((header) => (header.subHeaders ? header.subHeaders : header))
              .map((subHeader) => (
                <Text
                  key={subHeader.id}
                  style={{
                    flex: 1,
                    color: color.secondHeaderRowTextColor,
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: 4,
                    fontSize: 10,
                  }}
                >
                  {flexRender(subHeader.column.columnDef.header, subHeader.getContext())}
                </Text>
              ))}
          </View>
          {/* Render rows */}
          {table.getRowModel().rows.map((row, index) => (
            <View
              key={row.id}
              style={{
                flexDirection: "row",
                backgroundColor: index === 0 ? color.totalRowBackgroundColor : color.tableBackgroundColor,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <Text
                  key={cell.id}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: 4,
                    fontSize: 10,
                    color: index === 0 ? color.totalRowTextColor : color.textColor,
                  }}
                >
                  {formatCellValue(cell.getValue())}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

const ScoreCard = () => {
  const [generateScorecardModalOpen, setGenerateScorecardModalOpen] = useState(false);
  const { data, isLoading, error } = useGetScorecardFlightAggregatesQuery();
  const aggregates: FlightAggregates | null = data?.aggregates || null;
  const aggregatesPerAircraft: FlightAggregatesByAircraft[] = useMemo(() => {
    const aggs = aggregates?.flightAggregatesPerAircraft || [];
    if (aggs.length === 0) {
      return [];
    } else {
      // add a total row as the first row, which is a sum of all the other rows, but the 'aircraftModel' is ''
      const totalRow: FlightAggregatesByAircraft = {
        aircraftType: "",
        totalHours: 0,
        totalSingleEngineHours: 0,
        totalMultiEngineHours: 0,
        totalHelicopterHours: 0,
        totalDayLandings: 0,
        totalNightLandings: 0,
        totalNightHours: 0,
        totalInstrumentHours: 0,
        totalSimulatedInstrumentHours: 0,
        totalInstrumentApproaches: 0,
        totalCrossCountryHours: 0,
        totalSoloHours: 0,
        totalPilotInCommandHours: 0,
        totalSecondInCommandHours: 0,
        totalDualReceivedHours: 0,
        totalInstructorHours: 0,
        totalSorties: 0,
        totalSpecialFlightCrewHours: 0,
        totalNightVisionGoggleHours: 0,
      };
      aggs.forEach((agg) => {
        totalRow.totalHours += agg.totalHours;
        totalRow.totalSingleEngineHours += agg.totalSingleEngineHours;
        totalRow.totalMultiEngineHours += agg.totalMultiEngineHours;
        totalRow.totalHelicopterHours += agg.totalHelicopterHours;
        totalRow.totalDayLandings += agg.totalDayLandings;
        totalRow.totalNightLandings += agg.totalNightLandings;
        totalRow.totalNightHours += agg.totalNightHours;
        totalRow.totalInstrumentHours += agg.totalInstrumentHours;
        totalRow.totalSimulatedInstrumentHours += agg.totalSimulatedInstrumentHours;
        totalRow.totalInstrumentApproaches += agg.totalInstrumentApproaches;
        totalRow.totalCrossCountryHours += agg.totalCrossCountryHours;
        totalRow.totalSoloHours += agg.totalSoloHours;
        totalRow.totalPilotInCommandHours += agg.totalPilotInCommandHours;
        totalRow.totalSecondInCommandHours += agg.totalSecondInCommandHours;
        totalRow.totalDualReceivedHours += agg.totalDualReceivedHours;
        totalRow.totalInstructorHours += agg.totalInstructorHours;
        totalRow.totalSorties += agg.totalSorties;
        totalRow.totalSpecialFlightCrewHours += agg.totalSpecialFlightCrewHours;
        totalRow.totalNightVisionGoggleHours += agg.totalNightVisionGoggleHours;
      });
      return [totalRow, ...aggs];
    }
  }, [aggregates]);
  // Define columns with grouped headers
  const columns: ColumnDef<FlightAggregatesByAircraft>[] = [
    {
      header: "GENERAL INFO",
      columns: [
        { accessorKey: "aircraftType", header: "Type" },
        { accessorKey: "totalHours", header: "Total" },
      ],
    },
    {
      header: "CAT/CLASS",
      columns: [
        { accessorKey: "totalSingleEngineHours", header: "ASEL" },
        { accessorKey: "totalMultiEngineHours", header: "AMEL" },
        { accessorKey: "totalHelicopterHours", header: "HELO" },
      ],
    },
    {
      header: "LANDINGS",
      columns: [
        { accessorKey: "totalDayLandings", header: "DAY" },
        { accessorKey: "totalNightLandings", header: "NT" },
      ],
    },
    {
      header: "CONDITIONS OF FLIGHT",
      columns: [
        { accessorKey: "totalNightHours", header: "NT" },
        { accessorKey: "totalInstrumentHours", header: "ACT IN" },
        { accessorKey: "totalSimulatedInstrumentHours", header: "SIM IN" },
        { accessorKey: "totalInstrumentApproaches", header: "APP" },
      ],
    },
    {
      header: "TYPE OF PILOTING TIME",
      columns: [
        { accessorKey: "totalCrossCountryHours", header: "XC" },
        { accessorKey: "totalSoloHours", header: "SOLO" },
        { accessorKey: "totalPilotInCommandHours", header: "PIC" },
        { accessorKey: "totalSecondInCommandHours", header: "SIC" },
        { accessorKey: "totalDualReceivedHours", header: "DUAL" },
        { accessorKey: "totalInstructorHours", header: "INSTRUCTOR" },
      ],
    },
    {
      header: "MILITARY",
      columns: [
        { accessorKey: "totalSorties", header: "SORTIES" },
        { accessorKey: "totalSpecialFlightCrewHours", header: "SFC" },
        { accessorKey: "totalNightVisionGoggleHours", header: "NVG" },
      ],
    },
  ];

  // Initialize table
  const table = useReactTable<FlightAggregatesByAircraft>({
    data: aggregatesPerAircraft,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const LoadingState = () => (
    <div className="py-8 w-full h-full bg-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-black">Loading flight data...</p>
      </div>
    </div>
  );

  const NoDataState = () => (
    <div className="py-8 w-full h-full bg-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
      <p className="text-black">No flight data available. Please upload and save data first.</p>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isLoading && aggregatesPerAircraft.length === 0) {
    return <NoDataState />;
  }

  if (error || aggregates === null) {
    return (
      <div className="py-8 w-full h-full bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
        <p className="text-black">Error loading flight data. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <GenerateScorecardModal
        isOpen={!!generateScorecardModalOpen}
        onClose={() => {
          setGenerateScorecardModalOpen(false);
        }}
        onConfirm={() => {
          setGenerateScorecardModalOpen(false);
        }}
        aggregates={aggregates}
        aggregatesPerAircraft={aggregatesPerAircraft}
        columns={columns}
      />
      <div className="px-8 py-8 w-full h-full bg-white">
        <h1 className="text-3xl font-bold mb-4 text-black">LOGBOOK</h1>
        <div className="flex flex-row gap-4 mb-6 pt-10 w-full">
          <div className="bg-gray-200 p-4 flex-1 border border-black">
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">FW Mult-Eng</span>
              <span className="text-orange-600 font-bold">{aggregates.totalFixedWingMultiEngineHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">Military</span>
              <span className="text-orange-600 font-bold">{aggregates.totalMilitaryHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-semibold">FW PIC</span>
              <span className="text-orange-600 font-bold">
                {aggregates.totalFixedWingPilotInCommandHours.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="bg-gray-200 p-4 flex-1 border border-black">
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">Hrs PIC</span>
              <span className="text-orange-600 font-bold">{aggregates?.totalPilotInCommandHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">FW Turbine</span>
              <span className="text-orange-600 font-bold">{aggregates.totalFixedWingTurbineHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-semibold">Total Time</span>
              <span className="text-orange-600 font-bold">{aggregates.totalHours.toFixed(1)}</span>
            </div>
          </div>
          <div className="bg-gray-200 p-4 flex-1 border border-black">
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">1000 FW Turb PIC</span>
              <span className="text-orange-600 font-bold">
                {aggregates?.totalFixedWingTurbinePilotInCommand1000Hours.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">1500 Turbine</span>
              <span className="text-orange-600 font-bold">{aggregates.totalTurbine1500Hours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-semibold">1000 FW Turbine</span>
              <span className="text-orange-600 font-bold">{aggregates.totalFixedWingTurbine1000Hours.toFixed(1)}</span>
            </div>
          </div>
          <div className="bg-gray-200 p-4 flex-1 border border-black">
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">1 Yr History</span>
              <span className="text-orange-600 font-bold">{aggregates?.total12MonthHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-black font-semibold">2 Yr History</span>
              <span className="text-orange-600 font-bold">{aggregates.total24MonthHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-semibold">3 Yr History</span>
              <span className="text-orange-600 font-bold">{aggregates.total36MonthHours.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full pt-10" style={{ marginLeft: "-2px" }}>
          <Table className="w-full border-separate">
            <TableHeader>
              {/* Render category headers (parent headers) */}
              <TableRow className="bg-black rounded-md w-full text-xs">
                {table.getHeaderGroups()[0].headers.map((header: any) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.subHeaders ? header.subHeaders.length : 1}
                    className="h-12 align-middle text-white font-bold text-center py-2"
                  >
                    {header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
              {/* Render subheaders */}
              <TableRow className="bg-black rounded-md text-xs">
                {table
                  .getHeaderGroups()[0]
                  .headers.flatMap((header) => (header.subHeaders ? header.subHeaders : header))
                  .map((subHeader) => (
                    <TableHead key={subHeader.id} className="h-12 align-middle text-white font-bold text-center">
                      {flexRender(subHeader.column.columnDef.header, subHeader.getContext())}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow key={row.id} className={index === 0 ? "bg-yellow-200" : "bg-gray-200"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`text-xs p-2 h-12 align-middle text-center ${
                        index === 0 ? "text-black" : "text-gray-600"
                      }`}
                    >
                      {formatCellValue(cell.getValue())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex w-full pt-20 justify-center">
          <button
            type="button"
            disabled={generateScorecardModalOpen}
            className="w-fit text-white-100 flex gap-2 min-w-32 px-14 my-6 py-3 hover:bg-orange-600 rounded-full justify-center bg-orange-500  text-white border border-orange-600 shadow text-xl font-semibold"
            onClick={() => {
              setGenerateScorecardModalOpen(true);
            }}
          >
            Generate Scorecard
          </button>
        </div>
      </div>
    </>
  );
};

export default ScoreCard;
