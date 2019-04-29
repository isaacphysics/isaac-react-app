import React from "react";
import { connect } from "react-redux";
import { Inequality, makeInequality } from "inequality";
import katex from "katex";

interface MenuItem {
    type: string,
    properties: any,
    menu: { label: string, texLabel: boolean }
}

interface InequalityModalProps {
    availableSymbols?: Array<string>,
    sketch?: Inequality,
    close: () => void,
}
export class InequalityModal extends React.Component<InequalityModalProps> {

    state: {
        sketch?: Inequality,
    };

    availableSymbols?: Array<string> = [];
    menuElements: Array<HTMLElement> = [];
    menuRef: any;

    close: () => void;

    constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            sketch: props.sketch,
        }
        this.availableSymbols = props.availableSymbols;
        this.close = props.close;
        this.menuRef = React.createRef();
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
    }

    generateLogicFunctionsItems(syntax = 'logic'): Array<MenuItem> {
        let labels: any = {
            logic: {
                and: "\\land",
                or: "\\lor",
                not: "\\lnot",
                equiv: "\\equiv",
                True: "\\mathsf{T}",
                False: "\\mathsf{F}"
            },
            binary: {
                and: "\\cdot",
                or: "+",
                not: "\\overline{x}",
                equiv: "\\equiv",
                True: "1",
                False: "0"
            }
        };
        return [
            {
                type: "LogicBinaryOperation",
                properties: { operation: "and" },
                menu: { label: labels[syntax]['and'], texLabel: true }
            },
            {
                type: "LogicBinaryOperation",
                properties: { operation: "or" },
                menu: { label: labels[syntax]['or'], texLabel: true }
            },
            {
                type: "LogicNot",
                properties: {},
                menu: { label: labels[syntax]['not'], texLabel: true }
            },
            {
                type: "Relation",
                properties: { relation: "equiv" },
                menu: { label: labels[syntax]['equiv'], texLabel: true }
            },
            {
                type: "LogicLiteral",
                properties: { value: true },
                menu: { label: labels[syntax]['True'], texLabel: true }
            },
            {
                type: "LogicLiteral",
                properties: { value: false },
                menu: { label: labels[syntax]['False'], texLabel: true }
            },
            {
                type: "Brackets",
                properties: { type: "round" },
                menu: { label: "(x)", texLabel: true }
            }
        ];
    };

    render() {
        let logicFunctionItems = this.generateLogicFunctionsItems();

        if (this.availableSymbols && this.availableSymbols.length > 0) {
            console.log(`Parsing available symbols: ${this.availableSymbols}`);
        } else {
            console.log("No symbols available, generating default menu.");
        }

        return <div id="inequality-modal">
            <nav className="inequality-ui menubar">
                <ul>
                    {logicFunctionItems.map((e, i) => <li key={i} dangerouslySetInnerHTML={ {__html: katex.renderToString(e.menu.label)} }></li>)}
                </ul>
            </nav>
            <div className="inequality-ui confirm button" onClick={this.close}>Close</div>
        </div>;
    }
}
