"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PostalNameDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (name: string) => void;
  isGenerating: boolean;
}

export function PostalNameDialog({
  open,
  onClose,
  onGenerate,
  isGenerating,
}: PostalNameDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Por favor, ingresa un nombre para la postal");
      return;
    }

    onGenerate(name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (e.target.value.trim()) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <div className="fixed inset-0 z-[9999]">
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm"></div>
        <DialogContent className="sm:max-w-[425px] z-[9999] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Generar Postal</DialogTitle>
              <DialogDescription>
                Ingresa un nombre para tu postal. Este nombre aparecerá en el
                encabezado del PDF generado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Postal</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Ej: Baches del Centro"
                  className={error ? "border-red-500" : ""}
                  disabled={isGenerating}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generando..." : "Generar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
