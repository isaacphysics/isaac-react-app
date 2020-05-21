import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { GraphSketcher, LineType, Curve, makeGraphSketcher } from "isaac-graph-sketcher/src/GraphSketcher";
import { bezierLineStyle } from "isaac-graph-sketcher/src/GraphUtils";
import { update } from "lodash";

const GraphSketcherModalComponent = (props: any) => {
    const [graphSketcherElement, setGraphSketcherElement] = useState<HTMLElement>();
    const [sketch, setSketch] = useState<GraphSketcher|undefined|null>();
    const [graphSketcherState, setGraphSketcherState] = useState<object|undefined|null>();

    const updateGraphSketcherState = (state: { canvasWidth: number; canvasHeight: number; curves: Curve[] }) => {
        setGraphSketcherState(state);
    };

    const setLineType = (type: LineType) => {
        if (sketch) {
            sketch.selectedLineType = type;
        }
    };

    const undo = () => sketch?.undo();

    const redo = () => sketch?.redo();

    const deleteSelected = () => {
        // TODO: Implement this
    };

    const close = () => {
        // TODO: Implement this
    };

    useEffect(() => {
        const e = document.getElementById('graph-sketcher-modal') as HTMLElement
        const { sketch, p } = makeGraphSketcher(e, window.innerWidth, window.innerHeight);

        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            sketch.updateGraphSketcherState = updateGraphSketcherState;
            setSketch(sketch);
        }
        setGraphSketcherElement(e);

        return () => {
            const e = document.getElementById('graph-sketcher-modal') as HTMLElement
            if (e) {
                e.removeChild(e.getElementsByTagName('canvas')[0]);
            }
        }
    }, []);

    return <div id='graph-sketcher-modal' style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <div className={ ['button', sketch?.isRedoable() ? 'visible' : 'hidden' ].join(' ')} role="button" onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">redo</div>
            <div className={ ['button', sketch?.isUndoable() ? 'visible' : 'hidden' ].join(' ')} role="button" onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">undo</div>
            <div className="button" role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">poly</div>
            <div className="button" role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">straight</div>
            <div className="button" role="button" onClick={deleteSelected} onKeyUp={deleteSelected} tabIndex={0} id="graph-sketcher-ui-trash-button">trash</div>
            <div className="button" role="button" onClick={close} onKeyUp={close} tabIndex={0} id="graph-sketcher-ui-submit-button">submit</div>
            <select className="dropdown" id="graph-sketcher-ui-color-select" defaultValue="Blue">
                <option value="Blue">Blue</option>
                <option value="Orange">Orange</option>
                <option value="Green">Green</option>
            </select>
        </div>
    </div>
}

export const GraphSketcherModal = connect()(GraphSketcherModalComponent);