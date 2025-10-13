import React from "react";
import { Badge } from "reactstrap";

interface CustomMultiSelectProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  label?: string;
}

const CustomMultiSelect = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  isRequired = false,
  label = "Multi-select field",
}: CustomMultiSelectProps) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const newSelectedValues = selectedOptions.map((option) => option.value);
    onChange(newSelectedValues);
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div>
      <label htmlFor="multi-select-control" className={isRequired ? "form-required" : ""}>
        {label}
      </label>

      {/* Selected values display */}
      {selectedValues.length > 0 && (
        <div className="mb-2">
          <div className="d-flex flex-wrap gap-1">
            {selectedValues.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge key={value} color="secondary" className="d-flex align-items-center">
                  {option?.label}
                  <button
                    type="button"
                    className="btn btn-link p-0 ms-1 text-white"
                    onClick={() => removeValue(value)}
                    aria-label={`Remove ${option?.label}`}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Accessible select multiple element */}
      <select
        id="multi-select-control"
        multiple
        value={selectedValues}
        onChange={handleSelectChange}
        className="form-select"
        size={Math.min(options.length, 6)} // Show up to 6 options at once
        aria-label={label}
        required={isRequired}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {selectedValues.length === 0 && <div className="text-muted small mt-1">{placeholder}</div>}
    </div>
  );
};

export default CustomMultiSelect;
