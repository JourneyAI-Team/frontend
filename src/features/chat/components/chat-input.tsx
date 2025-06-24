import { Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { toast } from "sonner";

import { Form } from "@/components/ui/react-hook-form-wrapper";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useWebSocketConnection } from "@/hooks/use-ws";
import type { Message } from "@/types/models";
import { SUPPORTED_FILE_EXTENSIONS } from "@/utils/vars";

import { ImagePreview } from "./image-preview";
import { FilePreview } from "./file-preview";
import { useFilesUpload } from "../api/upload-files";

// Debug: Set to true to disable image uploads
const DEBUG_DISABLE_IMAGES = true;

const chatInputSchema = z.object({
  content: z.string(),
});
export type ChatInputType = z.infer<typeof chatInputSchema>;

export const ChatInput = ({
  onSendMessage,
  sessionId,
  accountId,
}: {
  className?: string;
  placeholder?: string;
  sessionId: string;
  accountId: string;
  onSendMessage: (data: ChatInputType, files?: File[]) => void;
}) => {
  const { sendJsonMessage } = useWebSocketConnection();

  const queryClient = useQueryClient();

  const messages = queryClient.getQueryData<Message[]>([
    "messages",
    { account_id: accountId, session_id: sessionId },
  ]);

  // ref to ensure we only send once
  const didSendInitial = useRef(false);

  useEffect(() => {
    // 1) only run after we've fetched (messages !== undefined)
    if (messages === undefined) return;

    // 2) only if truly empty
    if (messages.length !== 0) return;

    // 3) only once
    if (didSendInitial.current) return;

    const content = "I am ready to begin.";
    sendJsonMessage({
      event: "ingest_message",
      data: { content, session_id: sessionId },
    });
    onSendMessage({ content });

    didSendInitial.current = true;
  }, [messages, sendJsonMessage, onSendMessage, sessionId]);

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useFilesUpload(sessionId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = e.target.files;
    const newFiles = Array.from(filesToUpload || []);

    // Filter out invalid files
    const validFiles = newFiles.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return SUPPORTED_FILE_EXTENSIONS.has(`.${ext}`);
    });
    const invalidFiles = newFiles.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return !SUPPORTED_FILE_EXTENSIONS.has(`.${ext}`);
    });

    if (invalidFiles.length > 0) {
      toast.error("Invalid file type", {
        description: "Invalid files will not be uploaded.",
      });
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setFiles((prev) => [...validFiles, ...prev]);

    validFiles.forEach((_file) => {
      const formData = new FormData();
      formData.append("files", _file);
      uploadMutation.mutation.mutate({ files: formData, fileName: _file.name });
    });

    e.target.value = "";
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));

    uploadMutation.handleRemoveFile(file.name);
  };

  const handleSendMessage = (data: ChatInputType) => {
    const message = data.content.trim();
    if (message === "" && files.length === 0) return;

    // Create attachment metadata from files
    const attachments = files.map((file) => ({
      type: "file",
      name: file.name,
      mimetype: file.type,
      size: file.size,
    }));

    const messageData: {
      content: string;
      session_id: string;
      attachments?: typeof attachments;
    } = {
      content: message,
      session_id: sessionId,
    };

    // Only include attachments if there are files
    if (attachments.length > 0) {
      messageData.attachments = attachments;
    }

    sendJsonMessage({
      event: "ingest_message",
      data: messageData,
    });
    // Clear all files
    uploadMutation.handleRemoveAllFiles();
    setFiles([]);
    onSendMessage(data, files);
  };

  const getAcceptedFileTypes = () => {
    return DEBUG_DISABLE_IMAGES
      ? ".pdf,.doc,.docx,.txt"
      : "image/*,.pdf,.doc,.docx,.txt";
  };

  return (
    <div className="relative rounded-3xl! bg-background border overflow-hidden shadow-sm pr-2 pt-2">
      {/* File preview section */}
      <div className="mx-3 overflow-x-auto hide-scrollbar mb-2">
        <div className="flex gap-2 flex-row flex-nowrap w-max">
          {files &&
            files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex-shrink-0">
                {file.type.includes("image") ? (
                  // TODO: For future image support
                  <ImagePreview
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    // onClick={() => console.log("Image clicked!")}
                    onClose={() => handleRemoveFile(file)}
                    showCloseButton={true}
                    aspectRatio="square"
                    className="w-15 h-15"
                  />
                ) : (
                  <FilePreview
                    file={file}
                    onClose={() => handleRemoveFile(file)}
                    isUploading={
                      uploadMutation.uploadProgressMap[file.name] < 100
                    }
                    uploadProgress={uploadMutation.uploadProgressMap[file.name]}
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Chat Input */}
      <Form
        onSubmit={handleSendMessage}
        schema={chatInputSchema}
        options={{
          defaultValues: {
            content: "",
          },
        }}
      >
        {({ control, reset }) => (
          <>
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      className="w-full border-none px-4 pt-3 pb-0! mb-10! placeholder:text-muted-foreground focus-visible:ring-0 focus:outline-none resize-none"
                      placeholder="Ask Journey AI or type @ to use an AI Extension"
                      rows={1}
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage({ content: field.value });
                          reset({ content: "" });
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 128) + "px";
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Attachments */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClick}
                  className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-0"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedFileTypes()}
                    multiple={true}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <Paperclip size={16} />
                  <span className="sr-only">Add attachment</span>
                </Button>
              </div>

              <div className="flex items-center">
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  // disabled={
                  //   !field.value?.trim() ||
                  //   event === "processing_session" ||
                  //   event === "agent_response"
                  // }
                  className="h-8 w-8 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 p-0"
                >
                  <Send size={16} className="text-white" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};
