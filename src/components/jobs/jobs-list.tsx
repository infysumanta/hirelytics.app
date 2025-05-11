"use client";

import * as React from "react";
import { JobCard } from "./job-card";
import { JobFilter } from "./job-filter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { IJob } from "@/models/job";

interface JobWithId extends Omit<IJob, "_id"> {
  id: string;
}

export function JobsList() {
  const [jobs, setJobs] = React.useState<JobWithId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(1);

  // Filter states
  const [search, setSearch] = React.useState("");
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [location, setLocation] = React.useState("");

  // Infinite scroll setup
  const { ref, inView } = useInView();

  // Build query string from filters
  const buildQueryString = React.useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");

      if (search) params.append("search", search);
      if (selectedSkills.length > 0)
        params.append("skills", selectedSkills.join(","));
      if (location) params.append("location", location);

      return params.toString();
    },
    [search, selectedSkills, location],
  );

  // Initial load and filter changes
  React.useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const queryString = buildQueryString(1);
        const response = await fetch(`/api/jobs/list?${queryString}`);

        if (!response.ok) {
          throw new Error(`Error fetching jobs: ${response.status}`);
        }

        const result = await response.json();
        setJobs(result.jobs);
        setHasMore(result.hasMore);
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [buildQueryString]);

  // Load more when scrolled to bottom
  React.useEffect(() => {
    const loadMoreJobs = async () => {
      if (inView && hasMore && !loading) {
        const nextPage = page + 1;
        setLoading(true);

        try {
          const queryString = buildQueryString(nextPage);
          const response = await fetch(`/api/jobs/list?${queryString}`);

          if (!response.ok) {
            throw new Error(`Error fetching more jobs: ${response.status}`);
          }

          const result = await response.json();
          setJobs((prevJobs) => [...prevJobs, ...result.jobs]);
          setHasMore(result.hasMore);
          setPage(nextPage);
        } catch (error) {
          console.error("Failed to load more jobs:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMoreJobs();
  }, [inView, hasMore, loading, page, buildQueryString]);

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Find your next opportunity
        </h1>
        <p className="text-muted-foreground">
          Browse through available job positions and find the perfect match for
          your skills.
        </p>
      </div>

      <div className="backdrop-blur-sm rounded-lg p-4 mb-6 h-full transition-all duration-300 hover:shadow-md hover:border-primary/30 bg-background/70 border border-primary/10">
        <JobFilter
          onSearchChange={handleSearchChange}
          onSkillsChange={handleSkillsChange}
          onLocationChange={handleLocationChange}
        />
      </div>

      {jobs.length === 0 && !loading ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search criteria or check back later for new
            opportunities.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="flex justify-center mt-8" ref={ref}>
            {loading && (
              <Button disabled variant="outline" className="w-full max-w-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more jobs...
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
