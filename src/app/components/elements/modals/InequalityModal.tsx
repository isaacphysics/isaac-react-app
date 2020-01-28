/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";
import {Inequality, makeInequality, WidgetSpec} from "inequality";
import katex from "katex";

class MenuItem {
    public type: string;
    public properties: any;
    public children?: any;
    public menu: { label: string; texLabel: boolean; className: string };

    public constructor(
        type: string,
        properties: any,
        menu: { label: string; texLabel: boolean; className: string }) {

        this.type = type;
        this.properties = properties;
        this.menu = menu;
    }
}

interface InequalityModalProps {
    availableSymbols?: string[];
    sketch?: Inequality;
    close: () => void;
    onEditorStateChange: (state: any) => void;
    initialEditorSymbols: any;
    editorMode?: string;
    logicSyntax?: string;
    visible: boolean;
}
export class InequalityModal extends React.Component<InequalityModalProps> {
    public state: {
        sketch?: Inequality | null;
        activeMenu: string;
        activeSubMenu: string;
        trashActive: boolean;
        menuOpen: boolean;
        editorState: any;
        menuItems: { [key: string]: MenuItem[] };
        defaultMenu: boolean;
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

    private _previousCursor?: { x: number; y: number } | null = null;

    private _disappearingMenuItem?: HTMLElement | null = null;
    private _movingMenuItem?: HTMLElement | null = null;
    private _movingMenuBar?: HTMLElement | null = null;
    private _potentialSymbolSpec?: MenuItem | null = null;

    private _greekLetterMap: { [letter: string]: string } = {"alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "varepsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ", "iota": "ι", "kappa": "κ", "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "omicron": "ο", "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "upsilon": "υ", "phi": "ϕ", "chi": "χ", "psi": "ψ", "omega": "ω", "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ", "Lambda": "Λ", "Xi": "Ξ", "Pi": "Π", "Sigma": "Σ", "Upsilon": "Υ", "Phi": "Φ", "Psi": "Ψ", "Omega": "Ω"};
    private _reverseGreekLetterMap: { [letter: string]: string } = {};
    private _lowerCaseGreekLetters = ["alpha", "beta", "gamma", "delta", "varepsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"];
    private _upperCaseGreekLetters = ["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega"];


    // Call this to close the editor
    public close: () => void;

    public constructor(props: InequalityModalProps) {
        super(props);
        this.state = {
            sketch: props.sketch,
            activeMenu: "letters",
            activeSubMenu: "upperCaseLetters",
            trashActive: false,
            menuOpen: false,
            editorState: {},
            menuItems: {
                logicFunctionItems: this.generateLogicFunctionsItems(props.logicSyntax || "logic"),
                upperCaseLetters: [],
                lowerCaseLetters: [],
                upperCaseGreekLetters: [],
                lowerCaseGreekLetters: [],
                letters: [],
            },
            defaultMenu: true,
        }

        this._reverseGreekLetterMap = Object.fromEntries(Object.entries(this._greekLetterMap).map(e => [e[1], e[0]]));

        if (props.availableSymbols && props.availableSymbols.length > 0) {
            // Assuming these are only letters... might become more complicated in the future.
            this.state.menuItems.letters = props.availableSymbols.map( l => {
                let letter = l.trim();
                let parts = letter.split('_');
                if (parts.length > 1) {
                    let label = `${parts[0]}_${parts[1]}`.replace(new RegExp(`${Object.keys(this._greekLetterMap).join('|')}`), m => this._greekLetterMap[m]);
                    let first = this.makeLetterMenuItem(this._greekLetterMap[parts[0]] || parts[0], label);
                    let second = this.makeLetterMenuItem(this._greekLetterMap[parts[1]] || parts[1], this._greekLetterMap[parts[1]] ? '\\' + parts[1] : parts[1]);
                    first['children'] = { subscript: second };
                    return first;
                } else {
                    return this.makeLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter);
                }
            });
            this.state.defaultMenu = false;
        } else {
            if (props.editorMode === 'logic') {
                // T and F are reserved in logic. The jury is still out on t and f.
                this.state.menuItems.upperCaseLetters = "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( letter => this.makeLetterMenuItem(letter) );
                this.state.menuItems.lowerCaseLetters = "abcdeghijklmnopqrsuvwxyz".split("").map( letter => this.makeLetterMenuItem(letter) );
            } else {
                // Assuming editorMode === 'maths'
                this.state.menuItems.upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map( letter => this.makeLetterMenuItem(letter) );
                this.state.menuItems.lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz".split("").map( letter => this.makeLetterMenuItem(letter) );
                this.state.menuItems.upperCaseGreekLetters = this._upperCaseGreekLetters.map( letter => this.makeLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter) );
                this.state.menuItems.lowerCaseGreekLetters = this._lowerCaseGreekLetters.map( letter => this.makeLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter) );
            }
        }
        this.close = () => {
            props.close();
        }
    }

    public componentDidMount() {
        const inequalityElement = document.getElementById('inequality-modal') as HTMLElement;
        const { sketch, p } = makeInequality(
            inequalityElement,
            window.innerWidth * Math.ceil(window.devicePixelRatio),
            window.innerHeight * Math.ceil(window.devicePixelRatio),
            this.props.initialEditorSymbols,
            {
                editorMode: this.props.editorMode || 'logic',
                logicSyntax: this.props.logicSyntax || 'logic',
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
                // TODO: Preprocess state to convert greek letters back to letter names
                if (s['result'] && s['result']['tex']) {
                    s['result']['tex'] = s['result']['tex'].split('').map((l: string) => this._reverseGreekLetterMap[l] ? '\\' + this._reverseGreekLetterMap[l] : l).join('');
                }
                if (s['result'] && s['result']['python']) {
                    s['result']['python'] = s['result']['python'].split('').map((l: string) => this._reverseGreekLetterMap[l] || l).join('');
                }
                if (s['result'] && s['result']['uniqueSymbols']) {
                    s['result']['uniqueSymbols'] = s['result']['uniqueSymbols'].split('').map((l: string) => this._reverseGreekLetterMap[l] || l).join('');
                }
                console.log(s);
                this.setState({ editorState: s });
                this.props.onEditorStateChange(s);
            }
        };
        sketch.onCloseMenus = () => { /*this.setState({ menuOpen: false })*/ }; // TODO Maybe nice to have
        sketch.isUserPrivileged = () => true; // TODO Integrate with currentUser object
        sketch.onNotifySymbolDrag = () => { }; // This is probably irrelevant now
        sketch.isTrashActive = () => this.state.trashActive;

        this.setState({ sketch });

        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = '100vw';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.touchAction = 'none';
        document.body.style.overflow = "hidden";
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.touchAction = 'none';

        inequalityElement.addEventListener('mousedown', this.onMouseDown.bind(this), { passive: false } );
        inequalityElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false } );
        inequalityElement.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: false } );
        inequalityElement.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false } );
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.addEventListener('mouseup', this.onCursorMoveEnd.bind(this), { passive: true } );
        document.body.addEventListener('touchend', this.onCursorMoveEnd.bind(this), { passive: true } );
    }

    public componentWillUnmount() {
        const inequalityElement = document.getElementById('inequality-modal') as HTMLElement;
        inequalityElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
        inequalityElement.removeEventListener('touchstart', this.onTouchStart.bind(this));
        inequalityElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
        inequalityElement.removeEventListener('touchmove', this.onTouchMove.bind(this));
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.removeEventListener('mouseup', this.onCursorMoveEnd.bind(this));
        document.body.removeEventListener('touchend', this.onCursorMoveEnd.bind(this));

        if (this.state.sketch) {
            this.setState({ sketch: {
                ...this.state.sketch,
                onNewEditorState: (s: any) => null,
                onCloseMenus: () => null,
                isUserPrivileged: () => false, // TODO Integrate with currentUser object
                onNotifySymbolDrag: () => null, // This is probably irrelevant now
                isTrashActive: () => false,
            }});
            this.setState({ sketch: null });
        }
        if (inequalityElement) {
            inequalityElement.removeChild(inequalityElement.getElementsByTagName('canvas')[0]);
        }

        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.touchAction = 'auto';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = 'auto';
    }

    private makeLetterMenuItem(letter: string, label?: string) {
        return new MenuItem("Symbol", { letter: letter }, { label: label || letter, texLabel: true, className: `symbol-${letter} menu-item` });
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
                this._movingMenuItem.style.pointerEvents = 'none';
                document.body.appendChild(this._movingMenuItem);

                this._disappearingMenuItem = menuItem as HTMLElement;
                this._disappearingMenuItem.style.opacity = '0';

                this._movingMenuBar = menuItem.closest('.sub-menu') as HTMLElement;
            }
        }
    }

    private generateLogicFunctionsItems(syntax = 'logic'): MenuItem[] {
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

    // WARNING Cursor coordinates on mobile are floating point and this makes
    // math sad, therefore ROUND EVERYTHING OR FACE MADNESS

    private onMouseDown(e: MouseEvent) {
        // preventDefault here to stop selection on desktop
        e.preventDefault();
        if (!this.state.sketch) {
            return;
        }
        this._previousCursor = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
        const element = document.elementFromPoint(this._previousCursor.x, this._previousCursor.y);
        this.prepareAbsoluteElement(element);
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, this._previousCursor.x, this._previousCursor.y);
        }
    }

    private onTouchStart(e: TouchEvent) {
        // DO NOT preventDefault here
        if (!this.state.sketch) {
            return;
        }
        this._previousCursor = { x: Math.round(e.touches[0].clientX), y: Math.round(e.touches[0].clientY) };
        const element = document.elementFromPoint(this._previousCursor.x, this._previousCursor.y);
        this.prepareAbsoluteElement(element);
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, this._previousCursor.x, this._previousCursor.y);
        }
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.state.sketch) {
            return;
        }
        this.handleMove(e.target as HTMLElement, Math.round(e.clientX), Math.round(e.clientY));
    }

    private onTouchMove(e: TouchEvent) {
        // preventDefault here to stop iOS' elastic-banding while moving around (messes with coordinates)
        e.preventDefault();
        if (!this.state.sketch) {
            return;
        }
        this.handleMove(e.target as HTMLElement, Math.round(e.touches[0].clientX), Math.round(e.touches[0].clientY));
    }

    private onCursorMoveEnd(e: MouseEvent | TouchEvent) {
        // No need to run if we are not dealing with a menu item.
        if (!this.state.sketch || !this._movingMenuItem) {
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
        void e;
    }

    private handleMove(_target: HTMLElement, x: number, y: number) {
        const trashCan = document.getElementById('inequality-trash') as Element;
        if (trashCan) {
            const trashCanRect = trashCan.getBoundingClientRect();
            if (trashCanRect && x >= trashCanRect.left && x <= trashCanRect.right && y >= trashCanRect.top && y <= trashCanRect.bottom) {
                trashCan.classList.add('active');
                this.setState({ trashActive: true });
            } else {
                trashCan.classList.remove('active');
                this.setState({ trashActive: false });
            }
        }

        // No need to run any further if we are not dealing with a menu item.
        if (!this._movingMenuItem) {
            return;
        }

        if (this._previousCursor) {
            const dx =  x - this._previousCursor.x;
            if (this._movingMenuBar) {
                const menuBarRect = this._movingMenuBar.getBoundingClientRect();
                const menuItems = this._movingMenuBar.getElementsByClassName('menu-item');
                const lastMenuItem = menuItems.item(menuItems.length-1);
                if (lastMenuItem) {
                    const newUlLeft = Math.min(0, menuBarRect.left + dx);
                    const lastMenuItemRect = lastMenuItem.getBoundingClientRect();
                    if (lastMenuItemRect.right > window.innerWidth || dx >= 0) {
                        this._movingMenuBar.style.left = `${newUlLeft}px`;
                    }
                }
            }
            this._movingMenuItem.style.top = `${y}px`;
            this._movingMenuItem.style.left = `${x}px`;
        }
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, x, y);
        }

        this._previousCursor = { x, y };
    }

    private onMenuTabClick(menuName: string) {
        if (this.state.activeMenu == menuName) {
            this.setState({ menuOpen: !this.state.menuOpen });
        } else {
            this.setState({ menuOpen: true, activeMenu: menuName});
        }
    }

    private setSubMenuOpen(submenu: string) {
        this.setState({ menuOpen: true, activeSubMenu: submenu})
    }

    public render() {
        let lettersMenu: JSX.Element;
        if (this.state.defaultMenu) {
            lettersMenu =
            <div className="top-menu letters">
                <ul className="sub-menu-tabs">
                    <li className={this.state.activeSubMenu == "upperCaseLetters" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("AB") }}
                        onClick={() => this.setSubMenuOpen("upperCaseLetters") }
                        onKeyUp={() => this.setSubMenuOpen("upperCaseLetters") }
                    />
                    <li className={this.state.activeSubMenu == "lowerCaseLetters" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("ab") }}
                        onClick={() => this.setSubMenuOpen("lowerCaseLetters") }
                        onKeyUp={() => this.setSubMenuOpen("lowerCaseLetters") }
                    />
                    {this.props.editorMode === 'maths' &&
                        <li className={this.state.activeSubMenu == "upperCaseGreekLetters" ? 'active' : 'inactive'}
                            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("ΓΔ") }}
                            onClick={() => this.setSubMenuOpen("upperCaseGreekLetters") }
                            onKeyUp={() => this.setSubMenuOpen("upperCaseGreekLetters") }
                        />}
                    {this.props.editorMode === 'maths' &&
                        <li className={this.state.activeSubMenu == "lowerCaseGreekLetters" ? 'active' : 'inactive'}
                            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("αβ") }}
                            onClick={() => this.setSubMenuOpen("lowerCaseGreekLetters") }
                            onKeyUp={() => this.setSubMenuOpen("lowerCaseGreekLetters") }
                        />}
                </ul>
                {this.state.activeSubMenu == "upperCaseLetters" && <ul className="sub-menu uppercaseletters">{
                    this.state.menuItems.upperCaseLetters.map(this.menuItem)
                }</ul>}
                {this.state.activeSubMenu == "lowerCaseLetters" && <ul className="sub-menu lowercaseletters">{
                    this.state.menuItems.lowerCaseLetters.map(this.menuItem)
                }</ul>}

                {this.props.editorMode === 'maths' && this.state.activeSubMenu == "upperCaseGreekLetters" && <ul className="sub-menu uppercasegreekletters">{
                    this.state.menuItems.upperCaseGreekLetters.map(this.menuItem)
                }</ul>}
                {this.props.editorMode === 'maths' && this.state.activeSubMenu == "lowerCaseGreekLetters" && <ul className="sub-menu lowercasegreekletters">{
                    this.state.menuItems.lowerCaseGreekLetters.map(this.menuItem)
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
                    <li className={this.state.activeMenu == "letters" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString("A\\ b") }}
                        onClick={() => this.onMenuTabClick("letters")}
                        onKeyUp={() => this.onMenuTabClick("letters")}
                    />
                    <li className={this.state.activeMenu == "functions" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString(this.props.logicSyntax == "logic" ? "\\wedge\\ \\lnot" : "\\cdot\\ \\overline{x}") }}
                        onClick={() => this.onMenuTabClick("functions")}
                        onKeyUp={() => this.onMenuTabClick("functions")}
                    />
                </ul>
            </div>
        </nav>

        const previewTexString = (this.state.editorState.result || { tex: ""}).tex;

        return <div id="inequality-modal">
            <div
                className="inequality-ui confirm button"
                role="button" tabIndex={-1}
                onClick={this.close}
                onKeyUp={this.close}>OK</div>
            <div className={`inequality-ui katex-preview ${previewTexString === "" ? "empty" : ""}`} dangerouslySetInnerHTML={{ __html: katex.renderToString(previewTexString) }}></div>
            <div
                className="inequality-ui centre button"
                role="button" tabIndex={-1}
                onClick={() => { if (this.state.sketch) this.state.sketch.centre() }}
                onKeyUp={() => { if (this.state.sketch) this.state.sketch.centre() }}
            >Centre</div>
            <div id="inequality-trash" className="inequality-ui trash button">Trash</div>
            <div className="beta-badge">beta</div>
            { menu }
        </div>;
    }
}
