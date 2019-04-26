import React from "react";
import { connect } from "react-redux";
import { Inequality, makeInequality } from "inequality";

interface InequalityModalProps {
    availableSymbols?: Array<string>,
    sketch?: Inequality,
    close: () => void,
}
export class InequalityModal extends React.Component<InequalityModalProps> {

    state: {
        sketch?: Inequality,
    };

    availableSymbols?: Array<string>

    close: () => void;

    constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            sketch: props.sketch,
        }
        this.availableSymbols = props.availableSymbols;
        this.close = props.close;
    }

    componentDidMount() {
        const { sketch, p } = makeInequality(
            document.getElementById('inequality-modal'),
            window.innerWidth,
            window.innerHeight,
            [{ type:'Symbol', position: {x: 0, y: 0}, properties: {letter: 'M'} } as any, { type:'LogicBinaryOperation', position: {x: 0, y: 0}, properties: {operation: 'and'} } as any],
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
        sketch.onNewEditorState = (s: any) => { console.log(s); };
        sketch.onCloseMenus = () => { console.log("closeMenus"); };
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = (x: number, y: number) => {  };
        sketch.isTrashActive = () => { return false };

        this.state = { sketch };

        if (this.availableSymbols && this.availableSymbols.length > 0) {
            console.log(`Parsing available symbols: ${this.availableSymbols}`);
        } else {
            console.log("No symbols available, generating default menu.");
        }
    }

    render() {
        return <div id="inequality-modal">
            <nav className="inequality-ui menubar">
                <ul>
                    <li>A</li>
                    <li>A</li>
                    <li>A</li>
                </ul>
            </nav>
            <div className="inequality-ui confirm button" onClick={this.close}>Close</div>
        </div>;
    }
}
