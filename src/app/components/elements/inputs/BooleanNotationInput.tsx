import {FormGroup, Input, Label} from "reactstrap";
import {BOOLEAN_NOTATION} from "../../../services/constants";
import {BooleanNotation} from "../../../../IsaacAppTypes";
import React, {ChangeEvent} from "react";
import {validateBooleanNotation} from "../../../services/validation";

interface BooleanNotationInputProps {
    booleanNotation: BooleanNotation;
    setBooleanNotation: (bn: BooleanNotation) => void;
    submissionAttempted: boolean;
}
export const BooleanNotationInput = ({booleanNotation, setBooleanNotation, submissionAttempted} : BooleanNotationInputProps) => {
    return <FormGroup>
        <Label className="d-inline-block pr-2 form-required" htmlFor="boolean-notation-preference">
            Boolean logic notation
        </Label>
        <Input
            type="select" name="select" id="boolean-notation-preference"
            value={
                // This chooses the last string in this list that (when used as a key)
                // is mapped to true in the current value of booleanNotation
                Object.keys(BOOLEAN_NOTATION).reduce((val: string | undefined, key) => booleanNotation[key as keyof BooleanNotation] === true ? key : val, undefined)
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setBooleanNotation({[event.target.value]: true})
            }
            }
            invalid={submissionAttempted && !validateBooleanNotation(booleanNotation)}
        >
            <option value={undefined}></option>
            <option value={BOOLEAN_NOTATION.MATH}>And (&and;) Or (&or;) Not (&not;)</option>
            <option value={BOOLEAN_NOTATION.ENG}>And (&middot;) Or (+) Not (bar)</option>
        </Input>
    </FormGroup>
}