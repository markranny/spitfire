"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetResumesQuery, useDeleteResumeMutation } from "@/state/api";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAppDispatch } from "@/state/redux";
import { setActiveSession } from "@/state";

interface Resume {
  id: string;
  title?: string;
}

interface GetResumesResponse {
  success: boolean;
  resumeList?: Resume[];
  error?: string;
}

const ResumeList: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, error, isLoading } = useGetResumesQuery();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setResumeToDelete(id);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (resumeToDelete) {
      try {
        await deleteResume({ id: resumeToDelete }).unwrap();
        const activeSession = localStorage.getItem("activeSession");
        if (activeSession && activeSession === resumeToDelete) {
          localStorage.removeItem("activeSession");
          dispatch(setActiveSession(null));
        }
        toast.success("Resume deleted successfully");
      } catch (error: any) {
        toast.error("Failed to delete resume");
      }
      setIsDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setResumeToDelete(null);
  };

  const handleStartNew = () => {
    localStorage.removeItem("formData");
    localStorage.removeItem("activeSession");
    dispatch(setActiveSession(null));
    router.push("/resume");
  };

  return (
    <div className="w-full h-full pl-12 py-12 pr-24 bg-white-50">
      <h1 className="text-2xl font-semibold text-black">Your Resumes</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Manage your saved resumes below</p>

      <div className="flex justify-end mb-6">
        <Button
          onClick={handleStartNew}
          className="w-fit flex gap-2 justify-between min-w-32 px-3 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
        >
          <Plus className="text-orange-500" />
          Create New Resume
        </Button>
      </div>

      {isLoading && <div className="text-black">Loading...</div>}
      {error && <div className="text-red-500">Error: {(error as any)?.data?.error || "Failed to fetch resumes"}</div>}
      {!isLoading && !error && data?.success && (
        <div className="flex flex-col gap-5 w-2/3">
          {data.resumeList?.length === 0 ? (
            <p className="text-customgreys-dirtyGrey">No resumes found. Create one to get started!</p>
          ) : (
            data.resumeList?.map((resume: any) => (
              <div
                key={resume.id}
                className="group bg-white-100 w-2/3 border-orange-500 border relative flex items-center justify-between p-4 bg-white rounded shadow"
              >
                <span className="text-black hover:text-orange-500 cursor-pointer">
                  {`ID: ${resume.id || "Untitled Resume"}`}
                </span>
                <Button
                  type="button"
                  onClick={() => handleDeleteClick(resume.id)}
                  disabled={isDeleting}
                  className="absolute right-[-20px] top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white-50">
          <DialogHeader>
            <DialogTitle className="text-black">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-black">
              Are you sure you want to delete this resume? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose} className="text-black">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pt-10 w-full flex justify-between">
        <Button
          type="button"
          onClick={() => router.push("/landing")}
          className="w-fit min-w-32 px-3 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ResumeList;
