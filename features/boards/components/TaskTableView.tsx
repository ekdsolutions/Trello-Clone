"use client";

import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Calendar, Trash2, User, GripVertical } from "lucide-react";
import { getPriorityColor } from "../utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface TaskTableViewProps {
  columns: ColumnWithTasks[];
  onDeleteTask: (taskId: string) => void;
  moveTask?: (taskId: string, columnId: string, newIndex: number) => Promise<void>;
}

interface SortableTaskRowProps {
  task: Task & { columnTitle: string; columnId: string };
  onDeleteTask: (taskId: string) => void;
}

function SortableTaskRow({ task, onDeleteTask }: SortableTaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="font-medium text-gray-900">{task.title}</div>
        </div>
        <div className="text-xs text-gray-500 sm:hidden mt-1 ml-6">
          {task.description ? (
            <span className="line-clamp-1">{task.description}</span>
          ) : (
            <span className="text-gray-400 italic">No description</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
        {task.description || (
          <span className="text-gray-400 italic">No description</span>
        )}
      </td>
      <td className="py-4 px-4">
        <Badge variant="secondary" className="text-xs">
          {task.columnTitle}
        </Badge>
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
        {task.assignee ? (
          <div className="flex items-center space-x-1">
            <User className="size-3.5 text-gray-400" />
            <span>{task.assignee}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {task.due_date ? (
          <div className="flex items-center space-x-1">
            <Calendar className="size-3.5 text-gray-400" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${getPriorityColor(
              task.priority
            )}`}
          />
          <span className="text-xs text-gray-600 capitalize hidden sm:inline">
            {task.priority}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="p-1.5 hover:bg-gray-100 rounded-md group"
          onClick={() => onDeleteTask(task.id)}
        >
          <Trash2 className="text-red-400 cursor-pointer group-hover:text-red-500 w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

interface DroppableColumnSectionProps {
  column: ColumnWithTasks;
  children: React.ReactNode;
}

function DroppableColumnSection({ column, children }: DroppableColumnSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <tbody
      ref={setNodeRef}
      className={isOver ? "bg-blue-50" : ""}
    >
      {children}
    </tbody>
  );
}

export function TaskTableView({ columns, onDeleteTask, moveTask }: TaskTableViewProps) {
  // Flatten all tasks from all columns with their column info
  const allTasks = columns.flatMap((column) =>
    column.tasks.map((task) => ({
      ...task,
      columnTitle: column.title,
      columnId: column.id,
    }))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">
              {/* Drag handle column */}
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Task
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">
              Description
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Column
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden md:table-cell">
              Assignee
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">
              Due Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Priority
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        {columns.map((column) => (
          <DroppableColumnSection key={column.id} column={column}>
            {column.tasks.length > 0 ? (
              column.tasks.map((task) => (
                <SortableTaskRow
                  key={task.id}
                  task={{
                    ...task,
                    columnTitle: column.title,
                    columnId: column.id,
                  }}
                  onDeleteTask={onDeleteTask}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 px-4 text-center text-gray-400 text-sm"
                >
                  <div className="font-medium text-gray-600 mb-1">
                    {column.title}
                  </div>
                  <div>No tasks in this list</div>
                </td>
              </tr>
            )}
          </DroppableColumnSection>
        ))}
        {allTasks.length === 0 && (
          <tbody>
            <tr>
              <td colSpan={8} className="py-12 px-4 text-center text-gray-500">
                <p>No tasks yet. Create a task to get started!</p>
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}

