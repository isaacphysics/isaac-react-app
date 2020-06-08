import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { connect } from "react-redux";
import { GraphSketcher, LineType, Curve, makeGraphSketcher } from "isaac-graph-sketcher/src/GraphSketcher";
import { isDefined } from "isaac-graph-sketcher/src/GraphUtils";
// import {debounce} from "lodash";

interface GraphSketcherModalProps {
    close: () => void;
    initialCurves?: { curves: Curve[]; canvasWidth: number; canvasHeight: number };
    onGraphSketcherStateChange: (state: any) => void;
}

const GraphSketcherModalComponent = (props: GraphSketcherModalProps) => {
    const { onGraphSketcherStateChange, close, initialCurves } = props;
    const [ , setGraphSketcherElement] = useState<HTMLElement>();
    const [modalSketch, setModalSketch] = useState<GraphSketcher|undefined|null>();
    const [drawingColorName, setDrawingColorName] = useState("Blue");
    const [lineType, setLineType] = useState(LineType.BEZIER);

    const updateGraphSketcherState = useCallback((state: { canvasWidth: number; canvasHeight: number; curves: Curve[] }) => {
        console.log(state);
        onGraphSketcherStateChange(state);
    }, []);
    
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
            modalSketch.data.curves = modalSketch.data.curves || initialCurves;
            modalSketch.reDraw();
        }
    }, [modalSketch, initialCurves]);

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
                // setInitialCurvesAssigned(false);
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

    return <div id='graph-sketcher-modal' style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <div className={ [ 'button', isRedoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">redo</div>
            <div className={ [ 'button', isUndoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">undo</div>
            <div className={ [ 'button', lineType === LineType.BEZIER ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">poly</div>
            <div className={ [ 'button', lineType === LineType.LINEAR ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">straight</div>
            <div className={ [ 'button', isTrashActive() ? 'active' : '' ].join(' ') } role="button" tabIndex={0} id="graph-sketcher-ui-trash-button">trash</div>
            <div className="button" role="button" onClick={close} onKeyUp={close} tabIndex={0} id="graph-sketcher-ui-submit-button">submit</div>

            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select className="dropdown" id="graph-sketcher-ui-color-select" value={drawingColorName} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDrawingColorName(e.target.value)}>
                <option value="Blue">Blue</option>
                <option value="Orange">Orange</option>
                <option value="Green">Green</option>
            </select>
        </div>
    </div>
}

export const GraphSketcherModal = connect()(GraphSketcherModalComponent);