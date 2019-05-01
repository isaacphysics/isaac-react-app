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

    private _ghost?: HTMLElement;

    state: {
        sketch?: Inequality,
    };

    private availableSymbols?: Array<string> = [];
    private menuElements: Array<HTMLElement> = [];
    private menuRef: any;

    private mouseX: number = -1;
    private mouseY: number = -1;

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
        const inequalityElement = document.getElementById('inequality-modal');
        const { sketch, p } = makeInequality(
            inequalityElement,
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
        sketch.onNotifySymbolDrag = () => { };
        sketch.isTrashActive = () => { return false };

        this.state = { sketch };

        // Firefox does not report coordinates correctly on drag, so we supplement them here.
        document.ondragover = (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        }

        this._ghost = document.createElement('div');
        this._ghost.style.opacity = "0";
        this._ghost.innerHTML = '_';
        this._ghost.id = 'the-ghost-of-inequality';
        document.body.appendChild(this._ghost);
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
    }

    onMenuItemDragStart(spec: MenuItem, event: React.DragEvent) {
        event.dataTransfer.setData('text/plain', ''); // Somehow, Firefox needs some data to be set on the drag start event to continue firing drag events.
        event.dataTransfer.setDragImage(this._ghost as Element, event.clientX, event.clientY);
        if (this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(spec, event.clientX, event.clientY);
        }
    }

    onMenuItemDrag(spec: MenuItem, event: React.DragEvent) {
        if (this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(spec, this.mouseX, this.mouseY);
        }
    }

    onMenuItemDragEnd(_event: React.DragEvent) {
        if (this.state.sketch) {
            this.state.sketch.commitPotentialSymbol();
        }
    }

    render() {
        let logicFunctionItems = this.generateLogicFunctionsItems();
        let letters = "ABCDEGHIJKLMNOPQRSUVWZ".split("").map((l) => ({
            type: "Symbol", properties: { letter: l },
            menu: { label: l, texLabel: true}
        }));

        if (this.availableSymbols && this.availableSymbols.length > 0) {
            console.log(`Parsing available symbols: ${this.availableSymbols}`);
        } else {
            console.log("No symbols available, generating default menu.");
        }

        return <div id="inequality-modal">
            <nav className="inequality-ui menubar">
                <ul>{
                    logicFunctionItems.map((item, index) =>
                        <li key={index}
                            dangerouslySetInnerHTML={{ __html: katex.renderToString(item.menu.label) }}
                            draggable
                            onDragStart={ event => this.onMenuItemDragStart(item, event) }
                            onDrag={ event => this.onMenuItemDrag(item, event) }
                            onDragEnd={ event => this.onMenuItemDragEnd(event) }
                            />
                    )
                }</ul>
            </nav>
            <div className="inequality-ui confirm button" onClick={this.close}>Close</div>
        </div>;
    }
}
