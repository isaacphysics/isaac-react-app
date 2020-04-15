import React from "react";
import {CustomInput} from "reactstrap";

interface SubjectInterestInputProps<T> {
    stateObject: T;
    propertyName: string;
    setStateFunction: (stateObject: T) => void;
}
export const SubjectInterestInput = (props: SubjectInterestInputProps<any>) => {
    const {stateObject, propertyName, setStateFunction} = props;
    return <CustomInput id={`${propertyName}-checkbox`} type="checkbox" className="isaac-checkbox" defaultChecked={stateObject[propertyName] === true}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            stateObject[propertyName] = e.target.checked;
            setStateFunction(Object.assign(stateObject, stateObject[propertyName]));
        }}
    />;
};
