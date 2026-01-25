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

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  columnId?: string;
}

export function CreateTaskDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  columnId,
}: CreateTaskDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Task"
      description="Add a new task to the board"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label>Title *</label>
          <Input
            id="title"
            name="title"
            placeholder="Enter task title"
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
          />
        </div>
        <div className="space-y-2">
          <label>Assignee</label>
          <Input
            id="assignee"
            name="assignee"
            placeholder="Who should do this? (defaults to 'me' if empty)"
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="medium">
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
          <Input type="date" name="dueDate" id="dueDate" />
        </div>
        {columnId && <input type="hidden" name="columnId" value={columnId} />}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" className="cursor-pointer">Create Task</Button>
        </div>
      </form>
    </BaseDialog>
  );
}