"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { colors } from "@/features/boards/constants";

interface Label {
  text: string;
  color: string;
}

interface LabelEditorProps {
  labelText: string | null;
  labelColor: string;
  existingLabels: Label[];
  onSave: (text: string, color: string) => void;
  onCancel: () => void;
}

export function LabelEditor({
  labelText,
  labelColor,
  existingLabels,
  onSave,
  onCancel,
}: LabelEditorProps) {
  const [text, setText] = useState(labelText || "");
  const [color, setColor] = useState(labelColor || "bg-gray-500");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const filteredLabels = existingLabels.filter(
    (label) =>
      label.text.toLowerCase().includes(text.toLowerCase()) && text.length > 0
  );

  const handleSelectLabel = (label: Label) => {
    setText(label.text);
    setColor(label.color);
    onSave(label.text, label.color);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(text, color);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[300px]"
    >
      <div className="space-y-3">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter label text..."
            className="w-full"
          />
          {showSuggestions && filteredLabels.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
              {filteredLabels.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLabel(label)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <div className={`w-3 h-3 rounded ${label.color}`} />
                  <span>{label.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Color:</span>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`w-4 h-4 rounded ${color}`} />
              {showColorPicker ? "Hide" : "Change"}
            </button>
          </div>
          {showColorPicker && (
            <div className="grid grid-cols-6 gap-2">
              {colors.map((colorClass) => (
                <button
                  key={colorClass}
                  type="button"
                  onClick={() => setColor(colorClass)}
                  className={`w-8 h-8 rounded-full ${colorClass} ${
                    colorClass === color
                      ? "ring-2 ring-offset-2 ring-gray-900"
                      : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(text, color)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

