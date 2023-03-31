import React from "react";
import Select from "react-select";

export const StyledSelect: typeof Select = (props) => {
    return <Select
        {...props}
        className={"basic-multi-select"}
        classNamePrefix="select"
    />;
};
