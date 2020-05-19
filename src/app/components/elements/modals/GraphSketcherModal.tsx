import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { GraphSketcher, makeGraphSketcher } from "isaac-graph-sketcher/src/GraphSketcher";

const GraphSketcherModalComponent = (props: any) => {
    const [graphSketcherElement, setGraphSketcherElement] = useState<HTMLElement>();
    const [sketch, setSketch] = useState<GraphSketcher|undefined|null>();

    useEffect(() => {
        const e = document.getElementById('graph-sketcher-modal') as HTMLElement
        const { sketch, p } = makeGraphSketcher(e, window.innerWidth, window.innerHeight);
        setSketch(sketch);
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
            <div className="button" id="graph-sketcher-ui-redo">.</div>
            <div className="button" id="graph-sketcher-ui-undo">.</div>
            <div className="button" id="graph-sketcher-ui-poly">.</div>
            <div className="button" id="graph-sketcher-ui-straight">.</div>
            <div className="button" id="graph-sketcher-ui-trash-button">.</div>
            <div className="button" id="graph-sketcher-ui-submit">.</div>
            <select className="dropdown" id="graph-sketcher-ui-color-select">
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
            </select>
        </div>
    </div>
}

export const GraphSketcherModal = connect()(GraphSketcherModalComponent);