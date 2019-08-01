import React from "react";
import { Inequality, makeInequality } from "inequality";
import katex from "katex";

class MenuItem {
    constructor(public type: string,
                public properties: any,
                public menu: { label: string, texLabel: boolean, className: string }) {}
}

interface InequalityModalProps {
    availableSymbols?: Array<string>;
    sketch?: Inequality;
    close: () => void;
    onEditorStateChange: (state: any) => void;
    initialEditorSymbols: any;
    syntax?: string;
    visible: boolean;
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

    // Drag ghost "image" thing
    private _ghost?: HTMLElement;

    private _vHexagon = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 173.5 200" style="enable-background:new 0 0 173.5 200;" xml:space="preserve">
            <polygon class="v-hexagon" points="0.7,50 0.7,150 87.3,200 173.9,150 173.9,50 87.3,0 " />
        </svg>
    `;
    private _tabTriangle = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 76 23" style="enable-background:new 0 0 76 23;" xml:space="preserve">
            <polygon points="0,0 76,0 38,23" class="tab-triangle"/>
        </svg>
    `

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
                logicFunctionItems: this.generateLogicFunctionsItems(props.syntax || "logic"),
                upperCaseLetters: [],
                lowerCaseLetters: [],
                letters: [],
            },
            defaultMenu: true,
        }

        if (props.availableSymbols && props.availableSymbols.length > 0) {
            // Assuming these are only letters... might become more complicated in the future.
            this.state.menuItems.letters = props.availableSymbols.map( l => new MenuItem("Symbol", { letter: l.trim() }, { label: l.trim(), texLabel: true, className: `symbol-${l.trim()}` }) );
            this.state.defaultMenu = false;
        } else {
            this.state.menuItems.upperCaseLetters = "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true, className: `symbol-${l}` }) );
            this.state.menuItems.lowerCaseLetters = "abcdeghijklmnopqrsuvwxyz".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true, className: `symbol-${l}` }) );
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
                logicSyntax: this.props.syntax || 'logic',
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
            const modal = document.getElementById('inequality-modal');
            if (modal) {
                this.setState({ editorState: s });
                this.props.onEditorStateChange(s);
            }
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
            new MenuItem("LogicBinaryOperation", { operation: "and" }, { label: labels[syntax]['and'], texLabel: true, className: 'and' }),
            new MenuItem("LogicBinaryOperation", { operation: "or" }, { label: labels[syntax]['or'], texLabel: true, className: 'or' }),
            new MenuItem("LogicNot", {}, { label: labels[syntax]['not'], texLabel: true, className: 'not' }),
            new MenuItem("Relation", { relation: "equiv" }, { label: labels[syntax]['equiv'], texLabel: true, className: 'equiv' }),
            new MenuItem("LogicLiteral", { value: true }, { label: labels[syntax]['True'], texLabel: true, className: 'true' }),
            new MenuItem("LogicLiteral", { value: false }, { label: labels[syntax]['False'], texLabel: true, className: 'false' }),
            new MenuItem("Brackets", { type: "round" }, { label: "\\small{(x)}", texLabel: true, className: 'brackets' })
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
            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(item.menu.label) }}
            draggable
            onDragStart={ event => this.onMenuItemDragStart(item, event) }
            onDrag={ event => this.onMenuItemDrag(item, event) }
            onDragEnd={ event => this.onMenuItemDragEnd(event) }
            className={ item.menu.className }
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
        let lettersMenu: JSX.Element;
        if (this.state.defaultMenu) {
            lettersMenu =
            <div className="top-menu letters">
                <ul className="sub-menu-tabs">
                    <li className={this.state.activeSubMenu == "upperCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("AB") }} onClick={() => this.setState({ menuOpen: true, activeSubMenu: "upperCaseLetters" })} />
                    <li className={this.state.activeSubMenu == "lowerCaseLetters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("ab") }} onClick={() => this.setState({ menuOpen: true, activeSubMenu: "lowerCaseLetters"})} />
                </ul>
                {(this.state.activeSubMenu == "upperCaseLetters") && <ul className="sub-menu uppercaseletters">{
                    this.state.menuItems.upperCaseLetters.map(this.menuItem)
                }</ul>}
                {(this.state.activeSubMenu == "lowerCaseLetters") && <ul className="sub-menu lowercaseletters">{
                    this.state.menuItems.lowerCaseLetters.map(this.menuItem)
                }</ul>}
            </div>
        } else {
            lettersMenu =
            <div className="top-menu function">
                <ul className="sub-menu letters">{
                    this.state.menuItems.letters.map(this.menuItem)
                }</ul>
            </div>
        }
        let menu: JSX.Element =
        <nav className="inequality-ui">
            <div className={"inequality-ui menu-bar" + (this.state.menuOpen ? " open" : " closed")}>
                {this.state.activeMenu == "letters" && lettersMenu}
                {this.state.activeMenu == "functions" && <div className="top-menu function">
                    <ul className="sub-menu">{
                        this.state.menuItems.logicFunctionItems.map(this.menuItem)
                    }</ul>
                </div>}
            </div>
            <div className="menu-tabs">
                <ul>
                    <li className={this.state.activeMenu == "letters" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString("A\\ b") }} onClick={() => this.onMenuTabClick("letters")} />
                    <li className={this.state.activeMenu == "functions" ? 'active' : 'inactive'} dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString(this.props.syntax == "logic" ? "\\wedge\\ \\lnot" : "\\cdot\\ \\overline{x}") }} onClick={() => this.onMenuTabClick("functions")} />
                </ul>
            </div>
        </nav>

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
