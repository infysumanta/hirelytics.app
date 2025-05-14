"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TestApiPage() {
  const [applicationId, setApplicationId] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [result, setResult] = useState<{
    applicationId?: string;
    status?: string;
    message?: string;
    [key: string]: string | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const updateStatus = async () => {
    if (!applicationId) {
      setError("Please enter an application ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMonitoringImage = async () => {
    if (!applicationId || !imageKey) {
      setError("Please enter both application ID and image key");
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/monitoring-image/${encodeURIComponent(imageKey)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get image");
      }

      setImageUrl(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">API Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Status Update API */}
        <Card>
          <CardHeader>
            <CardTitle>Test Application Status Update</CardTitle>
            <CardDescription>
              Update the status of a job application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter application ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={updateStatus} disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {result && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <pre className="whitespace-pre-wrap text-sm">
                  {typeof result === "string"
                    ? result
                    : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Monitoring Image API */}
        <Card>
          <CardHeader>
            <CardTitle>Test Monitoring Image Access</CardTitle>
            <CardDescription>
              Get a signed URL for accessing a monitoring image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId2">Application ID</Label>
              <Input
                id="applicationId2"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter application ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageKey">Image Key</Label>
              <Input
                id="imageKey"
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value)}
                placeholder="Enter image S3 key"
              />
            </div>

            <Button onClick={getMonitoringImage} disabled={loading}>
              {loading ? "Fetching..." : "Get Image URL"}
            </Button>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {imageUrl && (
              <div className="space-y-2">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  <p className="text-sm">Image URL generated successfully!</p>
                  <div className="aspect-video relative border rounded overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Monitoring image"
                      fill
                      className="object-contain"
                      unoptimized={
                        imageUrl.startsWith("blob:") ||
                        imageUrl.startsWith("data:")
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
