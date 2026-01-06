"use client";

import { Board } from "@/lib/supabase/models";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { GripVertical } from "lucide-react";

interface SortableBoardRowProps {
  board: Board;
  onValueUpdate: (boardId: string, updates: { total_value?: number; upcoming_value?: number; received_value?: number; retainer_y?: number }) => void;
}

export function SortableBoardRow({ board, onValueUpdate }: SortableBoardRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id });

  const [totalValue, setTotalValue] = useState<string>(board.total_value?.toString() || "0");
  const [upcomingValue, setUpcomingValue] = useState<string>(board.upcoming_value?.toString() || "0");
  const [receivedValue, setReceivedValue] = useState<string>(board.received_value?.toString() || "0");
  const [retainerY, setRetainerY] = useState<string>(board.retainer_y?.toString() || "0");
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingUpcoming, setIsEditingUpcoming] = useState(false);
  const [isEditingReceived, setIsEditingReceived] = useState(false);
  const [isEditingRetainer, setIsEditingRetainer] = useState(false);

  // Sync local state with board prop changes (when not editing)
  useEffect(() => {
    if (!isEditingTotal) {
      setTotalValue(board.total_value?.toString() || "0");
    }
  }, [board.total_value, isEditingTotal]);

  useEffect(() => {
    if (!isEditingUpcoming) {
      setUpcomingValue(board.upcoming_value?.toString() || "0");
    }
  }, [board.upcoming_value, isEditingUpcoming]);

  useEffect(() => {
    if (!isEditingReceived) {
      setReceivedValue(board.received_value?.toString() || "0");
    }
  }, [board.received_value, isEditingReceived]);

  useEffect(() => {
    if (!isEditingRetainer) {
      setRetainerY(board.retainer_y?.toString() || "0");
    }
  }, [board.retainer_y, isEditingRetainer]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleTotalValueBlur = () => {
    setIsEditingTotal(false);
    const numValue = parseFloat(totalValue) || 0;
    if (numValue !== board.total_value) {
      onValueUpdate(board.id, { total_value: numValue });
    } else {
      setTotalValue(board.total_value?.toString() || "0");
    }
  };

  const handleUpcomingValueBlur = () => {
    setIsEditingUpcoming(false);
    const numValue = parseFloat(upcomingValue) || 0;
    if (numValue !== board.upcoming_value) {
      onValueUpdate(board.id, { upcoming_value: numValue });
    } else {
      setUpcomingValue(board.upcoming_value?.toString() || "0");
    }
  };

  const handleTotalValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTotalValueBlur();
    } else if (e.key === "Escape") {
      setTotalValue(board.total_value?.toString() || "0");
      setIsEditingTotal(false);
    }
  };

  const handleUpcomingValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpcomingValueBlur();
    } else if (e.key === "Escape") {
      setUpcomingValue(board.upcoming_value?.toString() || "0");
      setIsEditingUpcoming(false);
    }
  };

  const handleReceivedValueBlur = () => {
    setIsEditingReceived(false);
    const numValue = parseFloat(receivedValue) || 0;
    if (numValue !== board.received_value) {
      onValueUpdate(board.id, { received_value: numValue });
    } else {
      setReceivedValue(board.received_value?.toString() || "0");
    }
  };

  const handleRetainerYBlur = () => {
    setIsEditingRetainer(false);
    const numValue = parseFloat(retainerY) || 0;
    if (numValue !== board.retainer_y) {
      onValueUpdate(board.id, { retainer_y: numValue });
    } else {
      setRetainerY(board.retainer_y?.toString() || "0");
    }
  };

  const handleReceivedValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleReceivedValueBlur();
    } else if (e.key === "Escape") {
      setReceivedValue(board.received_value?.toString() || "0");
      setIsEditingReceived(false);
    }
  };

  const handleRetainerYKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRetainerYBlur();
    } else if (e.key === "Escape") {
      setRetainerY(board.retainer_y?.toString() || "0");
      setIsEditingRetainer(false);
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <td className="py-4 px-4 w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </td>
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
        {isEditingUpcoming ? (
          <Input
            type="number"
            value={upcomingValue}
            onChange={(e) => setUpcomingValue(e.target.value)}
            onBlur={handleUpcomingValueBlur}
            onKeyDown={handleUpcomingValueKeyDown}
            className="w-24 h-8"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingUpcoming(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {formatCurrency(board.upcoming_value || 0)}
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {isEditingReceived ? (
          <Input
            type="number"
            value={receivedValue}
            onChange={(e) => setReceivedValue(e.target.value)}
            onBlur={handleReceivedValueBlur}
            onKeyDown={handleReceivedValueKeyDown}
            className="w-24 h-8"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingReceived(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {formatCurrency(board.received_value || 0)}
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {isEditingTotal ? (
          <Input
            type="number"
            value={totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
            onBlur={handleTotalValueBlur}
            onKeyDown={handleTotalValueKeyDown}
            className="w-24 h-8"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingTotal(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {formatCurrency(board.total_value || 0)}
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {isEditingRetainer ? (
          <Input
            type="number"
            value={retainerY}
            onChange={(e) => setRetainerY(e.target.value)}
            onBlur={handleRetainerYBlur}
            onKeyDown={handleRetainerYKeyDown}
            className="w-24 h-8"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingRetainer(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {formatCurrency(board.retainer_y || 0)}
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {new Date(board.created_at).toLocaleDateString()}
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
        {new Date(board.updated_at).toLocaleDateString()}
      </td>
    </tr>
  );
}

