import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useWebSocketConnection } from "@/hooks/use-ws";

import {
  useListMessages,
  listMessagesQueryOptions,
  type ListMessagesResponse,
} from "@/features/chat/api/list-messages";

import {
  ChatInput,
  type ChatInputType,
} from "@/features/chat/components/chat-input";
import { ChatBubble } from "@/features/chat/components/chat-bubble";

import type { Message, MessageOutputMessageType } from "@/types/models";
import type {
  BaseEventResponse,
  AgentResponseTokenStreamEvent,
} from "@/types/api";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const accountId = params.accountId as string;
    const sessionId = params.sessionId as string;

    await queryClient.ensureQueryData(
      listMessagesQueryOptions({
        query: {
          account_id: accountId,
          session_id: sessionId,
        },
      })
    );
    return { accountId, sessionId };
  };

export const ChatBubbles = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user"; // message can only be from user or assistant

  // Handle rendering of user message from input
  if (isUser) {
    const content = message.input?.content;
    if (!content) return null;
    return <ChatBubble content={content} isUser={true} />;
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

  return <ChatBubble content={content.text} isUser={false} />;
};

// TODO: I think this better return Components instead of strings
const handleEventStream = (event: BaseEventResponse) => {
  // Handle agent response token stream

  if (event.event === "agent_response") {
    // Get the data
    const agentResponseData = event.data;
    // Check the type of the data

    // If it's a token, then it will render the word by word like a typewriter, delta returns the word
    if (agentResponseData.type === "token") {
      const data = agentResponseData as AgentResponseTokenStreamEvent;
      return data.delta;
    }

    // If it's a message, then TODO, for now return null
    // if (agentResponseData.type === "message") {
    //   // const data = agentResponseData as AgentResponseMessageOutputEvent;
    //   // return data.message;
    //   return null;
    // }

    if (agentResponseData.type === "done") {
      return "//done//";
    }
  }

  // Ignore other events for now and return null
  return null;
};

export const EventResponseStream = ({
  onDoneStreaming,
}: {
  onDoneStreaming: (fullResponse: string) => void;
}) => {
  const { lastJsonMessage } = useWebSocketConnection();
  const [tokens, setTokens] = useState<string[]>([]);

  useEffect(() => {
    const event = lastJsonMessage as BaseEventResponse;
    if (event) {
      const token = handleEventStream(event);
      if (token && token !== "//done//") {
        setTokens((prev) => [...prev, token]);
      }
      if (token === "//done//") {
        onDoneStreaming(tokens.join(""));
        setTokens([]);
      }
    }
  }, [lastJsonMessage]);

  // if (loading) {
  //   return <LoadingDots className="text-gray-400" />;
  // }

  return (
    <ChatBubble content={tokens.join("")} isUser={false} isStreaming={true} />
  );
};

export const ChatMessages = () => {
  const { accountId, sessionId } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const queryClient = useQueryClient();

  const [newUserChat, setNewUserChat] = useState<string | null>(null);
  const [fullResponse, setFullResponse] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasInitiallyScrolled = useRef(false);
  // const [chatContainerHeight, setChatContainerHeight] = useState(320);
  // const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch past messages from database
  const { data: messages, isFetched } = useListMessages({
    queryParams: {
      query: {
        account_id: accountId!,
        session_id: sessionId!,
      },
    },
  });

  // Reset scroll tracking when session changes
  useEffect(() => {
    hasInitiallyScrolled.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (messages?.length && !hasInitiallyScrolled.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      hasInitiallyScrolled.current = true;
    }
  }, [messages]);

  // const increaseContainerHeight = () => {
  //   const el = chatContainerRef.current;
  //   if (!el) return;
  //   const h = parseInt(getComputedStyle(el).height, 10);
  //   el.style.height = `${h + 320}px`;
  // };

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
    },
    [newUserChat]
  );

  // When the stream finishes, append into the cache & reset local state
  useEffect(() => {
    if (!fullResponse) return;

    // Build a Message object consistent with your DB shape
    const newMsg: ListMessagesResponse = {
      ...messages?.[0]!,
      id: `streamed-${Date.now()}`,
      sender: "assistant",
      input: null,
      output: {
        id: `streamed-output-${Date.now()}`,
        status: "completed",
        type: "message",
        content: [{ type: "output_text", text: fullResponse }],
      },
    };

    queryClient.setQueryData<Message[]>(
      // same key used in useListMessages
      ["messages", { account_id: accountId!, session_id: sessionId! }],
      (old = []) => [...old, newMsg]
    );

    // clear the temporary UI bits
    setNewUserChat(null);
    setFullResponse(null);
  }, [fullResponse]);

  useEffect(() => {
    if (!newUserChat) return;

    // Build a Message object consistent with your DB shape
    const newMsg: ListMessagesResponse = {
      ...messages?.[0]!,
      id: `streamed-${Date.now()}`,
      sender: "user",
      input: {
        content: newUserChat,
      },
      output: null,
    };

    queryClient.setQueryData<Message[]>(
      // same key used in useListMessages
      ["messages", { account_id: accountId!, session_id: sessionId! }],
      (old = []) => [...old, newMsg]
    );
  }, [newUserChat]);

  const handleDoneStreaming = (fullResponse: string) => {
    setFullResponse(fullResponse);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-auto px-4 py-6 transition-all duration-300 ease-in-out"
        // ref={chatContainerRef}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Render past messages */}
          {messages?.map((message) => (
            <ChatBubbles key={message.id} message={message} />
          ))}
          {/* Render streaming response */}
          {newUserChat && (
            <EventResponseStream onDoneStreaming={handleDoneStreaming} />
          )}
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
