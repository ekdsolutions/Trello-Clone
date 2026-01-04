"use client";

import Navbar from "@/components/layout/Navbar";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ErrorState } from "@/components/common/Error";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TaskOverlay } from "./TaskOverlay";
import { BoardHeader } from "./BoardHeader";
import { BoardColumns } from "./BoardColumns";
import { EditBoardDialog } from "./EditBoardDialog";
import { FilterDialog } from "./FilterDialog";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { CreateColumnDialog } from "./CreateColumnDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { EditColumnDialog } from "./EditColumnDialog";
import { DeleteColumnDialog } from "./DeleteColumnDialog";
import { useBoard } from "../hooks/useBoard";

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    moveTask,
    createColumn,
    updateColumn,
    deleteRealTask,
    deleteRealColumn,
  } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null
  );
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleFilterChange = (
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  };

  const handleUpdateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error updating board:", err);
    }
  };

  const createTask = async (
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    },
    columnId?: string
  ) => {
    const targetColumn = columnId ? columnId : columns[0].id;
    if (!targetColumn) {
      throw new Error("No column found");
    }
    await createRealTask(targetColumn, taskData);
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string | undefined,
      assignee: formData.get("assignee") as string | undefined,
      priority: formData.get("priority") as "low" | "medium" | "high",
      dueDate: formData.get("dueDate") as string | undefined,
    };
    const columnId = formData.get("columnId") as string;
    if (taskData.title.trim()) {
      await createTask(taskData, columnId);
      setIsCreatingTask(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((column) => column.tasks)
      .find((task) => task.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    console.log("Dragging Over", { activeId, overId });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      const targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId
        );
        if (oldIndex !== newIndex) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  };

  const handleUpdateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumnTitle.trim() || !editingColumn) return;
    await updateColumn(editingColumn?.id, editingColumnTitle);
    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  };

  const handleEditColumn = (column: ColumnWithTasks) => {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  };

  const requestDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeletingTask(true);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    await deleteRealTask(deletingTaskId);
    setIsDeletingTask(false);
    setDeletingTaskId(null);
  };

  const requestDeleteColumn = (columnId: string) => {
    setDeletingColumnId(columnId);
    setIsDeletingColumn(true);
  };

  const confirmDeleteColumn = async () => {
    if (!deletingColumnId) return;
    await deleteRealColumn(deletingColumnId);
    setIsDeletingColumn(false);
    setDeletingColumnId(null);
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      if (filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();

        if (taskDate !== filterDate) {
          return false;
        }
      }

      return true;
    }),
  }));

  if (error) {
    console.log(error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <ErrorState
            title="Error loading board"
            message={error}
            onRetry={() => window.location.reload()}
            retryText="Reload board"
          />
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        <main className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <BoardHeader
            totalTasks={columns?.reduce(
              (sum, column) => sum + column.tasks.length,
              0
            )}
            loading={loading}
            onCreateColumn={() => setIsCreatingColumn(true)}
            onCreateTask={() => setIsCreatingTask(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <BoardColumns
              columns={filteredColumns}
              loading={loading}
              onCreateTask={handleCreateTask}
              onEditColumn={handleEditColumn}
              onDeleteColumn={requestDeleteColumn}
              onDeleteTask={requestDeleteTask}
              onCreateColumn={() => setIsCreatingColumn(true)}
              viewMode={viewMode}
            />
            <DragOverlay>
              {activeTask ? <TaskOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      <EditBoardDialog
        isOpen={isEditingTitle}
        onOpenChange={setIsEditingTitle}
        title={newTitle}
        onTitleChange={setNewTitle}
        color={newColor}
        onColorChange={setNewColor}
        onSubmit={handleUpdateBoard}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <CreateTaskDialog
        isOpen={isCreatingTask}
        onOpenChange={setIsCreatingTask}
        onSubmit={handleCreateTask}
      />

      <CreateColumnDialog
        isOpen={isCreatingColumn}
        onOpenChange={setIsCreatingColumn}
        title={newColumnTitle}
        onTitleChange={setNewColumnTitle}
        onSubmit={handleCreateColumn}
      />

      <EditColumnDialog
        isOpen={isEditingColumn}
        onOpenChange={setIsEditingColumn}
        title={editingColumnTitle}
        onTitleChange={setEditingColumnTitle}
        onSubmit={handleUpdateColumn}
        onCancel={() => {
          setIsEditingColumn(false);
          setEditingColumnTitle("");
          setEditingColumn(null);
        }}
      />

      <DeleteTaskDialog
        isOpen={isDeletingTask}
        onOpenChange={setIsDeletingTask}
        onConfirm={confirmDeleteTask}
      />

      <DeleteColumnDialog
        isOpen={isDeletingColumn}
        onOpenChange={setIsDeletingColumn}
        onConfirm={confirmDeleteColumn}
      />
    </>
  );
}
