import type { Profile } from "./models";

export type AuthTokens = {
  access_token: string;
  api_key: string;
};

/**
 * Response from login and register endpoints
 */
export type AuthResponse = AuthTokens & { token_type: string };

export type ProfileRead = Omit<Profile, "id" | "created_at">;

export type SenderType = "assistant" | "user";

/**
 * From websockets events data type
 */
export type EventDataType =
  | "agent_switch"
  | "done"
  | "token"
  | "message"
  | "tool_call"
  | "tool_output"
  | "handoff"
  | "error";

export type Events =
  | "processing_session"
  | "agent_response"
  | "connection_established";

export type BaseEventResponse<TData = { type: EventDataType }> = {
  event: Events;
  data: TData;
};

export type ConnectionEstablishedEvent = {
  connection_id: string;
  user_id: string;
  status: "connected" | "disconnected";
};

export type ErrorEvent = {
  message: string;
};

export type ProcessingSessionEvent = {
  session_id: string;
  assistant_id: string;
};

export type AgentResponseTokenStreamEvent = {
  type: "token";
  delta: string;
};

export type AgentResponseAgentSwitchEvent = {
  type: "agent_switch";
  agent: string;
};

export type AgentResponseMessageOutputEvent = {
  type: "message";
  status: "completed";
  role: "assistant";
  content: {
    annotations: unknown[];
    text: string;
    type: "output_text";
  }[];
};

export type AgentResponseToolCallEvent = {
  type: "tool_call";
  tool_call: {
    id: string;
    name: string;
    args: Record<string, unknown>;
  };
};

export type AgentResponseToolCallOutputEvent = {
  type: "tool_output";
  tool: {
    id: string;
    call_id: string;
    raw_output: string;
    output: string;
  };
};

export type AgentResponseHandoffRequestedEvent = {
  type: "handoff";
  action: "requested";
  from: string;
  to: string;
};

export type AgentResponseHandoffOccuredEvent = {
  type: "handoff";
  action: "completed";
  from: string;
  to: string;
};

export type AgentResponseDoneEvent = {
  type: "done";
};

export type AgentResponseErrorEvent = {
  type: "error";
  session_id: string;
};
