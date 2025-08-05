export const getGenerateVolunteeringResponsibilitiesPrompt = (responsibilities: string, organization: string | null, volunteering_type: string | null) => {
  return `
# Work Experience Description Generation
Generate a description of an employee's work experience for their resume by writing these sentences into *three short and consise bullet points*
Additionally, do not use 'I' 'Me' or 'My' in the response
${organization ? `Also include what a volunteer at ${organization} has for responsibilities.` : ""}

Employee's Work Experience Description:
${responsibilities}

Additional Context:
- Organization: ${organization ?? "N/A"}
- Volunteering Type: ${volunteering_type ?? "N/A"}

# Output Format
Your response must be in **JSON format only**. Do not include any additional explanations outside of the JSON structure. Use the following JSON structure for your output:

\`\`\`json
{
  "volunteering_description": [
    "bullet 1",
    "bullet 2",
    "bullet 3"
  ]
}`;
};
