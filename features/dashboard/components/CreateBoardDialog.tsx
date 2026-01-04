"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BaseDialog } from "@/components/common/BaseDialog";
import { colors } from "@/features/boards/constants";

interface CreateBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function CreateBoardDialog({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  color,
  onColorChange,
  onSubmit,
}: CreateBoardDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Board"
      description="Give your board a name and choose a color"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="boardTitle">Board Title</Label>
          <Input
            id="boardTitle"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter board title..."
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="boardDescription">Description (Optional)</Label>
          <Textarea
            id="boardDescription"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter board description..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Board Color</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {colors.map((colorClass, key) => (
              <button
                key={key}
                type="button"
                className={`w-8 h-8 cursor-pointer rounded-full ${colorClass} ${
                  colorClass === color
                    ? "ring-2 ring-offset-2 ring-gray-900"
                    : ""
                }`}
                onClick={() => onColorChange(colorClass)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Create Board
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

