"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { colors } from "@/features/boards/constants";
import { Label } from "@/lib/supabase/models";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LabelEditorProps {
  boardLabels: Label[];
  allLabels: Label[];
  onSave: (labelIds: string[]) => void;
  onCancel: () => void;
  onCreateLabel: (text: string, color: string) => Promise<Label>;
  onDeleteLabel?: (labelId: string) => Promise<void>;
}

export function LabelEditor({
  boardLabels,
  allLabels,
  onSave,
  onCancel,
  onCreateLabel,
  onDeleteLabel,
}: LabelEditorProps) {
  const [selectedLabelIds, setSelectedLabelIds] = useState<Set<string>>(
    new Set(boardLabels.map((l) => l.id))
  );
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("bg-gray-500");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const toggleLabel = (labelId: string) => {
    const newSet = new Set(selectedLabelIds);
    if (newSet.has(labelId)) {
      newSet.delete(labelId);
    } else {
      newSet.add(labelId);
    }
    setSelectedLabelIds(newSet);
  };

  const handleCreateLabel = async () => {
    if (!newLabelText.trim()) return;
    setIsCreating(true);
    try {
      const newLabel = await onCreateLabel(newLabelText.trim(), newLabelColor);
      setSelectedLabelIds(new Set([...selectedLabelIds, newLabel.id]));
      setNewLabelText("");
      setShowNewLabelForm(false);
    } catch (err) {
      console.error("Failed to create label:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    onSave(Array.from(selectedLabelIds));
  };

  const selectedLabels = allLabels.filter((l) => selectedLabelIds.has(l.id));
  const unselectedLabels = allLabels.filter((l) => !selectedLabelIds.has(l.id));

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[400px] max-w-[500px]"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Selected Labels
          </h3>
          {selectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${label.color}`} />
                  <span className="uppercase">{label.text}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No labels selected</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Quick Select
          </h3>
          {unselectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {unselectedLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${label.color}`} />
                  <span className="uppercase">{label.text}</span>
                  {onDeleteLabel && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLabelToDelete(label);
                      }}
                      className="ml-1 hover:bg-gray-200 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No other labels available</p>
          )}
        </div>

        <div className="border-t pt-3">
          {!showNewLabelForm ? (
            <button
              type="button"
              onClick={() => setShowNewLabelForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Create New Label
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <Input
                  type="text"
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  placeholder="Label text..."
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateLabel();
                    } else if (e.key === "Escape") {
                      setShowNewLabelForm(false);
                      setNewLabelText("");
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Color:</span>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className={`w-4 h-4 rounded ${newLabelColor}`} />
                    {showColorPicker ? "Hide" : "Change"}
                  </button>
                </div>
                {showColorPicker && (
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((colorClass) => (
                      <button
                        key={colorClass}
                        type="button"
                        onClick={() => setNewLabelColor(colorClass)}
                        className={`w-6 h-6 rounded-full ${colorClass} ${
                          colorClass === newLabelColor
                            ? "ring-2 ring-offset-1 ring-gray-900"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  disabled={!newLabelText.trim() || isCreating}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLabelForm(false);
                    setNewLabelText("");
                  }}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Delete Label Confirmation Dialog */}
      <Dialog open={!!labelToDelete} onOpenChange={(open) => !open && setLabelToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the label "{labelToDelete?.text}"? This will remove it from all boards that use it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLabelToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!labelToDelete || !onDeleteLabel) return;
                setIsDeleting(true);
                try {
                  await onDeleteLabel(labelToDelete.id);
                  // Remove from selected if it was selected
                  if (selectedLabelIds.has(labelToDelete.id)) {
                    const newSet = new Set(selectedLabelIds);
                    newSet.delete(labelToDelete.id);
                    setSelectedLabelIds(newSet);
                  }
                  setLabelToDelete(null);
                } catch (err) {
                  console.error("Failed to delete label:", err);
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
