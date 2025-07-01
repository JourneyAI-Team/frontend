/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect, memo, startTransition } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useWebSocketConnection } from "@/hooks/use-ws";

import type { Message } from "@/types/models";
import type { MessageOutputMessageType } from "@/types/models";
import { buildMessageSchema } from "@/utils/build-message-schema";
// import { GA_SESSION_ID, GA_ACCOUNT_ID } from "@/utils/vars";
import { handleEventStream, type ParsedEvent } from "@/utils/handleEventStream";
import { messages } from "@/utils/build-message-schema";
import type { BaseEventResponse } from "@/types/api";

import { ChatBubble } from "./chat-bubble";

// import { useSession } from "../api/get-session";
// import { useCreateSession } from "../api/create-session";
// import { useAccount } from "../api/get-account";
// import { useCreateAccount } from "../api/create-account";
// import { useListMessages } from "../api/list-messages";
import { LoadingDots } from "./loading";

import type { ChatInputType } from "./chat-input";

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

  if (event?.event === "agent_response") {
    if (tokens.length > 0) {
      return <ChatBubble content={tokens} isUser={false} isStreaming={true} />;
    } else {
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
  }

  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col space-y-1 max-w-[80%]">
        <div className="px-4 py-3">
          <LoadingDots className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const EventResponseStream = ({
  onDoneStreaming,
}: {
  onDoneStreaming: (fullResponse: string) => void;
}) => {
  const { lastJsonMessage } = useWebSocketConnection();
  const [tokens, setTokens] = useState<string[]>([]);
  const [curEvent, setCurEvent] = useState<ParsedEvent>(null);

  useEffect(() => {
    const event = lastJsonMessage as BaseEventResponse;
    if (event) {
      const parsedEvent = handleEventStream(event);
      if (parsedEvent) {
        if (parsedEvent.type === "token") {
          setTokens((prev) => [...prev, parsedEvent.data]);
        }
        if (parsedEvent.type === "done") {
          onDoneStreaming(tokens.join(""));
          setTokens([]);
        }
      }
      setCurEvent(parsedEvent);
    }
  }, [lastJsonMessage]);

  return <RenderEvent tokens={tokens.join("")} event={curEvent} />;
};

const MessageList = memo(({ sessionId }: { sessionId: string }) => {
  // Fetch past messages from database
  // const { data: messages } = useListMessages({
  //   queryParams: {
  //     query: {
  //       account_id: accountId,
  //       session_id: sessionId,
  //     },
  //   },
  // });

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
});

const ChatInput = ({
  isOpen,
  // sessionId,
  onSendMessage,
}: {
  isOpen: boolean;
  sessionId?: string;
  onSendMessage: (data: ChatInputType) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");

  // const { sendJsonMessage } = useWebSocketConnection();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    const content = inputValue.trim();
    if (!content) return;

    // const messageData: {
    //   content: string;
    //   session_id: string;
    //   attachments?: [];
    // } = {
    //   content,
    //   session_id: sessionId,
    // };

    // sendJsonMessage({
    //   event: "ingest_message",
    //   data: messageData,
    // });
    onSendMessage({ content });
    setInputValue("");
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
      />
      <button
        onClick={handleSendMessage}
        // disabled={!inputValue.trim()}
        className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </>
  );
};

export const GeneralAssistantChatBox = ({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionId = "test-session";
  const accountId = "test-account";
  // const [sessionId, setSessionId] = useState<string | null>("test-session");

  // const [accountId, setAccountId] = useState<string | null>("test-account");

  // const createAccount = useCreateAccount({});
  // const createSession = useCreateSession({});

  // const accountData = useAccount({
  //   queryParams: {
  //     accountId: accountId!,
  //   },
  //   // queryConfig: {
  //   //   enabled: !!accountId,
  //   // },
  // });

  // useEffect(() => {
  //   if (!accountData) {
  //   }
  // }, [accountData.data]);
  // useEffect(() => {
  //   if (!accountId || !accountData.data) {
  //     // createAccount.mutate(
  //     //   { name: "General Assistant Account", description: "" },
  //     //   {
  //     //     onSuccess: (data) => {
  //     //       localStorage.setItem(GA_ACCOUNT_ID, data.id);
  //     //       setAccountId(data.id);
  //     //     },
  //     //   }
  //     // );
  //   }
  // }, [accountId]);

  // useEffect(() => {
  //   if (!accountId || accountData.isError) {
  //     createAccount.mutate(
  //       { name: "General Assistant Account", description: "" },
  //       {
  //         onSuccess: (data) => {
  //           localStorage.setItem(GA_ACCOUNT_ID, data.id);
  //           setAccountId(data.id);
  //         },
  //       }
  //     );
  //   }
  // }, [accountId, accountData.isError, createAccount]);

  // useEffect(() => {
  //   console.log(accountData.isPending);
  //   console.log(accountData.data);
  //   if (accountData.isLoading) return;

  //   if (!accountData.data) {
  //     createAccount.mutate(
  //       {
  //         name: "General Assistants Account",
  //         description: "",
  //       },
  //       {
  //         onSuccess: (data) => {
  //           localStorage.setItem(GA_ACCOUNT_ID, data.id);
  //           setAccountId(data.id);
  //         },
  //         onError: (err) => {
  //           console.log(err);
  //         },
  //       }
  //     );
  //   } else {
  //     localStorage.setItem(GA_ACCOUNT_ID, accountData.data.id);
  //   }
  // }, [accountData.data]);

  // const sessionData = useSession({
  //   queryParams: {
  //     sessionId: sessionId!,
  //   },
  //   queryConfig: {
  //     enabled: !!sessionId,
  //   },
  // });

  // useEffect(() => {
  //   if (sessionData.isLoading) return;
  //   if (accountId && !sessionData.data) {
  //     createSession.mutate(
  //       {
  //         account_id: accountId!,
  //         title: "New Session",
  //         summary: "",
  //         assistant_id: "a96dce52750242a9aa5639b9dd98baec", // TODO: TEMPORARY ASSISTANT ID
  //       },
  //       {
  //         onSuccess: (data) => {
  //           localStorage.setItem(GA_SESSION_ID, data.id);
  //           setSessionId(data.id);
  //         },
  //         onError: (err) => {
  //           console.error(err);
  //         },
  //       }
  //     );
  //   }
  // }, [sessionData.data]);

  const [newUserChat, setNewUserChat] = useState<string | null>(null);
  const [fullResponse, setFullResponse] = useState<string | null>(null);

  useEffect(() => {
    if (!newUserChat) return;

    // Build a Message object consistent with your DB shape
    const newMsg = buildMessageSchema({
      isUser: true,
      message: newUserChat,
    });

    queryClient.setQueryData<Message[]>(
      // same key used in useListMessages
      ["messages", { account_id: accountId!, session_id: sessionId! }],
      (old = []) => [...old, newMsg]
    );
  }, [newUserChat, queryClient, accountId, sessionId]);

  // When the stream finishes, append into the cache & reset local state
  useEffect(() => {
    if (!fullResponse) return;

    // Build a Message object consistent with the schema
    const newMsg = buildMessageSchema({
      isUser: false,
      message: fullResponse,
    });

    startTransition(() => {
      queryClient.setQueryData<Message[]>(
        ["messages", { account_id: accountId, session_id: sessionId }],
        (old = []) => [...old, newMsg]
      );
    });
    // clear the temporary UI bits
    setNewUserChat(null);
    setFullResponse(null);
  }, [fullResponse, queryClient, accountId, sessionId]);

  if (!isOpen) return;

  // if (!accountId) return;

  // if (!sessionId) return;

  const handleSendMessage = (message: ChatInputType) => {
    setNewUserChat(message.content);
  };

  const handleDoneStreaming = (fullResponse: string) => {
    setFullResponse(fullResponse);
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h3 className="font-semibold">General Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-600 rounded transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/** Insert chat messages here */}
        {accountId && sessionId && <MessageList sessionId={sessionId} />}
        {newUserChat && (
          <EventResponseStream onDoneStreaming={handleDoneStreaming} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          {sessionId && (
            <ChatInput
              isOpen={isOpen}
              onSendMessage={handleSendMessage}
              sessionId={sessionId}
            />
          )}
        </div>
      </div>
    </div>
  );
};
