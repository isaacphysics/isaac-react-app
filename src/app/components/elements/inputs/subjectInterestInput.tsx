import React from "react";
import {SubjectInterests} from "../../../../IsaacAppTypes";
import { Input } from "reactstrap";

interface SubjectInterestInputProps<T> {
    stateObject: T;
    propertyName: keyof T;
    setStateFunction: (stateObject: T) => void;
}

export const SubjectInterestInput = (props: SubjectInterestInputProps<SubjectInterests>) => {
    const {stateObject, propertyName, setStateFunction} = props;

    return <Input id={`${propertyName}-checkbox`} type="checkbox" className="isaac-checkbox" checked={!!stateObject[propertyName]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStateFunction({...stateObject, [propertyName]: e.target.checked});
        }}
    />;
};
