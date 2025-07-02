import type { Reducer } from "react";
import type {
  Events,
  EventDataType,
  BaseEventResponse,
  AgentResponseTokenStreamEvent,
  AgentResponseMessageOutputEvent,
  AgentResponseFunctionCallEvent,
  // AgentResponseMessageOutputEvent,
} from "@/types/api";
import type { IComponent } from "./dynamic-rendering/service";
import { v4 as uuid } from "uuid";

export type ParsedEvent = {
  event: Events;
  data: string;
  type: EventDataType | null;
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

    if (agentResponseData.type === "file_search_call") {
      return {
        // Don't render anything for file_search_call, only add an indicator that
        // we're searching through the files
        event: event.event,
        data: "",
        type: agentResponseData.type,
      };
    }
  }

  if (event.event === "connection_established") {
    return {
      event: event.event,
      data: "",
      type: null,
    };
  }

  if (event.event === "processing_session") {
    return {
      event: event.event,
      data: "",
      type: null,
    };
  }
  // Ignore other events for now and return null
  return null;
};

type DynamicComponent = IComponent & {
  eventType: EventDataType;
  persist: boolean;
};

type State = {
  components: DynamicComponent[];
  current: DynamicComponent | null;
};

export const reducer: Reducer<State, BaseEventResponse> = (state, event) => {
  const components = state.components.filter((f) => f.persist);
  const agentResponseData = event.data;
  if (event.event === "connection_established") {
    return {
      components: [],
      current: null,
    };
  }
  if (event.event === "processing_session") {
    const newComponent: DynamicComponent = {
      type: "ChatLoading",
      persist: false,
      eventType: agentResponseData.type,
      data: {
        id: uuid(),
      },
    };
    return {
      components: [...components, newComponent],
      current: null,
    };
  }
  if (event.event === "agent_response") {
    switch (agentResponseData.type) {
      case "agent_switch": {
        const newComponent: DynamicComponent = {
          type: "ChatLoading",
          persist: false,
          eventType: agentResponseData.type,
          data: {
            id: uuid(),
          },
        };
        return {
          components: [...components, newComponent],
          current: null,
        };
      }
      case "token": {
        const data = agentResponseData as AgentResponseTokenStreamEvent;
        const newComponent: DynamicComponent = {
          type: "ChatBubble",
          eventType: agentResponseData.type,
          persist: true,
          data: {
            id: uuid(),
            content: data.delta,
            isUser: false,
            isStreaming: true,
          },
        };
        // append token to current streaming bubble
        const updated = state.current
          ? {
              ...state.current,
              data: {
                ...state.current.data,
                id: uuid(),
                content: state.current.data.content + data.delta,
              },
            }
          : newComponent;

        return {
          components,
          current: updated,
        };
      }
      case "file_search_call": {
        // const data = agentResponseData as AgentResponseFileSearchCallEvent;
        const newComponent: DynamicComponent = {
          type: "ToolCallIndicatorBadge",
          persist: true,
          eventType: agentResponseData.type,
          data: {
            id: uuid(),
            text: "Searching files...",
          },
        };
        return {
          components,
          current: newComponent,
        };
      }
      case "message": {
        const data = agentResponseData as AgentResponseMessageOutputEvent;
        const newComponent: DynamicComponent = {
          type: "ChatBubble",
          eventType: agentResponseData.type,
          persist: true,
          data: {
            id: uuid(),
            content: data.content.map((d) => d.text).join(""),
            isUser: false,
            isStreaming: false,
          },
        };

        return {
          components,
          current: newComponent,
        };
      }
      case "done": {
        // // 1) take whatever persisted ones you already had…
        // const kept = state.components.filter((f) => f.persist);

        // // 2) if there’s a current bubble, finalize it and append it
        // const finalized = state.current
        //   ? {
        //       ...state.current,
        //       data: { ...state.current.data, isStreaming: false },
        //     }
        //   : null;

        // return {
        //   components: finalized ? [...kept, finalized] : kept,
        //   current: null,
        // };
        return {
          components,
          current: null,
        };
      }
    }
  }

  // Loading by default
  // 1) take whatever persisted ones you already had…
  const kept = state.components.filter((f) => f.persist);

  // 2) if there’s a current bubble, finalize it and append it
  const finalized = state.current
    ? {
        ...state.current,
        data: { ...state.current.data, isStreaming: false },
      }
    : null;

  return {
    components: finalized ? [...kept, finalized] : kept,
    current: null,
  };
};

export const test = (
  event: BaseEventResponse,
  prevComponent: IComponent | null
): IComponent | null => {
  const agentResponseData = event.data;
  if (event.event === "connection_established") {
    return null;
  }
  if (event.event === "agent_response") {
    switch (agentResponseData.type) {
      case "agent_switch": {
        return {
          type: "ChatLoading",
          data: {
            id: uuid(),
          },
        };
      }
      case "file_search_call": {
        return {
          type: "ToolCallIndicatorBadge",
          data: {
            id: uuid(),
            text: "Searched through files",
          },
        };
      }
      case "token": {
        const data = agentResponseData as AgentResponseTokenStreamEvent;

        return {
          type: "ChatBubble",
          data: {
            id: uuid(),
            content: (prevComponent?.data.content || "") + data.delta,
            isUser: false,
            isStreaming: true,
          },
        };
      }
      case "function_call": {
        const data = agentResponseData as AgentResponseFunctionCallEvent;
        const args = JSON.parse(data.arguments) as {
          artifact_type: string;
          title: string;
          body: string;
        };
        return {
          type: "FunctionToolCallAccordion",
          data: {
            id: uuid(),
            title: `${args.artifact_type} | ${args.title}`,
            items: [
              {
                type: "Paragraph",
                data: {
                  id: uuid(),
                  text: args.body,
                },
              },
            ],
          },
        };
      }
      case "web_search_call": {
        // const data = agentResponseData as AgentResponseWebSearchCallEvent;
        return {
          type: "ToolCallIndicatorBadge",
          data: {
            id: uuid(),
            text: "Searched the Web",
          },
        };
      }
    }
  }
  return null;
};
