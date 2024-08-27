import React from "react";
import * as RS from "reactstrap";

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
export function TrueFalseRadioInput({id, stateObject, propertyName, setStateFunction, submissionAttempted, trueLabel="Yes", falseLabel="No"}: TrueFalseRadioProps) {
    const invalid = submissionAttempted && (typeof stateObject?.[propertyName] !== "boolean");

    return <RS.FormGroup>
        <div className="d-flex flex-nowrap">
            <RS.Label htmlFor={`${id}-t`} className="w-50 text-end text-nowrap pe-2">
                {trueLabel}<span className='visually-hidden'> for {propertyName}</span>
            </RS.Label>
            <RS.Input
                id={`${id}-t`} type="radio" name={id} color="$secondary" className="d-inline"
                checked={stateObject?.[propertyName] === true} invalid={invalid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setStateFunction({...stateObject, [propertyName]: e.target.checked});
                }}
                aria-describedby={`${id}-feedback`}
            />
        </div>
        <div className="d-flex flex-nowrap">
            <RS.Label htmlFor={`${id}-f`} className="w-50 text-end text-nowrap pe-2">
                {falseLabel}<span className='visually-hidden'> for {propertyName}</span>
            </RS.Label>
            <RS.Input
                id={`${id}-f`} type="radio" name={id} color="$secondary" className="d-inline"
                checked={stateObject?.[propertyName] === false} invalid={invalid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setStateFunction({...stateObject, [propertyName]: !e.target.checked});
                }}
                aria-describedby={`${id}-feedback`}
            />
        </div>
        {invalid && <div id={`${id}-feedback`} className="required-before d-flex flex-nowrap text-center">
            required
        </div>}
    </RS.FormGroup>;
}
