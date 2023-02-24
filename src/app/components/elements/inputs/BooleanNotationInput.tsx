import {FormGroup, Input, Label} from "reactstrap";
import {BOOLEAN_NOTATION, EMPTY_BOOLEAN_NOTATION_RECORD} from "../../../services";
import {BooleanNotation} from "../../../../IsaacAppTypes";
import React, {ChangeEvent} from "react";

interface BooleanNotationInputProps {
    booleanNotation: Nullable<BooleanNotation>;
    setBooleanNotation: (bn: BooleanNotation) => void;
    isRequired?: boolean;
}
export const BooleanNotationInput = ({booleanNotation, setBooleanNotation, isRequired = false} : BooleanNotationInputProps) => {

    return <FormGroup>
        <Label className={`d-inline-block pr-2 ${isRequired ? "form-required" : ""}`} htmlFor="boolean-notation-preference">
            Boolean logic notation
        </Label>
        <Input
            type="select" name="select" id="boolean-notation-preference"
            value={
                // This chooses the last string in this list that (when used as a key)
                // is mapped to true in the current value of booleanNotation
                Object.keys(BOOLEAN_NOTATION).reduce((val: string, key) => booleanNotation?.[key as keyof BooleanNotation] ? key : val, BOOLEAN_NOTATION.MATH)
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    // Makes a new object, with all the boolean notation flags being false apart
                    // from those that are set in the newBooleanNotation parameter
                    const newBooleanNotation: BooleanNotation = {...EMPTY_BOOLEAN_NOTATION_RECORD};
                    newBooleanNotation[event.target.value as keyof BooleanNotation] = true;
                    setBooleanNotation(newBooleanNotation);
                }
            }
            required={isRequired}
        >
            <option value={BOOLEAN_NOTATION.MATH}>And (&and;) Or (&or;) Not (&not;)</option>
            <option value={BOOLEAN_NOTATION.ENG}>And (&middot;) Or (+) Not (bar)</option>
        </Input>
    </FormGroup>
}
