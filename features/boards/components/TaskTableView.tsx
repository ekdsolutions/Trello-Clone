"use client";

import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Calendar, Trash2, User } from "lucide-react";
import { getPriorityColor } from "../utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TaskTableViewProps {
  columns: ColumnWithTasks[];
  onDeleteTask: (taskId: string) => void;
}

export function TaskTableView({ columns, onDeleteTask }: TaskTableViewProps) {
  // Flatten all tasks from all columns with their column info
  const allTasks = columns.flatMap((column) =>
    column.tasks.map((task) => ({
      ...task,
      columnTitle: column.title,
      columnId: column.id,
    }))
  );

  if (allTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No tasks yet. Create a task to get started!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
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
        <tbody>
          {allTasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900">{task.title}</div>
                <div className="text-xs text-gray-500 sm:hidden mt-1">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

