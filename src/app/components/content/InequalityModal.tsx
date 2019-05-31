import React from "react";
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
    onEditorStateChange: (state: any) => void;
    initialEditorSymbols: any;
}
export class InequalityModal extends React.Component<InequalityModalProps> {
    state: {
        sketch?: Inequality,
        activeMenu: string,
        activeSubMenu: string,
        trashActive: boolean,
        mouseX: number,
        mouseY: number,
        menuOpen: boolean,
        editorState: any,
        menuItems: { [key: string]: Array<MenuItem> },
        defaultMenu: boolean,
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
            trashActive: false,
            mouseX: -1,
            mouseY: -1,
            menuOpen: false,
            editorState: {},
            menuItems: {
                logicFunctionItems: this.generateLogicFunctionsItems(),
                upperCaseLetters: [],
                lowerCaseLetters: [],
                letters: [],
            },
            defaultMenu: true,
        }

        if (props.availableSymbols && props.availableSymbols.length > 0) {
            console.log(`Parsing available symbols: ${this.availableSymbols}`);
            // Assuming these are only letters... might become more complicated in the future.
            this.state.menuItems.letters = props.availableSymbols.map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true }) );
            this.state.defaultMenu = false;
        } else {
            console.log("No symbols available, generating default menu.");
            this.state.menuItems.upperCaseLetters = "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true }) );
            this.state.menuItems.lowerCaseLetters = "abcdeghijklmnopqrsuvwxyz".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true }) );
        }
        this.close = props.close;
    }

    componentDidMount() {
        const inequalityElement = document.getElementById('inequality-modal');
        const { sketch, p } = makeInequality(
            inequalityElement,
            window.innerWidth * Math.ceil(window.devicePixelRatio),
            window.innerHeight * Math.ceil(window.devicePixelRatio),
            this.props.initialEditorSymbols,
            {
                editorMode: 'logic',
                textEntry: false,
                fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf'
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
            this.props.onEditorStateChange(s);
            console.log("New editor state: ", s);
        };
        sketch.onCloseMenus = () => { this.setState({ menuOpen: false }) }; // TODO Maybe nice to have
        sketch.isUserPrivileged = () => true; // TODO Integrate with currentUser object
        sketch.onNotifySymbolDrag = () => { }; // This is probably irrelevant now
        sketch.isTrashActive = () => this.state.trashActive;

        this.setState({ sketch });

        // Firefox does not report coordinates correctly on drag, so we supplement them here.
        document.onmousemove = (event) => {
            this.state.mouseX = event.clientX;
            this.state.mouseY = event.clientY;
        }
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

    private onMenuItemDrag(spec: MenuItem, _event: React.DragEvent) {
        if (this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(spec, this.state.mouseX, this.state.mouseY);
        }
    }

    private onMenuItemDragEnd(_event: React.DragEvent) {
        if (this.state.sketch) {
            const rect = document.getElementById("inequality-trash")!.getBoundingClientRect();
            if (rect && rect.left <= this.state.mouseX && rect.right >= this.state.mouseX && rect.top <= this.state.mouseY && rect.bottom >= this.state.mouseY) {
                this.state.sketch.abortPotentialSymbol();
            } else {
                this.state.sketch.commitPotentialSymbol();
            }
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
        let menu: JSX.Element;
        if (this.state.defaultMenu) {
            menu = 
            <nav className="inequality-ui">
                <div className={"inequality-ui menu-bar" + (this.state.menuOpen ? " open" : " closed")}>
                    {/* {this.state.activeMenu == "numbers" && <div className="top-menu numbers">
                        <ul className="sub-menu">{
                            "0123456789".split("").map((n, i) => {
                                return this.menuItem(new MenuItem("Num", { significand: n }, { label: n, texLabel: true}), i);
                            })
                        }</ul>
                    </div>} */}
                    {this.state.activeMenu == "letters" && <div className="top-menu letters">
                        <ul className="sub-menu-tabs">
                            <li className={this.state.activeSubMenu == "upperCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("A") }} onClick={() => this.setState({ activeSubMenu: "upperCaseLetters" })} />
                            <li className={this.state.activeSubMenu == "lowerCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("a") }} onClick={() => this.setState({ activeSubMenu: "lowerCaseLetters"})} />
                        </ul>
                        {(this.state.activeSubMenu == "upperCaseLetters") && <ul className="sub-menu uppercaseletters">{
                            this.state.menuItems.upperCaseLetters.map(this.menuItem)
                        }</ul>}
                        {(this.state.activeSubMenu == "lowerCaseLetters") && <ul className="sub-menu lowercaseletters">{
                            this.state.menuItems.lowerCaseLetters.map(this.menuItem)
                        }</ul>}
                    </div>}
                    {this.state.activeMenu == "functions" && <div className="top-menu function">
                        <ul className="sub-menu">{
                            this.state.menuItems.logicFunctionItems.map(this.menuItem)
                        }</ul>
                    </div>}
                </div>
                <div className="menu-tabs">
                    <ul>
                        {/* <li className={this.state.activeMenu == "numbers" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: katex.renderToString("1\\ 2") }} onClick={() => this.onMenuTabClick("numbers")} /> */}
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

        const previewTexString = (this.state.editorState.result || { tex: ""}).tex;

        return <div id="inequality-modal">
            <div className="inequality-ui confirm button" onClick={this.close}>OK</div>
            <div className={`inequality-ui katex-preview ${previewTexString === "" ? "empty" : ""}`} dangerouslySetInnerHTML={{ __html: katex.renderToString(previewTexString) }}></div>
            <div className="inequality-ui centre button" onClick={() => { if (this.state.sketch) this.state.sketch.centre() }}>Centre</div>
            <div id="inequality-trash" className={"inequality-ui trash button" + (this.state.trashActive ? " active" : " inactive")}
                 onDragEnter={() => { this.setState({ trashActive: true }) }}
                 onDragLeave={() => { this.setState({ trashActive: false }) }}
                 onMouseEnter={() => { this.setState({ trashActive: true }) }}
                 onMouseLeave={() => { this.setState({ trashActive: false }) }} // This is a bit ridiculous but hey...
            >Trash</div>
            <div className="beta-badge">beta</div>
            { menu }
        </div>;
    }
}
