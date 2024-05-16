import classNames from "classnames";
import React from "react";
import {FormFeedback, Input, InputProps} from "reactstrap";

export interface StyledDropdownProps extends InputProps {
    value: string | number | undefined;
    feedback?: string;
}

export const StyledDropdown = (props: StyledDropdownProps) => {
    return <div className="position-relative w-100 styled-dropdown-caret">
        <Input type="select" {...props} className={classNames("form-control d-inline-block ps-3 pe-4 mt-1 mt-sm-0 " + props.className)}>
            {props.children}
        </Input>
        <FormFeedback>
            {props.feedback}
        </FormFeedback>
    </div>;
};