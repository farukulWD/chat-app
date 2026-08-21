import axios from "axios";
import Cookies from "js-cookie";
import { isTokenExpired } from "@/lib/utils";

const instance = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
});

instance.interceptors.request.use(async (config) => {
  const accessToken = Cookies.get("ch-app-acc-token");

  if (accessToken && isTokenExpired(accessToken)) {
    // TODO: Need to logout
  }

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { instance };
