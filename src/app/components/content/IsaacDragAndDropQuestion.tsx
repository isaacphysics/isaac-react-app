import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Badge, Label} from "reactstrap";
import {
    ContentDTO,
    ItemDTO,
    DndChoiceDTO,
    IsaacDragAndDropQuestionDTO,
    DndValidationResponseDTO,
    DndItemDTO
} from "../../../IsaacApiTypes";
import {
    CLOZE_DROP_ZONE_ID_PREFIX,
    CLOZE_ITEM_SECTION_ID,
    NULL_CLOZE_ITEM_ID,
    below,
    isDefined,
    isTouchDevice,
    useCurrentQuestionAttempt,
    useDeviceSize
} from "../../services";
import {customKeyboardCoordinates} from "../../services/clozeQuestionKeyboardCoordinateGetter";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {
    Announcements,
    closestCenter,
    CollisionDetection,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    rectIntersection,
    ScreenReaderInstructions,
    TouchSensor,
    UniqueIdentifier,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {DragAndDropRegionContext, IsaacQuestionProps, ReplaceableItem} from "../../../IsaacAppTypes";
import {v4 as uuid_v4} from "uuid";
import {Item} from "../elements/markup/portals/InlineDropZones";
import {Immutable} from "immer";
import {arraySwap, SortableContext} from "@dnd-kit/sortable";

const isDropZone = (item: {id: UniqueIdentifier} | null) => item?.id === CLOZE_ITEM_SECTION_ID || String(item?.id).slice(0, 10) === CLOZE_DROP_ZONE_ID_PREFIX;

const augmentInlineItemWithUniqueReplacementID = (idv: Immutable<ReplaceableItem> | undefined) => isDefined(idv) ? ({...idv, replacementId: `${idv?.id}|${uuid_v4()}`}) : undefined;
const augmentNonSelectedItemWithReplacementID = (item: Immutable<ReplaceableItem>) => ({...item, replacementId: item.id});
const augmentInlineItemWithDropZoneId = (idv: Immutable<ReplaceableItem> | undefined, dropZoneId: string) => isDefined(idv) ? ({...idv, type: "dndItem", dropZoneId}) : undefined;
const itemNotNullAndNotInAttempt = (currentAttempt: {items?: (Immutable<ReplaceableItem> | undefined)[]}) => (i: Immutable<ReplaceableItem> | undefined) => i ? !currentAttempt.items?.map(si => si?.id).includes(i.id) : false;

const replaceNullItems = (items: readonly Immutable<ItemDTO>[] | undefined) => items?.map(i => i.id === NULL_CLOZE_ITEM_ID ? undefined : i);

const ItemSection = ({id, items}: {id: string, items: Immutable<ReplaceableItem>[]}) => {
    const itemIds = items.map(i => i.replacementId as string);
    const { over, isOver, setNodeRef } = useDroppable({
        id,
        data: { type: "item-section", itemIds }
    });
    const isOverContainer = isOver || (over ? isDefined(items.find(i => i.id === over.id)) : false);

    return <div className={"mb-3"}>
        <Label className="mt-3">Items: </Label>
        <Label className={"visually-hidden"} id={"item-section-info"}>
            To pick up an item, press space or enter.
            Use the up and down arrow keys to navigate between drop zones and items in the question.
            Press space or enter again to drop the item into a new position, or to swap it with another
            item being hovered over.
        </Label>
        <SortableContext items={itemIds} strategy={() => null}>
            <div aria-labelledby={"item-section-info"} ref={setNodeRef} aria-label={"Non-selected items"} className={`item-section rounded p-2 bg-inline-question ${isOverContainer ? "border border-dark" : "border-light"}`}>
                {items.map((item, i) => <Item key={i} item={item} id={item.replacementId as string} type={"item-section"} />)}
            </div>
        </SortableContext>
    </div>;
};

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
    return ["touchstart", "touchmove", "touchend", "touchcancel"].includes(event.type);
};

