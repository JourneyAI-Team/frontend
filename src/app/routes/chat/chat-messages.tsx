import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import useWebsocket, { ReadyState } from "react-use-websocket";
import type { QueryClient } from "@tanstack/react-query";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { ChatMessage } from "@/features/chat/components/chat-message";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/react-hook-form-wrapper";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

import {
  getMessagesQueryOptions,
  useMessages,
} from "@/features/chat/api/get-messages";
import { ChatMessageStream } from "@/features/chat/components/chat-message-stream";
import { NewChatMessage } from "@/features/chat/components/new-chat-messages";

import type { Events } from "@/types/api";
import { Paperclip, Send, AtSign, Globe, Layers } from "lucide-react";
import { API_KEY } from "@/utils/vars";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const accountId = params.accountId as string;
    const sessionId = params.sessionId as string;

    await queryClient.ensureQueryData(
      getMessagesQueryOptions({ accountId, sessionId })
    );
    return { accountId, sessionId };
  };

const chatInputSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});
type ChatInputType = z.infer<typeof chatInputSchema>;

type ChatMessageProp = {
  isUser: boolean;
  content?: string;
  outputType?: "message" | string;
};

export const ChatMessages = () => {
  const { accountId, sessionId } = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof loader>>
  >;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const [event, setEvent] = useState<Events | "idle">("idle");
  const [tokenStream, setTokenStream] = useState("");
  const [newMessages, setNewMessages] = useState<ChatMessageProp[]>([]);

  // Fetch messages from database
  const { data, isRefetching } = useMessages({
    queryParams: {
      accountId,
      sessionId,
    },
    queryConfig: {
      refetchOnWindowFocus: true,
    },
  });

  // Establish Websocket connection
  const WS_URL = `${import.meta.env.VITE_WS_URL}`;
  const { lastMessage, sendMessage, readyState } = useWebsocket(
    `${WS_URL}/ws/main`,
    {
      queryParams: {
        api_key: localStorage.getItem(API_KEY)!,
      },
    }
  );

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      if (data?.length === 0) {
        handleSendMessage({ content: "I'm ready to begin." });
      }
    }
  }, [readyState]);

  // Clear new messages when refetching or when session changes
  useEffect(() => {
    setNewMessages([]);
    setTokenStream("");
    setEvent("idle");
  }, [sessionId, isRefetching]);

  // Auto-scroll on new message or token stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newMessages, tokenStream]);

  // Typing effect stream handler
  useEffect(() => {
    if (!lastMessage?.data) return;

    try {
      const parsedLastMessage = JSON.parse(lastMessage.data);
      const delta = parsedLastMessage.data?.delta;
      const type = parsedLastMessage.data?.type;

      if (parsedLastMessage.event) {
        setEvent(parsedLastMessage.event);
      }

      // Handle token streaming for agent responses
      if (delta && parsedLastMessage.event === "agent_response") {
        setTokenStream((prev) => prev + delta);
      }

      // Final message complete — invalidate query to refetch messages
      if (type === "message" && parsedLastMessage.event === "agent_response") {
        // Clear the streaming state
        setTokenStream("");
        setEvent("idle");

        // Clear new messages since they'll be fetched from server
        setNewMessages([]);

        // Invalidate the messages query to refetch from server
        queryClient.invalidateQueries({
          queryKey: ["messages", accountId, sessionId],
        });
      }
    } catch (error) {
      console.error("Error parsing websocket message:", error);
    }
  }, [lastMessage, accountId, sessionId, queryClient]);

  // Send message to websocket
  const handleSendMessage = (data: ChatInputType) => {
    const messageContent = data.content?.trim();

    if (!messageContent) return;

    // Add user message to new messages immediately for immediate UI feedback
    const userMessage = {
      isUser: true,
      content: messageContent,
      outputType: "message" as const,
    };

    setNewMessages((prev) => [...prev, userMessage]);

    // Set processing state
    setEvent("processing_session");
    setTokenStream("");

    // Send message via websocket
    sendMessage(
      JSON.stringify({
        event: "ingest_message",
        data: {
          content: messageContent,
          session_id: sessionId,
        },
      })
    );

    // Clear the textarea directly
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[name="content"]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = "";
        textarea.style.height = "auto";
        // Trigger input event to update React state
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {data?.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {newMessages &&
            newMessages?.map((msg, index) => (
              <NewChatMessage
                key={`${msg.content}-${index}`}
                isUser={msg.isUser}
                content={msg.content}
              />
            ))}
          <ChatMessageStream event={event} tokenStream={tokenStream} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="sticky bottom-0 bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Form
            onSubmit={handleSendMessage}
            schema={chatInputSchema}
            options={{
              defaultValues: {
                content: "",
              },
            }}
          >
            {({ control }) => (
              <div className="relative">
                <FormField
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <textarea
                            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 pb-12 placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm min-h-[52px] max-h-32"
                            placeholder="Ask Journey AI or type @ to use an AI Extension"
                            rows={1}
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                const form = e.currentTarget.form;
                                if (form) {
                                  form.dispatchEvent(
                                    new Event("submit", {
                                      cancelable: true,
                                      bubbles: true,
                                    })
                                  );
                                }
                              }
                            }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = "auto";
                              target.style.height =
                                Math.min(target.scrollHeight, 128) + "px";
                            }}
                          />

                          {/* Action Buttons */}
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-0"
                              >
                                <Paperclip size={16} />
                                <span className="sr-only">Add attachment</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-0"
                              >
                                <Globe size={16} />
                                <span className="sr-only">Web search</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-0"
                              >
                                <AtSign size={16} />
                                <span className="sr-only">AI Extension</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-0"
                              >
                                <Layers size={16} />
                                <span className="sr-only">Templates</span>
                              </Button>
                            </div>

                            <div className="flex items-center">
                              <Button
                                type="submit"
                                size="sm"
                                disabled={
                                  !field.value?.trim() ||
                                  event === "processing_session" ||
                                  event === "agent_response"
                                }
                                className="h-8 w-8 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 p-0"
                              >
                                <Send size={16} className="text-white" />
                                <span className="sr-only">Send message</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </Form>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-500 mt-3">
            Journey AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};
