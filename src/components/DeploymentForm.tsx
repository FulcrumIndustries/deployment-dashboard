
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Deployment, DeploymentScript, DeploymentSection } from "@/types/deployment";

interface DeploymentFormProps {
  deployment?: Deployment;
  onSubmit: (data: Partial<Deployment>) => void;
  onCancel: () => void;
}

interface ScriptSectionProps {
  title: string;
  scripts: DeploymentScript[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, script: DeploymentScript) => void;
}

function ScriptSection({ title, scripts, onAdd, onRemove, onChange }: ScriptSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        {scripts.map((script, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Script name"
                value={script.name}
                onChange={(e) =>
                  onChange(index, { ...script, name: e.target.value })
                }
              />
              <Input
                placeholder="Command"
                value={script.command}
                onChange={(e) =>
                  onChange(index, { ...script, command: e.target.value })
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DeploymentForm({ deployment, onSubmit, onCancel }: DeploymentFormProps) {
  const [date, setDate] = useState<Date>(deployment?.date || new Date());
  const [sections, setSections] = useState<DeploymentSection>(
    deployment?.sections || {
      prerequisites: [],
      execution: [],
      postDeployment: [],
    }
  );
  
  const form = useForm({
    defaultValues: {
      title: deployment?.title || "",
      description: deployment?.description || "",
      category: deployment?.category || "Infrastructure",
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit({
      ...data,
      date,
      sections,
      id: deployment?.id || crypto.randomUUID(),
    });
  };

  const handleScriptAdd = (section: keyof DeploymentSection) => {
    setSections((prev) => ({
      ...prev,
      [section]: [...prev[section], { name: "", command: "" }],
    }));
  };

  const handleScriptRemove = (section: keyof DeploymentSection, index: number) => {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleScriptChange = (
    section: keyof DeploymentSection,
    index: number,
    script: DeploymentScript
  ) => {
    setSections((prev) => ({
      ...prev,
      [section]: prev[section].map((s, i) => (i === index ? script : s)),
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter deployment title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter deployment description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Infrastructure", "Software", "Testing", "Monitoring", "Security", "Backup", "Process", "Tools"].map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormItem>

        <div className="space-y-4">
          <FormLabel>Deployment Steps</FormLabel>
          <ScriptSection
            title="Prerequisites"
            scripts={sections.prerequisites}
            onAdd={() => handleScriptAdd("prerequisites")}
            onRemove={(index) => handleScriptRemove("prerequisites", index)}
            onChange={(index, script) =>
              handleScriptChange("prerequisites", index, script)
            }
          />
          <ScriptSection
            title="Execution"
            scripts={sections.execution}
            onAdd={() => handleScriptAdd("execution")}
            onRemove={(index) => handleScriptRemove("execution", index)}
            onChange={(index, script) =>
              handleScriptChange("execution", index, script)
            }
          />
          <ScriptSection
            title="Post-Deployment"
            scripts={sections.postDeployment}
            onAdd={() => handleScriptAdd("postDeployment")}
            onRemove={(index) => handleScriptRemove("postDeployment", index)}
            onChange={(index, script) =>
              handleScriptChange("postDeployment", index, script)
            }
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {deployment ? "Update" : "Create"} Deployment
          </Button>
        </div>
      </form>
    </Form>
  );
}
