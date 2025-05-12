"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export interface Message {
  id: string;
  text: string;
  sender: "ai" | "user" | "system";
  timestamp: Date;
  isCompletionMessage?: boolean;
}

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseInterviewChatProps {
  applicationId: string;
}

interface UseInterviewChatReturn {
  messages: Message[];
  messageInput: string;
  setMessageInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  isLoading: boolean;
  isUserTurn: boolean;
  isInitializing: boolean;
  restartInterview: () => Promise<void>;
  isCompleted: boolean;
}

export function useInterviewChat({
  applicationId,
}: UseInterviewChatProps): UseInterviewChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]); // Initialize interview with job and resume context or load existing chat
  const hasInitializedRef = useRef(false); // Track if initialization has been done
  useEffect(() => {
    const initializeInterview = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      setIsInitializing(true);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/interview/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to initialize interview");
        }

        const data = await response.json();

        if (
          data.hasExistingChat &&
          data.chatHistory &&
          data.chatHistory.length > 0
        ) {
          // Load existing chat history
          const formattedMessages: Message[] = data.chatHistory.map(
            (
              msg: {
                text: string;
                sender: "ai" | "user" | "system";
                timestamp: string;
              },
              index: number,
            ) => ({
              id: `history-${index}`,
              text: msg.text,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp),
              isCompletionMessage:
                msg.text.includes("interview is now complete") ||
                msg.text.includes("Thank you for participating"),
            }),
          );

          setMessages(formattedMessages);

          // Check if the interview is already completed
          if (data.isCompleted) {
            console.log("[Chat Hook] Loaded completed interview");
            setIsCompleted(true);
            setIsUserTurn(false);
          } else {
            // Set user turn to true only if the interview is not completed
            setIsUserTurn(true);
          }

          // Build conversation history for context - filter out system messages for AI context
          conversationHistoryRef.current = formattedMessages
            .filter((msg) => msg.sender !== "system") // Exclude system messages from AI context
            .map((msg) => ({
              role: msg.sender === "ai" ? "assistant" : "user",
              content: msg.text,
            }));

          console.log(
            "Loaded existing chat history:",
            formattedMessages.length,
            "messages",
          );
          toast.info(
            `Continuing previous interview with ${formattedMessages.length} messages`,
          );
        } else {
          // Start new chat with returned chat history which should include system message and initial greeting
          if (data.chatHistory && data.chatHistory.length > 0) {
            const formattedMessages: Message[] = data.chatHistory.map(
              (
                msg: {
                  text: string;
                  sender: "ai" | "user" | "system";
                  timestamp: string | Date;
                },
                index: number,
              ) => ({
                id: `new-${index}`,
                text: msg.text,
                sender: msg.sender,
                timestamp: new Date(msg.timestamp),
              }),
            );

            setMessages(formattedMessages);

            // Build conversation history for context - filter out system messages
            conversationHistoryRef.current = formattedMessages
              .filter((msg) => msg.sender !== "system") // Exclude system messages from AI context
              .map((msg) => ({
                role: msg.sender === "ai" ? "assistant" : "user",
                content: msg.text,
              }));
          } else {
            // Fallback to just using the greeting if for some reason chatHistory is not included
            const initialMessage: Message = {
              id: Date.now().toString(),
              text: data.greeting,
              sender: "ai",
              timestamp: new Date(),
            };

            setMessages([initialMessage]);

            // Add to conversation history
            conversationHistoryRef.current = [
              {
                role: "assistant",
                content: data.greeting,
              },
            ];
          }

          toast.success("Interview session initialized");
          // After initialization, it's user's turn
          setIsUserTurn(true);
        }
      } catch (error) {
        console.error("Error initializing interview:", error);
        toast.error("Failed to initialize interview. Using fallback greeting.");

        // Fallback message if initialization fails
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: `Hello! I'm your AI interviewer for the position. Let's start with you introducing yourself briefly.`,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages([fallbackMessage]);
        conversationHistoryRef.current = [
          {
            role: "assistant",
            content: fallbackMessage.text,
          },
        ];
        setIsUserTurn(true);
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [applicationId]);

  // Update conversation history when messages change
  useEffect(() => {
    // Only take the last message to add to history
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender !== "system") {
      const role = lastMessage.sender === "ai" ? "assistant" : "user";

      // Check if this message is already in the history to avoid duplicates
      const lastHistoryMessage =
        conversationHistoryRef.current.length > 0
          ? conversationHistoryRef.current[
              conversationHistoryRef.current.length - 1
            ]
          : null;

      if (
        !lastHistoryMessage ||
        lastHistoryMessage.content !== lastMessage.text
      ) {
        conversationHistoryRef.current.push({
          role,
          content: lastMessage.text,
        });
      }
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (messageInput.trim() === "" || !isUserTurn || isLoading) return;

    setIsLoading(true);
    setIsUserTurn(false);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    const sentMessage = messageInput.trim();
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessageInput("");

    try {
      // Debug: Check for special command to force completion
      if (
        sentMessage.toLowerCase() === "/complete" ||
        sentMessage.toLowerCase() === "/end"
      ) {
        console.log(
          "[Chat Hook Debug] Forcing interview completion via",
          sentMessage,
        );

        // Mock a completion response
        const mockCompletionMessage =
          "Your interview has been successfully completed! Your responses have been recorded and will be analyzed. Thank you for participating in this interview process with us.";

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "That concludes the interview. Thank you for your time and participation. Your responses will be analyzed, and you'll receive feedback shortly.",
          sender: "ai",
          timestamp: new Date(),
          isCompletionMessage: true,
        };

        const systemMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: mockCompletionMessage,
          sender: "system",
          timestamp: new Date(),
          isCompletionMessage: true,
        };

        setMessages((prevMessages) => [
          ...prevMessages,
          aiMessage,
          systemMessage,
        ]);
        setIsCompleted(true);
        return;
      }

      // Regular API call
      const response = await fetch("/api/ai/interview/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          message: sentMessage,
          history: conversationHistoryRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get interview response");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
        isCompletionMessage: !!data.isCompleted,
      };

      if (data.isCompleted && data.completionMessage) {
        console.log(
          "[Chat Hook] Received completion message:",
          data.completionMessage,
        );

        // If this is the final response, add a system completion message too
        setMessages((prevMessages) => [
          ...prevMessages,
          aiMessage,
          {
            id: (Date.now() + 2).toString(),
            text: data.completionMessage,
            sender: "system",
            timestamp: new Date(),
            isCompletionMessage: true,
          },
        ]);

        // Set the interview as completed
        console.log("[Chat Hook] Setting isCompleted to true");
        setIsCompleted(true);

        // Don't set user turn to true since interview is completed
      } else {
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        // After AI responds, it's user's turn again
        setIsUserTurn(true);
      }
    } catch (error) {
      console.error("Error in interview chat:", error);
      toast.error("Failed to get AI response");

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Let's continue our conversation. What were you saying?",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsUserTurn(true);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, messageInput, isUserTurn, isLoading]);

  // Function to restart the interview
  const restartInterview = useCallback(async () => {
    setIsInitializing(true);
    setIsLoading(true);
    setMessages([]);
    conversationHistoryRef.current = [];
    setIsCompleted(false); // Reset completion state
    hasInitializedRef.current = false; // Allow reinitialization

    toast.info("Restarting interview...");

    try {
      // Clear existing chat history from database
      const clearResponse = await fetch(
        `/api/ai/interview/history?applicationId=${applicationId}`,
        {
          method: "DELETE",
        },
      );

      if (!clearResponse.ok) {
        console.warn(
          "Failed to clear interview history, continuing with restart",
        );
      }

      // Re-initialize the interview
      const response = await fetch("/api/ai/interview/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          forceRestart: true, // Add flag to force restart
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to restart interview");
      }

      const data = await response.json();

      // Start new chat with initial greeting
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: data.greeting,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages([initialMessage]);

      // Add to conversation history
      conversationHistoryRef.current = [
        {
          role: "assistant",
          content: data.greeting,
        },
      ];

      // After initialization, it's user's turn
      setIsUserTurn(true);
      toast.success("Interview restarted successfully!");
    } catch (error) {
      console.error("Error restarting interview:", error);
      toast.error("Failed to restart interview. Using fallback greeting.");

      // Fallback message if restart fails
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: `Let's restart our interview. Please introduce yourself briefly.`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages([fallbackMessage]);
      conversationHistoryRef.current = [
        {
          role: "assistant",
          content: fallbackMessage.text,
        },
      ];
      setIsUserTurn(true);
    } finally {
      setIsInitializing(false);
      setIsLoading(false);
    }
  }, [applicationId]);

  return {
    messages,
    messageInput,
    setMessageInput,
    sendMessage,
    isLoading,
    isUserTurn,
    isInitializing,
    restartInterview,
    isCompleted,
  };
}
