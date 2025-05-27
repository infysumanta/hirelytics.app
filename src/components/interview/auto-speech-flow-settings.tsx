"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Mic, Send, Timer, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AutoSpeechFlowConfig {
  autoMicEnabled: boolean;
  autoSendEnabled: boolean;
  autoSendDelay: number;
  minSpeechDuration: number;
}

interface AutoSpeechFlowSettingsProps {
  config: AutoSpeechFlowConfig;
  onConfigChange: (newConfig: Partial<AutoSpeechFlowConfig>) => void;
  isAutoSendPending?: boolean;
  autoSendCountdown?: number;
  onCancelAutoSend?: () => void;
}

export function AutoSpeechFlowSettings({
  config,
  onConfigChange,
  isAutoSendPending = false,
  autoSendCountdown = 0,
  onCancelAutoSend,
}: AutoSpeechFlowSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAutoMicToggle = (enabled: boolean) => {
    onConfigChange({ autoMicEnabled: enabled });
  };

  const handleAutoSendToggle = (enabled: boolean) => {
    onConfigChange({ autoSendEnabled: enabled });
  };

  const handleAutoSendDelayChange = (value: number[]) => {
    onConfigChange({ autoSendDelay: value[0] * 1000 }); // Convert to milliseconds
  };

  const handleMinSpeechDurationChange = (value: number[]) => {
    onConfigChange({ minSpeechDuration: value[0] * 1000 }); // Convert to milliseconds
  };

  return (
    <>
      {/* Auto-send countdown indicator */}
      {isAutoSendPending && autoSendCountdown > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Auto-sending in {autoSendCountdown}s
                  </span>
                </div>
                {onCancelAutoSend && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelAutoSend}
                    className="h-7 px-2 text-xs border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-dashed"
            title="Auto Speech Flow Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Auto Speech Flow Settings
            </DialogTitle>
            <DialogDescription>
              Configure automatic microphone and message sending behavior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Auto Microphone */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Auto Microphone
                  {config.autoMicEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      Enabled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Automatically activate microphone when AI finishes speaking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-mic"
                    checked={config.autoMicEnabled}
                    onCheckedChange={handleAutoMicToggle}
                  />
                  <Label htmlFor="auto-mic" className="text-sm">
                    Enable auto microphone
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Auto Send */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Auto Send
                  {config.autoSendEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      Enabled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Automatically send message after you stop speaking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-send"
                    checked={config.autoSendEnabled}
                    onCheckedChange={handleAutoSendToggle}
                  />
                  <Label htmlFor="auto-send" className="text-sm">
                    Enable auto send
                  </Label>
                </div>

                {config.autoSendEnabled && (
                  <>
                    {/* Auto Send Delay */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Send delay: {config.autoSendDelay / 1000}s
                      </Label>
                      <Slider
                        value={[config.autoSendDelay / 1000]}
                        onValueChange={handleAutoSendDelayChange}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1s</span>
                        <span>10s</span>
                      </div>
                    </div>

                    {/* Minimum Speech Duration */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Min speech: {config.minSpeechDuration / 1000}s
                      </Label>
                      <Slider
                        value={[config.minSpeechDuration / 1000]}
                        onValueChange={handleMinSpeechDurationChange}
                        max={5}
                        min={0.5}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5s</span>
                        <span>5s</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    <span>Auto Mic:</span>
                    <Badge variant={config.autoMicEnabled ? "default" : "secondary"} className="text-xs">
                      {config.autoMicEnabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    <span>Auto Send:</span>
                    <Badge variant={config.autoSendEnabled ? "default" : "secondary"} className="text-xs">
                      {config.autoSendEnabled ? "On" : "Off"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
