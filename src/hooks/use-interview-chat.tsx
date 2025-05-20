"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SessionStateManager } from "@/lib/session-state-manager";

export interface Message {
  id: string;
  text: string;
  sender: "ai" | "user" | "system";
  timestamp: Date;
  isCompletionMessage?: boolean;
  audioUrl?: string; // URL to the audio file for TTS - directly from server
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
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const hasInitializedRef = useRef(false);

  // Audio URLs are now provided directly by the server
  // No need for client-side refreshing

  useEffect(() => {
    const initializeInterview = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      // Dispatch a custom event to signal chat initialization
      document.dispatchEvent(new Event("chat-initializing"));

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
          // Debug the received chat history
          console.log("[Interview Chat] Received chat history from server", {
            count: data.chatHistory.length,
            firstMessage: data.chatHistory[0]
              ? {
                  text: typeof data.chatHistory[0].text,
                  sender: data.chatHistory[0].sender,
                  hasAudioUrl: !!data.chatHistory[0].audioUrl,
                }
              : null,
          });

          // Load existing chat history
          const formattedMessages: Message[] = data.chatHistory.map(
            (
              msg: {
                text?: string;
                sender?: "ai" | "user" | "system";
                timestamp?: string;
                audioUrl?: string;
                audioS3Key?: string;
                audioS3Bucket?: string;
              },
              index: number,
            ) => {
              // Debug first message in detail
              if (index === 0) {
                console.log(`[Interview Chat] Processing message ${index}:`, {
                  properties: Object.keys(msg),
                  text: typeof msg.text,
                  audioUrl: msg.audioUrl
                    ? `${msg.audioUrl.substring(0, 30)}...`
                    : "undefined",
                });
              }

              return {
                id: `history-${index}`,
                text: msg.text || "", // Ensure text is never undefined
                sender: msg.sender || "system", // Default to system if missing
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                isCompletionMessage:
                  (msg.text &&
                    (msg.text.includes("interview is now complete") ||
                      msg.text.includes("Thank you for participating"))) ||
                  false,
                audioUrl: msg.audioUrl || undefined, // Keep the audioUrl if present
              };
            },
          );

          setMessages(formattedMessages);

          // Check if the interview is already completed
          if (data.isCompleted) {
            console.log("[Chat Hook] Loaded completed interview");
            setIsCompleted(true);
            setIsUserTurn(false);
            // Clear any saved state since interview is completed
            SessionStateManager.clearState(applicationId);
          } else {
            // Try to load the saved state first
            const savedState = SessionStateManager.loadState(applicationId);

            if (savedState && typeof savedState.isUserTurn === "boolean") {
              console.log(
                "[Chat Hook] Restoring user turn state from session:",
                savedState.isUserTurn,
              );
              setIsUserTurn(savedState.isUserTurn);
            } else {
              // Fall back to analyzing the last message
              const lastMessage =
                formattedMessages[formattedMessages.length - 1];
              // If the last message was from AI, it's the user's turn
              // If the last message was from the user, we're waiting for AI response
              const isUsersTurn = lastMessage && lastMessage.sender === "ai";
              console.log(
                "[Chat Hook] Setting user turn based on last message:",
                isUsersTurn,
              );
              setIsUserTurn(isUsersTurn);

              // Save the determined state
              SessionStateManager.saveState(applicationId, {
                isUserTurn: isUsersTurn,
                lastMsgId: lastMessage?.id,
              });
            }
          }

          // Build conversation history for context - filter out system messages for AI context
          conversationHistoryRef.current = formattedMessages
            .filter((msg) => msg.sender !== "system") // Exclude system messages from AI context
            .map((msg) => ({
              role: msg.sender === "ai" ? "assistant" : "user",
              content: msg.text,
            }));

          // Chat history has been loaded
          toast.info(
            `Continuing previous interview with ${formattedMessages.length} messages`,
          );
        } else {
          // Start new chat with initial greeting
          const initialMessage: Message = {
            id: Date.now().toString(),
            text: data.greeting,
            sender: "ai",
            timestamp: new Date(),
            audioUrl: data.audioUrl, // Use the direct audio URL from the response
          };

          setMessages([initialMessage]);

          // Add to conversation history
          conversationHistoryRef.current = [
            {
              role: "assistant",
              content: data.greeting,
            },
          ];

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
          text: `Hello! I'm Hirelytics AI, your interviewer for the position. Let's start with you introducing yourself briefly.`,
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

  // The server now provides complete audio URLs directly
  // No need to load audio URLs separately

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

    // Store the message content before clearing
    const sentMessage = messageInput.trim();

    console.log("sendMessage hook called, clearing input:", {
      originalMessage: sentMessage,
      timestamp: new Date().toISOString(),
    });

    // Dispatch a custom event to signal chat activity
    document.dispatchEvent(new Event("chat-message-sent"));

    // Clear input immediately before any other state updates
    setMessageInput("");
    console.log(messageInput);

    // Now continue with the message sending process
    setIsLoading(true);
    setIsUserTurn(false);

    // Save state to session storage that it's not user's turn
    SessionStateManager.saveState(applicationId, {
      isUserTurn: false,
    });

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: sentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Update messages state with the stored message content
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // Check for special command to force completion
      if (
        sentMessage.toLowerCase() === "/complete" ||
        sentMessage.toLowerCase() === "/end"
      ) {
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

      // Get the latest message from the response
      const latestAiMessage =
        data.updatedChatHistory?.[data.updatedChatHistory.length - 1];

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
        isCompletionMessage: data.isCompleted,
        // Use the direct audio URL from the response for immediate playback
        audioUrl: data.audioUrl || latestAiMessage?.audioUrl,
      };

      // When the interview is completed, also add a system message with the completion message
      if (data.isCompleted && data.completionMessage) {
        const systemMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: data.completionMessage,
          sender: "system",
          timestamp: new Date(),
          isCompletionMessage: true,
        };

        setMessages((prevMessages) => [
          ...prevMessages,
          aiMessage,
          systemMessage,
        ]);

        // Set the interview as completed
        setIsCompleted(true);

        // Don't set user turn to true since interview is completed
      } else {
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        // After AI responds, it's user's turn again
        setIsUserTurn(true);

        // Save state to session storage
        SessionStateManager.saveState(applicationId, {
          isUserTurn: true,
          lastMsgId: aiMessage.id,
        });
      }
    } catch (error) {
      console.error("Error in interview chat:", error);
      toast.error("Failed to get AI response");

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, this is Hirelytics AI. I encountered an error. Let's continue our conversation. What were you saying?",
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
    // Dispatch a custom event to signal chat initialization
    document.dispatchEvent(new Event("chat-initializing"));

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
        audioUrl: data.audioUrl, // Use the direct audio URL from the response
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
        text: `Hello, I'm Hirelytics AI. Let's restart our interview. Please introduce yourself briefly.`,
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
