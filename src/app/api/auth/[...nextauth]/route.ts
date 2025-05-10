import { handlers } from "@/lib/auth";

export const config = {
  runtime: "nodejs", // Ensures it runs in a Node.js serverless environment
};

export const { GET, POST } = handlers;
