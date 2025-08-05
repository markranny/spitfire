import { read, utils } from "xlsx";
import { GenerateContentRequest, Part, VertexAI } from "@google-cloud/vertexai";
import { DateTime } from "luxon";
import { getColumnMappingSuggestionsPrompt } from "@/lib/prompts/getColumnMappingSuggestionsPrompt";
import { getAircraftInfoPrompt } from "@/lib/prompts/getAircraftInfoPrompt";
import { getDateTimeAndAircraftPrompt } from "@/lib/prompts/getDateTimeAndAircraftPrompt";
import { flightColumnDefinitions, FlightColumnKey } from "@/lib/interfaces/flightColumnDefinition";
import { getConvertImageOrPdfToTsvPrompt } from "@/lib/prompts/getConvertImageOrPdfToTsvPrompt";
import { db } from "@/db/drizzle/db";
import { aircraftModels } from "@/db/drizzle/schema/aircraftModels";

const targetDateTimeColumnName: string = FlightColumnKey.DATE_TIME;
const targetAircraftColumnName: string = FlightColumnKey.AIRCRAFT_TYPE;

const imageFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
];

const csvFileTypes = [
  "text/csv",
  "application/csv",
  "text/plain",
];

const pdfFileTypes = [
  "application/pdf",
];

const excelFileTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const allowedFileTypes = [
  imageFileTypes,
  csvFileTypes,
  pdfFileTypes,
  excelFileTypes,
].flat();

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface AircraftModelInfo {
  inputModelName?: string;
  aliases?: string[];
  model: string;
  isSingleEngine: boolean;
  isFixedWing: boolean;
  isTurbine: boolean;
  isHelicopter: boolean;
  isMilitary: boolean;
}

interface ColumnRenameSuggestion {
  original: string;
  rename: string;
}

interface ColumnMappingSuggestions {
  removalSuggestions: string[];
  renameSuggestions: ColumnRenameSuggestion[];
}

export const normalizeModelName = (model: string) => {
  return model
    .trim() // Remove leading and trailing whitespace
    .toUpperCase() // Convert to uppercase
    .replaceAll(/[^A-Z0-9\s]/g, '') // Remove special characters
    .replaceAll(' ', ''); // Remove spaces
};

const addDateTimeAndAircraftColumns = async (tsvString: string): Promise<string> => {
  const capitalizedTsvString = tsvString.toUpperCase();
  const rows = capitalizedTsvString.split("\n");
  const { headers, headerIndex } = guessHeaderColumns([capitalizedTsvString]);
  const dateTimeIndex = headers.indexOf(targetDateTimeColumnName);
  const aircraftIndex = headers.indexOf(targetAircraftColumnName);
  if (dateTimeIndex >= 0 && aircraftIndex >= 0) {
    return capitalizedTsvString;
  }
  const base64EncodedTsvString = Buffer.from(capitalizedTsvString).toString("base64");
  const prompt = getDateTimeAndAircraftPrompt();
  const response = await generateGeminiResponse([
    {
      inlineData: {
        mimeType: 'text/tsv',
        data: base64EncodedTsvString,
      },
    },
    {
      text: prompt,
    },
    {
      functionResponse: {
        name: "response.json",
        response: {
          "type": "object",
          "properties": {
            "zero_based_date_time_column_index": {
              "type": "number"
            },
            "zero_based_aircraft_identifier_column_index": {
              "type": "number"
            },
            "luxon_date_time_format": {
              "type": "string"
            },
            "luxon_date_time_format_explanation": {
              "type": "string"
            }
          },
          "required": [
            "zero_based_date_time_column_index",
            "zero_based_aircraft_identifier_column_index",
            "luxon_date_time_format",
            "luxon_date_time_format_explanation"
          ]
        },
      },
    }
  ]);
  const {
    zero_based_date_time_column_index,
    zero_based_aircraft_identifier_column_index,
    luxon_date_time_format,
    luxon_date_time_format_explanation,
  } = JSON.parse(response);
  if (typeof zero_based_date_time_column_index !== "number" || typeof zero_based_aircraft_identifier_column_index !== "number" || typeof luxon_date_time_format !== "string") {
    throw new Error("Invalid response from Gemini");
  }
  let newHeaders = [
    targetDateTimeColumnName,
    targetAircraftColumnName,
    ...headers.filter((_, index) =>
      index !== zero_based_aircraft_identifier_column_index && index !== zero_based_date_time_column_index
    )
  ];
  let newRows: string[][] = rows.slice(headerIndex + 1).map((row) => row.split("\t"));
  newRows = newRows.map((cells) => {
    const rawDateTime = cells[zero_based_date_time_column_index];
    const aircraftType = cells[zero_based_aircraft_identifier_column_index];
    if (rawDateTime && aircraftType) {
      const dateTime = DateTime.fromFormat(rawDateTime, luxon_date_time_format);
      if (dateTime.isValid) {
        return [
          dateTime.toISO(),
          aircraftType,
          ...cells.filter((_, index) =>
            index !== zero_based_aircraft_identifier_column_index && index !== zero_based_date_time_column_index
          )
        ];
      } else {
        console.log("Invalid date time", dateTime, luxon_date_time_format, dateTime.invalidExplanation, luxon_date_time_format_explanation);
      }
    }
    return [];
  }).filter((row) => row.length > 0);
  return newHeaders.join("\t") + "\n" + newRows.map((row) => row.join("\t")).join("\n");
};

