'use client';

import { AlertCircle, Building, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AIInterviewBackground } from './ai-interview-background';
import { AIInterviewerIcon } from './ai-interviewer-icon';

interface InterviewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInterview: () => void;
  jobTitle: string;
  companyName: string;
  location?: string;
  skills: string[];
  interviewDuration: number; // in minutes
}

export function InterviewDetailsDialog({
  open,
  onOpenChange,
  onStartInterview,
  jobTitle,
  companyName,
  location,
  skills,
  interviewDuration,
}: InterviewDetailsDialogProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      await onStartInterview();
    } finally {
      setIsStarting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <AIInterviewBackground className="opacity-20" />
          </div>

          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <AIInterviewerIcon size={48} />
              <div>
                <DialogTitle className="text-2xl">Interview Details</DialogTitle>
                <DialogDescription>
                  Review the interview information before starting
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 relative z-10">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Position Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{jobTitle}</h3>
                  <p className="text-muted-foreground">{companyName}</p>
                  {location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{location}</span>
                    </div>
                  )}
                </div>

                {skills && skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 8).map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 8 && (
                        <Badge variant="outline">+{skills.length - 8} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Interview Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(interviewDuration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <AIInterviewerIcon size={20} />
                    <div>
                      <p className="font-medium">AI Interviewer</p>
                      <p className="text-sm text-muted-foreground">Hirelytics AI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Interview Guidelines
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>
                          • The interview will automatically end after{' '}
                          {formatDuration(interviewDuration)}
                        </li>
                        <li>• Ensure your camera and microphone are working properly</li>
                        <li>• Speak clearly and maintain eye contact with the camera</li>
                        <li>• You can use both voice and text to communicate</li>
                        <li>• The interview covers technical, project, and behavioral questions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="relative z-10 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isStarting}>
              Cancel
            </Button>
            <Button onClick={handleStartInterview} disabled={isStarting} className="min-w-[120px]">
              {isStarting ? 'Starting...' : 'Start Interview'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
