
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { Deployment, DeploymentCategory } from "@/types/deployment";

interface DeploymentFormProps {
  deployment?: Deployment;
  onSubmit: (data: Partial<Deployment>) => void;
  onCancel: () => void;
}

export function DeploymentForm({ deployment, onSubmit, onCancel }: DeploymentFormProps) {
  const [date, setDate] = useState<Date>(deployment?.date || new Date());
  
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
      id: deployment?.id || crypto.randomUUID(),
    });
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
