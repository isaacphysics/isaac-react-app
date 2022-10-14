import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {Badge, Label} from "reactstrap";
import {
    ClozeValidationResponseDTO,
    ContentDTO,
    IsaacClozeQuestionDTO,
    ItemChoiceDTO,
    ItemDTO
} from "../../../IsaacApiTypes";
import {CLOZE_DROP_ZONE_ID_PREFIX, CLOZE_ITEM_SECTION_ID, isDefined, useCurrentQuestionAttempt} from "../../services";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors,
    CollisionDetection,
    rectIntersection,
    Announcements,
    ScreenReaderInstructions,
    UniqueIdentifier, closestCorners
} from "@dnd-kit/core";
import {ClozeDropRegionContext, ClozeItemDTO, IsaacQuestionProps} from "../../../IsaacAppTypes";
import {v4 as uuid_v4} from "uuid";
import {Item} from "../elements/markup/portals/InlineDropZones";
import {Immutable} from "immer";
import {
    arraySwap,
    SortableContext
} from "@dnd-kit/sortable";
import {customKeyboardCoordinates} from "../../services";

const composeCollisionAlgorithms = (first: CollisionDetection, second: CollisionDetection): CollisionDetection => (args) => {
    const collisions = first(args);
    return collisions.length > 0 ? collisions : second(args);
};

const isDropZone = (item: {id: UniqueIdentifier} | null) => item?.id === CLOZE_ITEM_SECTION_ID || String(item?.id).slice(0, 10) === CLOZE_DROP_ZONE_ID_PREFIX;

const augmentInlineItemWithUniqueReplacementID = (idv: Immutable<ClozeItemDTO> | undefined) => isDefined(idv) ? ({...idv, replacementId: `${idv?.id}|${uuid_v4()}`}) : undefined;
const augmentNonSelectedItemWithReplacementID = (item: Immutable<ClozeItemDTO>) => ({...item, replacementId: item.id});
const itemNotNullAndNotInAttempt = (currentAttempt: {items?: (Immutable<ItemDTO> | undefined)[]}) => (i: Immutable<ClozeItemDTO> | undefined) => i ? !currentAttempt.items?.map(si => si?.id).includes(i.id) : false;

const NULL_CLOZE_ITEM_ID = "NULL_CLOZE_ITEM" as const;
const NULL_CLOZE_ITEM: ItemDTO = {
    type: "item",
    id: NULL_CLOZE_ITEM_ID
};
const replaceNullItems = (items: readonly Immutable<ItemDTO>[] | undefined) => items?.map(i => i.id === NULL_CLOZE_ITEM_ID ? undefined : i);

const ItemSection = ({id, items}: {id: string, items: Immutable<ClozeItemDTO>[]}) => {
    const itemIds = items.map(i => i.replacementId as string);
    const { over, isOver, setNodeRef } = useDroppable({
        id,
        data: { type: "item-section", itemIds }
    });
    const isOverContainer = isOver || (over ? isDefined(items.find(i => i.id === over.id)) : false);

    const itemSectionStyle: React.CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        alignItems: "center",
        // gridAutoRows: "max-content",
        // gridTemplateColumns: "repeat(2, 1fr)",
        minHeight: 64
    };

    return <div className={"mb-3"}>
        <Label className="mt-3">Items: </Label>
        <Label className={"sr-only"} id={"item-section-info"}>
            To pick up an item, press space or enter.
            Use the up and down arrow keys to navigate between drop zones and items in the question.
            Press space or enter again to drop the item into a new position, or to swap it with another
            item being hovered over.
        </Label>
        <SortableContext items={itemIds} strategy={() => null}>
            <div aria-labelledby={"item-section-info"} ref={setNodeRef} style={itemSectionStyle} aria-label={"Non-selected items"} className={`rounded p-2 bg-grey ${isOverContainer ? "border border-dark" : "border-light"}`}>
                {items.map((item, i) => <Item key={i} item={item} id={item.replacementId as string} type={"item-section"} />)}
            </div>
        </SortableContext>
    </div>;
};

