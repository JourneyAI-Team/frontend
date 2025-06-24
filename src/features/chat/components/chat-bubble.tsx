import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { AttachmentMetadata } from "@/types/models";

import { ImagePreview } from "./image-preview";
import { FilePreview } from "./file-preview";

export const ChatBubble = memo(
  ({
    content,
    isUser,
    isStreaming = false,
    attachments = [],
  }: {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
    attachments?: AttachmentMetadata[];
  }) => {
    return (
      <div
        className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      >
        <div className="flex flex-col space-y-1 max-w-[80%]">
          {/* Render attachments if they exist */}
          {attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name}-${index}`}
                  className="flex-shrink-0"
                >
                  {attachment.mimetype?.includes("image") ? (
                    <ImagePreview
                      src={`/api/files/${attachment.name}`} // Adjust this URL based on your backend
                      alt={attachment.name || "Attachment"}
                      aspectRatio="square"
                      className="w-15 h-15"
                    />
                  ) : (
                    <FilePreview
                      file={
                        {
                          name: attachment.name || "Unknown file",
                          type:
                            attachment.mimetype || "application/octet-stream",
                          size: attachment.size || 0,
                        } as File
                      }
                      isUploading={false}
                      uploadProgress={100}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <Card
            className={cn(
              "px-4 py-3 rounded-2xl border-none shadow-none",
              isUser
                ? "bg-green-600 text-white border-green-600"
                : "px-0 bg-transparent text-gray-900"
            )}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-gray-400 ml-1 animate-text-cursor">
                    |
                  </span>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }
);
