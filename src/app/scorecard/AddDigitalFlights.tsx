import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardModal } from "./ScoreCardModal";
import { UploadModal } from "./UploadModal";
import { Review } from "./Review";

const AddDigitalFlights = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState(null);
  return apiResponse ? (
    <Review apiData={apiResponse} />
  ) : (
    <div className=" px-8 py-8 w-full h-full bg-white">
      <h1 className="text-3xl font-bold mb-4 text-black">INSTRUCTIONS AND GUIDELINES</h1>
      <h4 className="text-xl font-semibold mb-4 text-black pt-10">
        1. Please click on the previews below for examples digital flight logs.
      </h4>
      <h4 className="text-xl font-semibold mb-4 text-black">
        2. The limit per upload is 10 files no greater than 15 MB.
      </h4>
      <div className="flex pt-20 px-10 gap-20">
        <div className="flex flex-col justify-center items-center w-fit">
          <span className="text-xl font-semibold mb-4 text-black">Example 1</span>
          <Button
            type="button"
            onClick={() => {
              setActiveImage("/scorecard/example1.png");
              setPreviewOpen(true);
              if (!previewButtonRef.current) return;
              previewButtonRef.current.click();
            }}
            className="w-fit flex gap-2  min-w-32 px-14 my-6 py-6 rounded-full justify-center hover:bg-orange-500 hover:text-white-100 text-orange-500 border border-orange-600 shadow text-xl font-semibold"
          >
            Preview
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <span className="text-xl font-semibold mb-4 text-black">Example 2</span>
          <Button
            type="button"
            onClick={() => {
              setActiveImage("/scorecard/example2.png");
              setPreviewOpen(true);
              if (!previewButtonRef.current) return;
              previewButtonRef.current.click();
            }}
            className="w-fit flex gap-2  min-w-32 px-14 my-6 py-6 rounded-full justify-center hover:bg-orange-500 hover:text-white-100 text-orange-500 border border-orange-600 shadow text-xl font-semibold"
          >
            Preview
          </Button>
        </div>
      </div>
      <div className="flex w-full pt-20 justify-center ">
        <Button
          type="button"
          onClick={() => {
            setUploadOpen(true);
            if (!uploadButtonRef.current) return;
            uploadButtonRef.current.click();
          }}
          className="w-fit flex gap-2  min-w-32 px-14 my-6 py-6 rounded-full justify-center bg-orange-500 hover:text-orange-500 text-white-100  border border-orange-600 shadow text-xl font-semibold"
        >
          Upload Flight Logs
        </Button>
      </div>
      <CardModal
        isOpen={previewOpen}
        setIsOpen={setPreviewOpen}
        dialogButtonRef={previewButtonRef}
        src={activeImage || ""}
      />
      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          setIsOpen={setUploadOpen}
          dialogButtonRef={uploadButtonRef}
          setApiResponse={setApiResponse}
        />
      )}
    </div>
  );
};

export default AddDigitalFlights;
