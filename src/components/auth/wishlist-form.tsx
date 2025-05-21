"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

// Define form schema
const wishlistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  reason: z.string().optional(),
});

type WishlistFormValues = z.infer<typeof wishlistSchema>;

export function WishlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("Auth");

  const form = useForm<WishlistFormValues>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
    },
  });

  async function onSubmit(data: WishlistFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(result.message || "Successfully joined the waitlist!");
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Wishlist submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/10 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">
          Thank you for your interest!
        </h3>
        <p>We&apos;ll notify you when registration opens.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@example.com"
                  type="email"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why are you interested? (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us why you're interested in Hirelytics"
                  disabled={isSubmitting}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Join Waitlist"}
        </Button>
      </form>
    </Form>
  );
}
