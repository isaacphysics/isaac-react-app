import React, { ComponentProps } from "react";
import { BoardOrder } from "../../../IsaacAppTypes";
import { siteSpecific } from "../../services";

function toggleSort(itemOrder: BoardOrder,
                    reverseOrder: BoardOrder,
                    boardOrder: BoardOrder,
                    setBoardOrder: (order: BoardOrder) => void) {
    if (boardOrder === itemOrder) {
        setBoardOrder(reverseOrder);
    } else {
        setBoardOrder(itemOrder);
    }
}

function sortClass(itemOrder: BoardOrder, reverseOrder: BoardOrder, boardOrder: BoardOrder) {
    if (boardOrder === itemOrder) {
        return " sorted forward";
    } else if (boardOrder === reverseOrder) {
        return " sorted reverse";
    } else {
        return "";
    }
}

export const sortItemHeader = (
    props: ComponentProps<"th"> & {title: string, itemOrder: BoardOrder, reverseOrder: BoardOrder},
    boardOrder: BoardOrder,
    setBoardOrder: (order: BoardOrder) => void) => {
    const {title, itemOrder, reverseOrder, ...rest} = props;
    const className = (props.className || siteSpecific("text-center align-middle", "")) + sortClass(itemOrder, reverseOrder, boardOrder);
    const sortArrows = <button className="sort" onClick={() => {toggleSort(itemOrder, reverseOrder, boardOrder, setBoardOrder);}}>
            <span className="up">▲</span>
            <span className="down">▼</span>
        </button>;

    return <th key={props.key} {...rest} className={className}>
        <div className="d-flex align-items-center">
            {title}
            {sortArrows}
        </div>
    </th>;
};

