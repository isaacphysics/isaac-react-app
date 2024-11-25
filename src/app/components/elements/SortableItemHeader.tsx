import React, { ComponentProps } from "react";
import { isDefined, siteSpecific } from "../../services";
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
    clickToSelect?: () => void,
    hideIcons?: boolean,
    reversed?: boolean,
    alignment?: "start" | "center" | "end",
}

export const SortItemHeader = <T,>(props: SortItemHeaderProps<NonUndefined<T>>) => {
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

    const justify = props.alignment ? "justify-content-" + props.alignment : siteSpecific("justify-content-center", "justify-content-start");

    const sortArrows = <button
        className="sort"
        onClick={() => {toggleSort(defaultOrder, reverseOrder, currentOrder, setOrder);}}
    >
        <span className="up">▲</span>
        <span className="down">▼</span>
    </button>;

    return <th {...rest}
        className={classNames(props.className, "user-select-none", sortClass(defaultOrder, reverseOrder, currentOrder, reversed))}
        onClick={clickToSelect ?? (() => toggleSort(defaultOrder, reverseOrder, currentOrder, setOrder))}
    >
        <div className={`d-flex ${justify} align-items-center`}>
            {props.children}
            {justify === "justify-content-start" && <Spacer/>}
            {!hideIcons && sortArrows}
        </div>
    </th>;
};

