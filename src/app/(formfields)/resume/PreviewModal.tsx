"use client";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { downloadFile, ResumeTemplate } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

const Document = dynamic(
  () =>
    import("react-pdf").then((lib) => {
      lib.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return lib.Document;
    }),
  {
    ssr: false,
  }
);
const Page = dynamic(() => import("react-pdf").then((lib) => lib.Page), { ssr: false });

export function CardModal({ isOpen, setIsOpen, dialogButtonRef, activePreview, handleGenerateResume }: any) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const pdfContainerRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  const downloadPdf = async (template: ResumeTemplate) => {
    setIsGenerating(true);
    handleGenerateResume(template, async (result: GenerateDocumentResult) => {
      const pdfBlob = await result.getPdf();
      if (pdfBlob) {
        downloadFile("Resume", "pdf", pdfBlob); // Call downloadFile direc
      }
      setIsGenerating(false);
    });
  };

  const downloadDocx = async (template: ResumeTemplate) =>{
    setIsGenerating(true);
    handleGenerateResume(template, async (result: GenerateDocumentResult) => {
      const docxBlob = await result.getDocx();
      downloadFile("Resume", "docx", docxBlob);
      setIsGenerating(false);
    });
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white-50 max-w-[90vw] sm:max-w-2xl p-4">
        <DialogTitle className="text-black font-md font-bold text-center">Template {activePreview}</DialogTitle>
        {/* PDF Document Display */}
        <div
          className="pdf-container relative w-full h-[60vh] sm:h-[500px] overflow-auto px-10"
          ref={pdfContainerRef}
        >
          <Document
            file={`/Template ${activePreview}/Spitfire_Preview_Template${activePreview}.pdf`}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page 
              pageNumber={1} 
              scale={scale} 
              width={400}
              className="mx-auto"
            />
          </Document>
        </div>

        {/* Action Buttons with Zoom */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              className="w-8 h-8 p-0 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md"
              onClick={handleZoomOut}
            >
              <Minus size={16} />
            </Button>
            <Button
              type="button"
              className="w-8 h-8 p-0 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md"
              onClick={handleZoomIn}
            >
              <Plus size={16} />
            </Button>
          </div>
          <Button
            type="button"
            className="w-full sm:w-fit min-w-[120px] px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md text-sm font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}