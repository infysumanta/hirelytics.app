"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Mic, 
  Send, 
  Volume2, 
  Timer, 
  Settings,
  CheckCircle,
  Circle
} from "lucide-react";
import { useAutoSpeechFlow } from "@/hooks/use-auto-speech-flow";
import { AutoSpeechFlowSettings } from "./auto-speech-flow-settings";

/**
 * Demo component to showcase the auto speech flow functionality
 */
export function AutoSpeechFlowDemo() {
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Mock send message function
  const handleSendMessage = () => {
    setMessageCount(prev => prev + 1);
    setIsUserTurn(false);
    
    // Simulate AI response after 2 seconds
    setTimeout(() => {
      setIsUserTurn(true);
    }, 2000);
  };

  // Auto speech flow hook
  const autoSpeechFlow = useAutoSpeechFlow(isUserTurn, handleSendMessage, {
    autoMicEnabled: true,
    autoSendEnabled: true,
    autoSendDelay: 5000,
    minSpeechDuration: 1000,
  });

  // Simulate audio playback
  const simulateAudioPlayback = () => {
    setIsAudioPlaying(true);
    document.dispatchEvent(new CustomEvent("audio-playback-started"));
    
    setTimeout(() => {
      setIsAudioPlaying(false);
      document.dispatchEvent(new CustomEvent("audio-playback-ended"));
    }, 3000);
  };

  // Simulate speech recognition
  const simulateSpeechRecognition = () => {
    // Start speech
    document.dispatchEvent(new CustomEvent("speech-recognition-status", {
      detail: { isListening: true }
    }));
    
    setTimeout(() => {
      // End speech
      document.dispatchEvent(new CustomEvent("speech-recognition-status", {
        detail: { isListening: false }
      }));
    }, 2000);
  };

  const getFlowStepStatus = (step: string) => {
    switch (step) {
      case "audio-ends":
        return !isAudioPlaying && autoSpeechFlow.config.autoMicEnabled;
      case "mic-auto-activates":
        return autoSpeechFlow.isAutoMicActive;
      case "user-speaks":
        return true; // Always available
      case "auto-send":
        return autoSpeechFlow.isAutoSendPending;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto Speech Flow Demo</CardTitle>
          <CardDescription>
            Experience the automatic speech flow: Audio ends → Mic activates → User speaks → Auto-send after pause
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Audio</div>
                  <Badge variant={isAudioPlaying ? "default" : "secondary"}>
                    {isAudioPlaying ? "Playing" : "Stopped"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Microphone</div>
                  <Badge variant={autoSpeechFlow.isAutoMicActive ? "default" : "secondary"}>
                    {autoSpeechFlow.isAutoMicActive ? "Auto Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Auto Send</div>
                  <Badge variant={autoSpeechFlow.isAutoSendPending ? "destructive" : "secondary"}>
                    {autoSpeechFlow.isAutoSendPending 
                      ? `${autoSpeechFlow.autoSendCountdown}s` 
                      : "Inactive"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                  <Badge variant="outline">
                    {messageCount} sent
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Flow Steps */}
          <div>
            <h4 className="font-medium mb-4">Auto Speech Flow Steps</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {getFlowStepStatus("audio-ends") ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">1. AI Audio Ends</div>
                  <div className="text-xs text-muted-foreground">
                    When AI finishes speaking, trigger auto-microphone activation
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={simulateAudioPlayback}
                  disabled={isAudioPlaying}
                >
                  {isAudioPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isAudioPlaying ? "Playing..." : "Simulate Audio"}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {getFlowStepStatus("mic-auto-activates") ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">2. Microphone Auto-Activates</div>
                  <div className="text-xs text-muted-foreground">
                    Microphone automatically starts listening for user speech
                  </div>
                </div>
                <Badge variant={autoSpeechFlow.config.autoMicEnabled ? "default" : "secondary"}>
                  {autoSpeechFlow.config.autoMicEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {getFlowStepStatus("user-speaks") ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">3. User Speaks</div>
                  <div className="text-xs text-muted-foreground">
                    User provides their response through speech recognition
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={simulateSpeechRecognition}
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Simulate Speech
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {getFlowStepStatus("auto-send") ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">4. Auto-Send After Pause</div>
                  <div className="text-xs text-muted-foreground">
                    Message automatically sends after {autoSpeechFlow.config.autoSendDelay / 1000}s of silence
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={autoSpeechFlow.config.autoSendEnabled ? "default" : "secondary"}>
                    {autoSpeechFlow.config.autoSendEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {autoSpeechFlow.isAutoSendPending && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={autoSpeechFlow.cancelAutoSend}
                    >
                      Cancel ({autoSpeechFlow.autoSendCountdown}s)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Flow Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Customize the auto speech flow behavior
              </p>
            </div>
            <AutoSpeechFlowSettings
              config={autoSpeechFlow.config}
              onConfigChange={autoSpeechFlow.updateConfig}
              isAutoSendPending={autoSpeechFlow.isAutoSendPending}
              autoSendCountdown={autoSpeechFlow.autoSendCountdown}
              onCancelAutoSend={autoSpeechFlow.cancelAutoSend}
            />
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMessageCount(0);
                setIsAudioPlaying(false);
                autoSpeechFlow.resetFlow();
              }}
            >
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
