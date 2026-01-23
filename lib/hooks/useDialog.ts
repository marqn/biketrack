import { useState, useCallback } from "react";

/**
 * Hook do zarządzania prostym stanem dialogu (open/close)
 */
export function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Hook do zarządzania dialogiem z akcjami edit/delete dla elementów listy
 * Zwraca ID elementu do edycji/usunięcia oraz funkcje pomocnicze
 */
export function useDialogWithActions<T = string>() {
  const [editId, setEditId] = useState<T | null>(null);
  const [deleteId, setDeleteId] = useState<T | null>(null);

  const startEdit = useCallback((id: T) => setEditId(id), []);
  const cancelEdit = useCallback(() => setEditId(null), []);

  const startDelete = useCallback((id: T) => setDeleteId(id), []);
  const cancelDelete = useCallback(() => setDeleteId(null), []);

  const reset = useCallback(() => {
    setEditId(null);
    setDeleteId(null);
  }, []);

  return {
    // Edit state
    editId,
    isEditing: editId !== null,
    startEdit,
    cancelEdit,

    // Delete state
    deleteId,
    isDeleting: deleteId !== null,
    startDelete,
    cancelDelete,

    // Combined
    reset,
  };
}

/**
 * Hook do zarządzania wieloma dialogami (np. różne typy dialogów w jednym komponencie)
 * Pozwala na otwieranie tylko jednego dialogu na raz
 */
export function useMultiDialog<T extends string | null = string | null>(
  initialDialog: T = null as T
) {
  const [activeDialog, setActiveDialog] = useState<T>(initialDialog);

  const openDialog = useCallback((dialog: T) => setActiveDialog(dialog), []);
  const closeDialog = useCallback(() => setActiveDialog(null as T), []);

  const isDialogOpen = useCallback(
    (dialog: T) => activeDialog === dialog,
    [activeDialog]
  );

  return {
    activeDialog,
    openDialog,
    closeDialog,
    isDialogOpen,
    setActiveDialog,
  };
}
