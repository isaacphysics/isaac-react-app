import React, { useState } from "react";
import { Input, InputProps } from "reactstrap";
import { v4 } from "uuid";
import { Spacer } from "../Spacer";
import { isPhy } from "../../../services";

export interface StyledCheckboxProps extends InputProps {
    initialValue: boolean;
    changeFunction: (checked: boolean) => void;
}

export const StyledCheckbox = ({initialValue, ...props} : StyledCheckboxProps) => {
    const [checked, setChecked] = useState(initialValue ?? false);
    const id = (props.id ?? "") + "-" + v4();
    return <div className="styled-checkbox-wrapper">
        <div className="mr-2 mb-3">
            {checked && <div className="tick"/>}
            <Input {...props} id={id} type="checkbox" checked={checked} className={(props.className ?? "") + (checked ? "checked" : "")} onChange={() => {
                props.changeFunction && props.changeFunction(!checked);
                setChecked(c => !c);
            }}/>
        </div>
        {props.label && <label htmlFor={id} className={isPhy ? "pt-1" : ""} {...props.label.props}/>}
        <Spacer/>
    </div>;
};