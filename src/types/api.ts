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
  lastMessage: ApiLastMessage | null;
  updatedAt: string;
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
