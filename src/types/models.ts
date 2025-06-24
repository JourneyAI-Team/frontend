export type Base = {
  id: string;
  created_at: string;
};

export type Account = {
  name: string;
  description: string;
  organization_id: string;
  user_id: string;
};

export type Artifact = {
  type: string;
  title: string;
  is_parent: boolean;
  body: string;

  user_id: string | null;
  organization_id: string | null;
  session_id: string | null;
  parent_id: string | null;
  artifact_id: string | null;
  assistant_id: string | null;

  account_id: string | null;
};

export type ToolType = "internal" | "external";

export type AssistantTool = {
  name: string;
  type: ToolType;
};

export type AssistantToolConfig = {
  tools?: AssistantTool[];
  vector_store_ids: string[] | null;
};

export type Assistant = {
  name: string;
  internal_name: string;
  description: string;
  category: string;
  tool_config: AssistantToolConfig;
  testing: boolean;
  version: string;
  developer_prompt: string;
  model: string;
};

export type Opportunity = {
  name: string;
  amount: number;
  stage: string;
  organization_id: string;
  account_id: string;
  user_id: string;
};

export type Contact = {
  email: string;
  first_name: string;
  last_name: string | null;
  title: string | null;

  organization_id: string;
  account_id: string;
  user_id: string;
};

export type SenderType = "assistant" | "user";

export type AttachmentMetadata = {
  type: string;
  name: string | null;
  mimetype: string | null;
  size: number | null;
};

export type InputMessageSchema = {
  content: string;
};

export type MessageOutputBase = {
  id: string;
  type: MessageOutputType;
  status: "completed";
  [key: string]: unknown;
};

export type MessageOutputType =
  | "message"
  | "file_search_call"
  | "web_search_call";

export type MessageOutputMessageType = {
  role: "assistant";
  content: MessageOutputContent[];
} & MessageOutputBase;

export type MessageOutputContent = {
  type: "output_text";
  text: string;
  annotations: unknown[];
};

export type Message<TMessageOutput = MessageOutputBase> = {
  output: TMessageOutput | null;
  input: InputMessageSchema | null;
  sender: SenderType;
  attachments: AttachmentMetadata[];
  user_id: string;
  organization_id: string;
  assistant_id: string;
  session_id: string;
  account_id: string;
};

export type User = {
  email: string;
  role: string;
  organization: string;
  profile: Profile;
};

export type Profile = {
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string | null;
  birth_date: string | null;
  bio: string | null;
  interests: string[] | null;
  location: string | null;
  occupation: string | null;
  personality_traits: string[] | null;
  communication_style: string | null;
  goals: string[] | null;
  preferences: Record<string, unknown> | null;
  assistant_notes: Record<string, unknown> | null;
  favorite_assistants: string[] | null;
};

export type Session = {
  title: string;
  summary: string | null;
  user_id: string;
  organization_id: string;
  assistant_id: string;
  account_id: string;
};
