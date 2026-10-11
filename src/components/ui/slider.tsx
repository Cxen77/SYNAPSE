import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onValueChange,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const currentVal = value && value.length > 0 ? value[0] : (defaultValue ? defaultValue[0] : min);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange([num]);
      }
    };

    return (
      <div className={cn("relative flex w-full items-center py-1", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
