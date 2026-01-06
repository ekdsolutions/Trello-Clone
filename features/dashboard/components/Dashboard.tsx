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
import { colors } from "@/features/boards/constants";

const VIEW_MODE_STORAGE_KEY = "tasker-view-mode";

export default function Dashboard() {
  const { createBoard, boards, labels, loading, error, refetch, reorderBoards, updateBoardValue, updateBoardLabels, createLabel } = useBoards();
  const { isFreeUser } = usePlan();
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
  const [newBoardDescription, setNewBoardDescription] = useState<string>("");
  const [newBoardColor, setNewBoardColor] = useState<string>(colors[0]);
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
    setNewBoardDescription("");
    setNewBoardColor(colors[0]);
    setIsCreateBoardDialogOpen(true);
  };

  const handleSubmitCreateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      await createBoard({
        title: newBoardTitle.trim(),
        description: newBoardDescription.trim() || undefined,
        color: newBoardColor,
      });
      setIsCreateBoardDialogOpen(false);
      // Reset form
      setNewBoardTitle("");
      setNewBoardDescription("");
      setNewBoardColor(colors[0]);
    } catch (err) {
      console.error("Failed to create board:", err);
    }
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
          onBoardValueUpdate={updateBoardValue}
          allLabels={labels}
          onLabelsUpdate={updateBoardLabels}
          onCreateLabel={createLabel}
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
        description={newBoardDescription}
        onDescriptionChange={setNewBoardDescription}
        color={newBoardColor}
        onColorChange={setNewBoardColor}
        onSubmit={handleSubmitCreateBoard}
      />
    </div>
  );
}
