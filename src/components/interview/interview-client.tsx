"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeviceCheck } from "./device-check";
import { useRouter } from "next/navigation";

interface InterviewClientProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
}

export function InterviewClient({ applicationId }: InterviewClientProps) {
  const [cameraChecked, setCameraChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const router = useRouter();

  const handleDeviceCheckComplete = (camera: boolean, microphone: boolean) => {
    setCameraChecked(camera);
    setMicChecked(microphone);
  };

  const handleStartInterview = () => {
    // Navigate to the actual interview session
    router.push(`/dashboard/applications/${applicationId}/interview/session`);
  };

  const bothDevicesChecked = cameraChecked && micChecked;

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to begin your interview?
        </h2>
        <p className="text-muted-foreground mb-6">
          Our AI-powered system will guide you through a series of questions to
          assess your skills and experience for this position. Please ensure
          your camera and microphone are working properly.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <DeviceCheck onComplete={handleDeviceCheckComplete} />

          <Button
            size="lg"
            variant="default"
            className="w-full mt-4"
            disabled={!bothDevicesChecked}
            onClick={handleStartInterview}
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
    </div>
  );
}
