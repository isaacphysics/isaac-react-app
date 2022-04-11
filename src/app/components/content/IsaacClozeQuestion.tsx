import React, {RefObject, useContext, useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {Label} from "reactstrap";
import {
    IsaacClozeQuestionDTO,
    ItemChoiceDTO,
    ItemDTO
} from "../../../IsaacApiTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {selectQuestionPart} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {
    DragDropContext,
    Draggable,
    DragStart,
    DragUpdate,
    Droppable,
    DropResult,
    ResponderProvided
} from "react-beautiful-dnd";
import ReactDOM from 'react-dom';
import {ClozeDropRegionContext, ClozeItemDTO} from "../../../IsaacAppTypes";
import {setCurrentAttempt} from "../../state/actions";
import {v4 as uuid_v4} from "uuid";
import {Item} from "../../services/select";

function Item({item}: {item: ItemDTO}) {
    return <RS.Badge className="m-2 p-2">
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children}
        </IsaacContentValueOrChildren>
    </RS.Badge>;
}

interface InlineDropRegionProps {
    id: string; item?: ClozeItemDTO; contentHolder: RefObject<HTMLDivElement>; readonly?: boolean; updateAttempt: (dropResult : DropResult) => void; showBorder: boolean;
}
function InlineDropRegion({id, item, contentHolder, readonly, updateAttempt, showBorder}: InlineDropRegionProps) {

    function clearInlineDropZone() {
        updateAttempt({source: {droppableId: id, index: 0}, draggableId: (item?.replacementId as string)} as DropResult);
    }

    const droppableTarget = contentHolder.current?.querySelector(`#${id}`);
    if (droppableTarget) {
        return ReactDOM.createPortal(
            <div style={{minHeight: "inherit", position: "relative", margin: "2px"}}>
                <Droppable droppableId={id} isDropDisabled={readonly} direction="vertical" >
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`d-flex justify-content-center align-items-center bg-grey rounded w-100 overflow-hidden ${showBorder && "border border-dark"}`}
                        style={{minHeight: "inherit"}}
                    >
                        {item && <Draggable key={item.replacementId} draggableId={item?.replacementId as string} index={0} isDragDisabled={true}>
                            {(provided, snapshot) =>
                                <div
                                    className={"cloze-draggable mr-4"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                >
                                    <Item item={item}/>
                                </div>
                            }
                        </Draggable>}
                        {!item && "\u00A0"}
                    </div>}
                </Droppable>
                {item && <button aria-label={"Clear drop zone"} className={"cloze-inline-clear"} onClick={clearInlineDropZone}>
                    <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"
                         className="cloze-clear-cross">
                        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"/>
                    </svg>
                </button>}
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
    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?
    const questionContentRef = useRef<HTMLDivElement>(null);
    const withReplacement = doc.withReplacement ?? false;

    const itemsSection = `${cssFriendlyQuestionPartId}-items-section`;

    const [nonSelectedItems, setNonSelectedItems] = useState<ClozeItemDTO[]>(doc.items ? [...doc.items].map(x => ({...x, replacementId: x.id})) : []);

    const registeredDropRegionIDs = useRef<string[]>([]).current;
    const [inlineDropValues, setInlineDropValues] = useState<(ClozeItemDTO | undefined)[]>(() => currentAttempt?.items || []);

    const [borderMap, setBorderMap] = useState<{[dropId: string]: boolean}>({});

    useEffect(() => {
        if (currentAttempt?.items) {
            const idvs = currentAttempt.items as (ClozeItemDTO | undefined)[];
            setInlineDropValues(registeredDropRegionIDs.map((_, i) => idvs[i] ? {...idvs[i], replacementId: `${idvs[i]?.id}-${uuid_v4()}`} : undefined));

            // If the question allows duplicates, then the items in the non-selected item section should never change
            //  (apart from on question load - this case is handled in the initial state of nonSelectedItems)
            if (!withReplacement) {
                setNonSelectedItems(nonSelectedItems.filter(i => !currentAttempt.items?.map(si => si?.id).includes(i.id)).map(x => ({...x, replacementId: x.id})) || []);
            }
        }
        }, [currentAttempt]);

    function registerInlineDropRegion(dropRegionId: string) {
        if (!registeredDropRegionIDs.includes(dropRegionId)) {
            registeredDropRegionIDs.push(dropRegionId);
            setInlineDropValues(registeredDropRegionIDs.map(() => undefined));
            setBorderMap(registeredDropRegionIDs.reduce((dict: {[dropId: string]: boolean}, id) => Object.assign(dict, {[id]: false}), {}));
        }
    }

    function fixInlineZoneOnStartDrag({source}: DragStart, provided: ResponderProvided) {
        fixInlineZones({destination: source} as DragUpdate, provided);
    }

    // This is run on drag update to highlight the droppable that the user is dragging over
    //  this gives more control over when a droppable is highlighted
    function fixInlineZones({destination}: DragUpdate, provided: ResponderProvided) {
        registeredDropRegionIDs.map((dropId, i) => {
            const destinationDropIndex = destination ? registeredDropRegionIDs.indexOf(dropId) : -1;
            const destinationDragIndex = destination?.index ?? -1;

            borderMap[dropId] = (dropId === destination?.droppableId && destinationDropIndex !== -1 && destinationDragIndex === 0);
        });
        // Tell React about the changes to borderMap
        setBorderMap({...borderMap});
    }

    // Run after a drag action ends
    function updateAttempt({source, destination, draggableId}: DropResult, provided: ResponderProvided) {

        // Make sure borders are removed, since drag has ended
        fixInlineZones({destination: undefined} as DragUpdate, provided);

        if (source.droppableId === destination?.droppableId && source.index === destination?.index) return; // No change

        if (!destination) return; // Drag had no destination

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
            if (destinationDropIndex !== -1 && destination.index === 0) {
                replaceSource(idvs[destinationDropIndex]);
                idvs.splice(destinationDropIndex, 1, withReplacement ? {...item, replacementId: item.id + uuid_v4()} : item);
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

    return <div ref={questionContentRef} className="question-content cloze-question">
        <ClozeDropRegionContext.Provider value={{questionPartId: cssFriendlyQuestionPartId, register: registerInlineDropRegion}}>
            <DragDropContext onDragStart={fixInlineZoneOnStartDrag} onDragEnd={updateAttempt} onDragUpdate={fixInlineZones}>
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
                        {nonSelectedItems.map((item, i) => <Draggable key={item.replacementId} isDragDisabled={readonly} draggableId={item.replacementId || `${i}`} index={i}>
                            {(provided) =>
                                <div className={"cloze-draggable"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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
                        id={dropRegionId} item={inlineDropValues[index]} updateAttempt={(dropResult) => {
                            updateAttempt({...dropResult, destination: {droppableId: itemsSection, index: nonSelectedItems.length}},{announce: (_) => {return;}});
                        }}
                        showBorder={borderMap[dropRegionId]}
                    />
                )}
            </DragDropContext>
        </ClozeDropRegionContext.Provider>
    </div>;
}
