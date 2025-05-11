"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

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

const formSchema = z.object({
  resumeUrl: z.string().optional(),
  preferredLanguage: z.string().min(1, {
    message: "Please select your preferred language.",
  }),
});

interface JobApplicationFormProps {
  jobId: string;
  job: IJob;
  inModal?: boolean;
  onSubmitSuccess?: () => void;
  onClose?: () => void;
}

export function JobApplicationForm({
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

      // Simulate file upload - in a real app, you would upload to your storage service
      try {
        // Mock upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock successful upload
        const mockUrl = `https://storage.example.com/resumes/${file.name}`;
        form.setValue("resumeUrl", mockUrl);

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
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleResumeUpload,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // This would be an actual API call in a real application
      console.log("Submitting application:", values);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful submission
      toast.success("Application submitted successfully!", {
        description: "Your application has been sent to the employer.",
      });

      // Either call the success callback or redirect
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        // Redirect to success page after submission
        router.push("/dashboard/jobs/application-success");
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
