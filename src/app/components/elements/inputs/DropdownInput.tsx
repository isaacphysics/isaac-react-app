import classNames from "classnames";
import React from "react";
import { Input, InputProps } from "reactstrap";
import { isPhy } from "../../../services";

export interface StyledDropdownProps extends InputProps {
    value: string | number | undefined;
}

export const StyledDropdown = (props: StyledDropdownProps) => {
    return <div className="position-relative w-100 styled-dropdown-caret">
        <Input type="select" {...props} className={classNames("form-control d-inline-block pl-3 pr-4 mt-1 mt-sm-0 " + props.className, {"w-auto" : isPhy})}>
            {props.children}
        </Input>
    </div>;
};