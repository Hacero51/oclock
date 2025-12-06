"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Filter } from "lucide-react";

export interface Condition {
  id: number;
  field: string;
  operator: string;
  value: string;
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
    { id: 1, field: "Departamento", operator: "igual", value: "" },
  ]);

  const camposDisponibles = [
    "Departamento",
    "Nombre a mostrar",
    "Documento",
    "Turno Actual",
  ];

  const handleChange = (id: number, key: keyof Condition, value: string) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: Date.now(),
        field: "Departamento",
        operator: "igual",
        value: ""
      },
    ]);
  };

  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clearAll = () => {
    setConditions([{ id: 1, field: "Departamento", operator: "igual", value: "" }]);
  };

  const applyFilters = () => {
    const filtersWithValues = conditions.filter(cond => cond.value.trim() !== "");
    onApply(filtersWithValues);
    onOpenChange(false);
  };

  const cancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Editor de Filtros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {conditions.map((cond) => (
            <div
              key={cond.id}
              className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Filtro {cond.id}
                </label>
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(cond.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Campo */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Campo
                </label>
                <Select
                  value={cond.field}
                  onValueChange={(v) => handleChange(cond.id, "field", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {camposDisponibles.map((campo) => (
                      <SelectItem key={campo} value={campo}>
                        {campo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operador - Solo "Igual" como en tu diseño */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Operador
                </label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <input
                    type="radio"
                    id={`operator-igual-${cond.id}`}
                    checked={cond.operator === "igual"}
                    onChange={() => handleChange(cond.id, "operator", "igual")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={`operator-igual-${cond.id}`} className="text-sm text-gray-700">
                    Igual
                  </label>
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Valor
                </label>
                <Input
                  placeholder="Introduzca un valor..."
                  value={cond.value}
                  onChange={(e) => handleChange(cond.id, "value", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-dashed border-2 border-gray-300 hover:border-gray-400"
            onClick={addCondition}
          >
            <Plus className="h-4 w-4" />
            Agregar Condición
          </Button>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <Button
            variant="outline"
            onClick={clearAll}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Vaciar Todos
          </Button>

          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={cancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Aplicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}