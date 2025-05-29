"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  CalendarIcon,
  Loader2,
  Check,
  ChevronsUpDown,
  MapPin,
  X as XIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { technicalSkills, skillsByCategory } from "@/data/technical-skills";
import { countries, getCountryLabel } from "@/data/countries";

// Define form schema
const formSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  salary: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  description: z.string().min(1, "Job description is required"),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
  isActive: z.boolean(),
  interviewDuration: z
    .number()
    .min(5, "Interview duration must be at least 5 minutes")
    .max(120, "Interview duration cannot exceed 120 minutes"),
});

type FormValues = z.infer<typeof formSchema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: () => void;
  jobId?: string; // Optional for editing mode
  mode: "create" | "edit";
}

export function JobFormDialog({
  open,
  onOpenChange,
  onSubmitSuccess,
  jobId,
  mode,
}: JobFormDialogProps) {
  // Translation hook available if needed
  useTranslations("Dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      companyName: "",
      location: "",
      salary: "",
      skills: [],
      description: "",
      isActive: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      // No default for interviewDuration - user must select
    },
  });

  // Fetch job data for editing
  useEffect(() => {
    const fetchJobData = async () => {
      if (mode === "edit" && jobId && open) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch job details");
          }
          const data = await response.json();
          const job = data.job;

          // Format the data for the form
          form.reset({
            title: job.title,
            companyName: job.companyName,
            location: job.location,
            salary: job.salary || "",
            skills: job.skills || [],
            description: job.description,
            isActive: job.isActive,
            expiryDate: new Date(job.expiryDate),
            interviewDuration: job.interviewDuration,
          });
        } catch (error) {
          console.error("Error fetching job data:", error);
          toast.error("Failed to load job details");
        } finally {
          setIsLoading(false);
        }
      } else if (mode === "create" && open) {
        // Reset form for creation mode
        form.reset({
          title: "",
          companyName: "",
          location: "",
          salary: "",
          skills: [],
          description: "",
          isActive: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          // No default for interviewDuration - user must select
        });
      }
    };

    fetchJobData();
  }, [open, jobId, mode, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const url = mode === "edit" ? `/api/jobs/${jobId}` : "/api/jobs";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${mode} job`);
      }

      toast.success(
        `Job ${mode === "edit" ? "updated" : "created"} successfully`,
      );
      onSubmitSuccess();
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate job description using AI
  const generateJobDescription = async () => {
    const { title, companyName, skills } = form.getValues();

    // Validate required fields
    if (!title || !companyName || !skills.length) {
      toast.error(
        "Please fill in job title, company name, and select at least one skill first",
      );
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/ai/generate-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: title,
          companyName,
          skills,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate job description");
      }

      const data = await response.json();
      form.setValue("description", data.description);
      toast.success("Job description generated successfully");
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Job" : "Edit Job"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new job posting."
              : "Update the job details."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Skills</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value.length && "text-muted-foreground",
                              )}
                            >
                              {field.value.length > 0
                                ? `${field.value.length} skill${field.value.length > 1 ? "s" : ""} selected`
                                : "Select skills"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Search skills..." />
                            <CommandEmpty>No skill found.</CommandEmpty>
                            <CommandList>
                              <ScrollArea className="h-72">
                                {Object.entries(skillsByCategory).map(
                                  ([category, skills]) => (
                                    <CommandGroup
                                      key={category}
                                      heading={
                                        category.charAt(0).toUpperCase() +
                                        category.slice(1)
                                      }
                                    >
                                      {skills.map((skill) => {
                                        const isSelected = field.value.includes(
                                          skill.value,
                                        );
                                        return (
                                          <CommandItem
                                            key={skill.value}
                                            value={skill.value}
                                            onSelect={() => {
                                              const newValue = isSelected
                                                ? field.value.filter(
                                                    (value) =>
                                                      value !== skill.value,
                                                  )
                                                : [...field.value, skill.value];
                                              field.onChange(newValue);
                                            }}
                                          >
                                            <div
                                              className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                  ? "bg-primary text-primary-foreground"
                                                  : "opacity-50 [&_svg]:invisible",
                                              )}
                                            >
                                              <Check
                                                className={cn("h-4 w-4")}
                                              />
                                            </div>
                                            <span>{skill.label}</span>
                                          </CommandItem>
                                        );
                                      })}
                                    </CommandGroup>
                                  ),
                                )}
                              </ScrollArea>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((skill) => {
                            const skillObj = technicalSkills.find(
                              (s) => s.value === skill,
                            );
                            return (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="mr-1 mb-1"
                              >
                                {skillObj?.label || skill}
                                <button
                                  type="button"
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter((s) => s !== skill),
                                    );
                                  }}
                                >
                                  <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Location</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {field.value
                                  ? getCountryLabel(field.value)
                                  : "Select location"}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search location..." />
                            <CommandList>
                              <CommandEmpty>No location found.</CommandEmpty>
                              <CommandGroup heading="Options">
                                <CommandItem
                                  value="remote"
                                  onSelect={() => field.onChange("remote")}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === "remote"
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  Remote
                                </CommandItem>
                              </CommandGroup>
                              <CommandGroup heading="Countries">
                                <ScrollArea className="h-72">
                                  {countries.slice(1).map((country) => (
                                    <CommandItem
                                      value={country.value}
                                      key={country.value}
                                      onSelect={() =>
                                        field.onChange(country.value)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === country.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {country.label}
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. $80,000 - $100,000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Job Status</FormLabel>
                        <FormDescription>
                          Set whether this job is active and visible to
                          candidates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interviewDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Duration</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interview duration *" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set the maximum duration for the AI interview session
                        (required)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Job Description</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateJobDescription}
                        disabled={isGeneratingDescription}
                      >
                        {isGeneratingDescription && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Enter job description or generate with AI"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can manually enter the job description or use AI to
                      generate one based on the job title, company, and role.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requirements and benefits sections removed */}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create" ? "Create" : "Update"} Job
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
