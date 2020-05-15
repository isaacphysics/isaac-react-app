import React, {useEffect, useState} from "react";
import {CustomInput} from "reactstrap";

interface SubjectInterestInputProps<T> {
    stateObject: T;
    propertyName: string;
    setStateFunction: (stateObject: T) => void;
}

export const SubjectInterestInput = (props: SubjectInterestInputProps<any>) => {
    const {stateObject, propertyName, setStateFunction} = props;
    const [thisPref, setThisPref] = useState(stateObject[propertyName]);
    useEffect(() => {
        setThisPref(stateObject[propertyName])
    }, [stateObject]);

    function alterChecked(choice: boolean){
        setThisPref(choice);
    }

    return <CustomInput id={`${propertyName}-checkbox`} type="checkbox" className="isaac-checkbox" checked={thisPref}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            alterChecked(e.target.checked);
            stateObject[propertyName] = e.target.checked;
            setStateFunction(Object.assign(stateObject, {propertyName: e.target.checked}));
        }}
    />;
};
