import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  ScoreCardPDFColorConfig,
  ScoreCardPDFDocument,
  ScorecardTemplateOptions,
  scorecardTemplates,
} from "./ScoreCard";
import { DateTime } from "luxon";
import { FlightAggregates, FlightAggregatesByAircraft } from "@/lib/interfaces/flightAggregates";
import { ColumnDef } from "@tanstack/react-table";

interface GenerateScorecardModalProps {
  isOpen: boolean;
  aggregates: FlightAggregates;
  aggregatesPerAircraft: FlightAggregatesByAircraft[];
  columns: ColumnDef<FlightAggregatesByAircraft>[];
  onClose: () => void;
  onConfirm: () => void;
}

const ReplaceAllModal: React.FC<GenerateScorecardModalProps> = ({
  isOpen,
  aggregates,
  aggregatesPerAircraft,
  columns,
  onClose,
  onConfirm,
}) => {
  const [fullNameInput, setFullNameInput] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [fromDateString, setFromDateString] = useState<string>(aggregates?.earliestFlightDate);
  const [toDateString, setToDateString] = useState<string>(aggregates?.latestFlightDate);
  const [airlineLogo, setAirlineLogo] = useState<boolean>(true);
  const [downloadTriggered, setDownloadTriggered] = useState<ScorecardTemplateOptions | null>(null);
  const [renderPdf, setRenderPdf] = useState<boolean>(true);
  const isValid = (fullName?.length && fromDateString?.length && toDateString?.length) || false;

  const templateButtons = useMemo(() => {
    return Object.keys(scorecardTemplates).map((value: string, index) => {
      const templateOption = value as ScorecardTemplateOptions;
      const colorConfig: ScoreCardPDFColorConfig = scorecardTemplates[templateOption];
      if (!isValid) {
        return (
          <div
            key={index}
            className="flex flex-col md:gap-7 p-2 gap-2 bg-white-100 border-orange-200 border md:px-10 md:py-5 shadow-md rounded-md md:mb-5"
          >
            <span className="text-center text-black font-bold md:text-xl">{templateOption}</span>
            <button
              type="button"
              disabled={true}
              className="min-w-32 text-white-100 flex gap-1 md:py-1 md:px-5 rounded-full justify-center bg-orange-300  text-white border border-orange-300 shadow text-sm font-semibold"
            >
              Generate
            </button>
          </div>
        );
      }

      return (
        <div
          key={index}
          className="flex flex-col md:gap-7 p-2 gap-2 bg-white-100 border-orange-200 border md:px-10 md:py-5 shadow-md rounded-md md:mb-5"
        >
          <span className="text-center text-black font-bold md:text-xl">{templateOption}</span>
          {downloadTriggered === templateOption && renderPdf ? (
            <PDFDownloadLink
              document={
                <ScoreCardPDFDocument
                  fullName={fullName}
                  fromDate={DateTime.fromISO(fromDateString)}
                  toDate={DateTime.fromISO(toDateString)}
                  colorConfig={colorConfig}
                  aggregates={aggregates}
                  aggregatesPerAircraft={aggregatesPerAircraft}
                  columns={columns}
                  airlineLogo={airlineLogo}
                />
              }
              fileName={`${fullName} ${templateOption} Scorecard.pdf`}
            >
              {({ loading, url }) => {
                if (!loading && url) {
                  // Create a temporary <a> element to trigger the download

                  return (
                    <button
                      type="button"
                      className="min-w-32 text-white-100 flex gap-1 md:py-1 md:px-5 rounded-full justify-center bg-orange-600  text-white border border-black shadow text-sm font-semibold"
                    >
                      Download
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    className="min-w-32 text-white-100 flex gap-1 md:py-1 md:px-5 rounded-full justify-center bg-orange-500  text-white border border-orange-600 shadow text-sm font-semibold"
                    disabled
                  >
                    Generating...
                  </button>
                );
              }}
            </PDFDownloadLink>
          ) : (
            <button
              type="button"
              className="min-w-32 text-white-100 flex gap-1 md:py-1 md:px-5 rounded-full justify-center bg-orange-500  text-white border border-orange-600 shadow text-sm font-semibold"
              onClick={() => {
                setDownloadTriggered(templateOption);
              }}
            >
              Generate
            </button>
          )}
        </div>
      );
    });
  }, [fullName, fromDateString, toDateString, isValid, airlineLogo, downloadTriggered, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white-100 p-10 md:max-w-[65rem]">
        <DialogTitle className="text-xl font-semibold text-left text-black">GENERATE YOUR SCORECARD</DialogTitle>
        <p className="text-black text-left text-lg mb-6 whitespace-pre-wrap">Please make a selection below</p>
        <div>
          <label htmlFor="fullName" className="block text-black text-sm font-medium mb-2">
            Name on scorecard
          </label>
          <input
            id="fullName"
            type="text"
            value={fullNameInput}
            onChange={(e) => setFullNameInput(e.target.value)}
            onBlur={() => setFullName(fullNameInput)}
            className="p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-black text-sm font-medium mb-2">Date Range</label>
          <div className="flex gap-4 mb-4">
            <input
              id="fromDate"
              type="date"
              value={fromDateString}
              onChange={(e) => setFromDateString(e.target.value)}
              className="flex space-between p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            />
            <input
              id="toDate"
              type="date"
              value={toDateString}
              onChange={(e) => setToDateString(e.target.value)}
              className="flex space-between p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <input
              id="airlineLogo"
              type="checkbox"
              checked={airlineLogo}
              onChange={(e) => {
                setRenderPdf(false);
                setDownloadTriggered(null);
                setAirlineLogo(e.target.checked);
                setTimeout(() => {
                  setRenderPdf(true);
                }, 1);
              }}
            />
            <label htmlFor="airlineLogo" className="text-black font-semibold">
              Include Airline Logo
            </label>
          </div>
        </div>
        <div className="flex justify-start gap-4 flex-wrap">{templateButtons}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceAllModal;
