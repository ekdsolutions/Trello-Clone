"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    taskCount: {
      min: number | null;
      max: number | null;
    };
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function FilterDialog({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  onClearFilters,
}: FilterDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filter Boards"
      description="Filter boards by date or task count."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={filters.dateRange.start ?? ""}
                onChange={(e) =>
                  onFiltersChange((prev: any) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      start: e.target.value || null,
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={filters.dateRange.end ?? ""}
                onChange={(e) =>
                  onFiltersChange((prev: any) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      end: e.target.value || null,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Task Count</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Minimum</Label>
              <Input
                value={filters.taskCount.min ?? ""}
                type="number"
                min="0"
                placeholder="Min tasks"
                onChange={(e) =>
                  onFiltersChange((prev: any) => ({
                    ...prev,
                    taskCount: {
                      ...prev.taskCount,
                      min: e.target.value ? Number(e.target.value) : null,
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs">Maximum</Label>
              <Input
                value={filters.taskCount.max ?? ""}
                type="number"
                min="0"
                placeholder="Max tasks"
                onChange={(e) =>
                  onFiltersChange((prev: any) => ({
                    ...prev,
                    taskCount: {
                      ...prev.taskCount,
                      max: e.target.value ? Number(e.target.value) : null,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
