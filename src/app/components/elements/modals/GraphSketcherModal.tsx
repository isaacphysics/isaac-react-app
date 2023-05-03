import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from "isaac-graph-sketcher";
import debounce from "lodash/debounce";
import {IsaacGraphSketcherQuestionDTO} from "../../../../IsaacApiTypes";
import {Markup} from "../markup";
import {calculateHexagonProportions, Hexagon} from "../svg/Hexagon";
import classNames from "classnames";
import {closeActiveModal, openActiveModal, store, useAppDispatch} from "../../../state";
import {PageFragment} from "../PageFragment";
import {isDefined} from "../../../services";

interface GraphSketcherModalProps {
    close: () => void;
    initialState?: GraphSketcherState;
    onGraphSketcherStateChange: (state: GraphSketcherState) => void;
    question?: IsaacGraphSketcherQuestionDTO;
}

const GraphSketcherModal = (props: GraphSketcherModalProps) => {
    const { onGraphSketcherStateChange, close, initialState } = props;
    const [drawingColorName, setDrawingColorName] = useState("Blue");
    const [lineType, setLineType] = useState(LineType.BEZIER);

    const [modalSketch, setModalSketch] = useState<GraphSketcher | undefined | null>();
    const graphSketcherContainer = useRef<HTMLDivElement>(null);

    // Help modal logic
    const dispatch = useAppDispatch();
    const showHelpModal = () => dispatch(openActiveModal({
        closeAction: () => { store.dispatch(closeActiveModal()) },
        size: "xl",
        title: "Quick Help",
        body: <PageFragment fragmentId={`graph_sketcher_help_modal`}/>
    }));

    // This is debounced here because the graph sketcher upstream calls this
    // on every redraw, which happens on every mouse event.
    const updateGraphSketcherState = useCallback(debounce((newState: GraphSketcherState) => {
        onGraphSketcherStateChange(newState);
    }, 250, {trailing: true}), []);

    // Setup and teardown of the graph sketcher p5 instance
    useEffect(() => {
        const { sketch, p } = makeGraphSketcher(graphSketcherContainer.current ?? undefined, window.innerWidth, window.innerHeight, { previewMode: false, initialCurves: initialState?.curves });

        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            sketch.updateGraphSketcherState = updateGraphSketcherState;
            setModalSketch(sketch);
        }

        return () => {
            modalSketch?.teardown();
            setModalSketch(null);
            if (graphSketcherContainer.current) {
                for (const canvas of graphSketcherContainer.current.getElementsByTagName('canvas')) {
                    graphSketcherContainer.current.removeChild(canvas);
                }
            }
            p.remove();
        }
    }, []);

    useEffect(() => {
        if (isDefined(modalSketch)) {
            modalSketch.state = {
                ...modalSketch.state,
                curves: initialState?.curves ?? modalSketch.state.curves ?? []
            };
        }
    }, [initialState]);

    useEffect(() => {
        if (modalSketch) {
            modalSketch.drawingColorName = drawingColorName;
        }
    }, [modalSketch, drawingColorName]);

    useEffect(() => {
        if (modalSketch) {
            modalSketch.selectedLineType = lineType;
        }
    }, [modalSketch, lineType]);

    const isRedoable = () => {
        return modalSketch?.isRedoable();
    };

    const isUndoable = () => {
        return modalSketch?.isUndoable();
    }

    const undo = () => modalSketch?.undo();

    const redo = () => modalSketch?.redo();

    const isTrashActive = () => {
        return modalSketch?.isTrashActive;
    }

    const hexagonSize = 80;
    const colourHexagon = calculateHexagonProportions(hexagonSize/4, 3);

    return <div id='graph-sketcher-modal' ref={graphSketcherContainer} style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <div className={ [ 'button', isRedoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">redo</div>
            <div className={ [ 'button', isUndoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">undo</div>
            <div className={ [ 'button', lineType === LineType.BEZIER ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">polynomial curve</div>
            <div className={ [ 'button', lineType === LineType.LINEAR ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">straight line</div>
            <div className={ [ 'button', isTrashActive() ? 'active' : '' ].join(' ') } role="button" tabIndex={0} id="graph-sketcher-ui-trash-button">trash</div>
            <div className="button" role="button" onClick={close} onKeyUp={close} tabIndex={0} id="graph-sketcher-ui-submit-button">submit</div>
            <div className="button" role="button" onClick={showHelpModal} onKeyUp={showHelpModal} tabIndex={0} id="graph-sketcher-ui-help-button">Help</div>

            <input className={"d-none"} id="graph-sketcher-ui-color-select" value={drawingColorName} readOnly />
            <div id="graph-sketcher-ui-color-select-hexagons">
                <svg>
                    <Hexagon
                        {...colourHexagon} id={"blue-hex-colour"}
                        transform={`translate(${hexagonSize/4 + 3 + 5}, 5)`}
                        className={classNames({"active": drawingColorName === "Blue"})}
                        onClick={() => setDrawingColorName("Blue")}
                    />
                    <Hexagon
                        {...colourHexagon} id={"orange-hex-colour"}
                        transform={`translate(5, ${hexagonSize/2 + 5})`}
                        className={classNames({"active": drawingColorName === "Orange"})}
                        onClick={() => setDrawingColorName("Orange")}
                    />
                    <Hexagon
                        {...colourHexagon} id={"green-hex-colour"}
                        transform={`translate(${hexagonSize/2 + 6 + 5}, ${hexagonSize/2 + 5})`}
                        className={classNames({"active": drawingColorName === "Green"})}
                        onClick={() => setDrawingColorName("Green")}
                    />
                </svg>
                <h5 className={"hover-text"}>Line colour</h5>
            </div>
            {props.question?.value &&
                <Markup trusted-markup-encoding={props.question.encoding}>
                    {props.question.value}
                </Markup>
            }
        </div>
    </div>
}
export default GraphSketcherModal;