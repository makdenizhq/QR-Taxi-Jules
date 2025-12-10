// Backend API URL Configuration
// 1. If VITE_API_URL is set (even if empty string), use it.
// 2. If not set, check if we are in Development mode -> use localhost.
// 3. If not set and in Production mode -> use empty string (relative path for Nginx proxy).

const envUrl = import.meta.env.VITE_API_URL;

export const API_URL = (envUrl !== undefined && envUrl !== null)
  ? envUrl
  : (import.meta.env.DEV ? "http://localhost:3001" : "");
