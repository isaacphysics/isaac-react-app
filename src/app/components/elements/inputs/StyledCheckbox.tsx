import React, {useMemo, useState} from "react";
import {Input, InputProps} from "reactstrap";
import {v4} from "uuid";
import {Spacer} from "../Spacer";

export const StyledCheckbox = (props : InputProps) => {
    const [checked, setChecked] = useState(props.checked ?? false);
    const id = useMemo(() => {return (props.id ?? "") + "-" + v4();}, [props.id]);
    return <div className="styled-checkbox-wrapper">
        <div className="mr-2 mb-3">
            {checked && <div className="tick"/>}
            <Input {...props} id={id} type="checkbox" checked={props.checked} className={(props.className ?? "") + (checked ? "checked" : "")} onChange={(e) => {
                props.onChange && props.onChange(e);
                setChecked(c => !c);
            }}/>
        </div>
        {props.label && <label htmlFor={id} className="pt-1" {...props.label.props}/>}
        <Spacer/>
    </div>;
};