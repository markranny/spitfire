
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeTemplate } from "@/lib/utils";
import React from "react";

interface PreviewCardProps {
  template: ResumeTemplate;
  handlePreview: (template: ResumeTemplate) => void;
  downloadPdf: (template: ResumeTemplate) => void;
}

const PreviewCard = ({ handlePreview, template, downloadPdf }: PreviewCardProps) => {
  return (
    <Card key={template} className="p-5 border border-orange-200 shadow-lg rounded-lg w-full md:w-1/3 lg:w-1/4">
      <CardHeader>
        <CardTitle className="flex justify-center font-bold text-black text-2xl md:text-3xl">Template {template}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="pt-10 w-full flex flex-col items-center">
          <Button
            type="button"
            onClick={() => handlePreview(template)}
            className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold mb-4"
          >
            Preview
          </Button>
          <Button
            type="button"
            onClick={() => downloadPdf(template)}
            className="w-fit min-w-32 px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md text-sm font-semibold"
          >
            Download PDF
          </Button>
        </div>
        <div className="h-24"></div>
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
