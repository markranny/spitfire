import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadFile, ResumeTemplate } from "@/lib/utils";
import React from "react";

const PreviewCard = ({
  handlePreview,
  card,
  handleGenerateResume,
}: {
  handlePreview: (card: number) => void;
  card: number;
  handleGenerateResume: any;
}) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex justify-center self-center items-center text-black text-sm text-bold h-full">Template {card}</div>
      <div className="flex justify-center self-center items-center ml-2">
        <Button
          type="button"
          onClick={() => handlePreview(card)}
          className="flex p-1 py-0 justify-center items-center self-center bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm h-8"
        >
          Preview
        </Button>
      </div>
    </div>
  );
};

export default PreviewCard;
