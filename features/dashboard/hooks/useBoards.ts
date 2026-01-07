"use client";

import { boardDataService, boardService, labelService, boardLabelService, productService } from "@/lib/services";
import { Board, Label, SavedProduct } from "@/lib/supabase/models";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isLoaded && supabase) {
      loadBoards();
      loadLabels();
      loadSavedProducts();
    }
  }, [user, isLoaded]);

  async function loadBoards() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      await loadBoards(); // Reload to get proper sort order
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
      throw err;
    }
  }

  async function reorderBoards(newOrder: { id: string; sort_order: number }[]) {
    if (!user || !supabase) return;

    try {
      await boardService.reorderBoards(supabase, user.id, newOrder);
      // Update local state optimistically
      const orderMap = new Map(newOrder.map((item) => [item.id, item.sort_order]));
      setBoards((prev) =>
        [...prev].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? a.sort_order;
          const orderB = orderMap.get(b.id) ?? b.sort_order;
          return orderA - orderB;
        })
      );
    } catch (err) {
      console.error("Failed to reorder boards:", err);
      setError(err instanceof Error ? err.message : "Failed to reorder boards.");
      await loadBoards(); // Reload on error
    }
  }

  async function loadLabels() {
    if (!user || !supabase) return;

    try {
      const data = await labelService.getLabels(supabase, user.id);
      setLabels(data);
    } catch (err) {
      console.error("Failed to load labels:", err);
    }
  }

  async function loadSavedProducts() {
    if (!user || !supabase) return;
    try {
      const data = await productService.getSavedProducts(supabase, user.id);
      setSavedProducts(data);
    } catch (err) {
      console.error("Failed to load saved products:", err);
    }
  }

  async function updateBoardValue(
    boardId: string,
    updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null; notes?: string | null }
  ) {
    if (!user || !supabase) return;

    try {
      await boardService.updateBoard(supabase, boardId, updates);
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId ? { ...board, ...updates } : board
        )
      );
    } catch (err) {
      console.error("Failed to update board value:", err);
      setError(err instanceof Error ? err.message : "Failed to update board value.");
    }
  }

  async function updateBoardLabels(boardId: string, labelIds: string[]) {
    if (!user || !supabase) return;

    try {
      await boardLabelService.updateBoardLabels(supabase, boardId, labelIds);
      // Optimistically update labels without full reload
      const selectedLabels = labels.filter(l => labelIds.includes(l.id));
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId ? { ...board, labels: selectedLabels } : board
        )
      );
    } catch (err) {
      console.error("Failed to update board labels:", err);
      setError(err instanceof Error ? err.message : "Failed to update board labels.");
      // Reload on error to sync state
      await loadBoards();
    }
  }

  async function createLabel(text: string, color: string): Promise<Label> {
    if (!user || !supabase) throw new Error("User not authenticated");

    try {
      const newLabel = await labelService.createLabel(supabase, {
        user_id: user.id,
        text,
        color,
      });
      setLabels((prev) => [newLabel, ...prev]);
      return newLabel;
    } catch (err) {
      console.error("Failed to create label:", err);
      throw err;
    }
  }

  async function updateBoardProducts(boardId: string, products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>) {
    if (!user || !supabase) return;
    try {
      await productService.updateBoardProducts(supabase, boardId, user.id, products);
      
      // Calculate annual from products
      const calculatedAnnual = products.reduce((sum, product) => {
        return sum + (product.price / product.period);
      }, 0);

      // Calculate ending date (closest upcoming ending date)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let closestEndingDate: Date | null = null;
      const endingDates = products.map(product => {
        const startDate = new Date(product.started_date);
        let endDate = new Date(startDate);
        
        // Add period years
        endDate.setFullYear(endDate.getFullYear() + Math.floor(product.period));
        if (product.period % 1 !== 0) {
          endDate.setMonth(endDate.getMonth() + 6); // Add 6 months for 0.5 year
        }
        
        // Auto-extend if past
        while (endDate < today) {
          endDate.setFullYear(endDate.getFullYear() + Math.floor(product.period));
          if (product.period % 1 !== 0) {
            endDate.setMonth(endDate.getMonth() + 6);
          }
        }
        
        return endDate;
      }).filter(date => date >= today).sort((a, b) => a.getTime() - b.getTime());
      
      if (endingDates.length > 0) {
        closestEndingDate = endingDates[0];
      }

      // Convert products to Product format for state
      const productsWithIds = products.map((p, idx) => ({
        id: `temp-${Date.now()}-${idx}`, // Temporary ID, will be replaced on next load
        board_id: boardId,
        name: p.name,
        started_date: p.started_date,
        period: p.period,
        price: p.price,
        sort_order: idx,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Optimistically update board without full reload
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? {
                ...board,
                products: productsWithIds,
                annual: calculatedAnnual,
                ending_date: closestEndingDate ? closestEndingDate.toISOString().split('T')[0] : null,
              }
            : board
        )
      );

      // Reload saved products in case new ones were created (this is lightweight)
      await loadSavedProducts();
    } catch (err) {
      console.error("Failed to update board products:", err);
      setError(err instanceof Error ? err.message : "Failed to update board products.");
      // Reload on error to sync state
      await loadBoards();
    }
  }

  async function createSavedProduct(name: string): Promise<SavedProduct> {
    if (!user || !supabase) throw new Error("User not authenticated");
    try {
      const newProduct = await productService.createSavedProduct(supabase, user.id, name);
      setSavedProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error("Failed to create saved product:", err);
      throw err;
    }
  }

  const refetch = () => {
    loadBoards();
    loadLabels();
    loadSavedProducts();
  };

  async function deleteBoard(boardId: string) {
    if (!user || !supabase) return;
    try {
      await boardService.deleteBoard(supabase, boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      console.error("Failed to delete board:", err);
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  }

  async function deleteLabel(labelId: string) {
    if (!user || !supabase) return;
    try {
      await labelService.deleteLabel(supabase, labelId);
      setLabels((prev) => prev.filter((l) => l.id !== labelId));
      // Also remove from boards that had this label
      setBoards((prev) =>
        prev.map((board) => ({
          ...board,
          labels: board.labels?.filter((l) => l.id !== labelId) || [],
        }))
      );
    } catch (err) {
      console.error("Failed to delete label:", err);
      setError(err instanceof Error ? err.message : "Failed to delete label.");
    }
  }

  return { 
    boards, 
    labels,
    savedProducts,
    loading, 
    error, 
    createBoard, 
    refetch, 
    reorderBoards, 
    updateBoardValue,
    updateBoardLabels,
    updateBoardProducts,
    createLabel,
    createSavedProduct,
    deleteBoard,
    deleteLabel,
  };
}
