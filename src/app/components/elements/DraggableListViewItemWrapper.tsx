import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import classNames from "classnames";

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
                className={classNames("d-flex", className)}
                {...providedDrag.draggableProps} {...providedDrag.dragHandleProps}
            >
                {children}
            </li>;
        }}
    </Draggable>;
};

export default DraggableListViewWrapper;
