/* eslint-disable react-hooks/exhaustive-deps */
import {
  // memo,
  useRef,
  useEffect,
  useState,
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
import { reducer, test } from "@/utils/handleEventStream";
import { createPage, type IComponent } from "@/utils/dynamic-rendering/service";
import type {
  AgentResponseMessageOutputEvent,
  BaseEventResponse,
} from "@/types/api";
import { ToolCallIndicatorBadge } from "@/features/chat/components/tool-call-indicator-badge";
// import { FunctionToolCallAccordion } from "@/features/chat/components/function-tool-call-accordion";
import { buildMessageSchema } from "@/utils/build-message-schema";

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

  if (message.output.type === "web_search_call") {
    return <ToolCallIndicatorBadge text="Searched the web" />;
  }

  if (message.output.type === "file_search_call") {
    return <ToolCallIndicatorBadge text="Searched through files" />;
  }

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

let curComponent: IComponent | null = null;
const container: IComponent = {
  type: "Container",
  data: {
    id: "chat-container",
    items: [],
  },
};

const newMessages: {
  toolCalls: (Message & { id: string })[];
  messages: (Message & { id: string })[];
} = {
  toolCalls: [],
  messages: [],
};

const ResponseStream = ({
  onDoneStreaming,
}: {
  onDoneStreaming: (message: string | null) => void;
}) => {
  const { lastJsonMessage } = useWebSocketConnection();
  // const [state, dispatch] = useReducer(reducer, {
  //   components: [],
  //   current: null,
  // });
  // const [curComponent, setCurComponent] = useState<IComponent | null>(null);
  const [curEvent, setCurEvent] = useState<BaseEventResponse | null>(null);
  // const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const event = lastJsonMessage as BaseEventResponse;
    if (!event) return;
    console.log(event);
    // diff agent response type is also considered a different event
    if (event.event === "agent_response") {
      if (event.data.type !== curEvent?.data.type) {
        setCurEvent(event);
        if (curComponent && curComponent.type !== "ChatLoading") {
          container.data.items?.push(curComponent);
        }
        // if event type is of type "message", push to newMessages list
        if (event.data.type === "message") {
          const agentResponseData =
            event.data as AgentResponseMessageOutputEvent;
          newMessages.messages.push(
            buildMessageSchema({
              isUser: false,
              newAttachments: undefined,
              message: agentResponseData.content.map((d) => d.text).join(""),
            })
          );
        }

        // if event type is of type "file_search_call" or "web_search_call"
        if (
          event.data.type === "file_search_call" ||
          event.data.type === "web_search_call"
        ) {
          newMessages.toolCalls.push(
            buildMessageSchema({
              isUser: false,
              newAttachments: undefined,
              message: "",
              outputType: event.data.type,
            })
          );
        }
      }
    }
    if (event.event !== curEvent?.event) {
      setCurEvent(event);
      // add component to permanent component
      if (curComponent && curComponent.type !== "ChatLoading") {
        container.data.items?.push(curComponent);
      }
    }
    const t = test(event, curComponent);
    curComponent = t;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return (
    <>
      {createPage(container)}
      {createPage(curComponent)}
    </>
  );
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

  // useEffect(() => {
  //   if (!finalResponse) return;
  //   queryClient.setQueryData<Message[]>(
  //     ["messages", { account_id: accountId, session_id: sessionId }],
  //     (old = []) => [...old, buildMessageSchema(false)]
  //   );
  //   setFinalResponse(null);
  // }, [finalResponse]);

  // 2) User-only effect, runs after the assistant one
  useEffect(() => {
    if (!newUserChat) return;

    queryClient.setQueryData<Message[]>(
      ["messages", { account_id: accountId, session_id: sessionId }],
      (old = []) => [
        ...old,
        ...newMessages.toolCalls,
        ...newMessages.messages,
        buildMessageSchema(true),
      ]
    );

    // clear previous
    newMessages.toolCalls = [];
    newMessages.messages = [];
    // clear previous contents of container
    container.data.items = [];
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
        content: [{ type: "output_text", text: "test" }],
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