// A slightly stutter-y autoscroll that can be toggled on and off
const useAutoScroll = ({acceleration, interval}: {acceleration?: number, interval?: number} = {}) => {
    const [scrollAmount, setScrollAmount] = useState<number>(0);

    const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
        return ["touchstart", "touchmove", "touchend", "touchcancel"].includes(event.type);
    };

    const autoScrollListener = useCallback((event: MouseEvent | TouchEvent) => {
        // TODO could try to support different scrolling contexts, but this may not be needed
        const baseline = 0;

        const y = (isTouchEvent(event)
            ? (event.touches[0] || event.changedTouches[0]).pageY
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
            const doScroll = () => window.scrollBy(0, scaledScrollAmount);
            const intervalId = setInterval(doScroll, interval);
            return () => clearInterval(intervalId);
        }
    }, []);

    useEffect(() => {
        return updateScrollAmount(scrollAmount, acceleration, interval);
    }, [scrollAmount, acceleration, interval]);

    const activateScroll = () => {
        window.addEventListener("mousemove", autoScrollListener);
        window.addEventListener("touchmove", autoScrollListener);
    }
    const deactivateScroll = () => {
        window.removeEventListener("mousemove", autoScrollListener);
        window.removeEventListener("touchmove", autoScrollListener);
        setScrollAmount(0);
    }
    return {activateScroll, deactivateScroll};
};

