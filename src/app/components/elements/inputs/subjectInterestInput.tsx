import React from "react";
import {CustomInput} from "reactstrap";

interface SujectInterestInputProps<T> {
    stateObject: T;
    propertyName: string;
    setStateFunction: (stateObject: T) => void;
}
export const SubjectInterestInput = (props: SujectInterestInputProps<any>) => {
    const {stateObject, propertyName, setStateFunction} = props
    return <CustomInput id={`${propertyName}-checkbox`} type="checkbox" className="isaac-checkbox" checked={stateObject[propertyName] === true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                stateObject[propertyName] = true;
            } else {
                delete stateObject[propertyName];
            }
            setStateFunction(Object.assign({}, stateObject));
        }}
    />;
};
