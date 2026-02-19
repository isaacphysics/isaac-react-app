import React from "react";
import { ReactNode } from "react";
import { Label, Input } from "reactstrap";
import { isDefined, siteSpecific } from "../../../services";
import { Spacer } from "../Spacer";
import classNames from "classnames";
import { Link } from "react-router-dom";

/**
 * @typedef {Object} StyledTabPickerProps
 * @property {string} id - A unique identifier for the tab picker.
 * @property {boolean} [checked] - Whether the tab is checked.
 * @property {boolean} [disabled] - Whether the tab is disabled.
 * @property {React.ChangeEventHandler<HTMLInputElement>} [onInputChange] - The function to call when the tab is clicked.
 * @property {ReactNode} checkboxTitle - The title of the tab.
 * @property {number} [count] - The number to display on the tab.
 * @property {"left" | "right"} [indicatorPosition] - The position of the indicator.
 * @property {Object} [suffix] - An optional suffix to display on the tab.
 * @property {"checkbox" | "radio" | "link"} type - The type of the tab picker.
 * @property {string} [to] - The URL to navigate to when the tab is clicked (only for type "link").
 */

type StyledTabPickerProps = React.HTMLAttributes<HTMLElement> & {
    checked?: boolean;
    disabled?: boolean;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
    checkboxTitle: ReactNode;
    count?: number;
    indicatorPosition?: "left" | "right";
    suffix?: {
        icon: string;
        action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        info: string;
    }
} & ({
    type?: "checkbox" | "radio";
    to?: never;
} | {
    type: "link";
    to: string;
})

const PickerContents = ({checkboxTitle, count, suffix, disabled}: Pick<StyledTabPickerProps, "checkboxTitle" | "count" | "suffix" | "disabled">) => <>
    <span className="ms-3">{checkboxTitle}</span>
    {isDefined(count) && <span className="badge rounded-pill ms-2">{count}</span>}
    <Spacer/>
    {suffix && <button type="button" className="px-2 py-1 bg-transparent" onClick={suffix.action} aria-label={suffix.info} title={suffix.info} disabled={disabled}>
        <i className={`${suffix.icon} d-block`}/>
    </button>}
</>;

/**
 * A StyledTabPicker component, used to render a list of selectable tabs, each with a title and optional counter (as to indicate how many options selecting that would provide).
 * This can work as either a radio button or a multi-select checkbox, depending on the functionality of onInputChange.
 *
 * @param {StyledTabPickerProps} props
 * @returns {JSX.Element}
 */
export const StyledTabPicker = (props: StyledTabPickerProps): JSX.Element => {
    const { checked, disabled, onInputChange, checkboxTitle, count, suffix, ...rest } = props;
    const id = checkboxTitle?.toString().replace(" ", "-");
    const type = props.type ?? "checkbox";

    if (type === "link") {
        return <Link {...rest} id={props.id ?? id} className={classNames("d-flex align-items-center py-2 w-100 tab-picker", rest.className, {"checked": checked})}
            to={rest.to as string}
        >
            <PickerContents checkboxTitle={checkboxTitle} count={count} suffix={suffix} disabled={disabled} />
        </Link>;
    }

    return <Label {...rest} id={props.id ?? id} tabIndex={-1} className={classNames("d-flex align-items-center py-2 my-1 w-100 tab-picker", rest.className, {"checked": checked})}>
        <Input type={type} checked={checked ?? false} onChange={onInputChange} readOnly={onInputChange === undefined} disabled={disabled} aria-labelledby={props.id ?? id} />
        <PickerContents checkboxTitle={checkboxTitle} count={count} suffix={suffix} disabled={disabled} />
    </Label>;
};