const convertExcelToTsv = async (file: File): Promise<string> => {
  const fileType = file?.type;
  if (!file || !fileType || !excelFileTypes.includes(fileType)) {
    throw new Error("Invalid file type");
  }
  const blob = await file.arrayBuffer();
  const workbook = read(blob, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const unprocessedTsvString = utils.sheet_to_csv(sheet, { FS: "\t" });
  return addDateTimeAndAircraftColumns(unprocessedTsvString);
};

const convertImageToTsv = async (file: File): Promise<string> => {
  const fileType = file?.type;
  const isPdf = pdfFileTypes.includes(fileType);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString("base64");
  const prompt = getConvertImageOrPdfToTsvPrompt(isPdf);
  return generateGeminiResponse([
    {
      inlineData: {
        mimeType: fileType,
        data: base64String,
      },
    },
    {
      text: prompt,
    },
  ]);
}

const convertCsvToTsv = async (file: File): Promise<string> => {
  const unprocessedCsvString = await file.text();
  const unprocessedTsvString = unprocessedCsvString.replaceAll(",", "\t");
  return addDateTimeAndAircraftColumns(unprocessedTsvString);
};

const convertFilesToTsv = async (files: File[]): Promise<{ tsvStrings: string[], fromOcr: boolean }> => {
  const tsvStrings: string[] = [];
  let fromOcr = false;
  for (const file of files) {
    const fileType = file?.type;
    if (csvFileTypes.includes(fileType)) {
      // Handle CSV files by just getting the raw text
      const tsvString = await convertCsvToTsv(file);
      tsvStrings.push(tsvString);
    } else if (excelFileTypes.includes(fileType)) {
      // Handle Excel files using the xlsx library
      const tsvString = await convertExcelToTsv(file);
      tsvStrings.push(tsvString);
    } else if (imageFileTypes.includes(fileType) || pdfFileTypes.includes(fileType)) {
      // Handle PDF and Image files by using Gemini to convert the images
      const tsvString = await convertImageToTsv(file);
      tsvStrings.push(tsvString);
      fromOcr = true;
    } else {
      throw new Error("Invalid file type");
    }
  }
  return {
    tsvStrings,
    fromOcr,
  };
};

export const generateGeminiResponse = async (parts: Part[], temperature?: number): Promise<string> => {
  if (!process.env.GCP_PROJECT_ID) {
    throw new Error("GCP_PROJECT_ID not set");
  }
  if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
    throw new Error("GCP_SERVICE_ACCOUNT_KEY not set");
  }
  const serviceAccountKey = JSON.parse(Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY!, "base64").toString("utf-8"));
  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: "us-central1",
    googleAuthOptions: {
      credentials: serviceAccountKey,
    },
  });
  const generativeModel = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: temperature ?? 0.2,
    }
  });
  const request: GenerateContentRequest = {
    contents: [
      {
        role: "user",
        parts: parts,
      },
    ],
  };
  const response = await generativeModel.generateContent(request);
  const contentResponse = response?.response;
  if (!contentResponse?.candidates || contentResponse?.candidates.length === 0) {
    throw new Error("Invalid response from Gemini");
  }
  const content = contentResponse?.candidates[0]?.content?.parts[0]?.text;
  if (!content || typeof content !== "string") {
    throw new Error("Invalid response from Gemini");
  }
  const isJsonExpected = parts.some((part) => part.functionResponse);
  if (isJsonExpected) {
    const jsonStartIndex = content.indexOf("{");
    const jsonEndIndex = content.lastIndexOf("}");
    if (jsonStartIndex >= 0 && jsonEndIndex >= 0) {
      const jsonString = content.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        return JSON.stringify(JSON.parse(jsonString));
      } catch (error) {
        console.log(jsonString);
        throw new Error("Invalid response from Gemini");
      }
    } else {
      console.log(content);
      throw new Error("Invalid response from Gemini");
    }
  }
  return content;
}

