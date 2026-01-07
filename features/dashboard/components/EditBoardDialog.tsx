"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseDialog } from "@/components/common/BaseDialog";
import { colors } from "@/features/boards/constants";
import { Label as LabelModel, SavedProduct } from "@/lib/supabase/models";
import { LabelEditor } from "./LabelEditor";
import { ProductsEditor } from "./ProductsEditor";

interface EditBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (title: string) => void;
  startedDate: string;
  onStartedDateChange: (date: string) => void;
  selectedLabelIds: string[];
  onLabelIdsChange: (labelIds: string[]) => void;
  allLabels: LabelModel[];
  onCreateLabel: (text: string, color: string) => Promise<LabelModel>;
  onDeleteLabel?: (labelId: string) => Promise<void>;
  savedProducts: SavedProduct[];
  selectedProducts: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>;
  onProductsChange: (products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>) => void;
  onCreateSavedProduct: (name: string) => Promise<SavedProduct>;
  totalValue: string;
  onTotalValueChange: (value: string) => void;
  pendingValue: string;
  onPendingValueChange: (value: string) => void;
  receivedValue: string;
  onReceivedValueChange: (value: string) => void;
  annualValue: string;
  onAnnualValueChange: (value: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EditBoardDialog({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  startedDate,
  onStartedDateChange,
  selectedLabelIds,
  onLabelIdsChange,
  allLabels,
  onCreateLabel,
  onDeleteLabel,
  savedProducts,
  selectedProducts,
  onProductsChange,
  onCreateSavedProduct,
  totalValue,
  onTotalValueChange,
  pendingValue,
  onPendingValueChange,
  receivedValue,
  onReceivedValueChange,
  annualValue,
  onAnnualValueChange,
  color,
  onColorChange,
  onSubmit,
}: EditBoardDialogProps) {
  const [isEditingLabels, setIsEditingLabels] = useState(false);
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const boardLabels = allLabels.filter(l => selectedLabelIds.includes(l.id));

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Board"
      description="Update your board details"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="boardTitle">Board Title</Label>
            <Input
              id="boardTitle"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter board title..."
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startedDate">Started</Label>
            <Input
              id="startedDate"
              type="date"
              value={startedDate}
              onChange={(e) => onStartedDateChange(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Labels (Optional)</Label>
            {isEditingLabels ? (
              <LabelEditor
                boardLabels={boardLabels}
                allLabels={allLabels}
                onSave={(labelIds) => {
                  onLabelIdsChange(labelIds);
                  setIsEditingLabels(false);
                }}
                onCancel={() => setIsEditingLabels(false)}
                onCreateLabel={onCreateLabel}
                onDeleteLabel={onDeleteLabel}
              />
            ) : (
              <div
                onClick={() => setIsEditingLabels(true)}
                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-h-[40px] border border-gray-200"
              >
                {boardLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {boardLabels.map((label) => (
                      <span
                        key={label.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase text-white ${label.color}`}
                      >
                        {label.text}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Click to add labels</span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Products (Optional)</Label>
            {isEditingProducts ? (
              <ProductsEditor
                products={selectedProducts.map((p, idx) => ({
                  id: `temp-${idx}`,
                  board_id: "",
                  name: p.name,
                  started_date: p.started_date,
                  period: p.period,
                  price: p.price,
                  sort_order: idx,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }))}
                savedProducts={savedProducts}
                onSave={(products) => {
                  onProductsChange(products);
                  setIsEditingProducts(false);
                }}
                onCancel={() => setIsEditingProducts(false)}
                onCreateSavedProduct={onCreateSavedProduct}
              />
            ) : (
              <div
                onClick={() => setIsEditingProducts(true)}
                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded min-h-[40px] border border-gray-200"
              >
                {selectedProducts.length > 0 ? (
                  <span className="text-sm">
                    {selectedProducts.length} {selectedProducts.length === 1 ? "Product" : "Products"}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Click to add products</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalValue">Total</Label>
            <Input
              id="totalValue"
              type="number"
              value={totalValue}
              onChange={(e) => onTotalValueChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pendingValue">Pending</Label>
            <Input
              id="pendingValue"
              type="number"
              value={pendingValue}
              onChange={(e) => onPendingValueChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receivedValue">Received</Label>
            <Input
              id="receivedValue"
              type="number"
              value={receivedValue}
              onChange={(e) => onReceivedValueChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualValue">Annual</Label>
            <Input
              id="annualValue"
              type="number"
              value={annualValue}
              onChange={(e) => onAnnualValueChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              readOnly
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Board Color</Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {colors.map((colorClass, key) => (
              <button
                key={key}
                type="button"
                className={`w-8 h-8 cursor-pointer rounded-full ${colorClass} ${
                  colorClass === color
                    ? "ring-2 ring-offset-2 ring-gray-900"
                    : ""
                }`}
                onClick={() => onColorChange(colorClass)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Save Changes
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

