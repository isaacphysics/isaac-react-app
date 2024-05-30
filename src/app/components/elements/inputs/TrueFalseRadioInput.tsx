import React from "react";
import { CustomInput, FormGroup, Label } from "reactstrap";

interface TrueFalseRadioProps {
  id: string;
  stateObject: Nullable<Record<string, Nullable<boolean>>>;
  propertyName: string;
  setStateFunction: (stateObject: Record<string, Nullable<boolean>>) => void;
  submissionAttempted: boolean;
  error?: string;
  trueLabel?: string;
  falseLabel?: string;
}
export function TrueFalseRadioInput({
  id,
  stateObject,
  propertyName,
  setStateFunction,
  submissionAttempted,
  trueLabel = "Yes",
  falseLabel = "No",
}: TrueFalseRadioProps) {
  const invalid = submissionAttempted && typeof stateObject?.[propertyName] !== "boolean";

  return (
    <FormGroup>
      <div className="d-flex flex-nowrap">
        <Label htmlFor={`${id}-t`} className="w-50 text-right text-nowrap pr-2">
          {trueLabel}
          <span className="sr-only"> for {propertyName}</span>
        </Label>
        <CustomInput
          id={`${id}-t`}
          type="radio"
          name={id}
          color="$secondary"
          className="d-inline"
          checked={stateObject?.[propertyName] === true}
          invalid={invalid}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStateFunction({ ...stateObject, [propertyName]: e.target.checked });
          }}
          aria-describedby={`${id}-feedback`}
        />
      </div>
      <div className="d-flex flex-nowrap">
        <Label htmlFor={`${id}-f`} className="w-50 text-right text-nowrap pr-2">
          {falseLabel}
          <span className="sr-only"> for {propertyName}</span>
        </Label>
        <CustomInput
          id={`${id}-f`}
          type="radio"
          name={id}
          color="$secondary"
          className="d-inline"
          checked={stateObject?.[propertyName] === false}
          invalid={invalid}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStateFunction({ ...stateObject, [propertyName]: !e.target.checked });
          }}
          aria-describedby={`${id}-feedback`}
        />
      </div>
      {invalid && (
        <div id={`${id}-feedback`} className="required-before d-flex flex-nowrap text-center">
          required
        </div>
      )}
    </FormGroup>
  );
}
