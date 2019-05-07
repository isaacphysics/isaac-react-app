import React from "react";
import { connect } from "react-redux";
import { Inequality, makeInequality } from "inequality";
import katex from "katex";

class MenuItem {
    constructor(public type: string,
                public properties: any,
                public menu: { label: string, texLabel: boolean }) {}
}

interface InequalityModalProps {
    availableSymbols?: Array<string>;
    sketch?: Inequality;
    close: () => void;
}
export class InequalityModal extends React.Component<InequalityModalProps> {
    state: {
        sketch?: Inequality,
        activeMenu: string,
        activeSubMenu: string,
        mouseX: number,
        mouseY: number,
        menuOpen: boolean,
        editorState: any,
    };

    // Available symbols if any are specified
    availableSymbols?: Array<string> = [];

    // Drag ghost "image" thing
    private _ghost?: HTMLElement;

    // Call this to close the editor
    close: () => void;

    constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            sketch: props.sketch,
            activeMenu: "letters",
            activeSubMenu: "upperCaseLetters",
            mouseX: -1,
            mouseY: -1,
            menuOpen: false,
            editorState: {}
        }
        this.availableSymbols = props.availableSymbols;
        this.close = props.close;
    }

    componentDidMount() {
        const inequalityElement = document.getElementById('inequality-modal');
        const { sketch, p } = makeInequality(
            inequalityElement,
            window.innerWidth * Math.ceil(window.devicePixelRatio),
            window.innerHeight * Math.ceil(window.devicePixelRatio),
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
        sketch.onNewEditorState = (s: any) => {
            this.setState({ editorState: s });
            console.log("New editor state: ", s);
        };
        sketch.onCloseMenus = () => { console.log("closeMenus"); };
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = () => { };
        sketch.isTrashActive = () => { return false };

        this.setState({ sketch });

        // Firefox does not report coordinates correctly on drag, so we supplement them here.
        document.ondragover = (event) => {
            this.state.mouseX = event.clientX;
            this.state.mouseY = event.clientY;
        }

        this._ghost = document.createElement('div');
        this._ghost.style.opacity = "0";
        this._ghost.innerHTML = '_';
        this._ghost.id = 'the-ghost-of-inequality';
        document.body.appendChild(this._ghost);
        document.body.style.overflow = "hidden";
    }

    private generateLogicFunctionsItems(syntax = 'logic'): Array<MenuItem> {
        let labels: any = {
            logic: { and: "\\land", or: "\\lor", not: "\\lnot", equiv: "\\equiv", True: "\\mathsf{T}", False: "\\mathsf{F}" },
            binary: { and: "\\cdot", or: "+", not: "\\overline{x}", equiv: "\\equiv", True: "1", False: "0" }
        };
        return [
            new MenuItem("LogicBinaryOperation", { operation: "and" }, { label: labels[syntax]['and'], texLabel: true }),
            new MenuItem("LogicBinaryOperation", { operation: "or" }, { label: labels[syntax]['or'], texLabel: true }),
            new MenuItem("LogicNot", {}, { label: labels[syntax]['not'], texLabel: true }),
            new MenuItem("Relation", { relation: "equiv" }, { label: labels[syntax]['equiv'], texLabel: true }),
            new MenuItem("LogicLiteral", { value: true }, { label: labels[syntax]['True'], texLabel: true }),
            new MenuItem("LogicLiteral", { value: false }, { label: labels[syntax]['False'], texLabel: true }),
            new MenuItem("Brackets", { type: "round" }, { label: "(x)", texLabel: true })
        ];
    }

    private onMenuItemDragStart(spec: MenuItem, event: React.DragEvent) {
        event.dataTransfer.setData('text/plain', ''); // Somehow, Firefox needs some data to be set on the drag start event to continue firing drag events.
        event.dataTransfer.setDragImage(this._ghost as Element, event.clientX, event.clientY);
        if (this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(spec, event.clientX, event.clientY);
        }
    }

    private onMenuItemDrag(spec: MenuItem, event: React.DragEvent) {
        if (this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(spec, this.state.mouseX, this.state.mouseY);
        }
    }

    private onMenuItemDragEnd(_event: React.DragEvent) {
        if (this.state.sketch) {
            this.state.sketch.commitPotentialSymbol();
        }
    }

    // Fat arrow form for correct "this" binding (?!)
    private menuItem = (item: MenuItem, index: number) => {
        return <li key={index}
            dangerouslySetInnerHTML={{ __html: katex.renderToString(item.menu.label) }}
            draggable
            onDragStart={ event => this.onMenuItemDragStart(item, event) }
            onDrag={ event => this.onMenuItemDrag(item, event) }
            onDragEnd={ event => this.onMenuItemDragEnd(event) }
            />;
    }

    private onMenuTabClick(menuName: string) {
        if (this.state.activeMenu == menuName) {
            this.setState({ menuOpen: !this.state.menuOpen });
        } else {
            this.setState({ menuOpen: true, activeMenu: menuName});
        }
    }

    render() {
        let logicFunctionItems = this.generateLogicFunctionsItems();
        let upperCaseLetters: Array<MenuItem> = [];
        let lowerCaseLetters: Array<MenuItem> = [];
        let letters: Array<MenuItem> = [];
        let defaultMenu = true;

        if (this.availableSymbols && this.availableSymbols.length > 0) {
            console.log(`Parsing available symbols: ${this.availableSymbols}`);
            // Assuming these are only letters... might become more complicated in the future.
            letters = this.availableSymbols.map( l =>
                new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true })
                );
            defaultMenu = false;
        } else {
            console.log("No symbols available, generating default menu.");
            upperCaseLetters = "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( l =>
                new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true })
                );
            lowerCaseLetters = "abcdeghijklmnopqrsuvwxyz".split("").map( l =>
                new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true })
                );
        }
        
        let menu: JSX.Element;
        if (defaultMenu) {
            menu = 
            <nav className="inequality-ui">
                <div className={"inequality-ui menu-bar" + (this.state.menuOpen ? " open" : " closed")}>
                    {this.state.activeMenu == "letters" && <div className="top-menu">
                        <ul className="sub-menu-tabs">
                            <li className={this.state.activeSubMenu == "upperCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("A") }} onClick={() => this.setState({ activeSubMenu: "upperCaseLetters" })} />
                            <li className={this.state.activeSubMenu == "lowerCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("a") }} onClick={() => this.setState({ activeSubMenu: "lowerCaseLetters"})} />
                        </ul>
                        {(this.state.activeSubMenu == "upperCaseLetters") && <ul className="sub-menu">{
                            upperCaseLetters.map(this.menuItem)
                        }</ul>}
                        {(this.state.activeSubMenu == "lowerCaseLetters") && <ul className="sub-menu">{
                            lowerCaseLetters.map(this.menuItem)
                        }</ul>}
                    </div>}
                    {this.state.activeMenu == "functions" && <div className="top-menu">
                        <ul className="sub-menu">{
                            logicFunctionItems.map(this.menuItem)
                        }</ul>
                    </div>}
                </div>
                <div className="menu-tabs">
                    <ul>
                        <li className={this.state.activeMenu == "letters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("A\\ b") }} onClick={() => this.onMenuTabClick("letters")} />
                        <li className={this.state.activeMenu == "functions" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("\\wedge\\ \\lnot") }} onClick={() => this.onMenuTabClick("functions")} />
                    </ul>
                </div>
            </nav>
        } else {
            menu =
            <nav className="inequality-ui menubar">
                NOPE
            </nav>
        }

        return <div id="inequality-modal">
            { menu }
            <div className="inequality-ui confirm button" onClick={this.close}>OK</div>
            <div className="inequality-ui katex-preview" dangerouslySetInnerHTML={{ __html: katex.renderToString((this.state.editorState.result || { tex: ""}).tex) }}></div>
            <div className="inequality-ui centre button" onClick={() => { if (this.state.sketch) this.state.sketch.centre() }}>Centre</div>
        </div>;
    }
}
