"use client";

import React, { useState } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TelegramShareButton,
  TelegramIcon,
  WhatsappShareButton,
  WhatsappIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
} from "next-share";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  iconSize?: number;
  round?: boolean;
  // Facebook & FacebookMessenger specific
  facebookQuote?: string;
  facebookHashtag?: string;
  appId?: string; // Required for FacebookMessenger
  // Telegram & WhatsApp specific
  message?: string;
  // Optional display URL for the copy button (can be shorter/cleaner than the actual URL)
  displayUrl?: string;
}

export function ShareButtons({
  url,
  title,
  className,
  iconSize = 32,
  round = true,
  facebookQuote,
  facebookHashtag,
  appId = "", // You should provide your FB App ID here or via env variable
  message,
  displayUrl,
}: ShareButtonsProps) {
  // State for copy feedback
  const [copied, setCopied] = useState(false);

  // Function to copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  // Fall back to title if message is not provided
  const shareMessage = message || title;

  // Use displayUrl if provided, otherwise use the actual URL
  const urlToDisplay = displayUrl || url;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Copy Link Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full flex justify-between items-center"
        onClick={copyToClipboard}
      >
        <span className="truncate mr-2">{urlToDisplay}</span>
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </Button>

      <div className="flex flex-wrap gap-2">
        {/* Facebook Share Button */}
        <FacebookShareButton
          url={url}
          quote={facebookQuote || title}
          hashtag={facebookHashtag}
        >
          <FacebookIcon size={iconSize} round={round} />
        </FacebookShareButton>

        {/* LinkedIn Share Button */}
        <LinkedinShareButton url={url}>
          <LinkedinIcon size={iconSize} round={round} />
        </LinkedinShareButton>

        {/* Telegram Share Button */}
        <TelegramShareButton url={url} title={title}>
          <TelegramIcon size={iconSize} round={round} />
        </TelegramShareButton>

        {/* WhatsApp Share Button */}
        <WhatsappShareButton url={url} title={shareMessage} separator=" ">
          <WhatsappIcon size={iconSize} round={round} />
        </WhatsappShareButton>

        {/* Facebook Messenger Share Button */}
        <FacebookMessengerShareButton url={url} appId={appId}>
          <FacebookMessengerIcon size={iconSize} round={round} />
        </FacebookMessengerShareButton>
      </div>
    </div>
  );
}
