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

interface Condition { 
  id: number;
  field: string;
  operator: string;
  value: string;
  connector?: "Y" | "O" | "Y no" | "O no";
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
    { id: 1, field: "Departamento", operator: "igual", value: "", connector: "Y" },
  ]);

  const camposDisponibles = [
    "Departamento",
    "Nombre a mostrar", 
    "Documento",
    "Turno Actual",
    "Número Lector",
    "Valor Hora"
  ];

  const operadores = [
    { value: "igual", label: "Igual" },
    { value: "contiene", label: "Contiene" },
    { value: "empieza", label: "Empieza con" },
    { value: "termina", label: "Termina con" },
    { value: "mayor", label: "Mayor que" },
    { value: "menor", label: "Menor que" }
  ];

  const conectores = [
    { value: "Y", label: "Y" },
    { value: "O", label: "O" },
    { value: "Y no", label: "Y no" },
    { value: "O no", label: "O no" }
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
        value: "", 
        connector: "Y" 
      },
    ]);
  };

  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clearAll = () => {
    setConditions([{ id: 1, field: "Departamento", operator: "igual", value: "", connector: "Y" }]);
  };

  const applyFilters = () => {
    // Filtrar condiciones que tienen valor
    const filtersWithValues = conditions.filter(cond => cond.value.trim() !== "");
    onApply(filtersWithValues);
    onOpenChange(false);
  };

  const cancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Editor de Filtros
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {conditions.map((cond, index) => (
            <div
              key={cond.id}
              className="flex items-center gap-2 border rounded-lg p-3 bg-gray-50/50"
            >
              {/* Conector lógico (no mostrar en el primero) */}
              {index > 0 && (
                <Select
                  value={cond.connector}
                  onValueChange={(v) => handleChange(cond.id, "connector", v)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conectores.map((conn) => (
                      <SelectItem key={conn.value} value={conn.value}>
                        {conn.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Campo */}
              <Select
                value={cond.field}
                onValueChange={(v) => handleChange(cond.id, "field", v)}
              >
                <SelectTrigger className="w-[180px]">
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

              {/* Operador */}
              <Select
                value={cond.operator}
                onValueChange={(v) => handleChange(cond.id, "operator", v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operadores.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Valor */}
              <Input
                placeholder="Introduzca un valor..."
                className="flex-1"
                value={cond.value}
                onChange={(e) => handleChange(cond.id, "value", e.target.value)}
              />

              {/* Botón eliminar */}
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCondition(cond.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={addCondition}
            >
              <Plus className="h-4 w-4" /> Agregar Condición
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" /> Vaciar Todos
            </Button>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between gap-2 mt-6 w-full">
            <div className="text-sm text-gray-500">
              {conditions.filter(c => c.value.trim() !== "").length} condición(es) activa(s)
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancel}>
                Cancelar
              </Button>
              <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
