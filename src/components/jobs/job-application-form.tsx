"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { IJob } from "@/models/job";
import { Loader2, Upload, FileIcon, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localsLanguages } from "@/i18n/config";
import { processFileForStorage } from "@/lib/file-utils";

const formSchema = z.object({
  resumeUrl: z.string().optional(),
  resumeBase64: z.string().optional(),
  fileName: z.string().optional(),
  s3Key: z.string().optional(),
  s3Bucket: z.string().optional(),
  preferredLanguage: z.string().min(1, {
    message: "Please select your preferred language.",
  }),
});

interface JobApplicationFormProps {
  jobId: string;
  job: IJob;
  inModal?: boolean;
  onSubmitSuccess?: (applicationId: string) => void;
  onClose?: () => void;
}

export function JobApplicationForm({
  jobId,
  job,
  inModal = false,
  onSubmitSuccess,
  onClose,
}: JobApplicationFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeUrl: "",
      preferredLanguage: "en",
    },
  });

  const [fileName, setFileName] = useState<string | null>(null);

  const handleResumeUpload = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setFileName(file.name);

      try {
        // Process file for storage (upload to S3 and convert to base64)
        const { url, base64, fileName, key, bucket } =
          await processFileForStorage(file);

        // Set form values
        form.setValue("resumeUrl", url);
        form.setValue("resumeBase64", base64);
        form.setValue("fileName", fileName);
        form.setValue("s3Key", key);
        form.setValue("s3Bucket", bucket);

        toast.success("Resume uploaded successfully", {
          description: "Your resume has been attached to your application",
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Upload failed", {
          description:
            "There was an error uploading your resume. Please try again.",
        });
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    },
    [form],
  );

  const removeFile = useCallback(() => {
    setFileName(null);
    form.setValue("resumeUrl", "");
    form.setValue("resumeBase64", "");
    form.setValue("fileName", "");
    form.setValue("s3Key", "");
    form.setValue("s3Bucket", "");
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleResumeUpload,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const { data: session } = useSession();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // Check if user is logged in
    if (!session || !session.user) {
      toast.error("Authentication required", {
        description: "Please log in before applying for this job.",
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure file was uploaded
    if (!values.resumeUrl || !values.resumeBase64) {
      toast.error("Missing resume", {
        description: "Please upload your resume before submitting.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Log job and jobId for debugging
      console.log("Job object:", job);
      console.log("JobId prop:", jobId);

      // Prepare application data - Use the URL ID which is what's used in the database as jobId
      const applicationData = {
        jobId: jobId,
        userId: session?.user?.id || "",
        // Candidatename and email are now optional in the model
        resumeUrl: values.resumeUrl,
        resumeBase64: values.resumeBase64,
        fileName: values.fileName,
        // Include S3 key and bucket for generating signed URLs later
        s3Key: values.s3Key,
        s3Bucket: values.s3Bucket,
        preferredLanguage: values.preferredLanguage,
      };

      // Submit to API
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit application");
      }

      toast.success("Application submitted successfully!", {
        description: "Your resume will now be analyzed.",
      });

      // Get the application ID from the response
      const applicationId = result.application._id;

      // Either call the success callback or redirect
      if (onSubmitSuccess) {
        onSubmitSuccess(applicationId);
      } else {
        // Redirect to the analysis page
        router.push(`/dashboard/applications/${applicationId}/analysis`);
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("Submission failed", {
        description:
          "There was an error submitting your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <h2 className="text-lg font-medium mb-2">{job.title}</h2>
            <p className="text-muted-foreground">{job.companyName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV (PDF only)</Label>
            {!fileName ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                    <p>Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Drag & drop your resume PDF here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only PDF files accepted (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 border rounded-md p-3">
                <FileIcon className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {localsLanguages
                      .filter((lang) => lang.active)
                      .map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the language you prefer for communications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (inModal) {
                onClose?.();
              } else {
                router.back();
              }
            }}
            disabled={isSubmitting}
          >
            {inModal ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
