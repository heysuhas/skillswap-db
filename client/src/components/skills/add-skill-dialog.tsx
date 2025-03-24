import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SkillQuizDialog } from "@/components/skills/skill-quiz-dialog";

// Form schema for adding a skill
const skillFormSchema = z.object({
  skillId: z.string().min(1, "Please select a skill").transform(val => parseInt(val, 10)),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a proficiency level"
  }),
  isTeaching: z.boolean()
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

interface AddSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillType: "teaching" | "learning";
}

interface Skill {
  id: number;
  name: string;
  description?: string;
}

export function AddSkillDialog({ open, onOpenChange, skillType }: AddSkillDialogProps) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { toast } = useToast();
  const isTeaching = skillType === "teaching";

  // Get all available skills
  const { data: skills, isLoading: isLoadingSkills, error } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/skills');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch skills');
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  // Form setup
  const form = useForm<z.infer<typeof skillFormSchema>>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      skillId: undefined,
      proficiency: undefined,
      isTeaching: isTeaching
    },
  });

  // Reset form when dialog opens/closes or skill type changes
  useEffect(() => {
    form.reset({
      skillId: undefined,
      proficiency: undefined,
      isTeaching: isTeaching
    });
  }, [open, skillType, form, isTeaching]);

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skillFormSchema>) => {
      const response = await apiRequest('POST', '/api/user/skills', {
        skillId: data.skillId, // Already transformed to number by zod
        proficiency: data.proficiency,
        isTeaching: data.isTeaching
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add skill');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'skills'] });
      
      toast({
        title: "Skill added",
        description: `The skill has been added to your ${isTeaching ? "teaching" : "learning"} list.`,
      });

      if (isTeaching) {
        setShowVerificationDialog(true);
      } else {
        onOpenChange(false);
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: SkillFormValues) {
    addSkillMutation.mutate(data);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          {isLoadingSkills ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading skills...</span>
            </div>
          ) : !skills?.length ? (
            <div className="text-center p-4 text-sm text-slate-500">
              No skills available
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-center p-4">
                  <p className="text-sm text-red-500">
                    {error instanceof Error ? error.message : 'Failed to load skills'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['skills'] })}
                  >
                    Try again
                  </Button>
                </div>
              ) : null}
              <DialogHeader>
                <DialogTitle>Add a {isTeaching ? "Teaching" : "Learning"} Skill</DialogTitle>
                <DialogDescription>
                  {isTeaching 
                    ? "Add a skill that you can teach to others."
                    : "Add a skill that you want to learn from others."}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="skillId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value ? String(field.value) : undefined}
                          disabled={isLoadingSkills}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {skills?.map((skill) => (
                              <SelectItem 
                                key={skill.id} 
                                value={skill.id.toString()}
                              >
                                {skill.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="proficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proficiency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      disabled={addSkillMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={addSkillMutation.isPending}
                    >
                      {addSkillMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Skill
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showVerificationDialog && isTeaching && (
        <SkillQuizDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          skill={{
            id: form.getValues().skillId,
            name: skills?.find(s => s.id.toString() === form.getValues().skillId.toString())?.name || "",
            proficiency: form.getValues().proficiency
          }}
        />
      )}
    </>
  );
}