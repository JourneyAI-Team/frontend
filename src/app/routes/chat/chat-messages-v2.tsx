import {
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
  memo,
} from "react";
import { useLoaderData } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FileSearch } from "lucide-react";

import { useWebSocketConnection } from "@/hooks/use-ws";

import {
  useListMessages,
  type ListMessagesResponse,
} from "@/features/chat/api/list-messages";

import { loader } from "@/features/chat/loaders/chat-messages-loader";
import {
  ChatInput,
  type ChatInputType,
} from "@/features/chat/components/chat-input";
import { ChatBubble } from "@/features/chat/components/chat-bubble";

import type { Message, MessageOutputMessageType } from "@/types/models";
import type { BaseEventResponse } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";
import { LoadingDots } from "@/features/chat/components/loading";
import { ToolCallIndicatorBadge } from "@/features/chat/components/tool-call-indicator-badge";

import { handleEventStream, type ParsedEvent } from "@/utils/handleEventStream";
import { createPage } from "@/utils/dynamic-rendering/service";
import { Button } from "@/components/ui/button";

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

const RenderEvent = ({
  event,
  tokens,
}: {
  event: ParsedEvent;
  tokens: string;
}) => {
  if (event?.event === "processing_session") {
    return (
      <div className="flex w-full justify-start">
        <div className="flex flex-col space-y-1 max-w-[80%]">
          <div className="px-4 py-3">
            <LoadingDots className="text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (event?.event === "connection_established") {
    // return <ChatBubble content={tokens} isUser={false} isStreaming={true} />;
    // if (event.type === "token") {
    //   if (tokens !== "") {
    //     return (
    //       <ChatBubble content={tokens} isUser={false} isStreaming={true} />
    //     );
    //   } else {
    //     return <span />;
    //   }
    // }
    // if (event.type === "token") {
    //   if (tokens !== "") {
    //     return (
    //       <ChatBubble content={tokens} isUser={false} isStreaming={true} />
    //     );
    //   }
    // } else {
    //   return <ChatBubble content={tokens} isUser={false} isStreaming={true} />;
    // }
    return (
      <div className="flex w-full justify-start">
        <div className="flex flex-col space-y-1 max-w-[80%]">
          <div className="px-4 py-3">
            <LoadingDots className="text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return <ChatBubble content={tokens} isUser={false} isStreaming={true} />;
};

const EventResponseStream = ({
  onDoneStreaming,
}: {
  onDoneStreaming: (fullResponse: string) => void;
}) => {
  const { lastJsonMessage } = useWebSocketConnection();
  const [tokens, setTokens] = useState<string>("");
  const [curEvent, setCurEvent] = useState<ParsedEvent>(null);

  useEffect(() => {
    const event = lastJsonMessage as BaseEventResponse;

    if (event) {
      const parsedEvent = handleEventStream(event);
      console.log(event);
      if (parsedEvent) {
        if (parsedEvent.type === "token") {
          setTokens((prev) => prev + parsedEvent.data);
        }
        if (parsedEvent.type === "message") {
          onDoneStreaming(parsedEvent.data || tokens);
        }
        if (parsedEvent.type === "file_search_call") {
          setTokens((prev) => prev + " Searching for your files...");
        }
        if (parsedEvent.type === "done") {
          setTokens("");
        }
      }
      setCurEvent(parsedEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return <RenderEvent tokens={tokens} event={curEvent} />;
};

const MessageList = memo(
  ({ accountId, sessionId }: { accountId: string; sessionId: string }) => {
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
  }
);

export const Chat = () => {
  const { accountId, sessionId } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newUserChat, setNewUserChat] = useState<string | null>(null);
  const [newUserChatAttachments, setNewUserChatAttachments] = useState<
    File[] | null
  >(null);
  const [fullResponse, setFullResponse] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages or newMessage changes
  useEffect(() => {
    if (!newUserChat) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newUserChat]);

  const handleSendMessage = useCallback(
    (chatText: ChatInputType, files?: File[]) => {
      const textContent = chatText.content.trim();
      if (!textContent) return;
      setNewUserChat(textContent);
      if (files) {
        setNewUserChatAttachments(files);
      }
      setFullResponse(null);
    },
    []
  );

  // When the stream finishes, append into the cache & reset local state
  useEffect(() => {
    if (!fullResponse) return;

    // Build a Message object consistent with the schema
    const newMsg = buildMessageSchema(false);

    startTransition(() => {
      queryClient.setQueryData<Message[]>(
        ["messages", { account_id: accountId, session_id: sessionId }],
        (old = []) => [...old, newMsg]
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullResponse]);

  useEffect(() => {
    if (!newUserChat) return;

    // Build a Message object consistent with your DB shape
    const newMsg = buildMessageSchema(true);

    queryClient.setQueryData<Message[]>(
      // same key used in useListMessages
      ["messages", { account_id: accountId!, session_id: sessionId! }],
      (old = []) => [...old, newMsg]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newUserChat]);

  const buildMessageSchema = (isUser: boolean): ListMessagesResponse => {
    const baseMessage = {
      user_id: "",
      assistant_id: "",
      organization_id: user?.organization || "",
      session_id: accountId,
      account_id: sessionId,
      id: `streamed-${Date.now()}`,
    };
    if (isUser) {
      // Convert File[] to AttachmentMetadata[]
      const attachments = (newUserChatAttachments || []).map((file) => ({
        type: "file",
        name: file.name,
        mimetype: file.type,
        size: file.size,
      }));

      return {
        ...baseMessage,
        sender: "user",
        input: {
          content: newUserChat || "",
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
        content: [{ type: "output_text", text: fullResponse }],
      },
      attachments: [],
    };
  };

  const handleDoneStreaming = (fullResponse: string) => {
    setFullResponse(fullResponse);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-4 py-6 transition-all duration-300 ease-in-out">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Render past messages */}
          <MessageList accountId={accountId} sessionId={sessionId} />
          {/* Render streaming response */}
          {newUserChat && (
            <EventResponseStream onDoneStreaming={handleDoneStreaming} />
          )}
          {createPage({
            type: "ChatBubble",
            data: {
              id: "123",
              content: "tesadadasdasdasdt",
              isUser: false,
              isStreaming: false,
            },
          })}

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
