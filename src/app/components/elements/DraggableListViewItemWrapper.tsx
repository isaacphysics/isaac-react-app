import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import classNames from "classnames";
import { isAda } from "../../services";

interface DraggableListViewWrapperProps extends React.HTMLAttributes<HTMLLIElement> {
    id: string;
    index: number;
}

const DraggableListViewWrapper = ({ id, index, className, children, ...rest }: DraggableListViewWrapperProps) => {
    return <Draggable key={id} draggableId={id ?? ""} index={index ?? -1}>
        {(providedDrag) => {
            return <li 
                {...rest}
                ref={providedDrag.innerRef}
                className={classNames("d-flex draggable-list-view-accessible", className, {"list-group-item align-items-center": isAda})}
                {...providedDrag.draggableProps} {...providedDrag.dragHandleProps}
            >
                {children}
            </li>;
        }}
    </Draggable>;
};

export default DraggableListViewWrapper;
