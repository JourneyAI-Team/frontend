// TODO: Delete this file
import { Card } from "@/components/ui/card";
import type { Message } from "@/types/models";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user";

  // For user messages, get content from input
  if (isUser) {
    const content = message.input?.content;
    if (!content) return null;

    return (
      <div className="flex w-full justify-end">
        <div className="flex flex-col space-y-1 max-w-[80%]">
          <Card className="px-4 py-3 bg-green-600 text-white border-green-600 rounded-2xl shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // For assistant messages, handle different output types
  if (!message.output) return null;

  // Skip tool calls and other non-message types for now
  if (message.output.type !== "message") {
    return null;
  }

  // Get text content from message output
  const contentObj = message.output.content?.find(
    (c) => c.type === "output_text"
  );
  const content = contentObj?.text;

  if (!content) return null;

  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col space-y-1 max-w-[80%]">
        <Card className="px-4 py-3 bg-white text-gray-900 border-gray-200 rounded-2xl shadow-sm">
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  );
};
