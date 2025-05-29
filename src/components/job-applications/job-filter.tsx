'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Job {
  id: string;
  title: string;
  companyName: string;
}

interface JobFilterProps {
  jobs: Job[];
  selectedJobId: string;
  onChange: (jobId: string) => void;
}

export default function JobFilter({ jobs, selectedJobId, onChange }: JobFilterProps) {
  const [selected, setSelected] = useState<string>(selectedJobId);

  // Update local state when the selectedJobId prop changes
  useEffect(() => {
    setSelected(selectedJobId);
  }, [selectedJobId]);

  const handleChange = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  const handleClear = () => {
    setSelected('');
    onChange('');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select value={selected} onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a job to filter applications" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title} - {job.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear filter">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
