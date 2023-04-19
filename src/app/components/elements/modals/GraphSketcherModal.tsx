import React, {useCallback, useEffect, useState} from "react";
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from "isaac-graph-sketcher";
import {isDefined} from "../../../services";
import debounce from "lodash/debounce";
import {IsaacGraphSketcherQuestionDTO} from "../../../../IsaacApiTypes";
import {Markup} from "../markup";
import {calculateHexagonProportions, Hexagon} from "../svg/Hexagon";
import classNames from "classnames";

interface GraphSketcherModalProps {
    close: () => void;
    initialState?: GraphSketcherState;
    onGraphSketcherStateChange: (state: GraphSketcherState) => void;
    question?: IsaacGraphSketcherQuestionDTO;
}

const GraphSketcherModal = (props: GraphSketcherModalProps) => {
    const { onGraphSketcherStateChange, close, initialState } = props;
    const [ , setGraphSketcherElement] = useState<HTMLElement>();
    const [modalSketch, setModalSketch] = useState<GraphSketcher|undefined|null>();
    const [drawingColorName, setDrawingColorName] = useState("Blue");
    const [lineType, setLineType] = useState(LineType.BEZIER);

    // This is debounced here because the graph sketcher upstream calls this
    // on every redraw, which happens on every mouse event.
    const updateGraphSketcherState = useCallback(debounce((newState: GraphSketcherState) => {
        onGraphSketcherStateChange(newState);
    }, 250), []);
    
    useEffect(() => {
        if (isDefined(modalSketch)) return;

        const e = document.getElementById('graph-sketcher-modal') as HTMLElement
        const { sketch } = makeGraphSketcher(e, window.innerWidth, window.innerHeight, { previewMode: false });

        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            sketch.updateGraphSketcherState = updateGraphSketcherState;
            setModalSketch(sketch);
        }
        setGraphSketcherElement(e);
    }, []);

    useEffect(() => {
        if (isDefined(modalSketch)) {
            modalSketch.state.curves = modalSketch.state.curves || initialState?.curves || [];
            modalSketch.reDraw();
        }
    }, [modalSketch, initialState]);

    // Teardown
    useEffect(() => {
        if (modalSketch) {
            return () => {
                modalSketch?.teardown();
                setModalSketch(null);
                const e = document.getElementById('graph-sketcher-modal') as HTMLElement
                if (e) {
                    for (const canvas of e.getElementsByTagName('canvas')) {
                        e.removeChild(canvas);
                    }
                }
            }
        }
    }, [modalSketch]);

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

    return <div id='graph-sketcher-modal' style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <div className={ [ 'button', isRedoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">redo</div>
            <div className={ [ 'button', isUndoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">undo</div>
            <div className={ [ 'button', lineType === LineType.BEZIER ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">poly</div>
            <div className={ [ 'button', lineType === LineType.LINEAR ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">straight</div>
            <div className={ [ 'button', isTrashActive() ? 'active' : '' ].join(' ') } role="button" tabIndex={0} id="graph-sketcher-ui-trash-button">trash</div>
            <div className="button" role="button" onClick={close} onKeyUp={close} tabIndex={0} id="graph-sketcher-ui-submit-button">submit</div>

            <input className={"d-none"} id="graph-sketcher-ui-color-select" value={drawingColorName} aria-readonly />
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