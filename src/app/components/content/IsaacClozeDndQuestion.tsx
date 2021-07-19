import React, {RefObject, useContext, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {IsaacClozeDndQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";
import ReactDOM from 'react-dom';
import {ClozeDropRegionContext} from "../../../IsaacAppTypes";
import {Simulate} from "react-dom/test-utils";
import drop = Simulate.drop;
import uuid from "uuid";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";
import {Label} from "reactstrap";

function Item({item}: {item: ItemDTO}) {
    return <RS.Badge className="m-2 p-2">
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children}
        </IsaacContentValueOrChildren>
    </RS.Badge>;
}

interface InlineDropRegionProps {
    id: string; items: ItemDTO[]; contentHolder: RefObject<HTMLDivElement>; readonly?: boolean;
}
function InlineDropRegion({id, items, contentHolder, readonly}: InlineDropRegionProps) {
    const droppableTarget = contentHolder.current?.querySelector(`#${id}`);
    if (droppableTarget) {
        return ReactDOM.createPortal(
            <div className="mb-n1">
                <Droppable droppableId={id} isDropDisabled={readonly}>
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`d-flex justify-content-center rounded bg-grey w-100 ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                    >
                        {items.map((item, i) =>
                            <Draggable key={item.id} draggableId={item.id || `${i}`} index={i}>
                                {(provided, snapshot) =>
                                    <div
                                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <Item item={item}/>
                                    </div>
                                }
                            </Draggable>
                        )}
                        {items.length === 0 && "\u00A0"}
                        {provided.placeholder}
                    </div>}
                </Droppable>
            </div>,
            droppableTarget);
    }
    return null;
}

// Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;

export function useClozeDropRegionsInHtml(html: string): string {
    const componentUuid = useRef(uuid.v4().slice(0, 8)).current; // useRef so that it will remain consistent between renders
    const dropRegionContext = useContext(ClozeDropRegionContext);
    if (dropRegionContext) {
        html = html.replace(dropZoneRegex, (matchingString, params, width, height, offset) => {
            const dropId = `drop-region-${componentUuid}-${offset}`;
            dropRegionContext.register(dropId);
            return `<div id="${dropId}" class="d-inline-block" style="min-width: 100px"></div>`;
        });
    }
    return html;
}

export function IsaacClozeDndQuestion({doc, questionId, readonly}: {doc: IsaacClozeDndQuestionDTO; questionId: string; readonly?: boolean}) {
    const dispatch = useDispatch();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    const currentAttempt = questionPart?.currentAttempt as ItemChoiceDTO;
    const cssFriendlyQuestionPartId = questionPart?.id?.replace("|", "-") ?? ""; // Maybe we need to clean up IDs more?
    const questionContentRef = useRef<HTMLDivElement>(null);

    const itemsSection = `${cssFriendlyQuestionPartId}-items-section`;
    const [nonSelectedItems, setNonSelectedItems] = useState([...doc.items]);

    const [inlineDropRegions, setInlineDropRegions] = useState<{[dropId: string]: ItemDTO[]}>({});
    function registerInlineDropRegion(dropRegionId: string) {
        if (!Object.keys(inlineDropRegions).includes(dropRegionId)) {
            setInlineDropRegions({...inlineDropRegions, [dropRegionId]: []});
        }
    }

    function updateAttempt({source, destination, draggableId}: DropResult, provided: ResponderProvided) {
        console.log(nonSelectedItems)
        if (source.droppableId === destination?.droppableId && source.index === destination?.index) {
            return; // No change
        }

        if (destination) {
            if (source.droppableId === itemsSection && destination.droppableId === itemsSection) {
                const nsis = [...nonSelectedItems];
                [nsis[source.index], nsis[destination.index]] = [nsis[destination.index], nsis[source.index]];
                setNonSelectedItems(nsis);
            }
            if (destination.droppableId !== itemsSection) {
                setInlineDropRegions({...inlineDropRegions, [destination.droppableId]: nonSelectedItems.filter(i => i.id === draggableId)});
                setNonSelectedItems(nonSelectedItems.filter(i => i.id !== draggableId));
            }
        }

        // let currentItems = currentAttempt && currentAttempt.items || [];
        // let itemChoice: ItemChoiceDTO = {type: "itemChoice", items: currentItems};
        // dispatch(setCurrentAttempt(questionId, {}));
    }

    return <div ref={questionContentRef} className="question-content">
        <ClozeDropRegionContext.Provider value={{register: registerInlineDropRegion}}>
            <DragDropContext onDragEnd={updateAttempt}>
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>

                {/* Items section */}
                <Label htmlFor="non-selected-items" className="mt-3">Items: </Label>
                <Droppable droppableId={itemsSection} direction="horizontal" isDropDisabled={readonly}>
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps} id="non-selected-items"
                        className={`d-flex rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                    >
                        {nonSelectedItems.map((item, i) => <Draggable key={item.id} draggableId={item.id || `${i}`} index={i}>
                            {(provided, snapshot) =>
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <Item item={item} />
                                </div>
                            }
                        </Draggable>)}
                        {provided.placeholder}
                    </div>}
                </Droppable>

                {/* Inline droppables rendered for each registered drop region */}
                {inlineDropRegions && Object.keys(inlineDropRegions).map(dropRegionId =>
                    <InlineDropRegion
                        key={dropRegionId} contentHolder={questionContentRef} readonly={readonly}
                        id={dropRegionId} items={inlineDropRegions[dropRegionId] || []}
                    />
                )}
            </DragDropContext>
        </ClozeDropRegionContext.Provider>
    </div>;
}
