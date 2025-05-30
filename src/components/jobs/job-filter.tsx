import { CheckIcon, FilterIcon, MapPinIcon, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { countries, getCountryLabel } from '@/data/countries';
import { Skill, SkillCategory, technicalSkills } from '@/data/technical-skills';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

type JobFilterProps = {
  onSearchChange: (value: string) => void;
  onSkillsChange: (skills: string[]) => void;
  onLocationChange: (location: string) => void;
};

export function JobFilter({ onSearchChange, onSkillsChange, onLocationChange }: JobFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const debouncedLocation = useDebounce(location, 400);

  // Group skills by category for better organization in the dropdown
  const skillsByCategory = React.useMemo(() => {
    return technicalSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<SkillCategory, Skill[]>
    );
  }, []);

  // Effect to handle search debounce
  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Effect to handle location debounce
  React.useEffect(() => {
    onLocationChange(debouncedLocation);
  }, [debouncedLocation, onLocationChange]);

  // Handle skill selection
  const toggleSkill = (value: string) => {
    let updatedSkills: string[];

    if (selectedSkills.includes(value)) {
      updatedSkills = selectedSkills.filter((skill) => skill !== value);
    } else {
      updatedSkills = [...selectedSkills, value];
    }

    setSelectedSkills(updatedSkills);
    onSkillsChange(updatedSkills);
  };

  // Remove a selected skill
  const removeSkill = (skill: string) => {
    const updatedSkills = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updatedSkills);
    onSkillsChange(updatedSkills);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setSelectedSkills([]);
    onSearchChange('');
    onLocationChange('');
    onSkillsChange([]);
  };

  return (
    <div className="mb-6 space-y-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            placeholder="Search jobs by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
              onClick={() => {
                setSearchQuery('');
                onSearchChange('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="justify-between w-full">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {location ? getCountryLabel(location) : 'Filter by location'}
              </div>
              <FilterIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search locations..." />
              <CommandList>
                <CommandEmpty>No locations found.</CommandEmpty>
                <CommandGroup heading="Options">
                  <CommandItem
                    value="remote"
                    onSelect={() => {
                      setLocation('remote');
                      onLocationChange('remote');
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        location === 'remote' ? 'bg-primary border-primary' : 'opacity-50'
                      )}
                    >
                      {location === 'remote' && (
                        <CheckIcon className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    Remote
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Countries">
                  {countries.slice(1).map((country) => (
                    <CommandItem
                      key={country.value}
                      value={country.value}
                      onSelect={() => {
                        setLocation(country.value);
                        onLocationChange(country.value);
                      }}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                          location === country.value ? 'bg-primary border-primary' : 'opacity-50'
                        )}
                      >
                        {location === country.value && (
                          <CheckIcon className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      {country.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full"
            >
              <span>
                {selectedSkills.length > 0
                  ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                  : 'Filter by skills'}
              </span>
              <FilterIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] md:w-[500px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandList>
                <CommandEmpty>No skills found.</CommandEmpty>
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <CommandGroup
                    key={category}
                    heading={category.charAt(0).toUpperCase() + category.slice(1)}
                  >
                    {skills.map((skill) => (
                      <CommandItem
                        key={skill.value}
                        value={skill.value}
                        onSelect={() => toggleSkill(skill.value)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                            selectedSkills.includes(skill.value)
                              ? 'bg-primary border-primary'
                              : 'opacity-50'
                          )}
                        >
                          {selectedSkills.includes(skill.value) && (
                            <CheckIcon className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        {skill.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {(selectedSkills.length > 0 || location) && (
          <>
            {selectedSkills.map((skill) => {
              const skillInfo = technicalSkills.find((s) => s.value === skill);
              return (
                <Badge key={skill} variant="secondary" className="px-2 py-1">
                  {skillInfo?.label || skill}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 rounded-full"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              );
            })}

            {location && (
              <Badge variant="secondary" className="px-2 py-1">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {getCountryLabel(location)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 rounded-full"
                  onClick={() => {
                    setLocation('');
                    onLocationChange('');
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
              Clear all filters
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
