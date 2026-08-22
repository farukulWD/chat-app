import axios from "axios";
import { getToken } from "@/lib/auth-token";
import { forceLogout } from "@/lib/force-logout";
import { isTokenExpired } from "@/lib/utils";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 90000,
});

instance.interceptors.request.use((config) => {
  const accessToken = getToken();

  if (accessToken && isTokenExpired(accessToken)) {
    forceLogout();
    return Promise.reject(new Error("Session expired"));
  }

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error?.response?.data?.error?.code;

    if (
      error?.response?.status === 401 ||
      code === "INVALID_TOKEN" ||
      code === "NO_TOKEN"
    ) {
      forceLogout();
    }

    return Promise.reject(error);
  },
);

export { instance };
