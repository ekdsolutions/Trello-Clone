"use client";

import { boardDataService, boardService } from "@/lib/services";
import { Board } from "@/lib/supabase/models";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isLoaded && supabase) {
      loadBoards();
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

  async function updateBoardValue(
    boardId: string,
    updates: { total_value?: number; upcoming_value?: number; received_value?: number; annual?: number; started_date?: string | null; label_text?: string | null; label_color?: string }
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

  const refetch = () => {
    loadBoards();
  };

  return { boards, loading, error, createBoard, refetch, reorderBoards, updateBoardValue };
}
