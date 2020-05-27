import React, { useState, useEffect, ChangeEvent } from "react";
import { connect } from "react-redux";
import { GraphSketcher, LineType, Curve, makeGraphSketcher } from "isaac-graph-sketcher/src/GraphSketcher";

interface GraphSketcherModalProps {
    close: () => void;
    onGraphSketcherStateChange: (state: any) => void;
}

const GraphSketcherModalComponent = (props: GraphSketcherModalProps) => {
    const { onGraphSketcherStateChange, close } = props;
    const [ , setGraphSketcherElement] = useState<HTMLElement>();
    const [sketch, setSketch] = useState<GraphSketcher|undefined|null>();
    const [ , setGraphSketcherState] = useState<object|undefined|null>();
    const [drawingColorName, setDrawingColorName] = useState("Blue");
    const [lineType, setLineType] = useState(LineType.BEZIER);

    const updateGraphSketcherState = (state: { canvasWidth: number; canvasHeight: number; curves: Curve[] }) => {
        setGraphSketcherState(state);
        onGraphSketcherStateChange(state);
    };

    const undo = () => sketch?.undo();

    const redo = () => sketch?.redo();

    const deleteSelected = () => {
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

    useEffect(() => {
        if (sketch) {
            sketch.drawingColorName = drawingColorName;
        }
    }, [drawingColorName]);

    useEffect(() => {
        if (sketch) {
            sketch.selectedLineType = lineType;
        }
    }, [lineType]);

    return <div id='graph-sketcher-modal' style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <div className={ [ 'button', sketch?.isRedoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">redo</div>
            <div className={ [ 'button', sketch?.isUndoable() ? 'visible' : 'hidden' ].join(' ') } role="button" onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">undo</div>
            <div className={ [ 'button', lineType === LineType.BEZIER ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">poly</div>
            <div className={ [ 'button', lineType === LineType.LINEAR ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">straight</div>
            <div className={ [ 'button', sketch?.isTrashActive ? 'active' : '' ].join(' ') } role="button" onClick={deleteSelected} onKeyUp={deleteSelected} tabIndex={0} id="graph-sketcher-ui-trash-button">trash</div>
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