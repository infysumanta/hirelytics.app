import { IJob } from "@/models/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, BriefcaseIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { getSkillLabel } from "@/data/technical-skills";
import ReactMarkdown from "react-markdown";
import { JobShareButtons } from "./job-share-buttons";

interface JobWithId extends Omit<IJob, "_id"> {
  id: string;
}

interface JobCardProps {
  job: JobWithId | IJob;
}

export function JobCard({ job }: JobCardProps) {
  // Format the date
  const formattedDate = new Date(job.expiryDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/30 bg-background/70 backdrop-blur-sm border border-primary/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-1">
            {job.title}
          </CardTitle>
          <JobShareButtons
            jobId={job.urlId}
            jobTitle={job.title}
            companyName={job.companyName}
          />
        </div>
        <div className="flex items-center mt-1 text-muted-foreground">
          <BriefcaseIcon className="h-4 w-4 mr-1" />
          <span className="font-medium">{job.companyName}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
          {job.salary && (
            <>
              <span className="mx-1">•</span>
              <span>{job.salary}</span>
            </>
          )}
        </div>

        <div className="text-sm line-clamp-2 mb-3 prose-sm prose-p:my-0">
          <ReactMarkdown>
            {job.description.substring(0, 150) +
              (job.description.length > 150 ? "..." : "")}
          </ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {getSkillLabel(skill)}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
          <span>Expires: {formattedDate}</span>
        </div>
        <div>
          <Link href={`/jobs/${job.urlId}`}>
            <Button variant="default" size="sm" className="h-8">
              <EyeIcon className="h-3.5 w-3.5 mr-1" /> View Job
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
