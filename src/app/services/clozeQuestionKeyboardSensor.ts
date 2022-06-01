import {DraggableId, FluidDragActions, PreDragActions, SensorAPI} from "react-beautiful-dnd";
import {useCallback, useLayoutEffect, useMemo, useRef} from "react";

/**
 * This entire file is essentially a hacked version of https://github.com/atlassian/react-beautiful-dnd/blob/master/src/view/use-sensor-marshal/sensors/use-keyboard-sensor.js
 *
 * The nasty hack was required to force keyboard navigation of cloze questions to work, because the standard react-beautiful-dnd
 * keyboard sensor is made for long lists of items arranged in a grid, and doesn't consider cases like ours: singleton
 * lists, randomly scattered across the page.
 */

function noop() {}

type UnbindFn = () => void;

// Copied from react-beautiful-dnd
function getOptions(
    shared: any,
    fromBinding: any,
) {
    return {
        ...shared,
        ...fromBinding,
    };
}

// Copied from react-beautiful-dnd
function bindEvents(
    el: Window,
    bindings: any,
    sharedOptions?: any,
) {
    const unbindings: UnbindFn[] = bindings.map(
        (binding: any) => {
            const options: Object = getOptions(sharedOptions, binding.options);

            el.addEventListener(binding.eventName, binding.fn, options);

            return function unbind() {
                el.removeEventListener(binding.eventName, binding.fn, options);
            };
        },
    );

    // Return a function to unbind events
    return function unbindAll() {
        unbindings.forEach((unbind) => {
            unbind();
        });
    };
}

let DROPPABLE_INDEX: number = -1;

function getDroppablePosition(initialPos: {x: number, y: number}, indexToId: Map<number, string>): {x: number, y: number} {
    const id = indexToId.get(DROPPABLE_INDEX);
    const el = id ? document.getElementById(id) : null;
    return id && el ? (() => {
        const rect = el.getBoundingClientRect()
        return {x: rect.left, y: rect.top}
    })() : initialPos;
}

function nextDroppable(indexToId: Map<number, string>) {
    if (DROPPABLE_INDEX === 0) return;
    if (DROPPABLE_INDEX === -1) {
        DROPPABLE_INDEX = indexToId.size - 1;
    } else {
        DROPPABLE_INDEX--;
    }
}

function prevDroppable(indexToId: Map<number, string>) {
    if (DROPPABLE_INDEX === -1) return;
    if (DROPPABLE_INDEX === indexToId.size - 1) {
        DROPPABLE_INDEX = -1;
    } else {
        DROPPABLE_INDEX++;
    }
}

// Adapted from react-beautiful-dnd
function getDraggingBindings(
    itemsSectionId: string,
    idToIndex: Map<string, number>,
    actions: FluidDragActions,
    stop: () => void,
) {
    function cancel() {
        stop();
        actions.cancel();
    }

    function drop() {
        stop();
        actions.drop();
    }

    return [
        {
            eventName: 'scroll',
            fn: () => {
                const indexToId: Map<number, string> = new Map(Array.from(idToIndex.entries()).map(([id, i]) => [i, id]));
                const itemSectionElement = document.querySelector(`div[data-rbd-droppable-id='${itemsSectionId}']`);
                const itemBox = itemSectionElement?.getBoundingClientRect();
                const itemSectionPos = itemBox ? {x: itemBox.left, y: itemBox.top} : {x: 0, y: 0};
                actions.move(getDroppablePosition(itemSectionPos, indexToId));
            }
        },
        {
            eventName: 'keydown',
            fn: (event: KeyboardEvent) => {

                const indexToId: Map<number, string> = new Map(Array.from(idToIndex.entries()).map(([id, i]) => [i, id]));
                const itemSectionElement = document.querySelector(`div[data-rbd-droppable-id='${itemsSectionId}']`);
                const itemBox = itemSectionElement?.getBoundingClientRect();
                const itemSectionPos = itemBox ? {x: itemBox.left, y: itemBox.top} : {x: 0, y: 0};

                if (event.key === "Escape" || event.key === "Esc") {
                    event.preventDefault();
                    cancel();
                    return;
                }

                // Dropping
                if (event.key === " ") {
                    // need to stop parent Draggable's thinking this is a lift
                    event.preventDefault();
                    drop();
                    return;
                }

                // Movement

                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    prevDroppable(indexToId);
                    actions.move(getDroppablePosition(itemSectionPos, indexToId));
                    return;
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    nextDroppable(indexToId);
                    actions.move(getDroppablePosition(itemSectionPos, indexToId));
                    return;
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    prevDroppable(indexToId);
                    actions.move(getDroppablePosition(itemSectionPos, indexToId));
                    return;
                }

                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    nextDroppable(indexToId);
                    actions.move(getDroppablePosition(itemSectionPos, indexToId));
                    return;
                }
            },
        },
        // any mouse actions kills a drag
        {
            eventName: 'mousedown',
            fn: cancel,
        },
        {
            eventName: 'mouseup',
            fn: cancel,
        },
        {
            eventName: 'click',
            fn: cancel,
        },
        {
            eventName: 'touchstart',
            fn: cancel,
        },
        // resizing the browser kills a drag
        {
            eventName: 'resize',
            fn: cancel,
        },
        // kill if the user is using the mouse wheel
        // We are not supporting wheel / trackpad scrolling with keyboard dragging
        {
            eventName: 'wheel',
            fn: cancel,
            // chrome says it is a violation for this to not be passive
            // it is fine for it to be passive as we just cancel as soon as we get
            // any event
            options: { passive: true },
        },
    ];
}