// A slightly stutter-y autoscroll that can be toggled on and off
const useAutoScroll = ({active, acceleration, interval}: {active: boolean; acceleration?: number, interval?: number} = {active: false}) => {
    const [scrollAmount, setScrollAmount] = useState<number>(0);

    const autoScrollListener = useCallback((event: MouseEvent | TouchEvent) => {
        // TODO could try to support different scrolling contexts, but this may not be needed
        const baseline = 0;

        const y = (isTouchEvent(event)
            ? (event.touches[0] || event.changedTouches[0]).clientY
            : event.clientY) - baseline;

        const referenceHeight = window.innerHeight;
        const thresholdInPixels = referenceHeight * 0.3;
        if (y <= thresholdInPixels) {
            setScrollAmount((Math.max(baseline, y) - thresholdInPixels) / thresholdInPixels);
        } else if (y >= (referenceHeight - thresholdInPixels)) {
            setScrollAmount((Math.min(referenceHeight, y) - (referenceHeight - thresholdInPixels)) / thresholdInPixels);
        } else {
            setScrollAmount(0);
        }
    }, []);

    // Debouncing this in a clever way might improve stuttering
    const updateScrollAmount = useCallback((scrollAmount: number, acceleration = 10, interval = 5) => {
        if (scrollAmount !== 0) {
            const scaledScrollAmount = Math.abs(scrollAmount) * scrollAmount * acceleration;
            const doScroll = () => window.scrollTo(window.scrollX, window.scrollY + scaledScrollAmount);
            const intervalId = setInterval(doScroll, interval);
            return () => clearInterval(intervalId);
        }
    }, []);

    useEffect(() => {
        return updateScrollAmount(scrollAmount, acceleration, interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollAmount, acceleration, interval]);

    useEffect(() => {
        if (active) {
            window.addEventListener("mousemove", autoScrollListener);
            window.addEventListener("touchmove", autoScrollListener);
            return () => {
                window.removeEventListener("mousemove", autoScrollListener);
                window.removeEventListener("touchmove", autoScrollListener);
                setScrollAmount(0);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);
};

const IsaacDragAndDropQuestion = ({doc, questionId, readonly, validationResponse}: IsaacQuestionProps<IsaacDragAndDropQuestionDTO, DndValidationResponseDTO>) => {
    const deviceSize = useDeviceSize();
    const { currentAttempt: rawCurrentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<DndChoiceDTO>(questionId);
    const currentAttempt = useMemo(() => rawCurrentAttempt ? {...rawCurrentAttempt, items: replaceNullItems(rawCurrentAttempt.items)} : undefined, [rawCurrentAttempt]);

    const convertCurrentAttemptToMap = (attempt: (Immutable<DndItemDTO> | undefined)[]): Record<string, Immutable<ReplaceableItem>> => {
        return attempt.reduce((map, item) => {
            if (item && item.dropZoneId) {
                map[item.dropZoneId] = item;
            }
            return map;
        }, {} as Record<string, Immutable<ReplaceableItem>>);
    };

    const convertMapToCurrentAttempt = (map: Record<string, Immutable<ReplaceableItem> | undefined>): Immutable<DndItemDTO[]> => {
        return Object.entries(map)
            .map(([dropZoneId, item]) => augmentInlineItemWithDropZoneId(item, dropZoneId))
            .filter(isDefined)
            .map(({replacementId: _, ...item}) => item);
    };

    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?
    const withReplacement = doc.withReplacement ?? false;

    const [nonSelectedItems, setNonSelectedItems] = useState<Immutable<ReplaceableItem>[]>(doc.items ? [...doc.items].map(augmentNonSelectedItemWithReplacementID) : []);

    const allItems = doc.items ? [...doc.items].map(augmentNonSelectedItemWithReplacementID) : [];

    const registeredDropRegionIDs = useRef<Map<string, string>>(new Map()).current;

    const [inlineDropValues, setInlineDropValues] = useState<Record<string, Immutable<ReplaceableItem> | undefined>>(() => currentAttempt?.items || {});
    // Whenever the inlineDropValues change or a drop region is added, computes a map from drop region id -> drop region value
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const inlineDropValueMap = useMemo<{[p: string]: ReplaceableItem}>(() => Array.from(registeredDropRegionIDs.entries()).reduce((dict, [dropId, i]) => Object.assign(dict, {[dropId]: inlineDropValues[i]}), {}), [inlineDropValues]);

    // Compute map used to highlight each inline drop-zone with whether it is correct or not
    const dropZonesCorrect = validationResponse?.dropZonesCorrect;
    const [dropZoneValidationMap, setDropZoneValidationMap] = useState<{[p: string]: {correct?: boolean, itemId?: string} | undefined}>({});
    useEffect(() => {
        if (isDefined(dropZonesCorrect)) {
            // Tag each drop-zone validation with the id of the item currently in that zone. This means that we can
            // conditionally show the validation based on whether it still applies to whatever item is in that
            // drop-zone.
            setDropZoneValidationMap(Array.from(registeredDropRegionIDs.entries()).reduce((dict, [dropId, i]) => Object.assign(dict, {[dropId]: {correct: dropZonesCorrect[i], itemId: inlineDropValueMap[dropId]?.id}}), {}));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropZonesCorrect, inlineDropValueMap]);

    // Manual management of which draggable item gets focus at the end of the drag. The new focus id is set in onDragEnd,
    // causing shouldGetFocus to be updated. shouldGetFocus is passed via the ClozeDropRegionContext to all draggable
    // items - each item will call it and attempt to get focus.
    const [focusId, setFocusId] = useState<string | undefined>();
    const shouldGetFocus = useCallback((id: string) => {
        if (id === focusId) {
            setFocusId(undefined);
            return true;
        }
        return false;
    }, [focusId, setFocusId]);

    // Force #root scrollLeft to be 0 - fixes issue with cloze drag and drop scolling the screen sideways if
    // dragging from item section to a drop-zone off screen.
    // This is an issue with how dnd-kit manages scroll contexts when `overflow: hidden`, can be fixed by setting
    // `overflow: clip` but only very modern browsers support that.
    useEffect(() => {
        const root = document.querySelector<HTMLDivElement>("#root");
        const resetScrollLeft = () => {if (root) {root.scrollLeft = 0;}};
        root?.addEventListener("scroll", resetScrollLeft);
        return () => {
            root?.removeEventListener("scroll", resetScrollLeft);
        };
    }, []);

    useEffect(function updateStateOnCurrentAttemptChange() {
        if (currentAttempt?.items) {
            setInlineDropValues(convertCurrentAttemptToMap(currentAttempt.items.map(augmentInlineItemWithUniqueReplacementID)));
            // If the question allows duplicates, then the items in the non-selected item section should never change
            //  (apart from on question load - this case is handled in the initial state of nonSelectedItems)
            if (!withReplacement) {
                setNonSelectedItems(nsis => nsis.filter(itemNotNullAndNotInAttempt(currentAttempt)).map(augmentNonSelectedItemWithReplacementID) || []);
            }
        }
    }, [currentAttempt, withReplacement]);

    // The following is to fix an issue with tests containing cloze qs across multiple sections - if the doc changes underneath
    // this component, the inline drop values and non-selected items don't get updated. It's reasonable to assume that
    // if the doc ever updates in a context other than this issue, reinitialising these values would be a valid behaviour.
    useEffect(function updateStateOnDocChange() {
        setInlineDropValues(convertCurrentAttemptToMap((currentAttempt?.items ?? []).map(augmentInlineItemWithUniqueReplacementID)));
        if (currentAttempt && !withReplacement) {
            setNonSelectedItems(doc.items ? [...doc.items].filter(itemNotNullAndNotInAttempt(currentAttempt)).map(augmentNonSelectedItemWithReplacementID) : []);
        } else {
            setNonSelectedItems(doc.items ? [...doc.items].map(augmentNonSelectedItemWithReplacementID) : []);
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc]);

    const findItemById = (id: string) => nonSelectedItems.find(i => i.replacementId === id) ?? Object.values(inlineDropValues).find(i => i && i.replacementId === id);

    const [usingKeyboard, setUsingKeyboard] = useState<boolean>(false);

    // Which item is being dragged currently, if any
    const [activeItem, setActiveItem] = useState<Immutable<DndItemDTO> | undefined>();
    const startItemDrag = (event: DragStartEvent) => {
        setActiveItem(findItemById(event.active.id as string));
    };
    const stopItemDrag = () => {
        setActiveItem(undefined);
        setUsingKeyboard(false);
    };

    useAutoScroll({active: isDefined(activeItem) && !usingKeyboard, acceleration: 5, interval: 5});

    const registerInlineDropRegion = useCallback((divId: string, zoneId: string) => {
        if (!registeredDropRegionIDs.has(divId)) {
            registeredDropRegionIDs.set(divId, zoneId);
            setInlineDropValues(idvs => ({...idvs})); // This is messy, but it makes sure that the inlineDropValueMap is recomputed
        }
    }, [registeredDropRegionIDs, setInlineDropValues]);

    const updateAttempt = (idvs: Record<string, Immutable<ReplaceableItem> | undefined>) => {
        const dndChoice: DndChoiceDTO = {
            type: "dndChoice",
            items: idvs ? convertMapToCurrentAttempt(idvs) as DndItemDTO[] : [],
        };
        dispatchSetCurrentAttempt(dndChoice);
    };

    // Run after a drag action ends
    const onDragEnd = useCallback((event: DragEndEvent) => {
        const {over, active} = event;

        stopItemDrag();

        if (!over) return; // Drag had no destination, don't update anything

        const isFromItemSection = isDefined(nonSelectedItems.find(i => i.replacementId === active?.id));
        const isToItemSection = isDefined(nonSelectedItems.find(i => i.replacementId === over?.id)) || over?.id === CLOZE_ITEM_SECTION_ID;

        const inlineDropIndex = (id : string) => registeredDropRegionIDs.get(id);

        let nsis = [...nonSelectedItems];
        const idvs = ({...inlineDropValues});
        // let idvs = inlineDropValues
        // .reduce((acc, item, index) => {
        //     if (isDndItem(item)) {
        //         acc[item.dropZoneId ?? "unknown"] = item;
        //     } else {
        //         acc[index] = item;
        //     }
        //     return acc;
        // }, {} as Record<string, Immutable<DndItemDTO> | undefined>);

        // The item that's being dragged, can be found immediately because replacement id is unique
        const item = findItemById(active.id as string);
        let newFocusId = item?.replacementId;

        if (!item) return; // Something very wrong happened here, abort

        if (isFromItemSection) {
            // Drag originated in the item section
            const fromIndex = nsis.indexOf(item);
            if (isToItemSection) {
                // Return if dragged to general item section area
                if (over?.id === CLOZE_ITEM_SECTION_ID) return;
                // Swap within item section
                const toIndex = nsis.findIndex(i => i.replacementId === over.id);
                // Return to same place if nothing changed
                if (toIndex === -1 || fromIndex === toIndex) return;
                // Otherwise swap into new spot
                nsis = arraySwap(nsis, fromIndex, toIndex);
            } else {
                // Take item from item section, considering duplication, and place into inline drop-zone
                const toIndex = inlineDropIndex(over.id as string) ?? Object.entries(idvs).find(([_, i]) => i?.replacementId === over.id)?.[0];
                // Cancel if error
                if (!toIndex) return;
                // Otherwise remove from item section and add to drop-zone, swapping out the previous item if it exists
                const dzItem = idvs[toIndex];
                if (!withReplacement) {
                    if (dzItem) {
                        nsis.splice(fromIndex, 1, dzItem);
                    } else {
                        nsis.splice(fromIndex, 1);
                    }
                }
                idvs[toIndex] = augmentInlineItemWithUniqueReplacementID(item);
                newFocusId = idvs[toIndex]?.replacementId;
                updateAttempt(idvs);
            }
        } else {
            // Drag originated in a drop-zone
            const fromIndex = Object.entries(idvs).find(([_, i]) => i === item)?.[0];
            if (!fromIndex) return; // shouldn't happen
            if (isToItemSection) {
                // Drag is from drop-zone into item section - add in correct position handling duplicates
                if (over?.id === CLOZE_ITEM_SECTION_ID) {
                    idvs[fromIndex] = undefined;
                    if (!withReplacement) nsis.push({...item, replacementId: item.id});
                } else {
                    const toIndex = nsis.findIndex(i => i.replacementId === over.id);
                    // Cancel if we can't find the item
                    if (toIndex === -1) return;
                    // If same items and with replacement, remove inline drop value and stop
                    if (item.id === over.id && withReplacement) {
                        idvs[fromIndex] = undefined;
                    } else { // Otherwise remove from drop-zone and add into item section
                        idvs[fromIndex] = augmentInlineItemWithUniqueReplacementID(nsis[toIndex]);
                        if (!withReplacement) nsis.splice(toIndex, 1, {...item, replacementId: item.id});
                    }
                }
                newFocusId = item.id;
                updateAttempt(idvs);
            } else {
                // Drag is between drop-zones, should check if it is back to the same drop-zone
                const toIndex = inlineDropIndex(over.id as string) ?? Object.entries(idvs).find(([_, i]) => i?.replacementId === over.id)?.[0];
                // Return to same drop zone if dragging to and from same one
                if (!toIndex || fromIndex === toIndex) return;
                // Otherwise perform the swap!
                // idvs = arraySwap(idvs, fromIndex, toIndex);
                const temp = idvs[toIndex];
                idvs[toIndex] = idvs[fromIndex];
                idvs[fromIndex] = temp;
                
                newFocusId = idvs[toIndex]?.replacementId;
                updateAttempt(idvs);
            }
        }

        // Update both lists of items after any changes
        setInlineDropValues(idvs);
        setNonSelectedItems(nsis);
        // Record the id of the item to be focused after the end of this drag - important for accessibility
        setFocusId(newFocusId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inlineDropValues, nonSelectedItems, registeredDropRegionIDs, dispatchSetCurrentAttempt]);

    // On mobile screens we have a dropdown rather than a drag and drop
    // Keep the logic here and provide a onEvent function
    const onDropdownSelect = useCallback((item: Immutable<DndItemDTO>, dropZoneId: UniqueIdentifier, clearSelection: boolean) => {
        const inlineDropIndex = (id : string) => registeredDropRegionIDs.get(id);

        const nsis = [...nonSelectedItems];
        const idvs = ({...inlineDropValues});

        const dropZoneIndex = inlineDropIndex(dropZoneId as string) ?? Object.entries(idvs).find(([_, i]) => i?.replacementId === dropZoneId)?.[0];
        // Cancel if error
        if (!dropZoneIndex) return;
        const previousItem = idvs[dropZoneIndex];

        if (!withReplacement && previousItem) {
            // Add the previously selected item back to the options
            // if it wasn't duplicated
            nsis.push(previousItem);
        }

        if (clearSelection) {
            idvs[dropZoneIndex] = undefined;
        } else {
            idvs[dropZoneIndex] = augmentInlineItemWithUniqueReplacementID(item);
        }

        updateAttempt(idvs);

        // Update both lists of items after any changes
        setInlineDropValues(idvs);
        setNonSelectedItems(nsis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inlineDropValues, nonSelectedItems, registeredDropRegionIDs, dispatchSetCurrentAttempt]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
                distance: 10,
            }
        }),
        useSensor(TouchSensor, {
            // Require a touch drag to have moved by 10 pixels before activating
            activationConstraint: {
                distance: 10
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: customKeyboardCoordinates,
            onActivation: () => setUsingKeyboard(true)
        })
    );

    // A nicer closestCenter collision detection that doesn't consider the center of the item section if it contains
    // items and you're currently hovering over it
    const customCollision: CollisionDetection = useCallback((args) => {
        if (usingKeyboard) {
            return closestCenter(args);
        }

        // Mouse collision should work like so
        // - If colliding with the item section by rect collision
        //   - Check if we are also colliding with an item in the item section (in the same list of collisions)
        //   - If so do closest center collision only within non-selected items
        //   - If not return initial list of collisions
        // - Else use closest corners between only the item section and drop-zones

        const initialCollisions = rectIntersection(args);
        const itemSection = initialCollisions.find(c => c.id === CLOZE_ITEM_SECTION_ID);
        if (itemSection) {
            const justNonSelectedItems = args.droppableContainers.filter(dc => nonSelectedItems.findIndex(i => i.replacementId === dc.id) !== -1);
            const rectNSICollisions = initialCollisions.filter(c => !isDropZone(c) && c.id !== CLOZE_ITEM_SECTION_ID);
            if (rectNSICollisions.length > 0) {
                return closestCenter({...args, droppableContainers: justNonSelectedItems});
            }
            return initialCollisions;
        }
        const collidingDropZones = initialCollisions.filter(c => isDropZone(c));
        if (collidingDropZones.length > 0) {
            const collidingDropZoneContainers = args.droppableContainers.filter(dc => collidingDropZones.findIndex(c => c.id === dc.id) !== -1);
            return closestCenter({...args, droppableContainers: collidingDropZoneContainers});
        }
        const justDropZonesAndItemSection = args.droppableContainers.filter(c => isDropZone(c) || c.id === CLOZE_ITEM_SECTION_ID);
        return closestCenter({...args, droppableContainers: justDropZonesAndItemSection});
    }, [nonSelectedItems, usingKeyboard]);

    const accessibility = useMemo<{announcements: Announcements, container?: Element | undefined, restoreFocus?: boolean, screenReaderInstructions: ScreenReaderInstructions}>(() => ({
        restoreFocus: false,
        announcements: {
            onDragStart({active}) {
                return `Picked up draggable item ${active.data.current?.text}.`;
            },
            onDragOver({active, over}) {
                if (!over) return usingKeyboard ? undefined : `Draggable item ${active.data.current?.text} is no longer over a droppable area.`;

                if (active.id === over.id) return `Draggable item ${active.data.current?.text} is over it's previous position.`;

                if (!isDropZone(over)) {
                    return `Swap draggable item ${active.data.current?.text} with item ${over.data.current?.text}.`;
                } else if (over.id === CLOZE_ITEM_SECTION_ID) {
                    return `Draggable item is over the items section`;
                } else {
                    const dropZoneIndex = (over.id as string).replace(CLOZE_DROP_ZONE_ID_PREFIX, "");
                    return `Draggable item is over drop zone number ${dropZoneIndex}`;
                }
            },
            onDragEnd({active, over}) {
                if (!over) return `Draggable item ${active.data.current?.text} was dropped.`;

                if (active.id === over.id) return `Draggable item ${active.data.current?.text} was returned to it's previous position.`;

                if (!isDropZone(over)) {
                    return `Draggable item ${active.data.current?.text} was swapped with ${over.data.current?.text}.`;
                } else if (over.id === CLOZE_ITEM_SECTION_ID) {
                    return `Draggable item was dropped into the items section`;
                } else {
                    const dropZoneIndex = (over.id as string).replace(CLOZE_DROP_ZONE_ID_PREFIX, "");
                    return `Draggable item ${active.data.current?.text} was dropped into drop zone number ${dropZoneIndex}`;
                }
            },
            onDragCancel({active}) {
                return `Dragging was cancelled. Draggable item ${active.data.current?.text} was returned to it's previous position.`;
            }
        },
        screenReaderInstructions: { draggable: "" }
    }), [usingKeyboard]);

    return <div className="question-content cloze-question" id={cssFriendlyQuestionPartId}>
        <DragAndDropRegionContext.Provider value={{
            questionPartId: cssFriendlyQuestionPartId,
            questionType: "isaacDragAndDropQuestion",
            register: registerInlineDropRegion,
            onSelect: onDropdownSelect,
            readonly: readonly ?? false,
            inlineDropValueMap,
            shouldGetFocus,
            dropZoneValidationMap,
            nonSelectedItems,
            allItems,
            zoneIds: new Set<string>(),
        }}>
            <DndContext
                sensors={sensors}
                autoScroll={false}
                onDragStart={startItemDrag}
                onDragCancel={stopItemDrag}
                onDragEnd={onDragEnd}
                collisionDetection={customCollision}
                accessibility={accessibility}
            >
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>

                {(!(deviceSize === "xs" || (isTouchDevice() && below['md'](deviceSize)))) && <>
                    {/* The item attached to the users cursor while dragging (just for display, shouldn't contain useDraggable/useSortable hooks) */}
                    <DragOverlay>
                        {activeItem && <Badge className="p-1 cloze-item cloze-bg is-dragging" color="theme">
                            <IsaacContentValueOrChildren value={activeItem.value} encoding={activeItem.encoding || "html"}>
                                {activeItem.children as ContentDTO[]}
                            </IsaacContentValueOrChildren>
                        </Badge>}
                    </DragOverlay>

                    <ItemSection id={CLOZE_ITEM_SECTION_ID} items={nonSelectedItems}/>
                </>}
            </DndContext>
        </DragAndDropRegionContext.Provider>
    </div>;
};
export default IsaacDragAndDropQuestion;
