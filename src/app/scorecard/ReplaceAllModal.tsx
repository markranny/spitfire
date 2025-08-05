import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReplaceAllModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ReplaceAllModal: React.FC<ReplaceAllModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white-50 p-10">
        <DialogTitle className="text-2xl font-semibold text-center text-black">
          {title}
        </DialogTitle>
        <p className="text-black text-center text-lg mb-6 whitespace-pre-wrap">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <Button 
            className="text-black text-center w-fit rounded-full bg-gray-300 py-6"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="text-black text-center w-fit rounded-full bg-gray-300 py-6"
            variant="outline"
            onClick={onConfirm}
          >
            Replace All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplaceAllModal;
