import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { makeGraphSketcher } from "isaac-graph-sketcher/src/GraphSketcher";

const GraphSketcherModalComponent = (props: any) => {
    const [graphSketcherElement, setGraphSketcherElement] = useState<HTMLElement>();
    const [sketch, setSketch] = useState();

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
        SKETCH: {JSON.stringify(sketch)}
    </div>
}

export const GraphSketcherModal = connect()(GraphSketcherModalComponent);