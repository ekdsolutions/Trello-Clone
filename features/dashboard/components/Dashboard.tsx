"use client";

import Navbar from "@/components/layout/Navbar";
import { Board } from "@/lib/supabase/models";
import { useState } from "react";
import { useBoards } from "../hooks/useBoards";
import { usePlan } from "../hooks/usePlan";
import { UpgradeDialog } from "./UpgradeDialog";
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

export default function Dashboard() {
  const { createBoard, boards, labels, savedProducts, loading, error, refetch, reorderBoards, updateBoardValue, updateBoardLabels, updateBoardProducts, createLabel, createSavedProduct, deleteBoard, deleteLabel } = useBoards();
  const { isFreeUser } = usePlan();
  const { supabase } = useSupabase();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState<boolean>(false);
  const [newBoardTitle, setNewBoardTitle] = useState<string>("");
  const [newBoardStartedDate, setNewBoardStartedDate] = useState<string>("");
  const [newBoardLabelIds, setNewBoardLabelIds] = useState<string[]>([]);
  const [newBoardProducts, setNewBoardProducts] = useState<Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>>([]);
  const [newBoardTotalValue, setNewBoardTotalValue] = useState<string>("");
  const [newBoardPendingValue, setNewBoardPendingValue] = useState<string>("");
  const [newBoardReceivedValue, setNewBoardReceivedValue] = useState<string>("");
  const [newBoardAnnualValue, setNewBoardAnnualValue] = useState<string>("");
  const [newBoardColor, setNewBoardColor] = useState<string>(colors[0]);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState<string>("");
  const [editingBoardStartedDate, setEditingBoardStartedDate] = useState<string>("");
  const [editingBoardLabelIds, setEditingBoardLabelIds] = useState<string[]>([]);
  const [editingBoardProducts, setEditingBoardProducts] = useState<Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>>([]);
  const [editingBoardTotalValue, setEditingBoardTotalValue] = useState<string>("");
  const [editingBoardPendingValue, setEditingBoardPendingValue] = useState<string>("");
  const [editingBoardReceivedValue, setEditingBoardReceivedValue] = useState<string>("");
  const [editingBoardAnnualValue, setEditingBoardAnnualValue] = useState<string>("");
  const [editingBoardColor, setEditingBoardColor] = useState<string>(colors[0]);
  const [isEditBoardDialogOpen, setIsEditBoardDialogOpen] = useState<boolean>(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  const canCreateBoard = !isFreeUser || boards.length < 1;

  const handleCreateBoard = () => {
    if (!canCreateBoard) {
      setShowUpgradeDialog(true);
      return;
    }
    // Reset form and open dialog
    setNewBoardTitle("");
    setNewBoardStartedDate("");
    setNewBoardLabelIds([]);
    setNewBoardProducts([]);
    setNewBoardTotalValue("");
    setNewBoardPendingValue("");
    setNewBoardReceivedValue("");
    setNewBoardAnnualValue("");
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
      
      if (board?.id) {
        // Update all fields
        const updates: any = {};
        if (newBoardStartedDate) {
          updates.started_date = newBoardStartedDate;
        }
        if (newBoardTotalValue) {
          updates.total_value = parseFloat(newBoardTotalValue) || 0;
        }
        if (newBoardPendingValue) {
          updates.upcoming_value = parseFloat(newBoardPendingValue) || 0;
        }
        if (newBoardReceivedValue) {
          updates.received_value = parseFloat(newBoardReceivedValue) || 0;
        }
        
        if (Object.keys(updates).length > 0) {
          await updateBoardValue(board.id, updates);
        }
        
        // Update labels if any were selected
        if (newBoardLabelIds.length > 0) {
          await updateBoardLabels(board.id, newBoardLabelIds);
        }
        
        // Update products if any were added
        if (newBoardProducts.length > 0) {
          await updateBoardProducts(board.id, newBoardProducts);
        }
      }
      
      setIsCreateBoardDialogOpen(false);
      // Reset form
      setNewBoardTitle("");
      setNewBoardStartedDate("");
      setNewBoardLabelIds([]);
      setNewBoardProducts([]);
      setNewBoardTotalValue("");
      setNewBoardPendingValue("");
      setNewBoardReceivedValue("");
      setNewBoardAnnualValue("");
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
      
      // Update all value fields
      const updates: any = {};
      if (editingBoardStartedDate) {
        updates.started_date = editingBoardStartedDate;
      } else {
        updates.started_date = null;
      }
      if (editingBoardTotalValue) {
        updates.total_value = parseFloat(editingBoardTotalValue) || 0;
      }
      if (editingBoardPendingValue) {
        updates.upcoming_value = parseFloat(editingBoardPendingValue) || 0;
      }
      if (editingBoardReceivedValue) {
        updates.received_value = parseFloat(editingBoardReceivedValue) || 0;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateBoardValue(editingBoardId, updates);
      }
      
      // Update labels
      await updateBoardLabels(editingBoardId, editingBoardLabelIds);
      
      // Update products
      await updateBoardProducts(editingBoardId, editingBoardProducts);
      
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
    setEditingBoardStartedDate(board.started_date || "");
    setEditingBoardLabelIds(board.labels?.map((l) => l.id) || []);
    setEditingBoardProducts(board.products?.map((p) => ({
      name: p.name,
      started_date: p.started_date,
      period: p.period,
      price: p.price,
    })) || []);
    setEditingBoardTotalValue(board.total_value?.toString() || "");
    setEditingBoardPendingValue(board.upcoming_value?.toString() || "");
    setEditingBoardReceivedValue(board.received_value?.toString() || "");
    setEditingBoardAnnualValue(board.annual?.toString() || "");
    setEditingBoardColor(board.color);
    setIsEditBoardDialogOpen(true);
  };


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
      <Navbar onCreateBoard={handleCreateBoard} />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <BoardsSection
          boards={boards}
          loading={loading}
          isFreeUser={isFreeUser}
          onReorderBoards={reorderBoards}
          onBoardValueUpdate={updateBoardValue as any}
          allLabels={labels}
          onLabelsUpdate={updateBoardLabels}
          onCreateLabel={createLabel}
          onDeleteLabel={deleteLabel}
          savedProducts={savedProducts}
          onProductsUpdate={updateBoardProducts}
          onCreateSavedProduct={createSavedProduct}
          onEditBoard={handleEditBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      </main>

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />

      <CreateBoardDialog
        isOpen={isCreateBoardDialogOpen}
        onOpenChange={setIsCreateBoardDialogOpen}
        title={newBoardTitle}
        onTitleChange={setNewBoardTitle}
        startedDate={newBoardStartedDate}
        onStartedDateChange={setNewBoardStartedDate}
        selectedLabelIds={newBoardLabelIds}
        onLabelIdsChange={setNewBoardLabelIds}
        allLabels={labels}
        onCreateLabel={createLabel}
        savedProducts={savedProducts}
        selectedProducts={newBoardProducts}
        onProductsChange={setNewBoardProducts}
        onCreateSavedProduct={createSavedProduct}
        totalValue={newBoardTotalValue}
        onTotalValueChange={setNewBoardTotalValue}
        pendingValue={newBoardPendingValue}
        onPendingValueChange={setNewBoardPendingValue}
        receivedValue={newBoardReceivedValue}
        onReceivedValueChange={setNewBoardReceivedValue}
        annualValue={newBoardAnnualValue}
        onAnnualValueChange={setNewBoardAnnualValue}
        color={newBoardColor}
        onColorChange={setNewBoardColor}
        onSubmit={handleSubmitCreateBoard}
      />

      <EditBoardDialog
        isOpen={isEditBoardDialogOpen}
        onOpenChange={setIsEditBoardDialogOpen}
        title={editingBoardTitle}
        onTitleChange={setEditingBoardTitle}
        startedDate={editingBoardStartedDate}
        onStartedDateChange={setEditingBoardStartedDate}
        selectedLabelIds={editingBoardLabelIds}
        onLabelIdsChange={setEditingBoardLabelIds}
        allLabels={labels}
        onCreateLabel={createLabel}
        onDeleteLabel={deleteLabel}
        savedProducts={savedProducts}
        selectedProducts={editingBoardProducts}
        onProductsChange={setEditingBoardProducts}
        onCreateSavedProduct={createSavedProduct}
        totalValue={editingBoardTotalValue}
        onTotalValueChange={setEditingBoardTotalValue}
        pendingValue={editingBoardPendingValue}
        onPendingValueChange={setEditingBoardPendingValue}
        receivedValue={editingBoardReceivedValue}
        onReceivedValueChange={setEditingBoardReceivedValue}
        annualValue={editingBoardAnnualValue}
        onAnnualValueChange={setEditingBoardAnnualValue}
        color={editingBoardColor}
        onColorChange={setEditingBoardColor}
        onSubmit={handleSubmitEditBoard}
      />

      <Dialog open={!!deletingBoardId} onOpenChange={(open: boolean) => !open && setDeletingBoardId(null)}>
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
