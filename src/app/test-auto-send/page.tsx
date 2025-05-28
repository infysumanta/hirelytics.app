"use client";

import { useState } from "react";
import { SpeechRecognitionInput } from "@/components/interview/speech-recognition-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAutoSendPage() {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      console.log("[Test] Message sent:", messageInput, "at", timestamp);
      setMessages((prev) => [
        ...prev,
        `${messageInput} (sent at ${timestamp})`,
      ]);
      setMessageInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Auto-Send Feature Test
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Test the auto-send functionality with the following behavior:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mt-4">
              <li>• Type a message and stop typing for 5 seconds</li>
              <li>• A 10-second countdown timer will appear in the top-right corner</li>
              <li>• The message will auto-send after the countdown</li>
              <li>• Start typing again to cancel the auto-send</li>
              <li>• Click the × button on the timer to manually cancel</li>
              <li>• Voice input also triggers the same behavior</li>
            </ul>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Messages Display */}
            <div className="space-y-2">
              <h3 className="font-semibold">Sent Messages:</h3>
              <div className="min-h-[200px] max-h-[300px] overflow-y-auto bg-muted/30 rounded-lg p-4 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    No messages sent yet. Try typing something below!
                  </p>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className="bg-primary/10 rounded-lg p-3 border border-primary/20"
                    >
                      <p className="text-sm font-medium">Message #{index + 1}</p>
                      <p className="mt-1">{message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent at: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-2">
              <h3 className="font-semibold">Test Input:</h3>
              <SpeechRecognitionInput
                placeholder="Type your message and wait 5 seconds to see auto-send in action..."
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
                disabled={false}
                rows={3}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Test:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Type a message in the input field above</li>
                <li>2. Stop typing and wait for 5 seconds</li>
                <li>3. You'll see a countdown timer appear in the top-right corner</li>
                <li>4. The timer will count down from 10 to 0</li>
                <li>5. The message will be automatically sent when it reaches 0</li>
                <li>6. Try typing again during the countdown to cancel it</li>
                <li>7. Try clicking the × button on the timer to manually cancel</li>
                <li>8. Test with voice input using the microphone button</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
