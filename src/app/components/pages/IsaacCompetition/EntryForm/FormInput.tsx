import React from "react";
import { FormGroup, Label, Input } from "reactstrap";
import { InputType } from "reactstrap/es/Input";
import { AppGroup } from "../../../../../IsaacAppTypes";
import CustomTooltip from "../../../elements/CustomTooltip";

interface FormInputProps {
  label: string;
  subLabel?: string;
  type: string;
  id: string;
  disabled: boolean;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  activeGroups?: AppGroup[];
  setSelectedGroup?: (group: AppGroup | null) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipMessage?: string;
}

const FormInput = ({
  label,
  subLabel,
  type,
  id,
  disabled,
  options = [],
  defaultValue,
  required = true,
  value,
  placeholder,
  activeGroups = [],
  setSelectedGroup,
  onChange,
  tooltipMessage,
}: FormInputProps) => {
  return (
    <FormGroup>
      <Label className="entry-form-sub-title">
        {label} {required && <span className="entry-form-asterisk">*</span>}
        {tooltipMessage && <CustomTooltip id={`${id}-tooltip`} message={tooltipMessage} />}
      </Label>
      {subLabel && <div className="entry-form-sub-title">{subLabel}</div>}
      {type === "select" ? (
        <Input
          type="select"
          id={id}
          disabled={false} // Always enabled
          required={required}
          onChange={(e) => setSelectedGroup?.(activeGroups.find((group) => group.groupName === e.target.value) || null)}
          style={{
            backgroundColor: "white",
            border: "1px solid #ced4da",
            borderRadius: "0.375rem",
            minHeight: "38px",
            padding: "6px 12px",
            fontSize: "16px",
            lineHeight: "1.5",
            appearance: "none",
            color: "#554759",
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px 12px",
            paddingRight: "40px",
          }}
        >
          {options.length > 0 &&
            options.map((option, index) => (
              <option key={index} value={option === "Please select from the list" ? "" : option}>
                {option}
              </option>
            ))}
        </Input>
      ) : (
        <Input
          type={type as InputType}
          id={id}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className={id === "projectTitle" || id === "projectLink" ? "white-bg" : undefined}
          autoComplete={id === "projectTitle" || id === "projectLink" ? "off" : undefined}
        />
      )}
    </FormGroup>
  );
};

export default FormInput;
