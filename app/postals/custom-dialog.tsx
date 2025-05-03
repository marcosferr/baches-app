"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (name: string) => void;
  isGenerating: boolean;
}

export function CustomDialog({
  open,
  onClose,
  onGenerate,
  isGenerating,
}: CustomDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setError("");
    }
  }, [open]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isGenerating) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, isGenerating]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={!isGenerating ? onClose : undefined}
      />
      
      {/* Dialog */}
      <div className="relative z-[9999] w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <button 
          type="button" 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={onClose}
          disabled={isGenerating}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Generar Postal
            </h3>
            <p className="text-sm text-muted-foreground">
              Ingresa un nombre para tu postal. Este nombre aparecerá en el encabezado del PDF generado.
            </p>
          </div>
          
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
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
