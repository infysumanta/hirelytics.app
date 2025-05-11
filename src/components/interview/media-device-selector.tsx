"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaDevice {
  deviceId: string;
  label: string;
}

interface MediaDeviceSelectorProps {
  onDevicesSelected: (
    videoDeviceId: string | null,
    audioDeviceId: string | null,
  ) => void;
  initialVideoDeviceId?: string;
  initialAudioDeviceId?: string;
}

export function MediaDeviceSelector({
  onDevicesSelected,
  initialVideoDeviceId,
  initialAudioDeviceId,
}: MediaDeviceSelectorProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>(
    initialVideoDeviceId || "",
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>(
    initialAudioDeviceId || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to enumerate devices
  const enumerateDevices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First request permissions to ensure device labels are accessible
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoInputs = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${videoDevices.length + 1}`,
        }));

      const audioInputs = devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${audioDevices.length + 1}`,
        }));

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      // Set default devices if not already set
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }

      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      setError(
        "Error accessing media devices. Please ensure you've granted camera and microphone permissions.",
      );
      console.error("Error enumerating devices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    enumerateDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDeviceSelection = () => {
    onDevicesSelected(selectedVideoDevice || null, selectedAudioDevice || null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> Media Device Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="camera-select">Camera</Label>
          <Select
            disabled={isLoading || videoDevices.length === 0}
            value={selectedVideoDevice}
            onValueChange={setSelectedVideoDevice}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={isLoading ? "Loading cameras..." : "Select camera"}
              />
            </SelectTrigger>
            <SelectContent>
              {videoDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="microphone-select">Microphone</Label>
          <Select
            disabled={isLoading || audioDevices.length === 0}
            value={selectedAudioDevice}
            onValueChange={setSelectedAudioDevice}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading ? "Loading microphones..." : "Select microphone"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={enumerateDevices}
            disabled={isLoading}
          >
            <div className="flex items-center">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Refreshing..." : "Refresh devices"}
            </div>
          </Button>
          <Button
            size="sm"
            onClick={handleSaveDeviceSelection}
            disabled={!selectedVideoDevice || !selectedAudioDevice || isLoading}
          >
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" /> Apply settings
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
