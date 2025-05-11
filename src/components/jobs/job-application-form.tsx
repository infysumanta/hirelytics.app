"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IJob } from "@/models/job";
import { Loader2, Upload } from "lucide-react";

const formSchema = z.object({
  coverLetter: z.string().min(100, {
    message: "Cover letter must be at least 100 characters.",
  }),
  resumeUrl: z.string().optional(),
  phoneNumber: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  availability: z.string().min(1, {
    message: "Please provide your availability information.",
  }),
  additionalInfo: z.string().optional(),
});

interface JobApplicationFormProps {
  jobId: string;
  job: IJob;
  inModal?: boolean;
  onSubmitSuccess?: () => void;
}

export function JobApplicationForm({
  job,
  inModal = false,
  onSubmitSuccess,
}: JobApplicationFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetter: "",
      resumeUrl: "",
      phoneNumber: "",
      availability: "",
      additionalInfo: "",
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

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
    } finally {
      setIsUploading(false);
    }
  };

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

          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your cover letter here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Explain why you&apos;re a good fit for this position.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("resume")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </Button>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
                disabled={isUploading}
              />
              <span className="text-sm text-muted-foreground">
                {form.watch("resumeUrl")
                  ? "Resume uploaded"
                  : "PDF, DOC or DOCX (max 5MB)"}
              </span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Available immediately, 2 weeks notice, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information you'd like to share..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={
              inModal
                ? () => onSubmitSuccess && onSubmitSuccess()
                : () => router.back()
            }
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
