"use client";

import Navbar from "@/components/layout/Navbar";
import { Board } from "@/lib/supabase/models";
import { useState, useEffect } from "react";
import { useBoards } from "../hooks/useBoards";
import { usePlan } from "../hooks/usePlan";
import { UpgradeDialog } from "./UpgradeDialog";
import { FilterDialog } from "./FilterDialog";
import { BoardsSection } from "./BoardsSection";
import { ErrorState } from "@/components/common/Error";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { EditBoardDialog } from "./EditBoardDialog";
import { colors } from "@/features/boards/constants";
import { boardService } from "@/lib/services";
import { useSupabase } from "@/providers/SupabaseProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VIEW_MODE_STORAGE_KEY = "tasker-view-mode";

export default function Dashboard() {
  const { createBoard, boards, labels, loading, error, refetch, reorderBoards, updateBoardValue, updateBoardLabels, createLabel, deleteBoard, deleteLabel } = useBoards();
  const { isFreeUser } = usePlan();
  const { supabase } = useSupabase();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load viewMode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState<boolean>(false);
  const [newBoardTitle, setNewBoardTitle] = useState<string>("");
  const [newBoardLabelIds, setNewBoardLabelIds] = useState<string[]>([]);
  const [newBoardColor, setNewBoardColor] = useState<string>(colors[0]);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState<string>("");
  const [editingBoardLabelIds, setEditingBoardLabelIds] = useState<string[]>([]);
  const [editingBoardColor, setEditingBoardColor] = useState<string>(colors[0]);
  const [isEditBoardDialogOpen, setIsEditBoardDialogOpen] = useState<boolean>(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
    taskCount: {
      min: null as number | null,
      max: null as number | null,
    },
  });

  const canCreateBoard = !isFreeUser || boards.length < 1;

  function clearFilters() {
    setFilters({
      search: "",
      dateRange: {
        start: null as string | null,
        end: null as string | null,
      },
      taskCount: {
        min: null as number | null,
        max: null as number | null,
      },
    });
  }

  const handleCreateBoard = () => {
    if (!canCreateBoard) {
      setShowUpgradeDialog(true);
      return;
    }
    // Reset form and open dialog
    setNewBoardTitle("");
    setNewBoardLabelIds([]);
    setNewBoardColor(colors[0]);
    setIsCreateBoardDialogOpen(true);
  };

  const handleSubmitCreateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const board = await createBoard({
        title: newBoardTitle.trim(),
        color: newBoardColor,
      });
      // Update labels if any were selected
      if (newBoardLabelIds.length > 0 && board?.id) {
        await updateBoardLabels(board.id, newBoardLabelIds);
      }
      setIsCreateBoardDialogOpen(false);
      // Reset form
      setNewBoardTitle("");
      setNewBoardLabelIds([]);
      setNewBoardColor(colors[0]);
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const handleSubmitEditBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBoardId || !editingBoardTitle.trim()) return;

    try {
      // Update board title and color
      await boardService.updateBoard(supabase!, editingBoardId, {
        title: editingBoardTitle.trim(),
        color: editingBoardColor,
      });
      // Update labels
      await updateBoardLabels(editingBoardId, editingBoardLabelIds);
      setIsEditBoardDialogOpen(false);
      setEditingBoardId(null);
      refetch();
    } catch (err) {
      console.error("Failed to update board:", err);
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    setDeletingBoardId(boardId);
  };

  const confirmDeleteBoard = async () => {
    if (!deletingBoardId) return;
    try {
      await deleteBoard(deletingBoardId);
      setDeletingBoardId(null);
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  const handleEditBoard = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    setEditingBoardId(boardId);
    setEditingBoardTitle(board.title);
    setEditingBoardLabelIds(board.labels?.map((l) => l.id) || []);
    setEditingBoardColor(board.color);
    setIsEditBoardDialogOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const filteredBoards = boards.filter((board: Board) => {
    const taskCount = board.totalTasks ?? 0;
    const matchesSearch = board.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesDateRange =
      (!filters.dateRange.start ||
        new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(board.created_at) <= new Date(filters.dateRange.end));
    const matchesTaskCount =
      (!filters.taskCount.min || taskCount >= filters.taskCount.min) &&
      (!filters.taskCount.max || taskCount <= filters.taskCount.max);

    return matchesSearch && matchesDateRange && matchesTaskCount;
  });

  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.dateRange.start ? 1 : 0,
    filters.dateRange.end ? 1 : 0,
    filters.taskCount.min !== null ? 1 : 0,
    filters.taskCount.max !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <ErrorState
            title="Error loading boards"
            message={error}
            onRetry={refetch}
            retryText="Reload boards"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <BoardsSection
          boards={filteredBoards}
          loading={loading}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onFilterClick={() => setIsFilterOpen(true)}
          onCreateBoard={handleCreateBoard}
          activeFilterCount={activeFilterCount}
          isFreeUser={isFreeUser}
          onSearchChange={handleSearchChange}
          searchValue={filters.search}
          onReorderBoards={reorderBoards}
          onBoardValueUpdate={updateBoardValue as any}
          allLabels={labels}
          onLabelsUpdate={updateBoardLabels}
          onCreateLabel={createLabel}
          onDeleteLabel={deleteLabel}
          onEditBoard={handleEditBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      </main>
      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />

      <CreateBoardDialog
        isOpen={isCreateBoardDialogOpen}
        onOpenChange={setIsCreateBoardDialogOpen}
        title={newBoardTitle}
        onTitleChange={setNewBoardTitle}
        selectedLabelIds={newBoardLabelIds}
        onLabelIdsChange={setNewBoardLabelIds}
        allLabels={labels}
        onCreateLabel={createLabel}
        color={newBoardColor}
        onColorChange={setNewBoardColor}
        onSubmit={handleSubmitCreateBoard}
      />

      <EditBoardDialog
        isOpen={isEditBoardDialogOpen}
        onOpenChange={setIsEditBoardDialogOpen}
        title={editingBoardTitle}
        onTitleChange={setEditingBoardTitle}
        selectedLabelIds={editingBoardLabelIds}
        onLabelIdsChange={setEditingBoardLabelIds}
        allLabels={labels}
        onCreateLabel={createLabel}
        onDeleteLabel={deleteLabel}
        color={editingBoardColor}
        onColorChange={setEditingBoardColor}
        onSubmit={handleSubmitEditBoard}
      />

      <Dialog open={!!deletingBoardId} onOpenChange={(open) => !open && setDeletingBoardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this board? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingBoardId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteBoard}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
