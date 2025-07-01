import type { ListMessagesResponse } from "@/features/chat/api/list-messages";
import { v4 as uuid } from "uuid";

type BuildMessageSchema = {
  isUser: boolean;
  message: string;
  newAttachments?: File[];
};

export const buildMessageSchema = ({
  isUser,
  newAttachments,
  message,
}: BuildMessageSchema): ListMessagesResponse => {
  const baseMessage = {
    user_id: "",
    assistant_id: "",
    organization_id: "",
    session_id: "",
    account_id: "",
    id: uuid(),
  };
  if (isUser) {
    // Convert File[] to AttachmentMetadata[]
    const attachments = (newAttachments || []).map((file) => ({
      type: "file",
      name: file.name,
      mimetype: file.type,
      size: file.size,
    }));

    return {
      ...baseMessage,
      sender: "user",
      input: {
        content: message || "",
      },
      output: null,
      attachments,
    };
  }
  return {
    ...baseMessage,
    sender: "assistant",
    input: null,
    output: {
      id: uuid(),
      status: "completed",
      type: "message",
      content: [{ type: "output_text", text: message }],
    },
    attachments: [],
  };
};

const content = ["I am ready to begin.", "How would you like to be assisted?"];

export const messages: ListMessagesResponse[] = Array.from(
  { length: content.length },
  (_, i) =>
    buildMessageSchema({
      isUser: i % 2 === 0, // example: alternate user/assistant
      message: content[i],
      newAttachments: [], // or supply your File[] here
    })
);
