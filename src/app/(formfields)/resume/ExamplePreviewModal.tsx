"use client";

import { Ref, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { GenerateDocumentResult } from "./ExamplePreview";
import { downloadFile } from "@/lib/utils";

const Document = dynamic(() => import('react-pdf').then((lib) => {
  lib.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  return lib.Document;
}), {
  ssr: false,
});
const Page = dynamic(() => import('react-pdf').then((lib) => lib.Page), { ssr: false });

interface PreviewModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void,
  dialogButtonRef: Ref<HTMLButtonElement>;
  generateDocumentResult: GenerateDocumentResult | null;
};

function PreviewModal({ isOpen, setIsOpen, dialogButtonRef, generateDocumentResult }: PreviewModalProps) {
  const preview = useMemo<File | undefined>(() => {
    if (generateDocumentResult?.pdf) {
      return new File([generateDocumentResult.pdf], "temp");
    }
    return undefined;
  }, [generateDocumentResult]);

  const downloadPdf = () => {
    if (generateDocumentResult?.pdf) {
      downloadFile("Resume", "pdf", generateDocumentResult.pdf);
    }
  };

  const downloadWord = () => {
    if (generateDocumentResult?.docx) {
      downloadFile("Resume", "docx", generateDocumentResult.docx);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Modal Content */}
      <DialogTrigger asChild className="hidden" ref={dialogButtonRef}>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="bg-white-50">
        <DialogTitle className="hidden">Preview</DialogTitle>
        {/* PDF Document Display */}
        <div className="pdf-container" style={{ width: "100%", height: "500px", overflow: "auto" }}>
          <Document file={preview}>
            <Page pageNumber={1}></Page>
          </Document>
        </div>
        <div className="pt-5 w-full flex items-center gap-2 justify-center">
          <Button
            type="button"
            className="w-fit min-w-32 px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md text-sm font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Close Preview
          </Button>
          <Button
            type="button"
            onClick={downloadPdf}
            className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold "
          >
            Download PDF
          </Button>
          <Button
            type="button"
            onClick={downloadWord}
            className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold "
          >
            Download Word
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewModal;