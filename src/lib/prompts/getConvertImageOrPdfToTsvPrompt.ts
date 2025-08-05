import { FlightColumnKey } from "../interfaces/flightColumnDefinition";

export const getConvertImageOrPdfToTsvPrompt = (isPdf: boolean) => {
  return `
# Task Description

Convert a ${isPdf ? 'PDF' : 'image'} of a pilot's logbook into a TSV string.

## Requirements

- **Output Format:**
  - The result must be a tab-separated values (TSV) string.
  - Only the TSV string should be returned, without any additional explanation or text.

- **TSV Content:**
  - Include all header rows in the TSV string.
  - Discard any pilot flight records that do not appear to be valid entries.

- **Additional Columns:**
  1. **${FlightColumnKey.DATE_TIME}:**
     - Generate a new column named \`${FlightColumnKey.DATE_TIME}\` based on the TSV read from the image.
     - This column must be the **first** column.
     - The date and time values should be in ISO 8601 format and always in UTC.
  2. **${FlightColumnKey.AIRCRAFT_TYPE}:**
     - Generate a new column named \`${FlightColumnKey.AIRCRAFT_TYPE}\` that includes the model number/name of the aircraft.
     - This should represent the model and manufacturer of the aircraft flown.
     - This is not to be confused with the aircraft's registration number or tail number.
     - This column must be the **second** column.
`;
};