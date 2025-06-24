import type {
  Events,
  EventDataType,
  BaseEventResponse,
  AgentResponseTokenStreamEvent,
  AgentResponseMessageOutputEvent,
} from "@/types/api";

export type ParsedEvent = {
  event: Events;
  data: string;
  type: EventDataType;
} | null;

export const handleEventStream = (event: BaseEventResponse): ParsedEvent => {
  // Handle agent response token stream

  if (event.event === "agent_response") {
    // Get the data
    const agentResponseData = event.data;
    // Check the type of the data

    // If it's a token, then it will render the word by word like a typewriter, delta returns the word
    if (agentResponseData.type === "token") {
      const data = agentResponseData as AgentResponseTokenStreamEvent;
      return {
        event: event.event,
        data: data.delta,
        type: agentResponseData.type,
      };
    }

    // If it's a message return the joined message content
    if (agentResponseData.type === "message") {
      const data = agentResponseData as AgentResponseMessageOutputEvent;
      return {
        event: event.event,
        data: data.content.map((d) => d.text).join(""),
        type: data.type,
      };
    }

    if (agentResponseData.type === "done") {
      return {
        event: event.event,
        data: "",
        type: agentResponseData.type,
      };
    }
  }

  // Ignore other events for now and return null
  return null;
};
