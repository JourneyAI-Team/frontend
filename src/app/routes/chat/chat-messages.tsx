/* eslint-disable react-hooks/exhaustive-deps */
import {
  // memo,
  useRef,
  useEffect,
  useState,
  useReducer,
  // useCallback,
  // startTransition,
} from "react";
import { useLoaderData } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useWebSocketConnection } from "@/hooks/use-ws";

import { ChatBubble } from "@/features/chat/components/chat-bubble";
import {
  useListMessages,
  type ListMessagesResponse,
} from "@/features/chat/api/list-messages";
import {
  ChatInput,
  type ChatInputType,
} from "@/features/chat/components/chat-input";
import { loader } from "@/features/chat/loaders/chat-messages-loader";

import type { Message, MessageOutputMessageType } from "@/types/models";
import { reducer } from "@/utils/handleEventStream";
import { createPage, type IComponent } from "@/utils/dynamic-rendering/service";
import type {
  AgentResponseMessageOutputEvent,
  BaseEventResponse,
} from "@/types/api";

const ChatBubbles = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user"; // message can only be from user or assistant

  // Handle rendering of user message from input
  if (isUser) {
    const content = message.input?.content;
    if (!content) return null;
    return (
      <ChatBubble
        content={content}
        isUser={true}
        attachments={message.attachments}
      />
    );
  }

  // Handle rendering of assistant message from output
  if (!message.output) return null;

  // Skip tool calls and other non-message types for now
  // TODO: Handle tool calls and other non-message types
  if (message.output.type !== "message") {
    return null;
  }

  // Get text content from assistant message output
  const contentObj = message.output as MessageOutputMessageType;
  const content = contentObj.content.find((c) => c.type === "output_text");
  if (!content) return null;

  return (
    <ChatBubble
      content={content.text}
      isUser={false}
      attachments={message.attachments}
    />
  );
};

const ChatHistory = ({
  accountId,
  sessionId,
}: {
  accountId: string;
  sessionId: string;
}) => {
  // Fetch past messages from database

  const { data: messages } = useListMessages({
    queryParams: {
      query: {
        account_id: accountId,
        session_id: sessionId,
      },
    },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasInitiallyScrolled = useRef(false);

  useEffect(() => {
    hasInitiallyScrolled.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (messages?.length && !hasInitiallyScrolled.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      hasInitiallyScrolled.current = true;
    }
  }, [messages]);

  return (
    <>
      {messages?.map((message) => (
        <ChatBubbles key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

const ResponseStream = ({
  onDoneStreaming,
}: {
  onDoneStreaming: (message: string | null) => void;
}) => {
  const { lastJsonMessage } = useWebSocketConnection();
  const [state, dispatch] = useReducer(reducer, {
    components: [],
    current: null,
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const event = lastJsonMessage as BaseEventResponse;
    if (!event) return;
    console.log(event);
    if (event.event === "agent_response") {
      if (event.data.type === "message") {
        const data = event.data as AgentResponseMessageOutputEvent;
        setMessage(data.content.map((d) => d.text).join(""));
      }
      if (event.data.type === "done") {
        onDoneStreaming(message);
      }
    }

    dispatch(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const container: IComponent = {
    type: "Container",
    data: {
      id: "chat-container",
      items: state.current
        ? // if you have a current bubble, append it
          [...state.components, state.current]
        : // otherwise just use the existing array
          state.components,
    },
  };
  return <>{createPage(container)}</>;
};

export const Chat = () => {
  const { accountId, sessionId } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const queryClient = useQueryClient();

  const [newUserChat, setNewUserChat] = useState<string | null>(null);
  const [finalResponse, setFinalResponse] = useState<string | null>(null);
  // const [newUserChatAttachments, setNewUserChatAttachments] = useState<
  //   File[] | null
  // >(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = (textInput: ChatInputType) => {
    const text = textInput.content.trim();
    if (!text) return;
    setNewUserChat(() => text);
  };

  // 1) Assistant-only effect
  useEffect(() => {
    if (!finalResponse) return;
    queryClient.setQueryData<Message[]>(
      ["messages", { account_id: accountId, session_id: sessionId }],
      (old = []) => [...old, buildMessageSchema(false)]
    );
    setFinalResponse(null);
  }, [finalResponse]);

  // 2) User-only effect, runs after the assistant one
  useEffect(() => {
    if (!newUserChat) return;
    queryClient.setQueryData<Message[]>(
      ["messages", { account_id: accountId, session_id: sessionId }],
      (old = []) => [...old, buildMessageSchema(true)]
    );
    setNewUserChat(null);
  }, [newUserChat]);

  const buildMessageSchema = (isUser: boolean): ListMessagesResponse => {
    const baseMessage = {
      user_id: "",
      assistant_id: "",
      organization_id: "",
      session_id: accountId,
      account_id: sessionId,
      id: `streamed-${Date.now()}`,
    };
    if (isUser) {
      // Convert File[] to AttachmentMetadata[]
      // const attachments = (newUserChatAttachments || []).map((file) => ({
      //   type: "file",
      //   name: file.name,
      //   mimetype: file.type,
      //   size: file.size,
      // }));

      return {
        ...baseMessage,
        sender: "user",
        input: {
          content: newUserChat || "",
        },
        output: null,
        attachments: [],
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
        content: [{ type: "output_text", text: finalResponse }],
      },
      attachments: [],
    };
  };

  const handleDoneStreaming = (message: string | null) => {
    setFinalResponse(message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-4 py-6 transition-all duration-300 ease-in-out">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Render past messages */}
          <ChatHistory accountId={accountId} sessionId={sessionId} />
          {/* Render streaming response */}
          <ResponseStream onDoneStreaming={handleDoneStreaming} />
          {/* {newUserChat && (
            <EventResponseStream onDoneStreaming={handleDoneStreaming} />
          )} */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            sessionId={sessionId}
            accountId={accountId}
          />
        </div>
      </div>
    </div>
  );
};
