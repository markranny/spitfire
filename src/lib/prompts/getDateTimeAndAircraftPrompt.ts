export const getDateTimeAndAircraftPrompt = () => {
  return `
## Task Overview

You are provided with tab-separated values (TSV) containing a pilot's logbook. Your goal is to extract the following information from the TSV file:

1. **Date/Time Column**: Identify the column that best represents the date and time of each flight record.
2. **Aircraft Identifier Column**: Identify the column that best represents the identifier for the aircraft model used in each record. This is typically in the form of a model number/name and should represent the model and manufacturer of the aircraft flown. This is not to be confused with the aircraft's registration number or tail number.
3. **Luxon Date/Time Format**: Provide the Luxon datetime format string suitable for processing the date/time values found in the TSV.

## Output Requirements

- **Format**: The response must be in **JSON** format.
- **Content**: Include the following keys:
  - \`"zero_based_date_time_column_index"\`: An integer representing the zero-based index of the date/time column.
  - \`"zero_based_aircraft_identifier_column_index"\`: An integer representing the zero-based index of the aircraft identifier column.
  - \`"luxon_date_time_format_explanation"\`: An explanation of the Luxon date/time format string used. This is mostly for debugging purposes and can be omitted in the final response.
  - \`"luxon_date_time_format"\`: A string representing the Luxon date/time format.

## Example Response

\`\`\`json
{
  "zero_based_date_time_column_index": 0,
  "zero_based_aircraft_identifier_column_index": 1,
  "luxon_date_time_format": "yyyy-MM-dd",
  "luxon_date_time_format_explanation": "Explanation of the Luxon date/time format string."
}`;
};