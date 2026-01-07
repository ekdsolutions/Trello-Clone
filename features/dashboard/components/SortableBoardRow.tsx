"use client";

import { Board, Label, SavedProduct } from "@/lib/supabase/models";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { GripVertical, MoreVertical, Receipt, Recycle, Hammer, CircleCheck, NotepadText } from "lucide-react";
import { LabelEditor } from "./LabelEditor";
import { ProductsEditor } from "./ProductsEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SortableBoardRowProps {
  board: Board;
  allLabels: Label[];
  onValueUpdate: (boardId: string, updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null; notes?: string | null }) => void;
  onLabelsUpdate: (boardId: string, labelIds: string[]) => Promise<void>;
  onCreateLabel: (text: string, color: string) => Promise<Label>;
  onDeleteLabel?: (labelId: string) => Promise<void>;
  savedProducts?: SavedProduct[];
  onProductsUpdate?: (boardId: string, products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>) => Promise<void>;
  onCreateSavedProduct?: (name: string) => Promise<SavedProduct>;
  onEditBoard?: (boardId: string) => void;
  onDeleteBoard?: (boardId: string) => void;
}

export function SortableBoardRow({ board, allLabels, onValueUpdate, onLabelsUpdate, onCreateLabel, onDeleteLabel, savedProducts = [], onProductsUpdate, onCreateSavedProduct, onEditBoard, onDeleteBoard }: SortableBoardRowProps) {
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
  const [startedDate, setStartedDate] = useState<string>(board.started_date ? new Date(board.started_date).toISOString().split('T')[0] : "");
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingUpcoming, setIsEditingUpcoming] = useState(false);
  const [isEditingReceived, setIsEditingReceived] = useState(false);
  const [isEditingStarted, setIsEditingStarted] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesValue, setNotesValue] = useState<string>(board.notes || "");

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
    if (!isEditingStarted) {
      setStartedDate(board.started_date ? new Date(board.started_date).toISOString().split('T')[0] : "");
    }
  }, [board.started_date, isEditingStarted]);

  useEffect(() => {
    if (!isNotesModalOpen) {
      setNotesValue(board.notes || "");
    }
  }, [board.notes, isNotesModalOpen]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (!value || value === 0) return "-";
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusIcon = () => {
    const upcoming = board.upcoming_value || 0;
    const annual = board.annual || 0;
    const received = board.received_value || 0;
    const total = board.total_value || 0;
    const endingDate = board.ending_date;

    // Check if ending date is within 3 months
    let endingWithin3Months = false;
    if (endingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ending = new Date(endingDate);
      ending.setHours(0, 0, 0, 0);
      const threeMonthsFromNow = new Date(today);
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      endingWithin3Months = ending <= threeMonthsFromNow && ending >= today;
    }

    // Rule 1: If upcoming has value (not 0), show Receipt (red-700)
    if (upcoming > 0) {
      return { icon: Receipt, bgColor: "bg-red-700", color: "text-white" };
    }

    // Rule 3a: If upcoming and received are empty but total has any value, show Hammer (orange)
    // This rule overrides the recycle rule
    if (upcoming === 0 && received === 0 && total > 0) {
      return { icon: Hammer, bgColor: "bg-orange-500", color: "text-white" };
    }

    // Rule 3b: If upcoming and annual are empty and received != total, show Hammer (orange)
    // This rule overrides the recycle rule
    if (upcoming === 0 && annual === 0 && received !== total) {
      return { icon: Hammer, bgColor: "bg-orange-500", color: "text-white" };
    }

    // Rule 2: If upcoming is empty but annual has value, show Recycle
    // If ending date is within 3 months, use red-700 background, otherwise blue
    if (upcoming === 0 && annual > 0) {
      return { 
        icon: Recycle, 
        bgColor: endingWithin3Months ? "bg-red-700" : "bg-blue-500", 
        color: "text-white" 
      };
    }

    // Rule 4: If upcoming and annual are empty but received equals total, show CircleCheck (green)
    if (upcoming === 0 && annual === 0 && received === total && total > 0) {
      return { icon: CircleCheck, bgColor: "bg-green-500", color: "text-white" };
    }

    // Default: no status
    return null;
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

  const handleStartedDateBlur = () => {
    setIsEditingStarted(false);
    const dateValue = startedDate || null;
    if (dateValue !== (board.started_date ? new Date(board.started_date).toISOString().split('T')[0] : "")) {
      onValueUpdate(board.id, { started_date: dateValue || null });
    } else {
      setStartedDate(board.started_date ? new Date(board.started_date).toISOString().split('T')[0] : "");
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

  const handleStartedDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStartedDateBlur();
    } else if (e.key === "Escape") {
      setStartedDate(board.started_date ? new Date(board.started_date).toISOString().split('T')[0] : "");
      setIsEditingStarted(false);
    }
  };

  const handleLabelSave = async (labelIds: string[]) => {
    setIsEditingLabel(false);
    await onLabelsUpdate(board.id, labelIds);
  };

  const handleNotesSave = () => {
    onValueUpdate(board.id, { notes: notesValue.trim() || null });
    setIsNotesModalOpen(false);
  };

  const handleProductsSave = async (products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>) => {
    if (onProductsUpdate) {
      await onProductsUpdate(board.id, products);
    }
    setIsEditingProducts(false);
  };

  const handleNotesCancel = () => {
    setNotesValue(board.notes || "");
    setIsNotesModalOpen(false);
  };

  useEffect(() => {
    if (!isNotesModalOpen) {
      setNotesValue(board.notes || "");
    }
  }, [board.notes, isNotesModalOpen]);

  const statusIcon = getStatusIcon();
  const hasNotes = board.notes && board.notes.trim().length > 0;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <td className="py-2 px-3 w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </td>
      <td className="py-2 px-3">
        <Link href={`/boards/${board.id}`}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-4 h-4 rounded flex-shrink-0 ${board.color}`} />
            <div>
              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {board.title}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden sm:table-cell relative">
        {isEditingLabel ? (
          <LabelEditor
            boardLabels={board.labels || []}
            allLabels={allLabels}
            onSave={handleLabelSave}
            onCancel={() => setIsEditingLabel(false)}
            onCreateLabel={onCreateLabel}
            onDeleteLabel={onDeleteLabel}
          />
        ) : (
          <div
            onClick={() => setIsEditingLabel(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[100px]"
          >
            {board.labels && board.labels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {board.labels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                    >
                      <div className={`w-2 h-2 rounded-full ${label.color}`} />
                      <span className="uppercase">{label.text}</span>
                    </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic">-</span>
            )}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell relative">
        {isEditingProducts ? (
          <ProductsEditor
            products={board.products || []}
            savedProducts={savedProducts}
            onSave={handleProductsSave}
            onCancel={() => setIsEditingProducts(false)}
            onCreateSavedProduct={onCreateSavedProduct || (async () => {
              throw new Error("createSavedProduct function not provided");
            })}
          />
        ) : (
          <div
            onClick={() => setIsEditingProducts(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {board.products && board.products.length > 0
              ? `${board.products.length} ${board.products.length === 1 ? "Product" : "Products"}`
              : "-"}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
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
            {formatCurrency(board.upcoming_value)}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
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
            {formatCurrency(board.received_value)}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
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
            {formatCurrency(board.total_value)}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
        {formatCurrency(board.annual)}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
        {isEditingStarted ? (
          <Input
            type="date"
            value={startedDate}
            onChange={(e) => setStartedDate(e.target.value)}
            onBlur={handleStartedDateBlur}
            onKeyDown={handleStartedDateKeyDown}
            className="w-32 h-8"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingStarted(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-w-[80px] inline-block"
          >
            {formatDate(board.started_date)}
          </div>
        )}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
        {formatDate(board.ending_date)}
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className={`inline-flex items-center justify-center w-6 h-6 rounded cursor-pointer transition-colors ${
                  hasNotes ? "bg-gray-700 text-white hover:bg-gray-800" : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                }`}
              >
                <NotepadText className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">
                {hasNotes ? board.notes : "Nothing here yet..."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden lg:table-cell">
        {statusIcon ? (
          <div className={`inline-flex items-center justify-center w-6 h-6 rounded ${statusIcon.bgColor} ${statusIcon.color}`}>
            <statusIcon.icon className="w-4 h-4" />
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="py-2 px-3 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEditBoard && (
              <DropdownMenuItem onClick={() => onEditBoard(board.id)}>
                Edit
              </DropdownMenuItem>
            )}
            {onDeleteBoard && (
              <DropdownMenuItem 
                onClick={() => onDeleteBoard(board.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      {/* Notes Edit Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>
              Add or edit notes for this board
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Enter notes..."
              className="min-h-[120px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleNotesCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleNotesSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </tr>
  );
}

