import React from "react";
import * as RS from "reactstrap";

interface TrueFalseRadioProps<T> {
    id: string;
    stateObject: T;
    propertyName: string;
    setStateFunction: (stateObject: T) => void;
    submissionAttempted: boolean;
    error?: string;
    trueLabel?: string;
    falseLabel?: string;
}
export const TrueFalseRadioInput = ({id, stateObject, propertyName, setStateFunction, submissionAttempted, trueLabel="Yes", falseLabel="No"}: TrueFalseRadioProps<any>) => {
    const invalid = submissionAttempted && ![true, false].includes(stateObject[propertyName]);

    return <RS.FormGroup>
        <div className="d-flex flex-nowrap">
            <RS.Label htmlFor={`${id}-t`} className="w-50 text-right text-nowrap pr-2">
                {trueLabel}<span className='sr-only'> for {propertyName}</span>
            </RS.Label>
            <RS.CustomInput
                id={`${id}-t`} type="radio" name={id} color="$secondary" className="d-inline"
                checked={stateObject?.[propertyName] === true} invalid={invalid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setStateFunction({...stateObject, [propertyName]: e.target.checked});
                }}
                aria-describedby={`${id}-feedback`}
            />
        </div>
        <div className="d-flex flex-nowrap">
            <RS.Label htmlFor={`${id}-f`} className="w-50 text-right text-nowrap pr-2">
                {falseLabel}<span className='sr-only'> for {propertyName}</span>
            </RS.Label>
            <RS.CustomInput
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
    </RS.FormGroup>
};
