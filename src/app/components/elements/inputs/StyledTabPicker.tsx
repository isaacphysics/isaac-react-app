import React from "react";
import { ReactNode } from "react";
import { Label, Input } from "reactstrap";
import { isDefined } from "../../../services";

/**
 * @typedef {Object} StyledTabPickerProps
 * @property {string} id - A unique identifier for the tab picker.
 * @property {boolean} [checked] - Whether the tab is checked.
 * @property {React.ChangeEventHandler<HTMLInputElement>} [onInputChange] - The function to call when the tab is clicked.
 * @property {ReactNode} checkboxTitle - The title of the tab.
 * @property {number} [count] - The number to display on the tab.
 */

interface StyledTabPickerProps extends React.HTMLAttributes<HTMLLabelElement> {
    checked?: boolean;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
    checkboxTitle: ReactNode;
    count?: number;
}

/**
 * A StyledTabPicker component, used to render a list of selectable tabs, each with a title and optional counter (as to indicate how many options selecting that would provide).
 * This can work as either a radio button or a multi-select checkbox, depending on the functionality of onInputChange.
 *
 * @param {StyledTabPickerProps} props
 * @returns {JSX.Element}
 */
export const StyledTabPicker = (props: StyledTabPickerProps): JSX.Element => {
    const { checked, onInputChange, checkboxTitle, count, ...rest } = props;
    return <Label {...rest} className="d-flex align-items-center tab-picker py-2 mb-1">
        <Input type="checkbox" checked={checked ?? false} onChange={onInputChange} />
        <span className="ms-3">{checkboxTitle}</span>
        {isDefined(count) && <span className="badge rounded-pill ms-2">{count}</span>}
    </Label>;
};
