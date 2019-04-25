import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Inequality, makeInequality } from "inequality";
import P5Wrapper from "react-p5-wrapper";

interface InequalityModalProps {
    visible: boolean,
    sketch: Inequality
}
export class InequalityModal extends React.Component {

    state: {
        visible?: boolean,
        sketch?: Inequality,
        canvas?: any
    };

    constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            visible: props.visible,
            sketch: props.sketch
        }
    }

    componentDidMount() {
        const { sketch, p } = makeInequality(
            document.getElementById('inequalityBox'),
            window.innerWidth,
            window.innerHeight,
            [],
            {
                editorMode: 'logic',
                textEntry: false,
                fontItalicPath: '/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/fonts/STIXGeneral-Regular.ttf'
            }
        );
        sketch.log = {
            initialState: [],
            actions: [{
                event: "OPEN",
                timestamp: Date.now()
            }]
        };
        sketch.onNewEditorState = (s) => { console.log(s); };
        sketch.onCloseMenus = () => { console.log("closeMenus"); };
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = (x, y) => {  };
        sketch.isTrashActive = () => { return true };
        // debugger;
        this.state = { sketch };
    }

    render() {
        return <P5Wrapper sketch={this.state.sketch} />
    }
}
// const InequalityModalComponent = (props: InequalityModalProps) => {
//     const [sketch, setSketch] = useState();

//     const box = React.createElement('div');
//     const inequality = makeInequality(
//         box,
//         window.innerWidth,
//         window.innerHeight,
//         [],
//         {
//             editorMode: 'logic',
//             textEntry: false,
//             fontItalicPath: '/fonts/STIXGeneral-Italic.ttf',
//             fontRegularPath: '/fonts/STIXGeneral-Regular.ttf'
//         }
//     );
//     const _sketch = inequality.sketch;
//     _sketch.log = {
//         initialState: [],
//         actions: [{
//             event: "OPEN",
//             timestamp: Date.now()
//         }]
//     };
//     _sketch.onNewEditorState = (s) => { console.log(s); };
//     _sketch.onCloseMenus = () => { console.log("closeMenus"); };
//     _sketch.isUserPrivileged = () => { return true; };
//     _sketch.onNotifySymbolDrag = (x, y) => {  };
//     _sketch.isTrashActive = () => { return true };
//     // debugger;
//     setSketch(_sketch);

//     return <div>{box}</div>
// }

// export const InequalityModal = connect()(InequalityModalComponent);
