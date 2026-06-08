import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

interface DraggableListViewContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    reorder: (result: DropResult<string>) => void;
}

const DraggableListViewContainer = ({ children, reorder, ...rest }: DraggableListViewContainerProps) => {
    return <DragDropContext onDragEnd={reorder}>
        <Droppable droppableId="droppable">
            {(providedDrop) => {
                return <div ref={providedDrop.innerRef} {...rest}>
                    {children}
                    {providedDrop.placeholder}
                </div>;
            }}
        </Droppable>
    </DragDropContext>;
};

export default DraggableListViewContainer;
