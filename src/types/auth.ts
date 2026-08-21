export type User = {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
};

export type LoginRequest = {
  phone: string;
  name: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    message: string;
    code: string | number;
    details?: ApiErrorDetail[];
  };
};

export type AuthStatus = "unknown" | "authenticated" | "anonymous";
