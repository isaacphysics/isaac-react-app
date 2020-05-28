import React from "react";
import {CustomInput} from "reactstrap";
import {SubjectInterests} from "../../../../IsaacAppTypes";

interface SubjectInterestInputProps<T> {
    stateObject: T;
    propertyName: keyof T;
    setStateFunction: (stateObject: T) => void;
}

export const SubjectInterestInput = (props: SubjectInterestInputProps<SubjectInterests>) => {
    const {stateObject, propertyName, setStateFunction} = props;

    return <CustomInput id={`${propertyName}-checkbox`} type="checkbox" className="isaac-checkbox" checked={!!stateObject[propertyName]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStateFunction({...stateObject, [propertyName]: e.target.checked});
        }}
    />;
};
