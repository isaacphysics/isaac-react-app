import React, { ComponentProps, ReactNode } from "react";
import { BoardOrder } from "../../../IsaacAppTypes";
import { siteSpecific, SortOrder } from "../../services";

function toggleSort<T extends BoardOrder | SortOrder>(
        itemOrder: T,
        reverseOrder: T,
        boardOrder: T,
        setBoardOrder: (order: T) => void) {
    console.log("Toggled!", boardOrder, itemOrder, reverseOrder);
    if (boardOrder === itemOrder) {
        setBoardOrder(reverseOrder);
    } else {
        setBoardOrder(itemOrder);
    }
}

function sortClass<T extends BoardOrder | SortOrder>(itemOrder: T, reverseOrder: T, boardOrder: T) {
    if (boardOrder === itemOrder) {
        return " sorted forward";
    } else if (boardOrder === reverseOrder) {
        return " sorted reverse";
    } else {
        return "";
    }
}

export interface SortItemHeaderProps<T extends BoardOrder | SortOrder> extends ComponentProps<"th"> {
    children: ReactNode,
    itemOrder: T,
    reverseOrder: T,
    boardOrder: T,
    setBoardOrder: (order: T) => void
}

export const SortItemHeader = <T extends BoardOrder | SortOrder>(props: SortItemHeaderProps<T>) => {
    const {itemOrder, reverseOrder, boardOrder, setBoardOrder, ...rest} = props;

    const className = (props.className || siteSpecific("text-center align-middle", "")) + sortClass(itemOrder, reverseOrder, boardOrder);
    const sortArrows = <button
        className="sort"
        onClick={() => {toggleSort(itemOrder, reverseOrder, boardOrder, setBoardOrder);}}
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

