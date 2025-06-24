import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { memo } from "react";

export const ChatBubble = memo(
  ({
    content,
    isUser,
    isStreaming = false,
  }: {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
  }) => {
    return (
      <div
        className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      >
        <div className="flex flex-col space-y-1 max-w-[80%]">
          <Card
            className={cn(
              "px-4 py-3 rounded-2xl shadow-sm",
              isUser
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-900 border-gray-200"
            )}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {content}
              </p>
            ) : (
              <div className="markdown-content">
                <span>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-gray-400 ml-1 animate-text-cursor">
                      |
                    </span>
                  )}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }
);
