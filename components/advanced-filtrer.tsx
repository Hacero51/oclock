"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Trash2,
  Filter,
  X,
  Check,
  Calendar as CalendarIcon,
} from "lucide-react";


import { cn } from "@/lib/utils";

// ---------------- TIPOS ---------------- //

export type FilterType = "group" | "condition";
export type LogicOperator = "AND" | "OR" | "NOT_AND" | "NOT_OR";

// Operadores extendidos para cubrir todos los casos comunes
export type ConditionOperator =
  | "igual"
  | "no_igual"
  | "contiene"
  | "no_contiene"
  | "empieza"
  | "termina"
  | "mayor"
  | "mayor_igual"
  | "menor"
  | "menor_igual"
  | "vacio"
  | "no_vacio";

export interface FilterNode {
  id: string;
  type: FilterType;
  // Solo para GRUPOS
  logic?: LogicOperator;
  children?: FilterNode[];
  // Solo para CONDICIONES
  field?: string;
  operator?: ConditionOperator;
  value?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

// ---------------- CONSTANTES ---------------- //

const LOGIC_LABELS: Record<LogicOperator, string> = {
  AND: "Y (Todas cumplen)",
  OR: "O (Alguna cumple)",
  NOT_AND: "Y NO (Ninguna cumple)", // Equivalente a NAND/NOR según interpretación, aquí lo usaremos como "Ninguna de estas"
  NOT_OR: "O NO (Al menos una no cumple)",
};

const LOGIC_COLORS: Record<LogicOperator, string> = {
  AND: "text-emerald-600 bg-emerald-50 border-emerald-200",
  OR: "text-blue-600 bg-blue-50 border-blue-200",
  NOT_AND: "text-red-600 bg-red-50 border-red-200",
  NOT_OR: "text-orange-600 bg-orange-50 border-orange-200",
};

const CAMPOS_DISPONIBLES = [
  { value: "Nombre a mostrar", label: "Empleado", type: "text" },
  { value: "Turno Actual", label: "Turno", type: "text" },
  { value: "Fecha", label: "Fecha", type: "date" },
  { value: "Estado", label: "Estado", type: "select", options: [{ value: "OK", label: "Completado" }, { value: "Incompleto", label: "Incompleto" }] },
  { value: "Entrada", label: "Entrada", type: "datetime" },
  { value: "Salida", label: "Salida", type: "datetime" },
];

const OPERATORS: { value: ConditionOperator; label: string; types?: string[] }[] = [
  { value: "igual", label: "Es igual a" },
  { value: "no_igual", label: "No es igual a" },
  { value: "contiene", label: "Contiene", types: ["text"] },
  { value: "no_contiene", label: "No contiene", types: ["text"] },
  { value: "empieza", label: "Empieza con", types: ["text"] },
  { value: "termina", label: "Termina con", types: ["text"] },
  { value: "mayor", label: "Mayor que", types: ["number", "date", "datetime"] },
  { value: "mayor_igual", label: "Mayor o igual que", types: ["number", "date", "datetime"] },
  { value: "menor", label: "Menor que", types: ["number", "date", "datetime"] },
  { value: "menor_igual", label: "Menor o igual que", types: ["number", "date", "datetime"] },
  { value: "vacio", label: "Está vacío" },
  { value: "no_vacio", label: "No está vacío" },
];

// ---------------- COMPONENTES INTERNOS ---------------- //

const NodeItem = ({
  node,
  onChange,
  onDelete,
  depth = 0,
  fieldOptions = {},
}: {
  node: FilterNode;
  onChange: (newNode: FilterNode) => void;
  onDelete: () => void;
  depth?: number;
  fieldOptions?: Record<string, FieldOption[]>;
}) => {
  // Manejo de actualización de un hijo específico dentro de un grupo
  const handleChildChange = (childIndex: number, newChildNode: FilterNode) => {
    if (!node.children) return;
    const newChildren = [...node.children];
    newChildren[childIndex] = newChildNode;
    onChange({ ...node, children: newChildren });
  };

  const handleAddChild = (type: FilterType) => {
    if (!node.children) return;
    const newNode: FilterNode =
      type === "group"
        ? {
          id: crypto.randomUUID(),
          type: "group",
          logic: "AND",
          children: [{ id: crypto.randomUUID(), type: "condition", field: "Departamento", operator: "igual", value: "" }],
        }
        : {
          id: crypto.randomUUID(),
          type: "condition",
          field: "Departamento",
          operator: "igual",
          value: "",
        };

    onChange({ ...node, children: [...node.children, newNode] });
  };

  const handleDeleteChild = (childIndex: number) => {
    if (!node.children) return;
    const newChildren = node.children.filter((_, i) => i !== childIndex);
    onChange({ ...node, children: newChildren });
  };

  if (node.type === "group") {
    // ---------------- RENDER GRUPO ---------------- //
    return (
      <div className={cn("relative", depth > 0 && "ml-6")}>
        {/* Línea conectora vertical para niveles anidados */}
        {depth > 0 && (
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 border-l border-dashed border-gray-300" />
        )}

        {/* Línea conectora horizontal hacia el nodo */}
        {depth > 0 && (
          <div className="absolute -left-4 top-5 w-4 h-px bg-gray-300 border-t border-dashed" />
        )}

        <div className={cn("rounded-lg border shadow-sm bg-white overflow-hidden transition-all duration-200 hover:shadow-md", LOGIC_COLORS[node.logic || 'AND'].replace('text-', 'border-').split(' ')[2])}>
          {/* Header del Grupo */}
          <div className={cn("px-3 py-2 flex items-center gap-2 border-b", LOGIC_COLORS[node.logic || 'AND'].split(' ')[1])}>

            {/* Selector de Lógica */}
            <div className="w-[180px]">
              <Select
                value={node.logic}
                onValueChange={(v: LogicOperator) => onChange({ ...node, logic: v })}
              >
                <SelectTrigger className={cn("h-7 text-xs font-bold uppercase tracking-wider border-transparent focus:ring-0 bg-transparent", LOGIC_COLORS[node.logic || 'AND'])}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["AND", "OR", "NOT_AND", "NOT_OR"] as LogicOperator[]).map((op) => (
                    <SelectItem key={op} value={op} className="text-xs">
                      {LOGIC_LABELS[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-xs text-gray-500 font-medium hidden sm:inline-block border-l border-gray-200 pl-2">
              {node.children?.length === 0 ? "Sin condiciones" : node.children?.length === 1 ? "1 condición" : `${node.children?.length} condiciones`}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <div className="flex gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddChild('condition')}
                  title="Agregar Condición"
                  className="h-7 px-2 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Cond
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddChild('group')}
                  title="Agregar Grupo"
                  className="h-7 px-2 text-xs font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Grupo
                </Button>
              </div>

              {depth > 0 && (
                <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cuerpo del Grupo (Children) */}
          <div className="p-3 space-y-3 bg-white/50">
            {node.children && node.children.length > 0 ? (
              node.children.map((child, index) => (
                <NodeItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  onChange={(newChild) => handleChildChange(index, newChild)}
                  onDelete={() => handleDeleteChild(index)}
                  fieldOptions={fieldOptions}
                />
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                Grupo vacío
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    // ---------------- RENDER CONDICIÓN ---------------- //
    const selectedFieldConfig = CAMPOS_DISPONIBLES.find(c => c.value === node.field);
    const fieldType = selectedFieldConfig?.type || "text";

    // Filtrar operadores válidos para el tipo
    const validOperators = OPERATORS.filter(op => !op.types || op.types.includes(fieldType));

    // Resetear operador si no es válido para el nuevo tipo (al cambiar campo)
    // Esto debería manejarse en el onChange del campo, pero aquí aseguramos visualización

    return (
      <div className={cn("relative flex items-center gap-2 group", depth > 0 && "ml-6")}>
        {/* Líneas conectoras */}
        {depth > 0 && (
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-200 border-l border-dashed border-gray-300 group-last:bottom-1/2" />
        )}
        {depth > 0 && (
          <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-300 border-t border-dashed" />
        )}

        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-md border border-gray-200 hover:border-blue-300 shadow-sm transition-colors">

          {/* Campo */}
          <Select
            value={node.field}
            onValueChange={(v) => {
              // Al cambiar campo, resetear valor y poner operador por defecto
              onChange({ ...node, field: v, value: "", operator: "igual" });
            }}
          >
            <SelectTrigger className="h-8 text-xs min-w-[140px] border-transparent hover:bg-gray-50 focus:ring-0 font-medium text-blue-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPOS_DISPONIBLES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-gray-300 hidden sm:inline">|</span>

          {/* Operador */}
          <Select value={node.operator} onValueChange={(v: ConditionOperator) => onChange({ ...node, operator: v })}>
            <SelectTrigger className="h-8 text-xs min-w-[130px] border-transparent hover:bg-gray-50 focus:ring-0 text-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {validOperators.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-gray-300 hidden sm:inline">|</span>

          {/* Valor Dinámico */}
          <div className="flex-1 w-full min-w-[200px]">
            {node.operator === "vacio" || node.operator === "no_vacio" ? (
              <div className="h-8 flex items-center px-3 text-xs text-gray-400 italic bg-gray-50 rounded">
                Sin valor requerido
              </div>
            ) : fieldType === "select" ? (
              <Select value={node.value} onValueChange={(v) => onChange({ ...node, value: v })}>
                <SelectTrigger className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:ring-0">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedFieldConfig?.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (node.field && fieldOptions[node.field]) ? (
              <>
                <Input
                  value={node.value}
                  list={`list-${node.id}`}
                  onChange={(e) => onChange({ ...node, value: e.target.value })}
                  className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-md"
                  placeholder="Escriba o seleccione..."
                />
                <datalist id={`list-${node.id}`}>
                  {fieldOptions[node.field].map((opt, idx) => (
                    <option key={`${opt.value}-${idx}`} value={opt.value}>{opt.label}</option>
                  ))}
                </datalist>
              </>
            ) : fieldType === "date" ? (
              <Input
                type="date"
                value={node.value}
                onChange={(e) => onChange({ ...node, value: e.target.value })}
                className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-md"
              />
            ) : fieldType === "datetime" ? (
              <Input
                type="datetime-local"
                value={node.value}
                onChange={(e) => onChange({ ...node, value: e.target.value })}
                className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-md"
              />
            ) : fieldType === "number" ? (
              <Input
                type="number"
                value={node.value}
                onChange={(e) => onChange({ ...node, value: e.target.value })}
                className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-md"
                placeholder="0"
              />
            ) : (
              <Input
                value={node.value}
                onChange={(e) => onChange({ ...node, value: e.target.value })}
                className="h-8 text-xs border-transparent bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 transition-all rounded-md"
                placeholder="Valor..."
              />
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-7 w-7 p-0 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>

        </div>
      </div>
    );
  }
};

// ---------------- DIALOGO PRINCIPAL ---------------- //

export function AdvancedFilterDialog({
  open,
  onOpenChange,
  onApply,
  initialFilter,
  fieldOptions = {},
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply: (root: FilterNode) => void;
  initialFilter?: FilterNode;
  fieldOptions?: Record<string, FieldOption[]>;
}) {
  const defaultRoot: FilterNode = {
    id: "root",
    type: "group",
    logic: "AND",
    children: [
      { id: "init-1", type: "condition", field: "Departamento", operator: "igual", value: "" },
    ],
  };

  const [rootNode, setRootNode] = useState<FilterNode>(initialFilter || defaultRoot);

  // Reiniciar cuando se abre si no hay filtro inicial
  useEffect(() => {
    if (open && !initialFilter) {
      // Opcional: Persistir el último estado o reiniciar
      // setRootNode(defaultRoot); 
    } else if (open && initialFilter) {
      setRootNode(initialFilter);
    }
  }, [open, initialFilter]);

  const handleApply = () => {
    onApply(rootNode);
    onOpenChange(false);
  };

  const clearAll = () => {
    setRootNode(defaultRoot);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="6xl">
      <DialogContent className="flex flex-col p-0 gap-0 bg-gray-50 overflow-hidden h-full max-h-[85vh]">
        <DialogHeader className="p-6 pb-2 bg-white border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Editor de Filtros Avanzado
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Construye consultas complejas usando grupos y operadores lógicos.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <NodeItem
            node={rootNode}
            onChange={setRootNode}
            onDelete={() => {/* Root no se borra */ }}
            fieldOptions={fieldOptions}
          />

          <div className="text-xs text-gray-400 text-center max-w-lg mx-auto">
            * Puedes anidar grupos dentro de grupos para crear lógica compleja como (A y B) o (C y D).
          </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Button
            variant="outline"
            onClick={clearAll}
            className="text-gray-500 hover:text-red-600 border-gray-200 hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar filtro
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none text-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
            >
              <Check className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
