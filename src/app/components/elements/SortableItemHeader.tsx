import React, { ComponentProps, ReactNode } from "react";
import { BoardOrder } from "../../../IsaacAppTypes";
import { siteSpecific, SortOrder } from "../../services";

function toggleSort<T extends BoardOrder | SortOrder>(
        defaultOrder: T,
        reverseOrder: T,
        currentOrder: T,
        setBoardOrder: (order: T) => void) {
    console.log("Toggled!", currentOrder, defaultOrder, reverseOrder);
    if (currentOrder === defaultOrder) {
        setBoardOrder(reverseOrder);
    } else {
        setBoardOrder(defaultOrder);
    }
}

function sortClass<T extends BoardOrder | SortOrder>(defaultOrder: T, reverseOrder: T, currentOrder: T) {
    if (currentOrder === defaultOrder) {
        return " sorted forward";
    } else if (currentOrder === reverseOrder) {
        return " sorted reverse";
    } else {
        return "";
    }
}

export interface SortItemHeaderProps<T extends BoardOrder | SortOrder> extends ComponentProps<"th"> {
    children: ReactNode,
    defaultOrder: T,
    reverseOrder: T,
    currentOrder: T,
    setBoardOrder: (order: T) => void
}

export const SortItemHeader = <T extends BoardOrder | SortOrder>(props: SortItemHeaderProps<T>) => {
    const {defaultOrder, reverseOrder, currentOrder, setBoardOrder, ...rest} = props;

    const className = (props.className || siteSpecific("text-center align-middle", "")) + sortClass(defaultOrder, reverseOrder, currentOrder);
    const sortArrows = <button
        className="sort"
        onClick={() => {toggleSort(defaultOrder, reverseOrder, currentOrder, setBoardOrder);}}
    >
        <span className="up">▲</span>
        <span className="down">▼</span>
    </button>;

    return <th key={props.key} {...rest} className={className}>
        <div className="d-flex align-items-center">
            {props.children}
            {sortArrows}
        </div>
    </th>;
};

