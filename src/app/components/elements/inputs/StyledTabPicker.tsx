import React from "react";
import { ReactNode } from "react";
import { Label, Input } from "reactstrap";
import { isDefined } from "../../../services";
import { Spacer } from "../Spacer";
import classNames from "classnames";

/**
 * @typedef {Object} StyledTabPickerProps
 * @property {string} id - A unique identifier for the tab picker.
 * @property {boolean} [checked] - Whether the tab is checked.
 * @property {boolean} [disabled] - Whether the tab is disabled.
 * @property {React.ChangeEventHandler<HTMLInputElement>} [onInputChange] - The function to call when the tab is clicked.
 * @property {ReactNode} checkboxTitle - The title of the tab.
 * @property {number} [count] - The number to display on the tab.
 */

interface StyledTabPickerProps extends React.HTMLAttributes<HTMLLabelElement> {
    checked?: boolean;
    disabled?: boolean;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
    checkboxTitle: ReactNode;
    count?: number;
    suffix?: {
        icon: string;
        action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        info: string;
    }
}

/**
 * A StyledTabPicker component, used to render a list of selectable tabs, each with a title and optional counter (as to indicate how many options selecting that would provide).
 * This can work as either a radio button or a multi-select checkbox, depending on the functionality of onInputChange.
 *
 * @param {StyledTabPickerProps} props
 * @returns {JSX.Element}
 */
export const StyledTabPicker = (props: StyledTabPickerProps): JSX.Element => {
    const { checked, disabled, onInputChange, checkboxTitle, count, suffix, ...rest } = props;
    return <Label {...rest} tabIndex={-1} className={classNames("d-flex align-items-center tab-picker py-2 my-1 w-100", rest.className)}>
        <Input type="checkbox" checked={checked ?? false} onChange={onInputChange} readOnly={onInputChange === undefined} disabled={disabled} />
        <span className="ms-3">{checkboxTitle}</span>
        {isDefined(count) && <span className="badge rounded-pill ms-2">{count}</span>}
        <Spacer/>
        {suffix && <button type="button" className="px-2 py-1 bg-transparent" onClick={suffix.action} aria-label={suffix.info} title={suffix.info} disabled={disabled}>
            <i className={`${suffix.icon} d-block`}/>
        </button>}
    </Label>;
};
