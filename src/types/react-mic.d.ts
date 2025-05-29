/* eslint-disable @typescript-eslint/no-explicit-any */
// React Mic declaration file
declare module 'react-mic' {
  import { Component } from 'react';

  export interface ReactMicProps {
    /** Whether or not audio is being recorded */
    record: boolean;
    /** CSS class for component wrapper */
    className?: string;
    /** Called when audio stops recording */
    onStop?: (recordedData: RecordedData) => void;
    /** Called when audio starts recording */
    onStart?: () => void;
    /** Called when audio data is available */
    onData?: (recordedData: any) => void;
    /** Called when error occurs */
    onError?: (error: any) => void;
    /** Background color of the component */
    backgroundColor?: string;
    /** Color of the stroke / waveform */
    strokeColor?: string;
    /** Width of the stroke / waveform */
    strokeWidth?: number;
    /** MIME type of audio */
    mimeType?: string;
    /** Sample rate of audio */
    sampleRate?: number;
    /** Bit rate of audio */
    bitRate?: number;
    /** Audio buffer size */
    bufferSize?: number;
    /** Width of the component */
    width?: string | number;
    /** Height of the component */
    height?: string | number;
    /** Visual settings (sinewave/frequencyBars) */
    visualSetting?: 'sinewave' | 'frequencyBars';
    /** Whether or not to echo audio through speakers */
    echoCancellation?: boolean;
    /** Whether or not to autoGainControl */
    autoGainControl?: boolean;
    /** Whether or not to use noiseSuppression */
    noiseSuppression?: boolean;
    /** Channel count */
    channelCount?: number;
  }

  export interface RecordedData {
    /** Recorded blob */
    blob: Blob;
    /** URL of the recorded blob */
    blobURL: string;
    /** Start timestamp */
    startTime: number;
    /** Stop timestamp */
    stopTime: number;
    /** Options used for recording */
    options?: any;
  }

  export class ReactMic extends Component<ReactMicProps> {}
}
