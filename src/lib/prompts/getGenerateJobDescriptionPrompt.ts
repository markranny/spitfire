export const getGenerateJobDescriptionPrompt = (jobDescription: string, company: string | null, title: string | null, aircraft: string | null) => {
  return `
# Work Experience Description Generation
Generate a description of an employee's work experience for their resume by writing these sentences into *three short and consise bullet points*
Additionally, do not use 'I' 'Me' or 'My' in the response
${title ? `Also include what a ${title} has for responsibilities.` : ""}

Employee's Work Experience Description:
${jobDescription}

Additional Context:
- Company: ${company ?? "N/A"}
- Title: ${title ?? "N/A"}
- Aircraft: ${aircraft ?? "N/A"}

# Output Format
Your response must be in **JSON format only**. Do not include any additional explanations outside of the JSON structure. Use the following JSON structure for your output:

\`\`\`json
{
  "job_description": [
    "bullet 1",
    "bullet 2",
    "bullet 3"
  ]
}`;
};
