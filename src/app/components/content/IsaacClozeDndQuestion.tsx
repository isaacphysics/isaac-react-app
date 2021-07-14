import React, {useState} from "react";
import * as RS from "reactstrap";
import {IsaacClozeDndQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {useDispatch, useSelector, useStore} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";

export function IsaacClozeDndQuestion({doc, questionId, readonly}: {doc: IsaacClozeDndQuestionDTO; questionId: string; readonly?: boolean}) {
    const dispatch = useDispatch();
    const store = useStore();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    const currentAttempt = questionPart?.currentAttempt as ItemChoiceDTO;

    const itemsAreaId = `${questionPart?.id as string}-items-area`;
    const dropLocationBaseId = `${questionPart?.id as string}-drop-location-`

    const [nonSelectedItems, setNonSelectedItems] = useState([...doc.items]);
    const [dropState, setDropState] = useState<{[dropId: string]: ItemDTO[]}>({[dropLocationBaseId + "1"]: []});

    function updateAttempt({source, destination, draggableId}: DropResult, provided: ResponderProvided) {
        console.log(nonSelectedItems)
        if (source.droppableId === destination?.droppableId && source.index === destination?.index) {
            return; // No change
        }

        if (destination) {
            if (source.droppableId === itemsAreaId && destination.droppableId === itemsAreaId) {
                const nsis = [...nonSelectedItems];
                [nsis[source.index], nsis[destination.index]] = [nsis[destination.index], nsis[source.index]];
                setNonSelectedItems(nsis);
            }
            if (destination.droppableId !== itemsAreaId) {
                setDropState({...dropState, [destination.droppableId]: nonSelectedItems.filter(i => i.id === draggableId)});
                setNonSelectedItems(nonSelectedItems.filter(i => i.id !== draggableId));
            }
        }

        // let currentItems = currentAttempt && currentAttempt.items || [];
        // let itemChoice: ItemChoiceDTO = {type: "itemChoice", items: currentItems};
        // dispatch(setCurrentAttempt(questionId, {}));
    }
    return <DragDropContext onDragEnd={updateAttempt}>
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>

            <Droppable droppableId={dropLocationBaseId + "1"}>
                {(provided, snapshot) => <div
                    ref={provided.innerRef} {...provided.droppableProps}
                    className={`d-flex rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                >
                    {(dropState[dropLocationBaseId + "1"] || []).map((item, i) =>
                        <Draggable key={item.id} draggableId={item.id as string} index={i}>
                            {(provided, snapshot) =>
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <RS.Badge className="m-2 p-2">{item.value}</RS.Badge>
                                </div>
                            }
                        </Draggable>
                    )}
                    {provided.placeholder}
                </div>}
            </Droppable>
        </div>
        <Droppable droppableId={itemsAreaId} direction="horizontal">
            {(provided, snapshot) => <div
                ref={provided.innerRef} {...provided.droppableProps}
                className={`d-flex rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
            >
                {nonSelectedItems.map((item, i) => <Draggable key={item.id} draggableId={item.id as string} index={i}>
                    {(provided, snapshot) =>
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <RS.Badge className="m-2 p-2">{item.value}</RS.Badge>
                        </div>
                    }
                </Draggable>)}
                {provided.placeholder}
            </div>}
        </Droppable>
    </DragDropContext>;
}