const guessHeaderColumns = (tsvStrings: string[]): { headers: string[], headerIndex: number } => {
  let possibleHeaderIndicies: number[] = [];
  let likelyHeaderRow: string | null = null;
  let likelyHeaderIndex: number | null = null;
  if (tsvStrings.length === 0) {
    throw new Error("No CSV strings found");
  }
  const tsvString = tsvStrings[0];
  const rows = tsvString.split("\n");
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i].toUpperCase();
    if (row.includes("DATE") || row.includes("TIME") || row.includes("AIR")) {
      possibleHeaderIndicies.push(i);
    }
  }
  let largestHeaderRow = 0;
  for (const possibleHeaderIndex of possibleHeaderIndicies) {
    let row = rows[possibleHeaderIndex];
    let rowLength = row.split("\t").filter((cell) => cell.trim().length > 0).length;
    if (rowLength > largestHeaderRow) {
      largestHeaderRow = rowLength;
      likelyHeaderRow = row;
      likelyHeaderIndex = possibleHeaderIndex;
    }
  }
  if (likelyHeaderRow !== null && likelyHeaderIndex !== null) {
    const headers = likelyHeaderRow.split("\t");
    return { headers, headerIndex: likelyHeaderIndex };
  } else {
    throw new Error("No header row found");
  }
}

const removeHeaderRows = (tsvStrings: string[], headerIndex: number): string[] => {
  return tsvStrings.map((tsvString) => {
    const rows = tsvString.split("\n");
    return rows.slice(headerIndex + 1).join("\n");
  });
}

const combineTsvStrings = (tsvStrings: string[]): { headers: string[], rows: string[][] } => {
  const capitalizedTsvStrings = tsvStrings.map((tsvString) => tsvString.toUpperCase());
  const { headers, headerIndex } = guessHeaderColumns(capitalizedTsvStrings);
  const trimmedTsvStrings = removeHeaderRows(capitalizedTsvStrings, headerIndex);
  const rows: string[][] = [];
  for (const tsvString of trimmedTsvStrings) {
    const tsvRows = tsvString.split("\n");
    for (const tsvRow of tsvRows) {
      rows.push(tsvRow.split("\t"));
    }
  }
  return {
    headers,
    rows,
  }
};

const getAircraftInfoFromDatabase = async (inputAircraftModels: string[]): Promise<{ matchedAircraftModels: AircraftModelInfo[], unmatchedAircraftModels: string[] }> => {
  const storedAircraftModels: any[] = await db.select().from(aircraftModels);
  const storedAircraftModelsMap = new Map<string, AircraftModelInfo>();
  for (const storedAircraftModel of storedAircraftModels) {
    const model = storedAircraftModel.model;
    const aliases = storedAircraftModel.aliases ? storedAircraftModel.aliases.split(",") : [];
    const isSingleEngine = storedAircraftModel.isSingleEngine;
    const isFixedWing = storedAircraftModel.isFixedWing;
    const isTurbine = storedAircraftModel.isTurbine;
    const isHelicopter = storedAircraftModel.isHelicopter;
    const isMilitary = storedAircraftModel.isMilitary;
    const possibleIdentifiers = [model, ...aliases];
    for (const possibleIdentifier of possibleIdentifiers) {
      storedAircraftModelsMap.set(possibleIdentifier, {
        model,
        aliases,
        isSingleEngine,
        isFixedWing,
        isTurbine,
        isHelicopter,
        isMilitary,
      });
    }
  }
  const matchedAircraftModels: AircraftModelInfo[] = [];
  const unmatchedAircraftModels: string[] = [];
  for (const inputAircraftModel of inputAircraftModels) {
    const normalizedAircraftModel = normalizeModelName(inputAircraftModel);
    const matchedAircraftModel = storedAircraftModelsMap.get(normalizedAircraftModel);
    if (matchedAircraftModel) {
      matchedAircraftModels.push({
        inputModelName: inputAircraftModel,
        ...matchedAircraftModel
      });
    } else {
      unmatchedAircraftModels.push(inputAircraftModel);
    }
  }
  return {
    matchedAircraftModels,
    unmatchedAircraftModels,
  };
}

