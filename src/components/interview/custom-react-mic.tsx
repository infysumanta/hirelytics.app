'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// Define ReactMic component props type
type ReactMicProps = {
  record: boolean;
  className?: string;
  onStop: (recordedBlob: {
    blob: Blob;
    blobURL: string;
    startTime: number;
    stopTime: number;
  }) => void;
  onData: (recordedData: unknown) => void;
  onError: (err: Error) => void;
  strokeColor?: string;
  backgroundColor?: string;
  mimeType?: string;
  visualSetting?: string;
};

// Use dynamic import with ssr: false to avoid window is not defined error
const DynamicReactMic = dynamic<ReactMicProps>(
  () =>
    import('react-mic').then((mod) => {
      const { ReactMic } = mod;
      return ReactMic;
    }),
  {
    ssr: false,
    loading: () => <div className="h-24 bg-muted rounded-md" />,
  }
);

interface CustomReactMicProps {
  record: boolean;
  deviceId?: string | null;
  className?: string;
  onStop: (recordedBlob: {
    blob: Blob;
    blobURL: string;
    startTime: number;
    stopTime: number;
  }) => void;
  onData: (recordedData: unknown) => void;
  onError: (err: Error) => void;
  strokeColor?: string;
  backgroundColor?: string;
  mimeType?: string;
  visualSetting?: string;
}

export function CustomReactMic({
  record,
  deviceId,
  className,
  onStop,
  onData,
  onError,
  strokeColor = '#09f',
  backgroundColor = '#f0f0f0',
  mimeType = 'audio/webm',
  visualSetting = 'frequencyBars',
}: CustomReactMicProps) {
  const [key, setKey] = useState<number>(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const initializeAudioStream = useCallback(async () => {
    try {
      if (audioStream) {
        // Stop any existing audio tracks
        audioStream.getTracks().forEach((track) => track.stop());
      }

      // Request access to the microphone with specified device if available
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      });

      setAudioStream(stream);

      // Force re-mount of ReactMic component with new device
      setKey((prevKey) => prevKey + 1);
    } catch (err) {
      onError(err as Error);
    }
  }, [deviceId, audioStream, onError]);

  // Initialize audio stream when deviceId changes
  useEffect(() => {
    initializeAudioStream();

    // Cleanup when unmounting
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId, initializeAudioStream, audioStream]);

  return (
    <DynamicReactMic
      key={key}
      record={record}
      className={className}
      onStop={onStop}
      onData={onData}
      onError={onError}
      strokeColor={strokeColor}
      backgroundColor={backgroundColor}
      mimeType={mimeType}
      visualSetting={visualSetting}
    />
  );
}
