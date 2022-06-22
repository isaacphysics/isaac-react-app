import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Label} from "reactstrap";
import {IsaacClozeQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {
    DragDropContext,
    Draggable,
    DragStart,
    DragUpdate,
    Droppable,
    DropResult,
    ResponderProvided,
    useMouseSensor,
    useTouchSensor
} from "react-beautiful-dnd";
import {ClozeDropRegionContext, ClozeItemDTO, IsaacQuestionProps} from "../../../IsaacAppTypes";
import {v4 as uuid_v4} from "uuid";
import {Item} from "../elements/markup/portals/InlineDropZones";
import {buildUseKeyboardSensor} from "../../services/clozeQuestionKeyboardSensor";

const IsaacClozeQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacClozeQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);

    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?
    const withReplacement = doc.withReplacement ?? false;

    const itemsSectionId = "Non-selected-items";

    const [nonSelectedItems, setNonSelectedItems] = useState<ClozeItemDTO[]>(doc.items ? [...doc.items].map(x => ({...x, replacementId: x.id})) : []);

    const registeredDropRegionIDs = useRef<Map<string, number>>(new Map()).current;

    const [borderMap, setBorderMap] = useState<{[dropId: string]: boolean}>({});

    const [inlineDropValues, setInlineDropValues] = useState<(ClozeItemDTO | undefined)[]>(() => currentAttempt?.items || []);
    // Whenever the inlineDropValues change or a drop region is added, computes a map from drop region id -> drop region value
    const inlineDropValueMap = useMemo(() => Array.from(registeredDropRegionIDs.entries()).reduce((dict, [dropId, i]) => Object.assign(dict, {[dropId]: inlineDropValues[i]}), {}), [inlineDropValues]);

    useEffect(() => {
        if (currentAttempt?.items) {
            setInlineDropValues(currentAttempt.items.map((idv: ClozeItemDTO | undefined) => idv ? ({...idv, replacementId: `${idv?.id}-${uuid_v4()}`}) : undefined));
            // If the question allows duplicates, then the items in the non-selected item section should never change
            //  (apart from on question load - this case is handled in the initial state of nonSelectedItems)
            if (!withReplacement) {
                setNonSelectedItems(nsis => nsis.filter(i => !currentAttempt.items?.map(si => si?.id).includes(i.id)).map(x => ({...x, replacementId: x.id})) || []);
            }
        }
        }, [currentAttempt]);

    const registerInlineDropRegion = (dropRegionId: string, index: number) => {
        if (!registeredDropRegionIDs.has(dropRegionId)) {
            registeredDropRegionIDs.set(dropRegionId, index);
            const registeredDropRegionEntries = Array.from(registeredDropRegionIDs.entries());
            setInlineDropValues(idvs => [...idvs]); // This is messy, but it makes sure that the inlineDropValueMap is recomputed
            setBorderMap(registeredDropRegionEntries.reduce((dict, [dropId, index]) => Object.assign(dict, {[dropId]: false}), {}));
        }
    };

    function fixInlineZoneOnStartDrag({source}: DragStart, provided: ResponderProvided) {
        fixInlineZones({destination: source} as DragUpdate, provided);
    }

    // This is run on drag update to highlight the droppable that the user is dragging over
    //  this gives more control over when a droppable is highlighted
    function fixInlineZones({destination}: DragUpdate, provided: ResponderProvided) {
        Array.from(registeredDropRegionIDs.entries()).map(([dropId, index]) => {
            const destinationDropIndex = destination ? index : -1;
            const destinationDragIndex = destination?.index ?? -1;
            borderMap[dropId] = (dropId === destination?.droppableId && destinationDropIndex !== -1 && destinationDragIndex === 0);
        });
        // Tell React about the changes to borderMap
        setBorderMap({...borderMap});
    }

    // Run after a drag action ends
    const updateAttempt = useCallback(({source, destination, draggableId}: DropResult, provided: ResponderProvided) => {
        // Make sure borders are removed, since drag has ended
        fixInlineZones({destination: undefined} as DragUpdate, provided);

        if (source.droppableId === destination?.droppableId && source.index === destination?.index) return; // No change

        if (!destination) return; // Drag had no destination

        const inlineDropIndex = (id : string) => registeredDropRegionIDs.get(id);

        const nsis = [...nonSelectedItems];
        const idvs = [...inlineDropValues];

        // The item that's being dragged (this is worked out below in each case)
        let item : ClozeItemDTO;
        // A callback to put an item back into the source of the drag (if needed)
        let replaceSource : (itemToReplace: ClozeItemDTO | undefined) => void = () => undefined;
        // Whether the inline drop zones were updated or not
        let update = false;

        // Check source of drag:
        if (source.droppableId === itemsSectionId) {
            // Drag was from items section
            item = nonSelectedItems[source.index];
            if (!withReplacement || destination.droppableId === itemsSectionId) {
                nsis.splice(source.index, 1);
                replaceSource = (itemToReplace) => itemToReplace && nsis.splice(source.index, 0, itemToReplace);
            }
        } else {
            // Drag was from inline drop section
            // When splicing inline drop values, you always need to delete and replace
            const sourceDropIndex = inlineDropIndex(source.droppableId) as number;
            if (sourceDropIndex !== undefined) {
                const maybeItem = idvs[sourceDropIndex]; // This nastiness is to appease typescript
                if (maybeItem) {
                    item = maybeItem;
                    idvs[sourceDropIndex] = undefined;
                    replaceSource = (itemToReplace) => {idvs[sourceDropIndex] = itemToReplace;};
                    update = true;
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        // Check destination of drag:
        if (destination.droppableId === itemsSectionId) {
            // Drop is into items section
            if (!withReplacement || source.droppableId === itemsSectionId) {
                nsis.splice(destination.index, 0, item);
            } else {
                nsis.splice(nsis.findIndex((x) => x.id === item.id), 1);
                nsis.splice(destination.index, 0, item);
            }
        } else {
            // Drop is into inline drop section
            const destinationDropIndex = inlineDropIndex(destination.droppableId) as number;
            if (destinationDropIndex !== undefined && destination.index === 0) {
                replaceSource(idvs[destinationDropIndex]);
                // Important! This extends the array with `undefined`s if `destinationDropIndex` is out of bounds
                idvs[destinationDropIndex] = withReplacement ? {...item, replacementId: item.id + uuid_v4()} : item
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
            dispatchSetCurrentAttempt(itemChoice);
        }
    }, [inlineDropValues, nonSelectedItems, registeredDropRegionIDs, dispatchSetCurrentAttempt]);

    const updateAttemptCallback = useCallback((dropResult) => {
        updateAttempt({...dropResult, destination: {droppableId: itemsSectionId, index: nonSelectedItems.length}},{announce: (_) => {return;}});
    }, [itemsSectionId, nonSelectedItems]);

    return <div className="question-content cloze-question" id={cssFriendlyQuestionPartId}>
        <ClozeDropRegionContext.Provider value={{questionPartId: cssFriendlyQuestionPartId, register: registerInlineDropRegion, updateAttemptCallback, readonly: readonly ?? false, inlineDropValueMap, borderMap}}>
            <DragDropContext onDragStart={fixInlineZoneOnStartDrag} onDragEnd={updateAttempt} onDragUpdate={fixInlineZones} enableDefaultSensors={false} sensors={[useMouseSensor, useTouchSensor, buildUseKeyboardSensor(itemsSectionId, cssFriendlyQuestionPartId, registeredDropRegionIDs)]}>
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>

                {/* Items section */}
                <Label htmlFor="non-selected-items" className="mt-3">Items: </Label>
                <div className={"cloze-drop-zone"}>
                    <Droppable droppableId={itemsSectionId} direction="horizontal" isDropDisabled={readonly}>
                        {(provided, snapshot) => <div
                            ref={provided.innerRef} {...provided.droppableProps} id="non-selected-items" aria-label={"Non-selected items"}
                            className={`d-flex overflow-auto rounded p-2 mb-3 bg-grey ${snapshot.isDraggingOver ? "border border-dark" : ""}`}
                        >
                            {nonSelectedItems.map((item, i) => <Draggable key={item.replacementId} isDragDisabled={readonly} draggableId={item.replacementId || `${i}`} index={i}>
                                {(provided) =>
                                    <div className={"cloze-draggable"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} role={"option"}>
                                        <Item item={item} />
                                    </div>
                                }
                            </Draggable>)}
                            {nonSelectedItems.length === 0 && "\u00A0"}
                            {provided.placeholder}
                        </div>}
                    </Droppable>
                </div>
            </DragDropContext>
        </ClozeDropRegionContext.Provider>
    </div>;
};
export default IsaacClozeQuestion;
