import {DropdownItem, FormGroup, Input, Label} from "reactstrap";
import {BOOLEAN_NOTATION, EMPTY_BOOLEAN_NOTATION_RECORD, booleanNotationMap} from "../../../services";
import {BooleanNotation} from "../../../../IsaacAppTypes";
import React, {ChangeEvent} from "react";
import classNames from "classnames";
import { StyledDropdown } from "./DropdownInput";

interface BooleanNotationInputProps {
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    isRequired?: boolean;
}
export const BooleanNotationInput = ({booleanNotation, setBooleanNotation, isRequired = false} : BooleanNotationInputProps) => {

    const onChange = (event: any) => {
        // Makes a new object, with all the boolean notation flags being false apart
        // from those that are set in the newBooleanNotation parameter
        const newBooleanNotation: BooleanNotation = {...EMPTY_BOOLEAN_NOTATION_RECORD};
        newBooleanNotation[event.target.value as keyof BooleanNotation] = true;
        setBooleanNotation(newBooleanNotation);
    };

    return <FormGroup className="mr-lg-5">
        <Label className={classNames({"form-optional": !isRequired}, "font-weight-bold")}
               htmlFor="boolean-notation-preference">Preferred logic notation</Label>

        <StyledDropdown
            type="select"
            name="select"
            id="boolean-notation-preference"
            required={isRequired}
            onChange={onChange}
            value={Object.keys(BOOLEAN_NOTATION).reduce((val: string, key) => booleanNotation?.[key as keyof BooleanNotation] ? key : val, BOOLEAN_NOTATION.MATH)}
        >
            {[BOOLEAN_NOTATION.MATH, BOOLEAN_NOTATION.ENG].map((notation) => (
                <option key={notation} value={notation}>{booleanNotationMap[notation]}</option>
            ))}
        </StyledDropdown>
    </FormGroup>;
};