const IsaacClozeQuestion = ({doc, questionId, readonly, validationResponse}: IsaacQuestionProps<IsaacClozeQuestionDTO, ClozeValidationResponseDTO>) => {

    const { currentAttempt: rawCurrentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);
    const currentAttempt = useMemo(() => rawCurrentAttempt ? {...rawCurrentAttempt, items: replaceNullItems(rawCurrentAttempt.items)} : undefined, [rawCurrentAttempt]);

    const cssFriendlyQuestionPartId = questionId?.replace(/\|/g, '-') ?? ""; // Maybe we should clean up IDs more?
    const withReplacement = doc.withReplacement ?? false;

    const [nonSelectedItems, setNonSelectedItems] = useState<Immutable<ClozeItemDTO>[]>(doc.items ? [...doc.items].map(augmentNonSelectedItemWithReplacementID) : []);

    const registeredDropRegionIDs = useRef<Map<string, number>>(new Map()).current;

    const [inlineDropValues, setInlineDropValues] = useState<(Immutable<ClozeItemDTO> | undefined)[]>(() => currentAttempt?.items || []);
    // Whenever the inlineDropValues change or a drop region is added, computes a map from drop region id -> drop region value
    const inlineDropValueMap = useMemo(() => Array.from(registeredDropRegionIDs.entries()).reduce((dict, [dropId, i]) => Object.assign(dict, {[dropId]: inlineDropValues[i]}), {}), [inlineDropValues]);

    // Compute map used to highlight each inline drop-zone with whether it is correct or not
    const itemsCorrect = validationResponse?.itemsCorrect;
    const dropZoneValidationMap = useMemo<{[p: string]: boolean | undefined}>(() => isDefined(itemsCorrect)
        ? Array.from(registeredDropRegionIDs.entries()).reduce((dict, [dropId, i]) => Object.assign(dict, {[dropId]: itemsCorrect.at(i)}), {})
        : {}
    , [itemsCorrect]);

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

    useEffect(function updateStateOnCurrentAttemptChange() {
        if (currentAttempt?.items) {
            setInlineDropValues(currentAttempt.items.map(augmentInlineItemWithUniqueReplacementID));
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
        setInlineDropValues((currentAttempt?.items ?? []).map(augmentInlineItemWithUniqueReplacementID));
        if (currentAttempt && !withReplacement) {
            setNonSelectedItems(doc.items ? [...doc.items].filter(itemNotNullAndNotInAttempt(currentAttempt)).map(augmentNonSelectedItemWithReplacementID) : []);
        } else {
            setNonSelectedItems(doc.items ? [...doc.items].map(augmentNonSelectedItemWithReplacementID) : []);
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc]);

    const findItemById = (id: string) => nonSelectedItems.find(i => i.replacementId === id) ?? inlineDropValues.find(i => i && i.replacementId === id);

    const {activateScroll, deactivateScroll} = useAutoScroll({acceleration: 3, interval: 5});

    const [usingKeyboard, setUsingKeyboard] = useState<boolean>(false);

    // Which item is being dragged currently, if any
    const [activeItem, setActiveItem] = useState<Immutable<ClozeItemDTO> | undefined>();
    const startItemDrag = (event: DragStartEvent) => {
        setActiveItem(findItemById(event.active.id as string));
    };
    const stopItemDrag = () => {
        deactivateScroll();
        setActiveItem(undefined);
        setUsingKeyboard(false);
    };

    const registerInlineDropRegion = useCallback((dropRegionId: string, index: number) => {
        if (!registeredDropRegionIDs.has(dropRegionId)) {
            registeredDropRegionIDs.set(dropRegionId, index);
            setInlineDropValues(idvs => [...idvs]); // This is messy, but it makes sure that the inlineDropValueMap is recomputed
        }
    }, [registeredDropRegionIDs, setInlineDropValues]);

    // Run after a drag action ends
    const onDragEnd = useCallback((event: DragEndEvent) => {
        const {over, active} = event;

        stopItemDrag();

        if (!over) return; // Drag had no destination, don't update anything

        const isFromItemSection = isDefined(nonSelectedItems.find(i => i.replacementId === active?.id));
        const isToItemSection = isDefined(nonSelectedItems.find(i => i.replacementId === over?.id)) || over?.id === CLOZE_ITEM_SECTION_ID;

        const inlineDropIndex = (id : string) => registeredDropRegionIDs.get(id);

        let nsis = [...nonSelectedItems];
        let idvs = [...inlineDropValues];

        // The item that's being dragged, can be found immediately because replacement id is unique
        const item = findItemById(active.id as string);
        let newFocusId = item?.replacementId;

        if (!item) return; // Something very wrong happened here, abort

        const updateAttempt = (idvs: (Immutable<ClozeItemDTO> | undefined)[]) => {
            // Update attempt since an inline drop zone changed
            const itemChoice: ItemChoiceDTO = {
                type: "itemChoice",
                items: Array(registeredDropRegionIDs.size).fill(null).map((_, i) => {
                    const item = idvs[i];
                    // If no item, return a "null item" to indicate a hole in the answer
                    if (!item) return NULL_CLOZE_ITEM;
                    const {replacementId, ...itemDto} = item;
                    return itemDto as ItemDTO;
                })
            };
            dispatchSetCurrentAttempt(itemChoice);
        };

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
                const toIndex = inlineDropIndex(over.id as string) ?? idvs.findIndex(i => i?.replacementId === over.id);
                // Cancel if error
                if (toIndex === -1) return;
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
            const fromIndex = idvs.indexOf(item);
            if (fromIndex === -1) return; // shouldn't happen
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
                const toIndex = inlineDropIndex(over.id as string) ?? idvs.findIndex(i => i?.replacementId === over.id);
                // Return to same drop zone if dragging to and from same one
                if (toIndex === -1 || fromIndex === toIndex) return;
                // Otherwise perform the swap!
                idvs = arraySwap(idvs, fromIndex, toIndex);
                newFocusId = idvs[toIndex]?.replacementId;
                updateAttempt(idvs);
            }
        }

        // Update both lists of items after any changes
        setInlineDropValues(idvs);
        setNonSelectedItems(nsis);
        // Record the id of the item to be focused after the end of this drag - important for accessibility
        setFocusId(newFocusId);

    }, [inlineDropValues, nonSelectedItems, registeredDropRegionIDs, dispatchSetCurrentAttempt]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
                distance: 10,
            },
            onActivation: activateScroll
        }),
        useSensor(TouchSensor, {
            // Press delay of 250ms, with tolerance of 5px of movement
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
            onActivation: activateScroll
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: customKeyboardCoordinates,
            onActivation: () => setUsingKeyboard(true)
        })
    );

    // A nicer closestCenter collision detection that doesn't consider the center of the item section if it contains
    // items and you're currently hovering over it
    const customCollision: CollisionDetection = useCallback((args) => {
        const justDropZones = args.droppableContainers.filter(isDropZone);
        const initialCollisions = composeCollisionAlgorithms(rectIntersection, closestCorners)({...args, droppableContainers: justDropZones});
        if (initialCollisions.length > 0 && initialCollisions[0].id === CLOZE_ITEM_SECTION_ID) {
            const justNonSelectedItems = args.droppableContainers.filter(dc => nonSelectedItems.findIndex(i => i.replacementId === dc.id) !== -1);
            const nsiCollisions = closestCenter({...args, droppableContainers: justNonSelectedItems});
            return nsiCollisions.length > 0 ? nsiCollisions : initialCollisions;
        }
        return initialCollisions;
    }, [nonSelectedItems]);

    const accessibility = useMemo<{announcements: Announcements, container?: Element | undefined, restoreFocus?: boolean, screenReaderInstructions: ScreenReaderInstructions}>(() => ({
        restoreFocus: false,
        announcements: {
            onDragStart({active}) {
                return `Picked up draggable item ${active.data.current?.value}.`;
            },
            onDragOver({active, over}) {
                if (!over) return usingKeyboard ? undefined : `Draggable item ${active.data.current?.value} is no longer over a droppable area.`;

                if (active.id === over.id) return `Draggable item ${active.data.current?.value} is over it's previous position.`;

                if (!isDropZone(over)) {
                    return `Swap draggable item ${active.data.current?.value} with item ${over.data.current?.value}.`;
                } else if (over.id === CLOZE_ITEM_SECTION_ID) {
                    return `Draggable item is over the items section`;
                } else {
                    const dropZoneIndex = (over.id as string).replace(CLOZE_DROP_ZONE_ID_PREFIX, "");
                    return `Draggable item is over drop zone number ${dropZoneIndex}`;
                }
            },
            onDragEnd({active, over}) {
                if (!over) return `Draggable item ${active.data.current?.value} was dropped.`;

                if (active.id === over.id) return `Draggable item ${active.data.current?.value} was returned to it's previous position.`;

                if (!isDropZone(over)) {
                    return `Draggable item ${active.data.current?.value} was swapped with ${over.data.current?.value}.`;
                } else if (over.id === CLOZE_ITEM_SECTION_ID) {
                    return `Draggable item was dropped into the items section`;
                } else {
                    const dropZoneIndex = (over.id as string).replace(CLOZE_DROP_ZONE_ID_PREFIX, "");
                    return `Draggable item ${active.data.current?.value} was dropped into drop zone number ${dropZoneIndex}`;
                }
            },
            onDragCancel({active}) {
                return `Dragging was cancelled. Draggable item ${active.data.current?.value} was returned to it's previous position.`;
            }
        },
        screenReaderInstructions: { draggable: "" }
    }), [usingKeyboard]);

    return <div className="question-content cloze-question" id={cssFriendlyQuestionPartId}>
        <ClozeDropRegionContext.Provider value={{questionPartId: cssFriendlyQuestionPartId, register: registerInlineDropRegion, readonly: readonly ?? false, inlineDropValueMap, shouldGetFocus, dropZoneValidationMap}}>
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

                {/* The item attached to the users cursor while dragging (just for display, shouldn't contain useDraggable/useSortable hooks) */}
                <DragOverlay>
                    {activeItem && <Badge className="p-2 cloze-item is-dragging">
                        <IsaacContentValueOrChildren value={activeItem.value} encoding={activeItem.encoding || "html"}>
                            {activeItem.children as ContentDTO[]}
                        </IsaacContentValueOrChildren>
                    </Badge>}
                </DragOverlay>

                <ItemSection id={CLOZE_ITEM_SECTION_ID} items={nonSelectedItems}/>
            </DndContext>
        </ClozeDropRegionContext.Provider>
    </div>;
};
export default IsaacClozeQuestion;
