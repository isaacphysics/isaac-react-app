import React from "react";
import Select from "react-select";
import { reactSelectDarkModeStyles } from "../../../services";

export const StyledSelect: Select = (props) => {
    return <Select
        {...props}
        className={"basic-multi-select"}
        classNamePrefix="select"
        styles={Object.assign(reactSelectDarkModeStyles, props.styles ?? {})}
    />;
};