const getAircraftInfoFromLLM = async (inputAircraftModels: string[], fromOcr: boolean, validate: boolean): Promise<AircraftModelInfo[]> => {
  const prompt = getAircraftInfoPrompt(inputAircraftModels, fromOcr);
  const response = await generateGeminiResponse([
    {
      text: prompt,
    },
    {
      functionResponse: {
        name: "response.json",
        response: {
          "type": "object",
          "properties": {
            "aircrafts": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "model": {
                    "type": "string"
                  },
                  "isSingleEngine": {
                    "type": "boolean"
                  },
                  "isFixedWing": {
                    "type": "boolean"
                  },
                  "isTurbine": {
                    "type": "boolean"
                  },
                  "isHelicopter": {
                    "type": "boolean"
                  },
                  "isMilitary": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "model",
                  "isSingleEngine",
                  "isFixedWing",
                  "isTurbine",
                  "isHelicopter",
                  "isMilitary"
                ]
              }
            }
          },
          "required": [
            "aircrafts"
          ]
        },
      },
    }
  ]);
  const { aircrafts } = JSON.parse(response);
  if (!aircrafts || !Array.isArray(aircrafts)) {
    throw new Error(`Invalid response from Gemini: ${response}`);
  }
  let aircraftInfo: AircraftModelInfo[] = [];
  for (let i = 0; i < aircrafts.length; i++) {
    const aircraft = aircrafts[i];
    if (typeof aircraft.model !== "string") {
      continue;
    }
    if (validate && (typeof aircraft.isSingleEngine !== "boolean" || typeof aircraft.isFixedWing !== "boolean" || typeof aircraft.isTurbine !== "boolean")) {
      continue;
    }
    aircraftInfo.push({
      inputModelName: inputAircraftModels[i] ?? null,
      ...aircraft
    });
  }
  return aircraftInfo;
};

export const getAircraftInfo = async (inputAircraftModels: string[], fromOcr: boolean, validate?: boolean): Promise<AircraftModelInfo[]> => {
  let aircraftInfo: AircraftModelInfo[] = [];
  const { matchedAircraftModels, unmatchedAircraftModels } = await getAircraftInfoFromDatabase(inputAircraftModels);
  if (unmatchedAircraftModels.length === 0) {
    return matchedAircraftModels;
  } else {
    aircraftInfo = matchedAircraftModels;
    const aircraftInfoFromLLM = await getAircraftInfoFromLLM(unmatchedAircraftModels, fromOcr, validate ?? false);
    const models = aircraftInfo.concat(aircraftInfoFromLLM);
    return models;
  }
};

const normalizeData = async (headers: string[], rows: string[][], fromOcr: boolean): Promise<{ headers: string[], rows: string[][] }> => {
  let normalizedHeaders = headers.map((header) => header.replaceAll(" ", "_").toUpperCase().trim());
  if (!normalizedHeaders.includes(targetDateTimeColumnName) || !normalizedHeaders.includes(targetAircraftColumnName)) {
    console.log(normalizedHeaders);
    throw new Error("Invalid headers");
  };
  // Remove duplicate columns
  const seenColumns = new Set<string>();
  const duplicateColumnIndicies: number[] = [];
  const invalidColumnIndicies: number[] = [];
  normalizedHeaders.forEach((header, index) => {
    if (header.trim().length === 0) {
      invalidColumnIndicies.push(index);
    } else if (seenColumns.has(header)) {
      duplicateColumnIndicies.push(index);
    }
    seenColumns.add(header);
  });
  normalizedHeaders = normalizedHeaders.filter((header, index) => !duplicateColumnIndicies.includes(index) && !invalidColumnIndicies.includes(index));
  let normalizedRows = rows.map((row) => row.filter((cell, index) => !duplicateColumnIndicies.includes(index) && !invalidColumnIndicies.includes(index)));

  // Trim the number of columns of all the rows to match the number of headers
  normalizedRows = normalizedRows.map((row) => row.slice(0, normalizedHeaders.length));

  const aircraftTypes = new Set<string>();
  normalizedRows = rows.map((row) => {
    const normalizedRow = row.map((cell) => cell.trim());
    let normalizedDateTime = DateTime.fromISO(normalizedRow[0], { zone: 'UTC' })?.startOf('day')?.toISO() ?? null;
    if (!normalizedDateTime) {
      return null;
    }
    normalizedRow[0] = normalizedDateTime;
    aircraftTypes.add(normalizedRow[1]);
    return normalizedRow;
  }).filter((row) => row !== null);
  const aircraftTypesArray = Array.from(aircraftTypes);
  const aircraftInfo = await getAircraftInfo(aircraftTypesArray, fromOcr);
  const aircraftInfoMap = new Map<string, AircraftModelInfo>();
  for (let i = 0; i < aircraftInfo.length; i++) {
    const aircraft = aircraftInfo[i];
    const originalModelName = aircraft.inputModelName ?? aircraftTypesArray[i] ?? null;
    if (!originalModelName) {
      continue;
    }
    aircraftInfoMap.set(originalModelName, aircraft);
  }
  for (const row of normalizedRows) {
    const aircraftModel = row[1];
    const aircraftInfo = aircraftInfoMap.get(aircraftModel);
    if (aircraftInfo) {
      row[1] = aircraftInfo.model;
    }
  }
  return {
    headers: normalizedHeaders,
    rows: normalizedRows,
  };
};

