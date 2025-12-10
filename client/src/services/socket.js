import { io } from "socket.io-client";
import { API_URL } from "../config";

// Connect to the backend using the configured URL
export const socket = io(API_URL);
