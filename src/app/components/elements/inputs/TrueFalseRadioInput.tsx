import React from "react";
import { FormGroup, Label, Input } from "reactstrap";

interface TrueFalseRadioProps {
    id: string;
    className?: string;
    stateObject: Nullable<Record<string, Nullable<boolean>>>;
    propertyName: string;
    accessibleName?: string;
    setStateFunction: (stateObject: Record<string, Nullable<boolean>>) => void;
    submissionAttempted: boolean | undefined;
    error?: string;
    trueLabel?: string;
    falseLabel?: string;
}
export function TrueFalseRadioInput({id, className, stateObject, propertyName, accessibleName, setStateFunction, submissionAttempted, trueLabel="Yes", falseLabel="No"}: TrueFalseRadioProps) {
    const invalid = submissionAttempted && (typeof stateObject?.[propertyName] !== "boolean");

    console.log(stateObject);

    return <FormGroup>
        <div className={className}>
            <div className="d-flex flex-nowrap flex-grow-1">
                <Label htmlFor={`${id}-t`} className="w-50 text-end text-nowrap pe-2">
                    {trueLabel}<span className='visually-hidden'> for {accessibleName ?? propertyName}</span>
                </Label>
                <Input
                    id={`${id}-t`} type="radio" name={id} color="primary" className="d-inline"
                    checked={stateObject?.[propertyName] === true} invalid={invalid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStateFunction({...stateObject, [propertyName]: e.target.checked});
                    }}
                    aria-describedby={`${id}-feedback`}
                />
            </div>
            <div className="d-flex flex-nowrap flex-grow-1">
                <Label htmlFor={`${id}-f`} className="w-50 text-end text-nowrap pe-2">
                    {falseLabel}<span className='visually-hidden'> for {accessibleName ?? propertyName}</span>
                </Label>
                <Input
                    id={`${id}-f`} type="radio" name={id} color="primary" className="d-inline"
                    checked={stateObject?.[propertyName] === false} invalid={invalid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setStateFunction({...stateObject, [propertyName]: !e.target.checked});
                    }}
                    aria-describedby={`${id}-feedback`}
                />
            </div>
        </div>

        {invalid && <div id={`${id}-feedback`} className="required-before d-flex flex-nowrap text-center">
            required
        </div>}
    </FormGroup>;
}
