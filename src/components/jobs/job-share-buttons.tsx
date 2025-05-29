'use client';

import { ShareIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShareButtons } from '@/components/ui/share-buttons';

interface JobShareButtonsProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  className?: string;
  alertDialogMode?: boolean;
}

export function JobShareButtons({
  jobId,
  jobTitle,
  companyName,
  className,
  alertDialogMode = false,
}: JobShareButtonsProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Get domain from environment variable or fallback
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'hirelytics.app';

  // Create the share URL for this specific job
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : `https://${domain}`;
  const shareUrl = `${baseUrl}/jobs/${jobId}`;

  // Create a shorter display URL for the copy button
  const displayUrl = `${domain}/jobs/${jobId}`;

  // Create share messages
  const shareTitle = `${jobTitle} at ${companyName}`;
  const shareMessage = `Check out this job opportunity: ${jobTitle} at ${companyName}`;

  // Get Facebook app ID from environment variable
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

  // Share content component to be used in both Popover and AlertDialog
  const ShareContent = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Share this job</h4>
      <p className="text-xs text-muted-foreground">Help others find this opportunity</p>
      <ShareButtons
        url={shareUrl}
        displayUrl={displayUrl}
        title={shareTitle}
        message={shareMessage}
        appId={fbAppId}
        facebookQuote={`I found this great job opportunity: ${shareTitle}`}
        facebookHashtag="#jobopportunity"
        iconSize={28}
      />
    </div>
  );

  if (alertDialogMode) {
    return (
      <>
        <Button variant="outline" className={className} onClick={() => setIsAlertOpen(true)}>
          <ShareIcon className="h-4 w-4 mr-2" />
          Share Job
        </Button>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Share Job</AlertDialogTitle>
              <AlertDialogDescription>
                Share this job opportunity with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <ShareContent />
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
                <XIcon className="h-4 w-4 mr-2" />
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <ShareIcon className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <ShareContent />
      </PopoverContent>
    </Popover>
  );
}
