export const getAircraftInfoPrompt = (aircraftModelNames: string[], fromOcr: boolean) => {
  const formattedAircraftModelNames = aircraftModelNames.map((model) => `- \`${model}\``).join('\n');
  return `
# Aircraft Information Extraction Prompt

**Objective:**  
Determine the following details for the provided aircraft models:

${formattedAircraftModelNames}

**Instructions:**

${!fromOcr ? "" : "- **Model Correction:**\nAircraft model names may be misspelled due to OCR errors. Correct the model names accordingly. Typically the number of characters is correct, but the letters may be incorrect."}  

- **Extract Information:**  
  For each aircraft, determine and include the following properties:
  - \`model\`: The corrected aircraft model name.
  - \`isSingleEngine\`: A boolean value indicating if the aircraft has a single engine.
  - \`isFixedWing\`: A boolean value indicating if the aircraft is a fixed-wing aircraft.
  - \`isTurbine\`: A boolean value indicating if the aircraft is turbine-powered.
  - \`isHelicopter\`: A boolean value indicating if the aircraft is a helicopter.
  - \`isMilitary\`: A boolean value indicating if the aircraft is typically used for military purposes.

- **Output Format:**  
  Respond in **JSON format only**, without any additional explanations or commentary.

**Example Response:**
\`\`\`json
{
  "aircrafts": [
    {
      "model": "C172",
      "isSingleEngine": true,
      "isFixedWing": true,
      "isTurbine": false,
      "isHelicopter": false,
      "isMilitary": false
    }
  ]
}`;
};