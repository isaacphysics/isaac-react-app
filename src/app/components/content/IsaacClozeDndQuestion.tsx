import React, {RefObject, useContext, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {Label} from "reactstrap";
import {IsaacClozeDndQuestionDTO, ItemDTO, ParsonsChoiceDTO} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";
import ReactDOM from 'react-dom';
import {ClozeDropRegionContext} from "../../../IsaacAppTypes";
import {setCurrentAttempt} from "../../state/actions";

function Item({item}: {item: ItemDTO}) {
    return <RS.Badge className="m-2 p-2">
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children}
        </IsaacContentValueOrChildren>
    </RS.Badge>;
}

interface InlineDropRegionProps {
    id: string; item?: ItemDTO; contentHolder: RefObject<HTMLDivElement>; readonly?: boolean;
}
function InlineDropRegion({id, item, contentHolder, readonly}: InlineDropRegionProps) {
    const droppableTarget = contentHolder.current?.querySelector(`#${id}`);
    if (droppableTarget) {
        return ReactDOM.createPortal(
            <div style={{minHeight: "inherit"}}>
                <Droppable droppableId={id} isDropDisabled={readonly} direction="vertical" >
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`d-flex justify-content-center align-items-center bg-grey ${snapshot.draggingFromThisWith ? "" : ""} rounded w-100 ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                        style={{minHeight: "inherit"}}
                    >
                        {item && <Draggable key={item.id} draggableId={item.id || ""} index={0}>
                            {(provided, snapshot) =>
                                <div
                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`${snapshot.isDragging ? "" : ""}`}
                                >
                                    <Item item={item}/>
                                </div>
                            }
                        </Draggable>}
                        {!item && "Empty\u00A0"}
                        {provided.placeholder && <div style={{width: 0}} >
                            {provided.placeholder}
                        </div>}
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
    const dropRegionContext = useContext(ClozeDropRegionContext);
    if (dropRegionContext && dropRegionContext.questionPartId) {
        let index = 0;
        html = html.replace(dropZoneRegex, (matchingString, params, widthMatch, heightMatch, offset) => {
            const dropId = `drop-region-${dropRegionContext.questionPartId}-${offset}`;
            dropRegionContext.register(dropId, index++); // also increments index
            const minWidth = widthMatch ? widthMatch.slice("w-".length) + "px" : "100px";
            const minHeight = heightMatch ? heightMatch.slice("h-".length) + "px" : "auto";
            return `<div id="${dropId}" class="d-inline-block" style="min-width: ${minWidth}; min-height: ${minHeight}"></div>`;
        });
    }
    return html;
}

export function IsaacClozeDndQuestion({doc, questionId, readonly}: {doc: IsaacClozeDndQuestionDTO; questionId: string; readonly?: boolean}) {
    const dispatch = useDispatch();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    const currentAttempt = questionPart?.currentAttempt as ParsonsChoiceDTO;
    const cssFriendlyQuestionPartId = questionPart?.id?.replace("|", "-") ?? ""; // Maybe we should clean up IDs more?
    const questionContentRef = useRef<HTMLDivElement>(null);

    const itemsSection = `${cssFriendlyQuestionPartId}-items-section`;

    const [nonSelectedItems, setNonSelectedItems] = useState([...doc.items]);

    const registeredDropRegionIDs = useRef<string[]>([]).current;
    const [inlineDropValues, setInlineDropValues] = useState<(ItemDTO | undefined)[]>(currentAttempt?.items || []);

    useEffect(() => {
        if (currentAttempt?.items) {
            setInlineDropValues(currentAttempt.items);
            setNonSelectedItems(doc.items?.filter(i => !currentAttempt.items?.map(si => si?.id).includes(i.id)) || []);
        }
        }, [currentAttempt]);

    function registerInlineDropRegion(dropRegionId: string, index: number) {
        if (!registeredDropRegionIDs.includes(dropRegionId)) {
            registeredDropRegionIDs.push(dropRegionId);
            setInlineDropValues(registeredDropRegionIDs.map(s => undefined));
        }
    }

    // Run after a drag action ends
    function updateAttempt({source, destination, draggableId}: DropResult, provided: ResponderProvided) {
        if (source.droppableId === destination?.droppableId && source.index === destination?.index) {
            return; // No change
        }

        if (!destination) {
            return; // Drag had no destination
        }

        const inlineDropIndex = (id : string) => registeredDropRegionIDs.indexOf(id)

        const nsis = [...nonSelectedItems];
        const idvs = [...inlineDropValues];

        let item : ItemDTO;
        let replaceSource : (itemToReplace: ItemDTO | undefined) => void; // a callback to put an item back into the source of the drag
        let update = false;

        if (source.droppableId === itemsSection) {
            // Drag was from items section
            item = nonSelectedItems[source.index];
            nsis.splice(source.index, 1);
            replaceSource = (itemToReplace) => itemToReplace && nsis.splice(source.index, 0, itemToReplace);
        } else {
            // Drag was from inline drop section
            // When splicing inline drop values, you always need to delete and replace
            const sourceDropIndex = inlineDropIndex(source.droppableId);
            if (sourceDropIndex !== -1) {
                item = doc.items?.filter(i => i.id === draggableId)[0] as ItemDTO;
                idvs.splice(sourceDropIndex, 1, undefined);
                replaceSource = (itemToReplace) => idvs.splice(sourceDropIndex, 1, itemToReplace);
            } else {
                return;
            }
            update = true;
        }

        if (destination.droppableId === itemsSection) {
            // Drop is into items section
            nsis.splice(destination.index, 0, item);
        } else {
            // Drop is into inline drop section
            const destinationDropIndex = inlineDropIndex(destination.droppableId);
            if (destinationDropIndex !== -1) {
                replaceSource(idvs[destinationDropIndex]);
                idvs.splice(destinationDropIndex, 1, doc.items?.filter(i => i.id === draggableId)[0] as ItemDTO);
            } else {
                replaceSource(item);
            }
            update = true;
        }

        setInlineDropValues(idvs);
        setNonSelectedItems(nsis);

        if (update) {
            // Update attempt since an inline drop zone changed
            const parsonsChoice: ParsonsChoiceDTO = {type: "parsonsChoice", items: idvs as ItemDTO[]};
            dispatch(setCurrentAttempt(questionId, parsonsChoice));
        }
    }

    return <div ref={questionContentRef} className="question-content">
        <ClozeDropRegionContext.Provider value={{questionPartId: cssFriendlyQuestionPartId, register: registerInlineDropRegion}}>
            <DragDropContext onDragEnd={updateAttempt}>
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>

                {/* Items section */}
                <Label htmlFor="non-selected-items" className="mt-3">Items: </Label>
                <Droppable droppableId={itemsSection} direction="horizontal" isDropDisabled={readonly}>
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps} id="non-selected-items"
                        className={`d-flex overflow-auto rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                    >
                        {nonSelectedItems.map((item, i) => <Draggable key={item.id} draggableId={item.id || `${i}`} index={i}>
                            {(provided) =>
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <Item item={item} />
                                </div>
                            }
                        </Draggable>)}
                        {nonSelectedItems.length === 0 && "\u00A0"}
                        {provided.placeholder}
                    </div>}
                </Droppable>

                {/* Inline droppables rendered for each registered drop region */}
                {registeredDropRegionIDs.map((dropRegionId, index) =>
                    <InlineDropRegion
                        key={dropRegionId} contentHolder={questionContentRef} readonly={readonly}
                        id={dropRegionId} item={inlineDropValues[index]}
                    />
                )}
            </DragDropContext>
        </ClozeDropRegionContext.Provider>
    </div>;
}
