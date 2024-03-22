import React, { ComponentProps } from "react";
import { BoardOrder } from "../../../IsaacAppTypes";
import { isDefined, siteSpecific, SortOrder } from "../../services";

export type ProgressSortOrder = number | "name" | "totalQuestionPartPercentage" | "totalQuestionPercentage";
type Order = BoardOrder | SortOrder | ProgressSortOrder;

function toggleSort<T extends Order>(
        defaultOrder: T,
        reverseOrder: T,
        currentOrder: T,
        setOrder: (order: T) => void) {
    if (currentOrder === defaultOrder) {
        setOrder(reverseOrder);
    } else {
        setOrder(defaultOrder);
    }
}

function sortClass<T extends Order>(
    defaultOrder: T,
    reverseOrder: T,
    currentOrder: T,
    reversed: boolean | undefined
) {
    if (currentOrder === defaultOrder) {
        return isDefined(reversed) ?
            " sorted " + (reversed ? "reverse" : "forward") :
            " sorted forward";
    } else if (currentOrder === reverseOrder) {
        return " sorted reverse";
    } else {
        return "";
    }
}

export interface SortItemHeaderProps<T extends Order> extends ComponentProps<"th"> {
    defaultOrder: T,
    reverseOrder: T,
    currentOrder: T,
    setOrder: (order: T) => void,
    clickToSelect?: () => void,
    hideIcons?: boolean,
    reversed?: boolean
}

export const SortItemHeader = <T extends Order>(props: SortItemHeaderProps<T>) => {
    const {
        defaultOrder,
        reverseOrder,
        currentOrder,
        setOrder,
        clickToSelect,
        hideIcons,
        reversed,
        ...rest
    } = props;

    const className = (props.className || siteSpecific("text-center align-middle", "")) + sortClass(defaultOrder, reverseOrder, currentOrder, reversed);
    const sortArrows = <button
        className="sort"
        onClick={() => {toggleSort(defaultOrder, reverseOrder, currentOrder, setOrder);}}
    >
        <span className="up">▲</span>
        <span className="down">▼</span>
    </button>;

    return <th key={props.key} {...rest} className={className} onClick={clickToSelect}>
        <div className="d-flex align-items-center">
            {props.children}
            {!hideIcons && sortArrows}
        </div>
    </th>;
};

