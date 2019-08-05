import React from "react";
import { Inequality, makeInequality, WidgetSpec } from "inequality";
import katex from "katex";
import { number } from "prop-types";

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
        sketch?: Inequality | null,
        activeMenu: string,
        activeSubMenu: string,
        trashActive: boolean,
        menuOpen: boolean,
        editorState: any,
        menuItems: { [key: string]: Array<MenuItem> },
        defaultMenu: boolean
    };

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

    private _previousCursor?: { x: number, y: number } | null = null;

    private _disappearingMenuItem?: HTMLElement | null = null;
    private _movingMenuItem?: HTMLElement | null = null;
    private _movingMenuBar?: HTMLElement | null = null;
    private _potentialSymbolSpec?: MenuItem | null = null;

    // Call this to close the editor
    close: () => void;

    constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            sketch: props.sketch,
            activeMenu: "letters",
            activeSubMenu: "upperCaseLetters",
            trashActive: false,
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
            this.state.menuItems.letters = props.availableSymbols.map( l => new MenuItem("Symbol", { letter: l.trim() }, { label: l.trim(), texLabel: true, className: `symbol-${l.trim()} menu-item` }) );
            this.state.defaultMenu = false;
        } else {
            this.state.menuItems.upperCaseLetters = "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true, className: `symbol-${l} menu-item` }) );
            this.state.menuItems.lowerCaseLetters = "abcdeghijklmnopqrsuvwxyz".split("").map( l => new MenuItem("Symbol", { letter: l }, { label: l, texLabel: true, className: `symbol-${l} menu-item` }) );
        }
        this.close = props.close;
    }

    componentDidMount() {
        const inequalityElement = document.getElementById('inequality-modal') as Node;
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

        this.state.sketch = sketch;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.documentElement.style.height = window.innerHeight.toString() + "px";
        document.body.style.height = window.innerHeight.toString() + "px";

        document.addEventListener('mousedown', this.onMouseDown.bind(this), true);
        document.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        document.addEventListener('mouseup', this.onCursorMoveEnd.bind(this), false);
        document.addEventListener('touchend', this.onCursorMoveEnd.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
        document.removeEventListener('touchstart', this.onTouchStart.bind(this), false);
        document.removeEventListener('mouseup', this.onCursorMoveEnd.bind(this), false);
        document.removeEventListener('touchend', this.onCursorMoveEnd.bind(this), false);
        document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.removeEventListener('touchmove', this.onTouchMove.bind(this), false);

        if (this.state.sketch) {
            this.state.sketch.onNewEditorState = (s: any) => null;
            this.state.sketch.onCloseMenus = () => null;
            this.state.sketch.isUserPrivileged = () => false; // TODO Integrate with currentUser object
            this.state.sketch.onNotifySymbolDrag = () => null; // This is probably irrelevant now
            this.state.sketch.isTrashActive = () => false;
            this.state.sketch = null;
        }
        const inequalityElement = document.getElementById('inequality-modal');
        if (inequalityElement) {
            inequalityElement.removeChild(document.getElementsByTagName('canvas')[0]);
        }
        document.documentElement.style.height = null;
        document.documentElement.style.overflow = null;
        document.body.style.height = null;
        document.body.style.overflow = null;
    }

    private prepareAbsoluteElement(element?: Element | null) {
        if (element) {
            const menuItem = element.closest('li.menu-item');
            if (menuItem) {
                this._potentialSymbolSpec = JSON.parse(menuItem.getAttribute('data-item') || '');
                this._movingMenuItem = (menuItem.cloneNode(true) as HTMLElement);
                this._movingMenuItem.id = 'moving-menu-item';
                this._movingMenuItem.style.position = 'absolute';
                this._movingMenuItem.style.opacity = '0.5';
                this._movingMenuItem.style.zIndex = '255';
                document.body.appendChild(this._movingMenuItem);

                this._disappearingMenuItem = menuItem as HTMLElement;
                this._disappearingMenuItem.style.opacity = '0';

                this._movingMenuBar = menuItem.closest('.sub-menu') as HTMLElement;
            }
        }
    }

    private onMouseDown(e: MouseEvent) {
        e.preventDefault();
        this._previousCursor = { x: e.pageX, y: e.pageY };
        const element = document.elementFromPoint(this._previousCursor.x, this._previousCursor.y);
        this.prepareAbsoluteElement(element);
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, this._previousCursor.x, this._previousCursor.y);
        }
    }

    private onTouchStart(e: TouchEvent) {
        e.preventDefault();
        this._previousCursor = { x: e.touches[0].pageX, y: e.touches[0].pageY };
        const element = document.elementFromPoint(this._previousCursor.x, this._previousCursor.y);
        this.prepareAbsoluteElement(element);
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, this._previousCursor.x, this._previousCursor.y);
        }
    }

    private onCursorMoveEnd(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        // No need to run if we are not dealing with a menu item.
        if (!this._movingMenuItem) {
            return;
        }

        const menuTabs = document.getElementById('inequality-menu-tabs') as Element;
        const menuTabsRect = menuTabs ? menuTabs.getBoundingClientRect() : null;

        const trashCan = document.getElementById('inequality-trash') as Element;
        const trashCanRect = trashCan ? trashCan.getBoundingClientRect() : null;

        if (this._previousCursor && this.state.sketch) {
            if (menuTabsRect && this._previousCursor.y <= menuTabsRect.top) {
                this.state.sketch.abortPotentialSymbol();
            } else if (trashCanRect &&
                this._previousCursor.x >= trashCanRect.left &&
                this._previousCursor.x <= trashCanRect.right &&
                this._previousCursor.y >= trashCanRect.top &&
                this._previousCursor.y <= trashCanRect.bottom) {
                this.state.sketch.abortPotentialSymbol();
            } else {
                this.state.sketch.commitPotentialSymbol();
            }
        }

        this._previousCursor = null;
        if (this._movingMenuItem) {
            document.body.removeChild(this._movingMenuItem);
        }
        if (this._disappearingMenuItem) {
            this._disappearingMenuItem.style.opacity = '1';
            this._disappearingMenuItem = null;
        }
        this._movingMenuItem = null;
        this._movingMenuBar = null;
        this._potentialSymbolSpec = null;
    }

    private onMouseMove(e: MouseEvent) {
        e.preventDefault();
        this.handleMove(e.target as HTMLElement, e.pageX, e.pageY);
    }

    private onTouchMove(e: TouchEvent) {
        e.preventDefault();
        this.handleMove(e.target as HTMLElement, e.touches[0].pageX, e.touches[0].pageY);
    }

    private handleMove(_target: HTMLElement, x: number, y: number) {
        const trashCan = document.getElementById('inequality-trash') as Element;
        const trashCanRect = trashCan ? trashCan.getBoundingClientRect() : null;
        if (trashCanRect && x >= trashCanRect.left && x <= trashCanRect.right && y >= trashCanRect.top && y <= trashCanRect.bottom) {
            trashCan.classList.add('active');
            this.state.trashActive = true;
        } else {
            trashCan.classList.remove('active');
            this.state.trashActive = false;
        }

        // No need to run any further if we are not dealing with a menu item.
        if (!this._movingMenuItem) {
            return;
        }

        if (this._previousCursor) {
            const dx =  x - this._previousCursor.x;
            const dy = -y + this._previousCursor.y;
            if (this._movingMenuBar) {
                const newUlLeft = Math.min(0, parseInt((this._movingMenuBar.style.marginLeft || '0').replace(/[^-\d]/g, '')) + dx);
                this._movingMenuBar.style.marginLeft = `${newUlLeft}px`;
            }
            this._movingMenuItem.style.top = `${y}px`;
            this._movingMenuItem.style.left = `${x}px`;
        }
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, x, y);
        }

        this._previousCursor = { x, y };
    }

    private generateLogicFunctionsItems(syntax = 'logic'): Array<MenuItem> {
        let labels: any = {
            logic: { and: "\\land", or: "\\lor", not: "\\lnot", equiv: "\\equiv", True: "\\mathsf{T}", False: "\\mathsf{F}" },
            binary: { and: "\\cdot", or: "+", not: "\\overline{x}", equiv: "\\equiv", True: "1", False: "0" }
        };
        return [
            new MenuItem("LogicBinaryOperation", { operation: "and" }, { label: labels[syntax]['and'], texLabel: true, className: 'and menu-item' }),
            new MenuItem("LogicBinaryOperation", { operation: "or" }, { label: labels[syntax]['or'], texLabel: true, className: 'or menu-item' }),
            new MenuItem("LogicNot", {}, { label: labels[syntax]['not'], texLabel: true, className: 'not menu-item' }),
            new MenuItem("Relation", { relation: "equiv" }, { label: labels[syntax]['equiv'], texLabel: true, className: 'equiv menu-item' }),
            new MenuItem("LogicLiteral", { value: true }, { label: labels[syntax]['True'], texLabel: true, className: 'true menu-item' }),
            new MenuItem("LogicLiteral", { value: false }, { label: labels[syntax]['False'], texLabel: true, className: 'false menu-item' }),
            new MenuItem("Brackets", { type: "round" }, { label: "\\small{(x)}", texLabel: true, className: 'brackets menu-item' })
        ];
    }

    // Fat arrow form for correct "this" binding (?!)
    private menuItem = (item: MenuItem, index: number) => {
        return <li key={index}
            data-item={JSON.stringify(item)} // TODO Come up with a better way than this.
            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(item.menu.label) }}
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
            <div id="inequality-menu-tabs" className="menu-tabs">
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
            <div id="inequality-trash" className="inequality-ui trash button">Trash</div>
            <div className="beta-badge">beta</div>
            { menu }
        </div>;
    }
}
