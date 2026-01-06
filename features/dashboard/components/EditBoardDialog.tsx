"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseDialog } from "@/components/common/BaseDialog";
import { colors } from "@/features/boards/constants";
import { Label as LabelModel } from "@/lib/supabase/models";
import { LabelEditor } from "./LabelEditor";

interface EditBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  selectedLabelIds: string[];
  onLabelIdsChange: (labelIds: string[]) => void;
  allLabels: LabelModel[];
  onCreateLabel: (text: string, color: string) => Promise<LabelModel>;
  onDeleteLabel?: (labelId: string) => Promise<void>;
  color: string;
  onColorChange: (color: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EditBoardDialog({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  selectedLabelIds,
  onLabelIdsChange,
  allLabels,
  onCreateLabel,
  onDeleteLabel,
  color,
  onColorChange,
  onSubmit,
}: EditBoardDialogProps) {
  const [isEditingLabels, setIsEditingLabels] = useState(false);
  const boardLabels = allLabels.filter(l => selectedLabelIds.includes(l.id));

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Board"
      description="Update your board details"
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
          <Label>Labels (Optional)</Label>
          {isEditingLabels ? (
            <LabelEditor
              boardLabels={boardLabels}
              allLabels={allLabels}
              onSave={(labelIds) => {
                onLabelIdsChange(labelIds);
                setIsEditingLabels(false);
              }}
              onCancel={() => setIsEditingLabels(false)}
              onCreateLabel={onCreateLabel}
              onDeleteLabel={onDeleteLabel}
            />
          ) : (
            <div
              onClick={() => setIsEditingLabels(true)}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-h-[40px] border border-gray-200"
            >
              {boardLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {boardLabels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                    >
                      <div className={`w-2 h-2 rounded-full ${label.color}`} />
                      <span className="uppercase">{label.text}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">Click to add labels</span>
              )}
            </div>
          )}
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
            Save Changes
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

