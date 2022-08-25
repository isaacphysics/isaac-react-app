import React, {useState} from "react";
import {SortOrder} from "../../services";

interface SortableTableHeaderProps {
    className: string;
    title: string;
    updateState: (order: string) => void;
    enabled: boolean;
}

export const SortableTableHeader = ({className, title, updateState, enabled}: SortableTableHeaderProps) => {
    const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
    const sortOrders = [SortOrder.NONE, SortOrder.ASC, SortOrder.DESC];

    return enabled ? <th
        className={className + " pointer-cursor"}
        onClick={(e: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => {
            const newIndex = (currentOrderIndex + 1) % sortOrders.length;
            setCurrentOrderIndex(newIndex);
            updateState(sortOrders[newIndex]);
        }}
    >
        {title}
        <div className="float-right">
            {sortOrders[currentOrderIndex] == SortOrder.ASC && "⇑"}
            {sortOrders[currentOrderIndex] == SortOrder.DESC && "⇓"}
            {sortOrders[currentOrderIndex] == SortOrder.NONE && "⇕"}
        </div>
    </th> : <th className={className}>{title}</th>;
}