const getColumnMappingSuggestions = async (headers: string[], rows: string[][]): Promise<ColumnMappingSuggestions> => {
  const prompt = getColumnMappingSuggestionsPrompt();
  const sampleCsvString = [headers.join("\t"), ...rows.slice(0, 5).map((row) => row.join("\t"))].join("\n");
  const base64EncodedCsvString = Buffer.from(sampleCsvString).toString("base64");
  const response = await generateGeminiResponse([
    {
      inlineData: {
        mimeType: 'text/csv',
        data: base64EncodedCsvString,
      },
    },
    {
      text: prompt,
    },
    {
      functionResponse: {
        name: "response.json",
        response: {
          "type": "object",
          "properties": {
            "rename_suggestions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "original_column_name": {
                    "type": "string"
                  },
                  "new_column_name_based_on_definition": {
                    "type": "string"
                  }
                },
                "required": [
                  "original_column_name",
                  "new_column_name_based_on_definition"
                ]
              }
            },
            "remove_suggestions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "rename_suggestions",
            "remove_suggestions"
          ]
        },
      },
    }
  ]);
  const { rename_suggestions, remove_suggestions } = JSON.parse(response);
  if (!rename_suggestions || !Array.isArray(rename_suggestions) || !remove_suggestions || !Array.isArray(remove_suggestions)) {
    throw new Error("Invalid response from Gemini");
  }
  let alreadySuggestedOldColumns = new Set<string>();
  let alreadySuggestedNewColumns = new Set<string>();
  let renameSuggestions = rename_suggestions.flatMap((suggestion: any) => {
    if (
      alreadySuggestedNewColumns.has(suggestion.new_column_name_based_on_definition)
      || alreadySuggestedOldColumns.has(suggestion.original_column_name)
    ) {
      return [];
    }
    alreadySuggestedNewColumns.add(suggestion.new_column_name_based_on_definition);
    alreadySuggestedOldColumns.add(suggestion.original_column_name);
    return {
      original: suggestion.original_column_name,
      rename: suggestion.new_column_name_based_on_definition,
    }
  }).filter(
    (suggestion: ColumnRenameSuggestion) => ![targetDateTimeColumnName, targetAircraftColumnName].includes(suggestion.original) && ![targetDateTimeColumnName, targetAircraftColumnName].includes(suggestion.rename)
  );

  let removalSuggestions = remove_suggestions.filter(
    (suggestion: string) =>
      ![targetDateTimeColumnName, targetAircraftColumnName].includes(suggestion)
      && !alreadySuggestedOldColumns.has(suggestion)
      && !FlightColumnKey[suggestion as keyof typeof FlightColumnKey]
  );

  return {
    removalSuggestions: removalSuggestions,
    renameSuggestions: renameSuggestions,
  };
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  if (!files || files.length === 0) {
    return Response.json({
      success: false,
      message: "No files found",
    });
  }
  if (files.length > 10) {
    return Response.json({
      success: false,
      message: "Too many files",
    });
  }
  const validFiles: File[] = [];
  for (const fileObj of files) {
    if (!fileObj || typeof fileObj === "string" || !fileObj?.arrayBuffer) {
      return Response.json({
        success: false,
        message: "Invalid file",
      });
    }
    const file = fileObj as File;
    const fileType = file?.type;
    if (!file || !fileType || !allowedFileTypes.includes(fileType)) {
      return Response.json({
        success: false,
        message: "Invalid file",
      });
    }
    validFiles.push(file);
  }
  try {
    const { tsvStrings, fromOcr } = await convertFilesToTsv(validFiles);
    const { rows, headers } = combineTsvStrings(tsvStrings);
    const { rows: normalizedRows, headers: normalizedHeaders } = await normalizeData(headers, rows, fromOcr);
    const columnMappingSuggestions = await getColumnMappingSuggestions(normalizedHeaders, normalizedRows);
    return Response.json({
      success: true,
      headers: normalizedHeaders,
      columnMappingSuggestions,
      availableColumns: flightColumnDefinitions,
      rows: normalizedRows,
    });
  } catch (error) {
    console.error("Error processing files", error);
    return Response.json({
      success: false,
      message: "Error processing files",
    });
  }
};
