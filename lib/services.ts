import { Board, Column, Task, Label, Product, SavedProduct } from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        *,
        columns (
          tasks ( count )
        ),
        board_labels (
          label:labels (
            id,
            text,
            color,
            created_at
          )
        ),
        products (
          id,
          name,
          started_date,
          period,
          price,
          sort_order,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((board: Board & { 
      columns?: Array<{ tasks?: Array<{ count: number }> }>;
      board_labels?: Array<{ label: Label }>;
      products?: Product[];
    }) => {
      const totalTasks =
        board.columns?.reduce(
          (sum: number, col: { tasks?: Array<{ count: number }> }) => sum + (col.tasks?.[0]?.count || 0),
          0
        ) || 0;

      const labels = board.board_labels?.map(bl => bl.label).filter(Boolean) || [];
      const products = (board.products || []).sort((a, b) => a.sort_order - b.sort_order);

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
        const endDate = new Date(startDate);
        
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { columns, board_labels, ...boardWithoutColumns } = board;
      return {
        ...boardWithoutColumns,
        labels,
        products,
        annual: calculatedAnnual,
        ending_date: closestEndingDate ? closestEndingDate.toISOString().split('T')[0] : null,
        totalTasks,
      };
    });
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) throw error;
  },

  async reorderBoards(
    supabase: SupabaseClient,
    userId: string,
    boardOrders: { id: string; sort_order: number }[]
  ): Promise<void> {
    // Update all boards in a transaction-like manner
    const updates = boardOrders.map(({ id, sort_order }) =>
      supabase
        .from("boards")
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to reorder boards: ${errors[0].error?.message}`);
    }
  },
};

export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(supabase: SupabaseClient, columnId: string) {
    const { data, error } = await supabase.from("columns").delete().eq("id", columnId);
    if (error) throw error;
    return data;
  },
};

export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) throw error;
    return data;
  },

  async deleteTask(supabase: SupabaseClient, taskId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);
    if (error) throw error;
    return data;
  },
};

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    // Get the max sort_order for this user to place new board at the end
    const { data: existingBoards } = await supabase
      .from("boards")
      .select("sort_order")
      .eq("user_id", boardData.userId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxSortOrder = existingBoards && existingBoards.length > 0 
      ? existingBoards[0].sort_order + 1 
      : 0;

    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
      total_value: 0,
      upcoming_value: 0,
      received_value: 0,
      annual: 0,
      started_date: null,
      notes: null,
      sort_order: maxSortOrder,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};

export const labelService = {
  async getLabels(supabase: SupabaseClient, userId: string): Promise<Label[]> {
    const { data, error } = await supabase
      .from("labels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createLabel(
    supabase: SupabaseClient,
    label: { user_id: string; text: string; color: string }
  ): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .insert(label)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrCreateLabel(supabase: SupabaseClient, userId: string, text: string, color: string): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .select("*")
      .eq("user_id", userId)
      .eq("text", text)
      .eq("color", color)
      .single();

    if (error && error.code === 'PGRST116') { // No rows found
      return await labelService.createLabel(supabase, { user_id: userId, text, color });
    } else if (error) {
      throw error;
    }
    return data;
  },

  async deleteLabel(supabase: SupabaseClient, labelId: string): Promise<void> {
    const { error } = await supabase
      .from("labels")
      .delete()
      .eq("id", labelId);

    if (error) throw error;
  },
};

export const boardLabelService = {
  async updateBoardLabels(
    supabase: SupabaseClient,
    boardId: string,
    labelIds: string[]
  ): Promise<void> {
    // Delete existing board_labels
    await supabase
      .from("board_labels")
      .delete()
      .eq("board_id", boardId);

    // Insert new board_labels
    if (labelIds.length > 0) {
      const { error } = await supabase
        .from("board_labels")
        .insert(labelIds.map(labelId => ({ board_id: boardId, label_id: labelId })));

      if (error) throw error;
    }
  },
};

export const productService = {
  async getSavedProducts(supabase: SupabaseClient, userId: string): Promise<SavedProduct[]> {
    const { data, error } = await supabase
      .from("saved_products")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createSavedProduct(supabase: SupabaseClient, userId: string, name: string): Promise<SavedProduct> {
    const { data, error } = await supabase
      .from("saved_products")
      .insert({ user_id: userId, name })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrCreateSavedProduct(supabase: SupabaseClient, userId: string, name: string): Promise<SavedProduct> {
    const { data, error } = await supabase
      .from("saved_products")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

    if (error && error.code === 'PGRST116') {
      return await productService.createSavedProduct(supabase, userId, name);
    } else if (error) {
      throw error;
    }
    return data;
  },

  async getProducts(supabase: SupabaseClient, boardId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async updateBoardProducts(
    supabase: SupabaseClient,
    boardId: string,
    userId: string,
    products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>
  ): Promise<void> {
    // Delete existing products
    await supabase
      .from("products")
      .delete()
      .eq("board_id", boardId);

    // Insert new products and save product names
    if (products.length > 0) {
      // Save product names for reuse
      await Promise.all(
        products.map(product => 
          productService.getOrCreateSavedProduct(supabase, userId, product.name)
        )
      );

      // Insert products
      const productsToInsert = products.map((product, index) => ({
        board_id: boardId,
        name: product.name,
        started_date: product.started_date,
        period: product.period,
        price: product.price,
        sort_order: index,
      }));

      const { error } = await supabase
        .from("products")
        .insert(productsToInsert);

      if (error) throw error;
    }
  },
};
