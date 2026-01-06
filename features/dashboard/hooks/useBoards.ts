"use client";

import { boardDataService, boardService, labelService } from "@/lib/services";
import { Board, Label } from "@/lib/supabase/models";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isLoaded && supabase) {
      loadBoards();
      loadLabels();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
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

  async function updateBoardValue(
    boardId: string,
    updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null }
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
      await labelService.updateBoardLabels(supabase, boardId, labelIds);
      await loadBoards(); // Reload to get updated labels
    } catch (err) {
      console.error("Failed to update board labels:", err);
      setError(err instanceof Error ? err.message : "Failed to update board labels.");
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

  const refetch = () => {
    loadBoards();
    loadLabels();
  };

  return { 
    boards, 
    labels,
    loading, 
    error, 
    createBoard, 
    refetch, 
    reorderBoards, 
    updateBoardValue,
    updateBoardLabels,
    createLabel,
  };
}
