"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useProcessFlightLogsMutation } from "@/state/api";
import { toast } from "sonner";

export function UploadModal({ isOpen, setIsOpen, dialogButtonRef, type, setApiResponse }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [processFlightLogs, { isLoading }] = useProcessFlightLogsMutation();
  const MAX_FILES = 10; // Max number of files
  const MAX_FILE_SIZE_MB = 15; // Max file size in MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes (15 MB = 15,728,640 bytes)

  // Handle file selection with size check
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    const totalFiles = files.length + newFiles.length;

    // Check total file count
    if (totalFiles > MAX_FILES) {
      toast.warning(`You can only upload up to ${MAX_FILES} files.`, {
        description: `Please remove some files or upload fewer than ${MAX_FILES}.`,
      });
      return;
    }

    // Check file sizes
    const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      toast.warning(`File size limit exceeded (${MAX_FILE_SIZE_MB} MB).`, {
        description: oversizedFiles
          .map((file) => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
          .join(", "),
      });
      return;
    }

    // Add valid files
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Remove a specific file
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle submission
  const handleNext = async () => {
    if (files.length === 0) return;
    try {
      const result = await processFlightLogs({ files }).unwrap();
      setApiResponse(result);
      setIsOpen(false);
    } catch (error) {
      console.error("Error processing flight logs:", error);
      toast.error("Failed to process flight logs.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="hidden" ref={dialogButtonRef}>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent className="bg-white-50 p-10">
        <div className="flex flex-col items-center relative gap-5">
          <DialogTitle className="text-2xl font-semibold text-center text-black">Import Flight Logs</DialogTitle>
          <div className="text-black text-center text-lg font-semibold mb-4">
            {type === "manual" ? "Images, PDF" : "Excel, CSV"}
          </div>
          <Button
            type="button"
            className="w-fit rounded-full bg-gray-300 absolute top-0 right-2 py-6"
            onClick={() => setIsOpen(false)}
          >
            <X size={22} color="black" />
          </Button>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-4 mb-6 border border-gray-400">
          {files.length === 0 && !isLoading ? (
            <>
              <Button asChild className="bg-gray-300 hover:bg-gray-400 text-black px-10 rounded-full w-fit py-2">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 text-black text-lg">
                  <Upload size={22} color="black" />
                  Upload Files
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept={type === "manual" ? ".pdf, .jpg, .jpeg, .png" : ".csv, .xlsx"}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
              <span className="text-gray-500 text-sm">No files uploaded (Max {MAX_FILE_SIZE_MB} MB each)</span>
            </>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
              <span className="text-gray-500 text-sm">Processing...</span>
            </div>
          ) : (
            <div className="w-full text-center">
              <div className="text-gray-700 font-medium mb-2">Uploaded Files:</div>
              <ul className="text-gray-600 space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
              {files.length < MAX_FILES && (
                <Button asChild className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-full max-w-xs py-2 mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 justify-center">
                    <Upload size={16} />
                    Add More Files
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept={type === "manual" ? ".pdf, .jpg, .jpeg, .png" : ".csv, .xlsx"}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="w-full flex justify-center">
          <Button
            type="button"
            className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white-100 rounded-full shadow-md text-sm font-semibold"
            disabled={files.length === 0 || isLoading}
            onClick={handleNext}
          >
            {isLoading ? "Processing..." : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
