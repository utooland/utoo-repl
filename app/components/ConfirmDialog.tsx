import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  onSave,
  onDontSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-100 mb-4">{title}</h3>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={onCancel}
                variant="outline"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={onDontSave}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium"
              >
                Don't Save
              </Button>
              <Button
                onClick={onSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
