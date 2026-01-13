"use client";

import { BoardsSkeleton } from "@/components/skeletons/Boards";
import { Board, Label, SavedProduct } from "@/lib/supabase/models";
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
  isFreeUser: boolean;
  onReorderBoards?: (newOrder: { id: string; sort_order: number }[]) => void;
  onBoardValueUpdate?: (boardId: string, updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null; notes?: string | null }) => void;
  allLabels?: Label[];
  onLabelsUpdate?: (boardId: string, labelIds: string[]) => Promise<void>;
  onCreateLabel?: (text: string, color: string) => Promise<Label>;
  onDeleteLabel?: (labelId: string) => Promise<void>;
  savedProducts?: SavedProduct[];
  onProductsUpdate?: (boardId: string, products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number; cost: number }>) => Promise<void>;
  onCreateSavedProduct?: (name: string) => Promise<SavedProduct>;
  onEditBoard?: (boardId: string) => void;
  onDeleteBoard?: (boardId: string) => void;
}

export function BoardsSection({
  boards,
  loading,
  isFreeUser,
  onReorderBoards,
  onBoardValueUpdate,
  allLabels = [],
  onLabelsUpdate,
  onCreateLabel,
  onDeleteLabel,
  savedProducts = [],
  onProductsUpdate,
  onCreateSavedProduct,
  onEditBoard,
  onDeleteBoard,
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
      const newOrder = newBoards.map((board: Board, index: number) => ({
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
  
  // Calculate summary totals
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return "-";
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalPending = displayBoards.reduce((sum: number, board: Board) => sum + (board.upcoming_value || 0), 0);
  const totalReceived = displayBoards.reduce((sum: number, board: Board) => sum + (board.received_value || 0), 0);
  // Calculate net annual (annual price - annual cost) from all products across all boards
  const totalAnnual = displayBoards.reduce((sum: number, board: Board) => {
    const boardNetAnnual = board.products?.reduce((productSum: number, product: any) => {
      const annualPrice = product.price / product.period;
      const annualCost = product.cost || 0;
      return productSum + (annualPrice - annualCost);
    }, 0) || 0;
    return sum + boardNetAnnual;
  }, 0);
  const boardsCount = displayBoards.length;

  return (
    <div className="mb-6 sm:mb-8">
      {/* Boards List */}
      {displayBoards.length === 0 ? (
        <div>No boards yet</div>
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
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 w-8">
                     {/* Drag handle column */}
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">
                     Board
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                     Label
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Products
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Pending
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Received
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Total
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Annual
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Started
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Ending
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Notes
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 hidden lg:table-cell">
                     Status
                   </th>
                   <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 w-12">
                     {/* Actions column */}
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
                      onDeleteLabel={onDeleteLabel}
                      savedProducts={savedProducts}
                      onProductsUpdate={onProductsUpdate || (async () => {})}
                      onCreateSavedProduct={onCreateSavedProduct || (async () => {
                        throw new Error("createSavedProduct function not provided");
                      })}
                      onEditBoard={onEditBoard}
                      onDeleteBoard={onDeleteBoard}
                    />
                  ))}
                </SortableContext>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td className="py-2 px-3 text-sm text-gray-700 w-8">
                    {/* Empty drag handle cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700">
                    {boardsCount} {boardsCount === 1 ? "Board" : "Boards"}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden sm:table-cell">
                    {/* Empty label cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty products cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {formatCurrency(totalPending)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {formatCurrency(totalReceived)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty total cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {formatCurrency(totalAnnual)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty started cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty ending cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty notes cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 hidden lg:table-cell">
                    {/* Empty status cell */}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 w-12">
                    {/* Empty actions cell */}
                  </td>
                </tr>
              </tfoot>
            </table>
          </DndContext>
        </div>
      )}
    </div>
  );
}
