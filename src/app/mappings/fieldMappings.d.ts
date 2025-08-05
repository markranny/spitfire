import { ResumeFields } from "../../types/api/requests";

export type FieldMappingFunction = (data: ResumeFields) => string;
export type TemplateMapping = Record<string, FieldMappingFunction>;
export const fieldMappings: Record<string, TemplateMapping>;
export const fieldMappingsDoc: Record<string, TemplateMapping>;

declare module "@/mappings/fieldMappings" {
    export const fieldMappings: Record<string, TemplateMapping>;
}
declare module "@/mappings/fieldMappingsDoc" {
    export const fieldMappingsDoc: Record<string, TemplateMapping>;
}