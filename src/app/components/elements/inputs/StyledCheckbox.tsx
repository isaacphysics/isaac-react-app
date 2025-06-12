import React, {useEffect, useMemo, useState} from "react";
import {InputProps} from "reactstrap";
import {v4} from "uuid";
import {Spacer} from "../Spacer";
import {ifKeyIsEnter, isAda, isPhy} from "../../../services";
import classNames from "classnames";

// A custom checkbox, dealing with mouse and keyboard input. Pass `onChange((e : ChangeEvent) => void)`, `checked: bool`, and `label: Element` as required as props to use.
// If `partial` is true, the checkbox can be put in a third state. In this case, the default display is ignored, and it is expected that the `className` prop will be set to a class that displays the partial state.

export const StyledCheckbox = (props: InputProps & {partial?: boolean}) => {

    const {label, ignoreLabelHover, className, bsSize, partial, invalid, ...rest} = props;

    const [checked, setChecked] = useState(props.checked ?? false);
    const id = useMemo(() => {return (props.id ?? "") + "-" + v4();}, [props.id]);
    const onCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.onChange) props.onChange(e);
        setChecked(e.target.checked);
    };

    // if `checked` is changed externally, reflect this here
    useEffect(() => {
        setChecked(props.checked ?? false);
    }, [props.checked]);

    return <div className={classNames("styled-checkbox-wrapper", {"is-invalid": invalid, "checkbox-small": bsSize === "sm"})}>
        <div className={classNames({"me-2 my-2": label})}>
            {isAda && checked && <div className="tick"/>}
            <input {...rest} id={id} type="checkbox" className={classNames(className ?? "", "d-block", {"checked": checked, "icon-checkbox-off": !partial && !checked, "icon-checkbox-selected": !partial && checked})}
                onChange={(e) => onCheckChange(e)}
                // If the user toggles with a keyboard, this does not change the state of the checkbox, so we need to do it manually (with modification to `target`
                // as this is a keyboard event, not a change event). We also prevent default to avoid submitting the outer form.
                onKeyDown={(e) => ifKeyIsEnter(() => {onCheckChange({...e, target: {...e.currentTarget, checked: !e.currentTarget.checked}}); e.preventDefault();})(e)}
            />
        </div>
        {label && <label htmlFor={id} className={classNames({"text-muted" : props.disabled, "hover-override" : ignoreLabelHover})} {...label.props}/>}
        <Spacer/>
    </div>;
};

interface CheckboxWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
}

// in many places, we want a stylised wrapper around the checkbox indicating selection.
export const CheckboxWrapper = (props: CheckboxWrapperProps) => {
    const {active, className, ...rest} = props;
    return <div {...rest} className={classNames("ps-3 checkbox-wrapper", {"ms-2": isPhy, "bg-white": isAda, "checkbox-active": active}, className)}/>;
};
