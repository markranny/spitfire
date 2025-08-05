"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CardModal({ isOpen, setIsOpen, dialogButtonRef, src }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Modal Content */}
      <DialogTrigger asChild className="hidden" ref={dialogButtonRef}>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="bg-white-50">
        <DialogTitle className="hidden">Preview</DialogTitle>
        <div className="image-container" style={{ width: "100%", overflow: "auto" }}>
          <Image src={src} alt="Score Card" width={1500} height={600} />
        </div>
        <div className="pt-5 w-full flex items-center gap-2 justify-center">
          <Button
            type="button"
            className="w-fit min-w-32 px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md text-sm font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
