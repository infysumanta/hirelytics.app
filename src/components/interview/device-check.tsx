'use client';

import { Check, Mic, RefreshCw, Settings, Video } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { CustomReactMic } from './custom-react-mic';
import { MediaDeviceSelector } from './media-device-selector';

interface DeviceCheckProps {
  onComplete: (cameraChecked: boolean, microphoneChecked: boolean) => void;
  initialVideoDeviceId?: string | null;
  initialAudioDeviceId?: string | null;
  onDeviceChange?: (videoDeviceId: string | null, audioDeviceId: string | null) => void;
}

export function DeviceCheck({
  onComplete,
  initialVideoDeviceId,
  initialAudioDeviceId,
  onDeviceChange,
}: DeviceCheckProps) {
  const [cameraChecked, setCameraChecked] = useState(false);
  const [microphoneChecked, setMicrophoneChecked] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | null>(
    initialVideoDeviceId || null
  );
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string | null>(
    initialAudioDeviceId || null
  );
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);

  const webcamRef = useRef<Webcam>(null);

  // Update parent component when checks are completed
  useEffect(() => {
    onComplete(cameraChecked, microphoneChecked);
  }, [cameraChecked, microphoneChecked, onComplete]);

  // Clean up recording timeout when unmounting
  useEffect(() => {
    return () => {
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
      }
    };
  }, [recordingTimeout]);

  const handleCameraCheck = useCallback(() => {
    setCameraError(null);
    setShowCamera(true);

    const videoConstraints: MediaStreamConstraints = {
      video: selectedVideoDeviceId ? { deviceId: { exact: selectedVideoDeviceId } } : true,
    };

    navigator.mediaDevices
      .getUserMedia(videoConstraints)
      .then(() => {
        // The Webcam component will handle the stream
        // Just mark as successful after showing the camera feed
        setTimeout(() => {
          setCameraChecked(true);
        }, 2000);
      })
      .catch((err: Error) => {
        setCameraError(`Error accessing camera: ${err.message}`);
        setShowCamera(false);
      });
  }, [selectedVideoDeviceId]);

  const handleMicrophoneCheck = useCallback(() => {
    setMicrophoneError(null);
    setAudioBlob(null);

    const audioConstraints: MediaStreamConstraints = {
      audio: selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : true,
    };

    // Request microphone permission first
    navigator.mediaDevices
      .getUserMedia(audioConstraints)
      .then(() => {
        // Start recording with ReactMic once we have permission
        setIsRecording(true);

        // Auto-stop recording after 5 seconds
        const timeout = setTimeout(() => {
          setIsRecording(false);
        }, 5000);

        setRecordingTimeout(timeout);
      })
      .catch((err: Error) => {
        setMicrophoneError(`Error accessing microphone: ${err.message}`);
      });
  }, [selectedAudioDeviceId]);

  // When camera check is complete, clean up the camera stream
  useEffect(() => {
    if (cameraChecked && showCamera) {
      setShowCamera(false);
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video as HTMLVideoElement;
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  }, [cameraChecked, showCamera]);

  return (
    <div className="space-y-4">
      {/* Camera check section */}
      <div className="flex flex-col items-center">
        <Button
          size="lg"
          className="gap-2 mb-2"
          onClick={handleCameraCheck}
          disabled={cameraChecked}
          variant={cameraChecked ? 'outline' : 'default'}
        >
          {cameraChecked ? (
            <>
              <Check className="h-5 w-5 text-green-500" /> Camera Working
            </>
          ) : (
            <>
              <Video className="h-5 w-5" /> Check Camera
            </>
          )}
        </Button>

        {cameraError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {showCamera && !cameraChecked && (
          <div className="relative mt-2 rounded-md overflow-hidden border border-muted">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={400}
              height={300}
              videoConstraints={
                selectedVideoDeviceId ? { deviceId: selectedVideoDeviceId } : { facingMode: 'user' }
              }
              className="rounded-md"
            />
          </div>
        )}
      </div>

      {/* Microphone check section */}
      <div className="flex flex-col items-center">
        <Button
          size="lg"
          className="gap-2 mb-2"
          onClick={handleMicrophoneCheck}
          disabled={microphoneChecked || isRecording}
          variant={microphoneChecked ? 'outline' : isRecording ? 'secondary' : 'default'}
        >
          {microphoneChecked ? (
            <>
              <Check className="h-5 w-5 text-green-500" /> Microphone Working
            </>
          ) : isRecording ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" /> Recording...
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" /> Check Microphone
            </>
          )}
        </Button>

        {microphoneError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{microphoneError}</AlertDescription>
          </Alert>
        )}

        <div className="w-full max-w-xs mt-2">
          {/* Show the ReactMic component only during recording, hide once test is complete */}
          <div style={{ display: isRecording ? 'block' : 'none' }}>
            <CustomReactMic
              record={isRecording}
              deviceId={selectedAudioDeviceId}
              className="w-full h-16 rounded-md"
              onStop={(recordedBlob: {
                blob: Blob;
                blobURL: string;
                startTime: number;
                stopTime: number;
              }) => {
                setAudioBlob(recordedBlob.blob);

                // Check if the recorded blob has significant audio data
                const blobSize = recordedBlob.blob.size;
                const recordingDuration = recordedBlob.stopTime - recordedBlob.startTime;

                // If the blob is too small, it might not have captured significant sound
                if (blobSize < 1000 && recordingDuration > 2000) {
                  setMicrophoneError(
                    'No significant audio detected. Please check your microphone and try again.'
                  );
                  return;
                }

                // Mark microphone check as successful
                setMicrophoneChecked(true);
              }}
              onData={() => {}}
              onError={(err: Error) => {
                setMicrophoneError(`Error accessing microphone: ${err.message || 'Unknown error'}`);
                setIsRecording(false);
              }}
              strokeColor="#09f"
              backgroundColor="#f0f0f0"
              mimeType="audio/webm"
              visualSetting="frequencyBars"
            />
          </div>

          {isRecording && (
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Please speak into your microphone
            </p>
          )}

          {!isRecording && !microphoneChecked && audioBlob && (
            <div className="mt-2 text-center">
              <p className="text-xs font-medium">Processing audio...</p>
            </div>
          )}
        </div>
      </div>

      {/* Device Settings Dialog */}
      <Dialog open={showDeviceSelector} onOpenChange={setShowDeviceSelector}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 mt-4 w-full">
            <Settings className="h-5 w-5" /> Configure Devices
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle className="flex gap-2">
            <Settings className="h-5 w-5" /> Media Device Settings
          </DialogTitle>
          <MediaDeviceSelector
            initialAudioDeviceId={selectedAudioDeviceId || undefined}
            initialVideoDeviceId={selectedVideoDeviceId || undefined}
            onDevicesSelected={(videoDeviceId, audioDeviceId) => {
              setSelectedVideoDeviceId(videoDeviceId);
              setSelectedAudioDeviceId(audioDeviceId);
              // Notify parent component about device changes
              if (onDeviceChange) {
                onDeviceChange(videoDeviceId, audioDeviceId);
              }
              setShowDeviceSelector(false);
              // Reset checks when devices change
              setCameraChecked(false);
              setMicrophoneChecked(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
