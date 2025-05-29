"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DeviceCheck } from "./device-check";
import { useRouter } from "next/navigation";
import { AIInterviewBackground } from "./ai-interview-background";
import { AIInterviewerIcon } from "./ai-interviewer-icon";
import { InterviewDetailsDialog } from "./interview-details-dialog";

interface InterviewClientProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  skills?: string[];
  interviewDuration: number; // in minutes
}

export function InterviewClient({
  applicationId,
  jobTitle,
  companyName,
  location,
  skills = [],
  interviewDuration,
}: InterviewClientProps) {
  const [cameraChecked, setCameraChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null,
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const router = useRouter();

  const handleDeviceCheckComplete = (camera: boolean, microphone: boolean) => {
    setCameraChecked(camera);
    setMicChecked(microphone);
  };

  // Save device preferences to localStorage when they change
  useEffect(() => {
    if (selectedVideoDevice) {
      localStorage.setItem("preferredVideoDevice", selectedVideoDevice);
    }
    if (selectedAudioDevice) {
      localStorage.setItem("preferredAudioDevice", selectedAudioDevice);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Load device preferences from localStorage on component mount
  useEffect(() => {
    const savedVideoDevice = localStorage.getItem("preferredVideoDevice");
    const savedAudioDevice = localStorage.getItem("preferredAudioDevice");

    if (savedVideoDevice) setSelectedVideoDevice(savedVideoDevice);
    if (savedAudioDevice) setSelectedAudioDevice(savedAudioDevice);
  }, []);

  const handleShowDetails = () => {
    setShowDetailsDialog(true);
  };

  const handleStartInterview = () => {
    // Save application ID in localStorage for resuming later if needed
    localStorage.setItem("currentInterviewId", applicationId);

    // Navigate to the actual interview session
    router.push(`/dashboard/applications/${applicationId}/interview/session`);
  };

  const bothDevicesChecked = cameraChecked && micChecked;

  return (
    <div className="space-y-6">
      <div className="relative bg-muted/50 p-6 rounded-lg text-center overflow-hidden">
        {/* Interview background */}
        <AIInterviewBackground className="opacity-30" />

        <div className="relative z-10">
          <div className="mx-auto mb-4 flex flex-col items-center">
            <AIInterviewerIcon size={84} />
            <h2 className="text-2xl font-bold mt-4">
              Ready to begin your interview?
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Our AI-powered system will guide you through a series of questions
            to assess your skills and experience for this position. Please
            ensure your camera and microphone are working properly.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <DeviceCheck
            onComplete={handleDeviceCheckComplete}
            initialVideoDeviceId={selectedVideoDevice}
            initialAudioDeviceId={selectedAudioDevice}
            onDeviceChange={(
              videoId: string | null,
              audioId: string | null,
            ) => {
              setSelectedVideoDevice(videoId);
              setSelectedAudioDevice(audioId);
            }}
          />

          <Button
            size="lg"
            variant="default"
            className="w-full mt-4"
            disabled={!bothDevicesChecked}
            onClick={handleShowDetails}
          >
            {bothDevicesChecked ? "Start Interview" : "Check Devices First"}
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 p-6 rounded-lg">
        <h3 className="font-medium mb-2">Interview Tips</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            Find a quiet place with good lighting and minimal background noise
          </li>
          <li>Dress professionally as you would for an in-person interview</li>
          <li>Speak clearly and take your time to answer thoughtfully</li>
          <li>Have your resume and relevant documents nearby for reference</li>
          <li>
            The interview will take approximately 15-20 minutes to complete
          </li>
        </ul>
      </div>

      <InterviewDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onStartInterview={handleStartInterview}
        jobTitle={jobTitle}
        companyName={companyName}
        location={location}
        skills={skills}
        interviewDuration={interviewDuration}
      />
    </div>
  );
}
