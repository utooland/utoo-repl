import { useCallback, useState } from "react";

interface DialogState {
  isOpen: boolean;
  title: string;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
  });
  const [resolveDialog, setResolveDialog] = useState<
    ((value: "save" | "dontSave" | null) => void) | null
  >(null);

  const showConfirmDialog = useCallback(
    (title: string): Promise<"save" | "dontSave" | null> => {
      return new Promise((resolve) => {
        setResolveDialog(() => resolve);
        setDialogState({ isOpen: true, title });
      });
    },
    [],
  );

  const handleDialogAction = useCallback(
    (action: "save" | "dontSave" | null) => {
      resolveDialog?.(action);
      setDialogState({ isOpen: false, title: "" });
      setResolveDialog(null);
    },
    [resolveDialog],
  );

  return {
    dialogState,
    showConfirmDialog,
    handleDialogAction,
  };
};
