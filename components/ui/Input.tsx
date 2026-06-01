import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onlyLetters?: boolean;
  onlyNumbers?: boolean;
  onlyDocument?: boolean;
  alphanumeric?: boolean;
  noSpaces?: boolean;
  uppercase?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onlyLetters, onlyNumbers, onlyDocument, alphanumeric, noSpaces, uppercase, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      console.log("🔥 [Input.tsx] handleChange ejecutado! Valor actual:", val, { onlyLetters, onlyNumbers, onlyDocument, alphanumeric });

      if (onlyLetters) {
        val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      }
      if (onlyNumbers) {
        val = val.replace(/[^0-9]/g, "");
      }
      if (onlyDocument) {
        val = val.replace(/[^0-9.]/g, "");
      }
      if (alphanumeric) {
        val = val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
      }
      if (noSpaces) {
        val = val.replace(/\s/g, "");
      }
      if (uppercase) {
        val = val.toUpperCase();
      }

      e.target.value = val;

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
