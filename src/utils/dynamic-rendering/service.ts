import type React from "react";
import { createElement } from "react";
import { Components } from "./constants";

type ComponentList =
  | "Button"
  | "ChatBubble"
  | "Container"
  | "ChatLoading"
  | "ToolCallIndicatorBadge"
  | "FunctionToolCallAccordion"
  | "Paragraph";

export interface IComponent {
  type: ComponentList;
  data: {
    id: string;
    embeddedView?: IComponent;
    items?: Array<IComponent>;
    [key: string]: unknown;
  };
}

export const createPage = (data: IComponent | null): React.ReactNode => {
  if (!data) return null;

  const createComponent = (item: IComponent): React.ReactNode => {
    const { data, type } = item;
    const { items, embeddedView, id, ...rest } = data;
    return createElement(
      // TODO: This can be improved
      Components[type] as never,
      {
        // Pass all the props coming from the data object.
        ...rest,
        id,
        // Make each react key unique
        key: id,
      } as never,
      // Map if there are items, if not try to render the embedded view as children
      Array.isArray(items)
        ? items.map(renderer)
        : renderer(embeddedView ?? null)
    );
  };

  const renderer = (config: IComponent | null) => {
    if (!config) return null;

    return createComponent(config);
  };

  return renderer(data);
};
