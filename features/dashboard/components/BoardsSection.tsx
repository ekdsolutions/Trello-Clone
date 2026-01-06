"use client";

import { BoardsSkeleton } from "@/components/skeletons/Boards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Board, Label } from "@/lib/supabase/models";
import { Filter, Grid3X3, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableBoardRow } from "./SortableBoardRow";
import { useState, useEffect } from "react";

interface BoardsSectionProps {
  boards: Board[];
  loading: boolean;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFilterClick: () => void;
  onCreateBoard: () => void;
  activeFilterCount: number;
  isFreeUser: boolean;
  onSearchChange: (value: string) => void;
  searchValue: string;
  onReorderBoards?: (newOrder: { id: string; sort_order: number }[]) => void;
  onBoardValueUpdate?: (boardId: string, updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null }) => void;
  allLabels?: Label[];
  onLabelsUpdate?: (boardId: string, labelIds: string[]) => Promise<void>;
  onCreateLabel?: (text: string, color: string) => Promise<Label>;
}

export function BoardsSection({
  boards,
  loading,
  viewMode,
  onViewModeChange,
  onFilterClick,
  onCreateBoard,
  activeFilterCount,
  isFreeUser,
  onSearchChange,
  searchValue,
  onReorderBoards,
  onBoardValueUpdate,
  allLabels = [],
  onLabelsUpdate,
  onCreateLabel,
}: BoardsSectionProps) {
  const [localBoards, setLocalBoards] = useState(boards);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update local boards when prop changes
  useEffect(() => {
    setLocalBoards(boards);
  }, [boards]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localBoards.findIndex((board) => board.id === active.id);
      const newIndex = localBoards.findIndex((board) => board.id === over.id);

      const newBoards = arrayMove(localBoards, oldIndex, newIndex);
      setLocalBoards(newBoards);

      // Update sort orders
      const newOrder = newBoards.map((board, index) => ({
        id: board.id,
        sort_order: index,
      }));

      if (onReorderBoards) {
        onReorderBoards(newOrder);
      }
    }
  };

  if (loading) {
    return <BoardsSkeleton />;
  }

  const displayBoards = localBoards;
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Your Boards
          </h2>
          <p className="text-gray-600">Manage your projects and tasks</p>
          {isFreeUser && (
            <p className="text-sm text-gray-500 mt-1">
              Free Plan: {boards.length}/1 boards used
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 bg-white border p-1 rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="cursor-pointer"
            >
              <Grid3X3 />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="cursor-pointer"
            >
              <List />
            </Button>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="py-5 cursor-pointer"
            onClick={onFilterClick}
          >
            <Filter />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant={"outline"}>{activeFilterCount}</Badge>
            )}
          </Button>
          <Button onClick={onCreateBoard} className="py-5 cursor-pointer">
            <Plus />
            Create Board
          </Button>
        </div>
      </div>

      {/* Search Boards */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="search"
          placeholder="Search Boards..."
          className="pl-10"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Boards Grids/List */}
      {displayBoards.length === 0 ? (
        <div>No boards yet</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayBoards.map((board, key) => (
            <Link href={`/boards/${board.id}`} key={key}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-4 h-4 rounded ${board.color} `} />
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {board.title}
                  </CardTitle>
                  <CardDescription className="text-sm mb-4">
                    {board.labels && board.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {board.labels.map((label) => (
                          <span
                            key={label.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                          >
                            <div className={`w-2 h-2 rounded-full ${label.color}`} />
                            <span>{label.text}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No labels</span>
                    )}
                  </CardDescription>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("he-IL", {
                          style: "currency",
                          currency: "ILS",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(board.total_value || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Upcoming:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("he-IL", {
                          style: "currency",
                          currency: "ILS",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(board.upcoming_value || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 space-y-1 sm:space-y-0">
                    <span>
                      Created {new Date(board.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      Updated {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Card
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
            onClick={onCreateBoard}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[150px] box-border">
              <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
              <p className="text-sm sm:text-base text-gray-600 font-medium group-hover:text-blue-600">
                Create new board
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-8">
                    {/* Drag handle column */}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Board
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                    Label
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Upcoming
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Received
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Annual
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={displayBoards.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {displayBoards.map((board) => (
                    <SortableBoardRow
                      key={board.id}
                      board={board}
                      allLabels={allLabels}
                      onValueUpdate={onBoardValueUpdate || (() => {})}
                      onLabelsUpdate={onLabelsUpdate || (async () => {})}
                      onCreateLabel={onCreateLabel || (async () => {
                        throw new Error("createLabel function not provided");
                      })}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
          <div className="mt-4">
            <div
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group rounded-lg p-6 flex flex-col items-center justify-center"
              onClick={onCreateBoard}
            >
              <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 font-medium group-hover:text-blue-600">
                Create new board
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
