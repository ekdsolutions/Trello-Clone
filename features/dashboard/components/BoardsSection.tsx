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
import { Board } from "@/lib/supabase/models";
import { Filter, Grid3X3, List, Plus, Search } from "lucide-react";
import Link from "next/link";

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
}: BoardsSectionProps) {
  if (loading) {
    return <BoardsSkeleton />;
  }
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
      {boards.length === 0 ? (
        <div>No boards yet</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {boards.map((board, key) => (
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
                    {board.description}
                  </CardDescription>
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Board
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden md:table-cell">
                  Tasks
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board, key) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <Link href={`/boards/${board.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded flex-shrink-0 ${board.color}`} />
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {board.title}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden mt-1">
                            {board.totalTasks ?? 0} tasks
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                    {board.description || (
                      <span className="text-gray-400 italic">No description</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                    {board.totalTasks ?? 0}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
                    {new Date(board.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
                    {new Date(board.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="py-4 px-4">
                  <div
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group rounded-lg p-6 flex flex-col items-center justify-center"
                    onClick={onCreateBoard}
                  >
                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600 font-medium group-hover:text-blue-600">
                      Create new board
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
