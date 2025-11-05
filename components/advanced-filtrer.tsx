"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";

interface Condition { 
  id: number;
  field: string;
  operator: string;
  value: string;
  connector?: "Y" | "O" | "No" | "O no";
}

export function AdvancedFilterDialog({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (filters: Condition[]) => void;
}) {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: 1, field: "departamento", operator: "igual", value: "", connector: "Y" },
  ]);

  const handleChange = (id: number, key: keyof Condition, value: string) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { id: Date.now(), field: "departamento", operator: "igual", value: "", connector: "Y" },
    ]);
  };

  const removeCondition = (id: number) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAll = () => setConditions([]);

  const applyFilters = () => {
    onApply(conditions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Editor de filtros</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {conditions.map((cond) => (
            <div
              key={cond.id}
              className="flex items-center gap-2 border rounded-md p-2 bg-muted/30"
            >
              {/* Conector lógico */}
              <Select
                value={cond.connector}
                onValueChange={(v) => handleChange(cond.id, "connector", v)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Y</SelectItem>
                  <SelectItem value="O">O</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="O no">O no</SelectItem>
                </SelectContent>
              </Select>

              {/* Campo */}
              <Select
                value={cond.field}
                onValueChange={(v) => handleChange(cond.id, "field", v)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="turno">Turno</SelectItem>
                  <SelectItem value="nombre">Nombre</SelectItem>
                </SelectContent>
              </Select>

              {/* Operador */}
              <Select
                value={cond.operator}
                onValueChange={(v) => handleChange(cond.id, "operator", v)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="igual">Igual</SelectItem>
                  <SelectItem value="contiene">Contiene</SelectItem>
                  <SelectItem value="empieza">Empieza con</SelectItem>
                  <SelectItem value="termina">Termina con</SelectItem>
                </SelectContent>
              </Select>

              {/* Valor */}
              <Input
                placeholder="Valor..."
                className="flex-1"
                value={cond.value}
                onChange={(e) => handleChange(cond.id, "value", e.target.value)}
              />

              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeCondition(cond.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={addCondition}
          >
            <Plus className="h-4 w-4" /> Agregar condición
          </Button>
        </div>

        <DialogFooter className="mt-4 flex justify-between">
          <Button variant="secondary" onClick={clearAll}>
            Vaciar todos
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={applyFilters}>Aplicar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
