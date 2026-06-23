import React from "react";
import Select from "react-select";
import { reactSelectDarkModeStyles } from "../../../services";

export const StyledSelect: Select = (props) => {
    return <Select
        {...props}
        className={"basic-multi-select"}
        classNamePrefix="select"
        // the Select component's type has its default props pre-instantiated, whereas the provided Props class (what `props` would be typed as) does not.
        // in order to explicitly set them here, then, so as to make TS happy, we would need to instantiate the default props, which can't be done from
        // outside the library as the correct classes are not exported. so just ignoring the warning for now :/
        // eslint-disable-next-line react/prop-types
        styles={Object.assign(reactSelectDarkModeStyles, props.styles ?? {})}
    />;
};
