export const getGenerateVolunteeringRolePrompt = (role: string, organization: string | null, volunteering_type: string | null) => {
  return `
# Volunteering Role Description Generation
Rewrite the employee's volunteering role into one sentence${organization ? ` and add details on what volunteers at ${organization} do:` : ""}

Employee's Volunteering Experience Role:
${role}

Additional Context:
- Organization: ${organization ?? "N/A"}
- Volunteering Type: ${volunteering_type ?? "N/A"}

# Output Format
Your response must be in **JSON format only**. Do not include any additional explanations outside of the JSON structure. Use the following JSON structure for your output:

\`\`\`json
{
  "role": "a sentence describing the role of the volunteer",
}`;
};
