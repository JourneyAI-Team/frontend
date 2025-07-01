import type { ListMessagesResponse } from "@/features/chat/api/list-messages";

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
    id: `streamed-${Date.now()}`,
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
      id: `streamed-output-${Date.now()}`,
      status: "completed",
      type: "message",
      content: [{ type: "output_text", text: message }],
    },
    attachments: [],
  };
};