// Adapted from react-beautiful-dnd
export const buildUseKeyboardSensor = (itemsSection: string, cssFriendlyQuestionPartId: string, idToIndex: Map<string, number>) => function useKeyboardSensor(api: SensorAPI) {
    const unbindEventsRef = useRef<() => void>(noop);

    const startCaptureBinding = useMemo(
        () => ({
            eventName: 'keydown',
            fn: function onKeyDown(event: KeyboardEvent) {
                // Event already used
                if (event.defaultPrevented) {
                    return;
                }

                // Need to start drag with a spacebar press
                if (event.key !== " ") {
                    return;
                }

                const draggableId: DraggableId | null = api.findClosestDraggableId(event);

                if (!draggableId) {
                    return;
                }

                const preDrag: PreDragActions | null = api.tryGetLock(
                    draggableId,
                    stop,
                    { sourceEvent: event },
                );

                // Cannot start capturing at this time
                if (!preDrag) {
                    return;
                }
                DROPPABLE_INDEX = -1;

                // we are consuming the event
                event.preventDefault();
                let isCapturing: boolean = true;

                // Make sure we only get the draggable element from a specific cloze question
                const draggableElement = document.querySelector(`div[id=${cssFriendlyQuestionPartId}]`)?.querySelector(`div[data-rbd-draggable-id='${draggableId}']`);
                const box = draggableElement?.getBoundingClientRect();
                const pos = box ? {x: box.left, y: box.top} : {x: 0, y: 0};

                // There is no pending period for a keyboard drag
                // We can lift immediately
                const actions: FluidDragActions = preDrag.fluidLift(pos);

                // unbind this listener
                unbindEventsRef.current();

                // setup our function to end everything
                function stop() {
                    isCapturing = false;
                    // unbind dragging bindings
                    unbindEventsRef.current();
                    // start listening for capture again
                    // eslint-disable-next-line no-use-before-define
                    listenForCapture();
                }

                // bind dragging listeners
                unbindEventsRef.current = bindEvents(
                    window,
                    getDraggingBindings(itemsSection, idToIndex, actions, stop),
                    { capture: true, passive: false },
                );
            },
        }),
        // not including startPendingDrag as it is not defined initially
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [api],
    );

    const listenForCapture = useCallback(
        function tryStartCapture() {
            const options = {
                passive: false,
                capture: true,
            };

            unbindEventsRef.current = bindEvents(
                window,
                [startCaptureBinding],
                options,
            );
        },
        [startCaptureBinding],
    );

    useLayoutEffect(
        function mount() {
            listenForCapture();

            // kill any pending window events when unmounting
            return function unmount() {
                unbindEventsRef.current();
            };
        },
        [listenForCapture],
    );
}