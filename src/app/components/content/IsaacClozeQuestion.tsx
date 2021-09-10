import React, {RefObject, useContext, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {Label} from "reactstrap";
import {
    ClozeItemDTO,
    IsaacClozeQuestionDTO,
    ItemChoiceDTO,
    ItemDTO
} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";
import ReactDOM from 'react-dom';
import {ClozeDropRegionContext} from "../../../IsaacAppTypes";
import {setCurrentAttempt} from "../../state/actions";
import uuid from "uuid";
import {Item} from "../../services/select";

function Item({item}: {item: ItemDTO}) {
    return <RS.Badge className="m-2 p-2">
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children}
        </IsaacContentValueOrChildren>
    </RS.Badge>;
}

interface InlineDropRegionProps {
    id: string; item?: ClozeItemDTO; contentHolder: RefObject<HTMLDivElement>; readonly?: boolean;
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
                        style={{overflow: "hidden", minHeight: "inherit"}}
                    >
                        {item && <Draggable key={item.replacementId} draggableId={item.replacementId || ""} index={0}>
                            {(provided, snapshot) =>
                                <div
                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`${snapshot.isDragging ? "" : ""}`}
                                >
                                    <Item item={item}/>
                                </div>
                            }
                        </Draggable>}
                        {!item && "\u00A0"}
                        {provided.placeholder && <div style={{width: 0, visibility: "hidden"}}>
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

export function IsaacClozeQuestion({doc, questionId, readonly}: {doc: IsaacClozeQuestionDTO; questionId: string; readonly?: boolean}) {
    const dispatch = useDispatch();
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    const currentAttempt = questionPart?.currentAttempt as (ItemChoiceDTO | undefined);
    const cssFriendlyQuestionPartId = questionPart?.id?.replace("|", "-") ?? ""; // Maybe we should clean up IDs more?
    const questionContentRef = useRef<HTMLDivElement>(null);
    const withReplacement = doc.withReplacement ?? false;

    const itemsSection = `${cssFriendlyQuestionPartId}-items-section`;

    const [nonSelectedItems, setNonSelectedItems] = useState<ClozeItemDTO[]>(() => {
        let initNsis : ClozeItemDTO[];
        if (!withReplacement && currentAttempt?.items && doc.items) {
            // If replacement is disabled, items from the current attempt are filtered from the questions items
            initNsis = doc.items.filter(i => !currentAttempt.items?.map(si => si?.id).includes(i.id));
        } else {
            // If replacement is enabled, we still need all of the items in the nonSelectedItems list
            initNsis = [...doc.items];
        }
        // In both cases, the replacementId must be set
        return initNsis.map(x => ({...x, replacementId: x.id}));
    });

    const registeredDropRegionIDs = useRef<string[]>([]).current;
    const [inlineDropValues, setInlineDropValues] = useState<(ClozeItemDTO | undefined)[]>(() => currentAttempt?.items || []);

    useEffect(() => {
        if (currentAttempt?.items) {
            const idvs = currentAttempt.items as (ClozeItemDTO | undefined)[];
            setInlineDropValues(idvs.map(x => x === undefined ? x : ({...x, replacementId: `${x.id}-${uuid.v4()}`})));

            // If the question allows duplicates, then the items in the non-selected item section should never change
            //  (apart from on question load - this case is handled in the initial state of nonSelectedItems)
            if (!withReplacement) {
                setNonSelectedItems(doc.items?.filter(i => !currentAttempt.items?.map(si => si?.id).includes(i.id)).map(x => ({...x, replacementId: x.id})) || []);
            }
        }
        }, [currentAttempt]);

    function registerInlineDropRegion(dropRegionId: string, index: number) {
        if (!registeredDropRegionIDs.includes(dropRegionId)) {
            registeredDropRegionIDs.push(dropRegionId);
            setInlineDropValues(registeredDropRegionIDs.map(() => undefined));
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

        // The item that's being dragged (this is worked out below in each case)
        let item : ClozeItemDTO;
        // A callback to put an item back into the source of the drag (if needed)
        let replaceSource : (itemToReplace: ClozeItemDTO | undefined) => void = () => undefined;
        // Whether the inline drop zones were updated or not
        let update = false;

        // Check source of drag:
        if (source.droppableId === itemsSection) {
            // Drag was from items section
            item = nonSelectedItems[source.index];
            if (!withReplacement || destination.droppableId === itemsSection) {
                nsis.splice(source.index, 1);
                replaceSource = (itemToReplace) => itemToReplace && nsis.splice(source.index, 0, itemToReplace);
            }
        } else {
            // Drag was from inline drop section
            // When splicing inline drop values, you always need to delete and replace
            const sourceDropIndex = inlineDropIndex(source.droppableId);
            if (sourceDropIndex !== -1) {
                const maybeItem = idvs[sourceDropIndex]; // This nastiness is to appease typescript
                if (maybeItem) {
                    item = maybeItem;
                    idvs.splice(sourceDropIndex, 1, undefined);
                    replaceSource = (itemToReplace) => idvs.splice(sourceDropIndex, 1, itemToReplace);
                    update = true;
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        // Check destination of drag:
        if (destination.droppableId === itemsSection) {
            // Drop is into items section
            if (!withReplacement || source.droppableId === itemsSection) {
                nsis.splice(destination.index, 0, item);
            } else {
                nsis.splice(nsis.findIndex((x) => x.id === item.id), 1);
                nsis.splice(destination.index, 0, item);
            }
        } else {
            // Drop is into inline drop section
            const destinationDropIndex = inlineDropIndex(destination.droppableId);
            if (destinationDropIndex !== -1) {
                replaceSource(idvs[destinationDropIndex]);
                idvs.splice(destinationDropIndex, 1, withReplacement ? {...item, replacementId: item.id + uuid.v4()} : item);
            } else {
                replaceSource(item);
            }
            update = true;
        }

        // Update draggable lists every time a successful drag ends
        setInlineDropValues(idvs);
        setNonSelectedItems(nsis);

        if (update) {
            // Update attempt since an inline drop zone changed
            const itemChoice: ItemChoiceDTO = {
                type: "itemChoice",
                items: idvs.map(x => {
                    if (x) {
                        const {replacementId, ...itemDto} = x;
                        return itemDto as ItemDTO;
                    }
                    // Really, items should be a list of type (ItemDTO | undefined), but this is a workaround
                    return x as unknown as ItemDTO;
                })
            };
            dispatch(setCurrentAttempt(questionId, itemChoice));
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
                        {nonSelectedItems.map((item, i) => <Draggable key={item.replacementId} draggableId={item.replacementId || `${i}`} index={i}>
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
