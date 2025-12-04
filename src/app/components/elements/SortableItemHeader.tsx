import React, { ComponentProps } from "react";
import { isDefined } from "../../services";
import { Spacer } from "./Spacer";
import { NonUndefined } from "@reduxjs/toolkit/dist/query/tsHelpers";
import classNames from "classnames";

function toggleSort<T>(
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

function sortClass<T>(
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

export interface SortItemHeaderProps<T> extends ComponentProps<"th"> {
    defaultOrder: T,
    reverseOrder: T,
    currentOrder: T,
    setOrder: (order: T) => void,
    onClick?: () => void,
    hideIcons?: boolean,
    reversed?: boolean,
    alignment?: "start" | "center" | "end",
    label?: string,
}

export const SortItemHeader = <T,>(props: SortItemHeaderProps<NonUndefined<T>>) => {
    const {
        defaultOrder,
        reverseOrder,
        currentOrder,
        setOrder,
        onClick,
        hideIcons,
        reversed,
        alignment,
        label,
        ...rest
    } = props;

    const justify = alignment ? "justify-content-" + alignment : "justify-content-center";

    const sortArrow = <button
        className="sort"
        aria-label={label}
        onClick={() => {toggleSort(defaultOrder, reverseOrder, currentOrder, setOrder);}}
    >
        <span className="arrow">▲</span>
    </button>;

    return <th {...rest}
        className={classNames(props.className, "user-select-none sortable-item-header", sortClass(defaultOrder, reverseOrder, currentOrder, reversed))}
        onClick={() => {
            toggleSort(defaultOrder, reverseOrder, currentOrder, setOrder);
            onClick?.();
        }}
    >
        <div className={`d-flex ${justify} align-items-center`}>
            {props.children}
            {!hideIcons && sortArrow}
            {justify === "justify-content-start" && <Spacer/>}
        </div>
    </th>;
};

