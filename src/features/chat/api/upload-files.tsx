import { useState } from "react";
import { api } from "@/libs/axios";
import { useMutation } from "@tanstack/react-query";

export const useFilesUpload = (sessionId: string) => {
  // Filenames and their upload progress
  const [uploadProgressMap, setUploadProgressMap] = useState<
    Record<string, number>
  >({});

  const mutation = useMutation({
    mutationFn: ({ files, fileName }: { files: FormData; fileName: string }) =>
      api.post("/session/:session_id/files", files, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        urlParams: {
          ":session_id": sessionId,
        },
        onUploadProgress(progressEvent) {
          const percentCompleted =
            Math.round(progressEvent.loaded * 100) / (progressEvent.total || 1);

          setUploadProgressMap((prev) => ({
            ...prev,
            [fileName]: percentCompleted,
          }));
        },
      }),
  });

  const handleRemoveFile = (fileName: string) => {
    setUploadProgressMap((prev) => {
      const { [fileName]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleRemoveAllFiles = () => {
    setUploadProgressMap({});
  };

  return {
    mutation,
    uploadProgressMap,
    handleRemoveFile,
    handleRemoveAllFiles,
  };
};
