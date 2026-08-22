export type ApiUser = {
  _id: string;
  name: string;
  phone: string;
};

export type ApiLastMessage = {
  text?: string;
  sender?: string;
  createdAt?: string;
};

type ApiConversationBase = {
  _id: string;
  lastMessage?: ApiLastMessage | null;
  updatedAt?: string;
};

export type ApiDirectConversation = ApiConversationBase & {
  type: "direct";
  participant?: ApiUser;
};

export type ApiGroupConversation = ApiConversationBase & {
  type: "group";
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: ApiUser[];
};

export type ApiConversation = ApiDirectConversation | ApiGroupConversation;

export type ApiConversationListResponse = {
  data: ApiConversation[];
};

export type ApiDirectConversationCreated = {
  _id: string;
  participants: string[];
  createdAt: string;
};

export type CreateDirectRequest = {
  userId: string;
};

export type CreateGroupRequest = {
  name: string;
  participantIds: string[];
};

export type AddParticipantsRequest = {
  conversationId: string;
  userIds: string[];
};

export type RemoveParticipantRequest = {
  conversationId: string;
  userId: string;
};

export type PromoteAdminRequest = {
  conversationId: string;
  userId: string;
};

export type RenameGroupRequest = {
  conversationId: string;
  name: string;
};

export type ApiMessage = {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
};

export type ApiSocketMessage = {
  id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: number;
};

export type ApiMessageListResponse = {
  messages: ApiMessage[];
  hasMore: boolean;
};

export type MessagePageRequest = {
  conversationId: string;
  before?: string;
};

export type SendMessageRequest = {
  conversationId: string;
  text: string;
};
