import React, {useEffect, useMemo, useState} from "react";
import {Input, InputProps} from "reactstrap";
import {v4} from "uuid";
import {Spacer} from "../Spacer";
import { ifKeyIsEnter, isPhy } from "../../../services";
import classNames from "classnames";

// A custom checkbox, dealing with mouse and keyboard input. Pass `onChange((e : ChangeEvent) => void)`, `checked: bool`, and `label: Element` as required as props to use.

export const StyledCheckbox = (props : InputProps) => {

    const {label, ignoreLabelHover, className, ...rest} = props;

    const [checked, setChecked] = useState(props.checked ?? false);
    const id = useMemo(() => {return (props.id ?? "") + "-" + v4();}, [props.id]);
    const onCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange && props.onChange(e);
        setChecked(e.target.checked);
    };

    // if `checked` is changed externally, reflect this here
    useEffect(() => {
        setChecked(props.checked ?? false);
    }, [props.checked]);

    return <div className={classNames("styled-checkbox-wrapper", {"is-invalid": props.invalid})}>
        <div className="me-2 my-2">
            {checked && <div className="tick"/>}
            <Input {...rest} id={id} type="checkbox" className={classNames(className ?? "", {"checked" : checked})}
                onChange={(e) => onCheckChange(e)}
                // If the user toggles with a keyboard, this does not change the state of the checkbox, so we need to do it manually (with modification to `target`
                // as this is a keyboard event, not a change event). We also prevent default to avoid submitting the outer form.
                onKeyDown={(e) => ifKeyIsEnter(() => {onCheckChange({...e, target: {...e.currentTarget, checked: !e.currentTarget.checked}}); e.preventDefault();})(e)}
            />
        </div>
        {label && <label htmlFor={id} className={classNames({"text-muted" : props.disabled, "pt-1" : isPhy, "hover-override" : ignoreLabelHover})} {...label.props}/>}
        <Spacer/>
    </div>;
};
