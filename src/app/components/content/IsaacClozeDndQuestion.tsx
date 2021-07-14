import React, {RefObject, useRef, useState} from "react";
import * as RS from "reactstrap";
import {IsaacClozeDndQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";
import ReactDOM from 'react-dom';

function InlineDroppable({id, items, contentHolder}: {id: string, items: ItemDTO[], contentHolder: RefObject<HTMLDivElement>}) {
    const droppableTarget = contentHolder.current?.querySelector(`#${id}`);
    if (droppableTarget) {
        return ReactDOM.createPortal(
            <Droppable droppableId={id}>
                {(provided, snapshot) => <div
                    ref={provided.innerRef} {...provided.droppableProps}
                    className={`d-flex rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                >
                    {items.map((item, i) =>
                        <Draggable key={item.id} draggableId={item.id || `${i}`} index={i}>
                            {(provided, snapshot) =>
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <RS.Badge className="m-2 p-2">
                                        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
                                            {item.children}
                                        </IsaacContentValueOrChildren>
                                    </RS.Badge>
                                </div>
                            }
                        </Draggable>
                    )}
                    {provided.placeholder}
                </div>}
            </Droppable>
        , droppableTarget);
    }
    return null;
}

export function IsaacClozeDndQuestion({doc, questionId, readonly}: {doc: IsaacClozeDndQuestionDTO; questionId: string; readonly?: boolean}) {
    const dispatch = useDispatch();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    const currentAttempt = questionPart?.currentAttempt as ItemChoiceDTO;
    const cssFriendlyQuestionPartId = questionPart?.id?.replace("|", "-") ?? ""; // Maybe we need to clean up IDs more?

    const questionContentRef = useRef<HTMLDivElement>(null);

    const itemsAreaId = `${cssFriendlyQuestionPartId}-items-area`;
    const dropLocationBaseId = `${cssFriendlyQuestionPartId}-drop-location-`

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
        <div ref={questionContentRef} className="question-content">
            {/* Prove that it is possible to find an element even if it has been set as inner html */}
            <div dangerouslySetInnerHTML={{__html: `<div id="${dropLocationBaseId + "1"}" />`}} />

            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>

            {/* An inline droppable (or probably a list of them) will still need to get rendered in the react tree somewhere */}
            <InlineDroppable id={dropLocationBaseId + "1"} items={dropState[dropLocationBaseId + "1"] || []} contentHolder={questionContentRef} />

            {/* Items section */}
            <Droppable droppableId={itemsAreaId} direction="horizontal">
                {(provided, snapshot) => <div
                    ref={provided.innerRef} {...provided.droppableProps}
                    className={`d-flex rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                >
                    {nonSelectedItems.map((item, i) => <Draggable key={item.id} draggableId={item.id || `${i}`} index={i}>
                        {(provided, snapshot) =>
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <RS.Badge className="m-2 p-2">
                                    <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
                                        {item.children}
                                    </IsaacContentValueOrChildren>
                                </RS.Badge>
                            </div>
                        }
                    </Draggable>)}
                    {provided.placeholder}
                </div>}
            </Droppable>
        </div>
    </DragDropContext>;
}
