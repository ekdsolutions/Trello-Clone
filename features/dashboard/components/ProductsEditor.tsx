"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Product, SavedProduct } from "@/lib/supabase/models";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  name: string;
  started_date: string;
  period: 0.5 | 1 | 2 | 3;
  price: string;
}

interface ProductsEditorProps {
  products: Product[];
  savedProducts: SavedProduct[];
  onSave: (products: Array<{ name: string; started_date: string; period: 0.5 | 1 | 2 | 3; price: number }>) => void;
  onCancel: () => void;
  onCreateSavedProduct: (name: string) => Promise<SavedProduct>;
}

export function ProductsEditor({
  products,
  savedProducts,
  onSave,
  onCancel,
  onCreateSavedProduct,
}: ProductsEditorProps) {
  const [productForms, setProductForms] = useState<ProductFormData[]>(() => {
    if (products.length > 0) {
      return products.map(p => ({
        name: p.name,
        started_date: p.started_date,
        period: p.period,
        price: p.price.toString(),
      }));
    }
    return [{
      name: "",
      started_date: "",
      period: 1 as 0.5 | 1 | 2 | 3,
      price: "",
    }];
  });

  const [showNewProductInput, setShowNewProductInput] = useState<{ [key: number]: boolean }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Don't close on outside click - let user explicitly cancel
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddProduct = () => {
    setProductForms([...productForms, {
      name: "",
      started_date: "",
      period: 1,
      price: "",
    }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProductForms(productForms.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductFormData, value: string | number) => {
    const updated = [...productForms];
    updated[index] = { ...updated[index], [field]: value };
    setProductForms(updated);
  };

  const handleSave = () => {
    const validProducts = productForms
      .filter(form => form.name.trim() && form.started_date && form.price)
      .map(form => ({
        name: form.name.trim(),
        started_date: form.started_date,
        period: form.period,
        price: parseFloat(form.price) || 0,
      }));

    onSave(validProducts);
  };


  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[500px] max-w-[600px] max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Products</h3>
          {productForms.map((form, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600">Product {index + 1}</span>
                {productForms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid Layout - Product and Period full width */}
              <div className="space-y-3">
                {/* Product Name - Full Width */}
                <div className="space-y-1">
                  <Label className="text-xs">Product</Label>
                  {savedProducts.length > 0 && !showNewProductInput[index] ? (
                    <Select
                      value={form.name || undefined}
                      onValueChange={(value) => {
                        if (value === "__new__") {
                          // User wants to create a new product
                          setShowNewProductInput({ ...showNewProductInput, [index]: true });
                          handleProductChange(index, "name", "");
                        } else {
                          // User selected an existing saved product
                          handleProductChange(index, "name", value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedProducts.map((sp) => (
                          <SelectItem key={sp.id} value={sp.name}>
                            {sp.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">
                          + Create new product
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleProductChange(index, "name", e.target.value)}
                        placeholder="Product name..."
                        className="flex-1"
                        onBlur={async () => {
                          if (form.name.trim() && !savedProducts.find(sp => sp.name === form.name.trim())) {
                            try {
                              await onCreateSavedProduct(form.name.trim());
                              setShowNewProductInput({ ...showNewProductInput, [index]: false });
                            } catch (error) {
                              console.error("Error creating saved product:", error);
                            }
                          } else if (form.name.trim()) {
                            setShowNewProductInput({ ...showNewProductInput, [index]: false });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setShowNewProductInput({ ...showNewProductInput, [index]: false });
                          }
                        }}
                      />
                      {savedProducts.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowNewProductInput({ ...showNewProductInput, [index]: false });
                            handleProductChange(index, "name", "");
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Started Date and Price - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Started</Label>
                    <Input
                      type="date"
                      value={form.started_date}
                      onChange={(e) => handleProductChange(index, "started_date", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => handleProductChange(index, "price", e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Period - Full Width */}
                <div className="space-y-1">
                  <Label className="text-xs">Period</Label>
                  <Select
                    value={form.period.toString()}
                    onValueChange={(value) => handleProductChange(index, "period", parseFloat(value) as 0.5 | 1 | 2 | 3)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5 year</SelectItem>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 years</SelectItem>
                      <SelectItem value="3">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddProduct}
            className="w-full mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="flex justify-end gap-2 border-t pt-3 mt-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Products
          </Button>
        </div>
      </div>
    </div>
  );
}

