import React from "react";
import {siteSpecific} from "../../../services";
import Select, {StylesConfig} from "react-select";

// The "any"s here are needed - don't try to style the select based on its options or values, otherwise we'll
// have to do some fancy generic typing
const SELECT_STYLES: StylesConfig<any, any, any> | undefined = siteSpecific(
    undefined,
    {
        control: (base, state) => state.isFocused
            ? {
                ...base,
                border: 0,
                boxShadow: "0 0 0 3px #00A8A6"
            } : base
    }
);

export const StyledSelect: typeof Select = (props) => {
    return <Select {...props} styles={SELECT_STYLES} />;
};
