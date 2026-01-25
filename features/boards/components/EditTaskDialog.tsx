"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Task } from "@/lib/supabase/models";

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  task: Task | null;
}

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  task,
}: EditTaskDialogProps) {
  if (!task) return null;

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Task"
      description="Update task details"
    >
      <form id="edit-task-form" className="space-y-4" onSubmit={onSubmit}>
        <input type="hidden" name="taskId" value={task.id} />
        <div className="space-y-2">
          <label>Title *</label>
          <Input
            id="title"
            name="title"
            placeholder="Enter task title"
            defaultValue={task.title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter task description"
            rows={3}
            defaultValue={task.description || ""}
          />
        </div>
        <div className="space-y-2">
          <label>Assignee</label>
          <Input
            id="assignee"
            name="assignee"
            placeholder="Who should do this? (defaults to 'me' if empty)"
            defaultValue={task.assignee || ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select name="priority" defaultValue={task.priority || "medium"}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high"].map((priority, key) => (
                <SelectItem
                  key={key}
                  value={priority}
                  className="cursor-pointer"
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            name="dueDate"
            id="dueDate"
            defaultValue={
              task.due_date
                ? new Date(task.due_date).toISOString().split("T")[0]
                : ""
            }
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Update Task
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

