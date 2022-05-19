/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { createRef, FormEvent } from "react";
import {Inequality, makeInequality, WidgetSpec} from "inequality";
import katex from "katex";
import _uniqWith from 'lodash/uniqWith';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import {parsePseudoSymbolicAvailableSymbols, sanitiseInequalityState} from "../../../services/questions";
import {ACTION_TYPE, GREEK_LETTERS_MAP} from '../../../services/constants';
import { IsaacContentValueOrChildren } from '../../content/IsaacContentValueOrChildren';
import { ContentDTO } from '../../../../IsaacApiTypes';
import { isDefined } from '../../../services/miscUtils';
import { store } from '../../../state/store';
import { closeActiveModal, openActiveModal } from "../../../state/actions";
import { connect } from "react-redux";
import { ActiveModal } from "../../../../IsaacAppTypes";
import { PageFragment } from "../PageFragment";
import { Input } from "reactstrap";

class MenuItem {
    public type: string;
    public properties: any;
    public children?: any;
    public menu: { label: string; texLabel: boolean; className: string; fontSize?: string };

    public constructor(
        type: string,
        properties: any,
        menu: { label: string; texLabel: boolean; className: string; fontSize?: string }) {

        this.type = type;
        this.properties = properties;
        this.menu = menu;
        if (this.menu.className.indexOf('menu-item') < 0) {
            this.menu.className += ' menu-item';
        }
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
    questionDoc?: ContentDTO;
    showHelpModal: (editorModal: string) => {
        type: ACTION_TYPE;
        activeModal: ActiveModal;
    };
}

interface InequalityModalState {
    sketch: Inequality;
    activeMenu: string;
    activeSubMenu: string;
    trashActive: boolean;
    menuOpen: boolean;
    showQuestionReminder: boolean;
    editorState: any;
    menuItems: {
        upperCaseLetters: MenuItem[];
        lowerCaseLetters: MenuItem[];
        upperCaseGreekLetters: MenuItem[];
        lowerCaseGreekLetters: MenuItem[];
        logicFunctionsItems: MenuItem[];
        mathsBasicFunctionsItems: MenuItem[];
        mathsTrigFunctions: MenuItem[];
        mathsHypFunctions: MenuItem[];
        mathsLogFunctions: MenuItem[];
        mathsDerivatives: MenuItem[];
        chemicalElements: MenuItem[];
        chemicalParticles: MenuItem[];
        // The following is for the pseudo-text-entry menu on /equality
        parsedChemicalElements: MenuItem[];
        chemicalStates: MenuItem[];
        chemicalOperations: MenuItem[];
        // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
        letters: MenuItem[];
        otherFunctions: MenuItem[];
    };
    defaultMenu: boolean;
    disableLetters: boolean;
    numberInputValue?: Nullable<number>;
    unparsedChemicalElements?: Nullable<string>;
}

interface InequalityHelpModalProps {
    editorMode: string;
}

const InequalityHelpModal = (props: InequalityHelpModalProps) => {
    const fragmentId = `eqn_editor_help_modal_${props.editorMode}`;
    return <>
        <PageFragment fragmentId={fragmentId}/>
        </>
}

class InequalityModalComponent extends React.Component<InequalityModalProps> {
    public state: InequalityModalState;

    private _vHexagon = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 173.5 200" style="enable-background:new 0 0 173.5 200;" class="v-hexagon" xml:space="preserve">
            <polygon points="0.7,50 0.7,150 87.3,200 173.9,150 173.9,50 87.3,0 " />
        </svg>
    `;
    private _tabTriangle = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 136 23" style="enable-background:new 0 0 76 23;" class="tab-triangle" xml:space="preserve">
            <polygon points="0,0 136,0 68,23" />
        </svg>
    `

    private _previousCursor?: { x: number; y: number } | null = null;

    private _disappearingMenuItem?: HTMLElement | null = null;
    private _movingMenuItem?: HTMLElement | null = null;
    private _movingMenuBar?: HTMLElement | null = null;
    private _potentialSymbolSpec?: MenuItem | null = null;

    private _greekLetterMap = GREEK_LETTERS_MAP;
    private _lowerCaseGreekLetters = ["alpha", "beta", "gamma", "delta", "varepsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"];
    private _upperCaseGreekLetters = ["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega"];

    private _trigFunctionNames = ["sin", "cos", "tan", "cosec", "sec", "cot", "arcsin", "arccos", "arctan", "arccosec", "arcsec", "arccot"];
    private _hypFunctionsNames = ["sinh", "cosh", "tanh", "cosech", "sech", "coth", "arccosech", "arcsech", "arccoth", "arcsinh", "arccosh", "arctanh"];
    private _logFunctionNames = ["ln", "log"];

    private _chemicalElements = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"];
    private _chemicalParticles: {[key: string]: { type: string; menu: { label: string; texLabel: boolean; className?: string; fontSize?: string }; properties: Record<string, unknown> } } = {
        alpha: {
            type: 'Particle',
            menu: { label: '\\alpha', texLabel: true },
            properties: { particle: 'α', type: 'alpha' }
        },
        beta: {
            type: 'Particle',
            menu: { label: '\\beta', texLabel: true },
            properties: { particle: 'β', type: 'beta' }
        },
        gamma: {
            type: 'Particle',
            menu: { label: '\\gamma', texLabel: true },
            properties: { particle: 'γ', type: 'gamma' }
        },
        neutrino: {
            type: 'Particle',
            menu: { label: '\\nu', texLabel: true },
            properties: { particle: 'ν', type: 'neutrino' }
        },
        antineutrino: {
            type: 'Particle',
            menu: { label: '\\bar{\\nu}', texLabel: true },
            properties: { particle: 'ν̅', type: 'antineutrino' }
        },
        proton: {
            type: 'Particle',
            menu: { label: '\\text{p}', texLabel: true },
            properties: { particle: 'p', type: 'proton' }
        },
        neutron: {
            type: 'Particle',
            menu: { label: '\\text{n}', texLabel: true },
            properties: { particle: 'n', type: 'neutron' }
        },
        electron: {
            type: 'Particle',
            menu: { label: '\\text{e}', texLabel: true },
            properties: { particle: 'e', type: 'electron' }
        }
    };

    private _differentialRegex = /^(Delta|delta|d)\s*(?:\^([0-9]+))?\s*([a-zA-Z]+(?:(?:_|\^).+)?)/;
    private _availableSymbols?: string[];

    private _inequalityModal = createRef<HTMLDivElement>();
    private _menuRef = createRef<HTMLDivElement>();

    // Call this to close the editor
    public close: () => void;

    public isUserPrivileged(): boolean {
        return true;
    }

    public constructor(props: InequalityModalProps) {
        super(props);

        this._availableSymbols = Array.from(new Set(parsePseudoSymbolicAvailableSymbols(props.availableSymbols))).filter(s => s.trim() !== '');

        this.state = {
            sketch: props.sketch as Inequality,
            activeMenu: "",
            activeSubMenu: props.editorMode === 'logic' ? "upperCaseLetters" : "lowerCaseLetters",
            trashActive: false,
            menuOpen: false,
            showQuestionReminder: true,
            editorState: {},
            menuItems: {
                upperCaseLetters: [],
                lowerCaseLetters: [],
                upperCaseGreekLetters: [],
                lowerCaseGreekLetters: [],
                logicFunctionsItems: [],
                mathsBasicFunctionsItems: [],
                mathsTrigFunctions: [],
                mathsHypFunctions: [],
                mathsLogFunctions: [],
                mathsDerivatives: [],
                // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
                letters: [],
                otherFunctions: [],
                chemicalElements: [],
                chemicalParticles: [],
                parsedChemicalElements: [],
                chemicalStates: [],
                chemicalOperations: [],
            },
            defaultMenu: true,
            disableLetters: props.availableSymbols?.includes('_no_alphabet') || false,
            numberInputValue: null,
            unparsedChemicalElements: null
        }

        this.close = () => {
            props.close();
        }

        this._handleKeyPress = this.handleKeyPress.bind(this);
        this._onMouseDown = this.onMouseDown.bind(this);
        this._onTouchStart = this.onTouchStart.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onTouchMove = this.onTouchMove.bind(this);
        this._onCursorMoveEnd = this.onCursorMoveEnd.bind(this);
    }

    private handleKeyPress(ev: KeyboardEvent) {
        if (ev.code === 'Escape') {
            this.close();
        }
    }

    private _handleKeyPress: (this: Window, e: KeyboardEvent) => void;
    private _onMouseDown: (this: HTMLElement, e: MouseEvent) => void;
    private _onTouchStart: (this: HTMLElement, e: TouchEvent) => void;
    private _onMouseMove: (this: HTMLElement, e: MouseEvent) => void;
    private _onTouchMove: (this: HTMLElement, e: TouchEvent) => void;
    private _onCursorMoveEnd: (this: HTMLElement, e: MouseEvent | TouchEvent) => void;

    public componentDidMount(): void {
        window.addEventListener('keyup', this._handleKeyPress);
        const inequalityElement = this._inequalityModal.current as HTMLDivElement; // document.getElementById('inequality-modal') as HTMLElement;
        const { sketch, p } = makeInequality(
            inequalityElement,
            window.innerWidth,
            window.innerHeight,
            this.props.initialEditorSymbols,
            {
                editorMode: this.props.editorMode || 'logic',
                logicSyntax: this.props.logicSyntax || 'logic',
                textEntry: false,
                fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf'
            }
        );
        if (!isDefined(sketch)) {
            throw new Error("Unable to initialize Inequality.");
        }

        sketch.log = {
            initialState: [],
            actions: [{
                event: "OPEN",
                timestamp: Date.now()
            }]
        };
        sketch.onNewEditorState = (state: any) => {
            const modal = this._inequalityModal.current as HTMLDivElement; // document.getElementById('inequality-modal');
            if (modal) {
                const newState = sanitiseInequalityState(state);
                this.setState((prevState: InequalityModalState) => ({ editorState: { ...prevState.editorState, ...newState } }));
                this.props.onEditorStateChange(newState);
            }
        };
        sketch.onCloseMenus = () => undefined; // { this.setState({ menuOpen: false }) };
        sketch.isUserPrivileged = () => this.isUserPrivileged();
        sketch.onNotifySymbolDrag = () => undefined; // This is probably irrelevant now
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

        inequalityElement.addEventListener('mousedown', this._onMouseDown);
        inequalityElement.addEventListener('touchstart', this._onTouchStart);
        inequalityElement.addEventListener('mousemove', this._onMouseMove);
        inequalityElement.addEventListener('touchmove', this._onTouchMove);
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.addEventListener('mouseup', this._onCursorMoveEnd);
        document.body.addEventListener('touchend', this._onCursorMoveEnd);

        const defaultMenuItems = {
            // ...this.state.menuItems,
            upperCaseLetters: [ ...(this.state.menuItems.upperCaseLetters || []) ],
            lowerCaseLetters: [ ...(this.state.menuItems.lowerCaseLetters || []) ],
            upperCaseGreekLetters: [ ...(this.state.menuItems.upperCaseGreekLetters || []) ],
            lowerCaseGreekLetters: [ ...(this.state.menuItems.lowerCaseGreekLetters || []) ],
            logicFunctionsItems: [ ...this.state.menuItems.logicFunctionsItems, ...(this.generateLogicFunctionsItems(this.props.logicSyntax || "logic")) ],
            mathsBasicFunctionsItems: this.generateMathsBasicFunctionsItems(),
            mathsTrigFunctions: [ ...this.state.menuItems.mathsTrigFunctions, ...this.generateMathsTrigFunctionsItems() ],
            mathsHypFunctions: [ ...this.state.menuItems.mathsHypFunctions, ...this.generateMathsHypFunctionsItems() ],
            mathsLogFunctions: [ ...this.state.menuItems.mathsLogFunctions, ...this.generateMathsLogFunctionsItems() ],
            mathsDerivatives: [ ...this.state.menuItems.mathsDerivatives, ...this.generateMathsDefaultDerivativesItems() ],
            chemicalStates: this.makeChemicalStatesMenuItems(),
            chemicalOperations: this.makeChemicalOperationsMenuItems(),
            // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
            // letters: [],
            // otherFunctions: [],
            // chemicalElements: [],
        };

        this.setState((prevState: InequalityModalState) => ({
            menuItems: {
                ...prevState.menuItems,
                ...defaultMenuItems
            }
        }));

        if (isDefined(this._availableSymbols) && Array.isArray(this._availableSymbols) && this._availableSymbols.length > 0) {
            // ~~~ Assuming these are only letters... might become more complicated in the future.
            // THE FUTURE IS HERE! Sorry.
            const customMenuItems = {
                mathsDerivatives: this.state.menuItems.mathsDerivatives,
                letters: new Array<MenuItem>(),
                otherFunctions: new Array<MenuItem>(),
                chemicalElements: new Array<MenuItem>(),
            };

            for (const l of this._availableSymbols) {
                const availableSymbol = l.trim();
                if (availableSymbol.endsWith('()')) {
                    // Functions
                    const functionName = availableSymbol.replace('()', '');
                    if (this._trigFunctionNames.includes(functionName)) {
                        customMenuItems.otherFunctions.push(this.makeMathsTrigFunctionItem(functionName));
                    } else if (this._hypFunctionsNames.includes(functionName)) {
                        customMenuItems.otherFunctions.push(this.makeMathsTrigFunctionItem(functionName));
                    } else if (this._logFunctionNames.includes(functionName)) {
                        customMenuItems.otherFunctions.push(this.makeMathsLogFunctionItem(functionName));
                    } else {
                        // What
                        // eslint-disable-next-line no-console
                        console.warn(`Could not parse available symbol "${availableSymbol} as a function"`);
                    }
                } else if (availableSymbol.startsWith('Derivative')) {
                    const items = this.generateMathsDerivativeAndLetters(availableSymbol);
                    if (items.derivative) {
                        customMenuItems.mathsDerivatives.push(...items.derivative);
                        customMenuItems.letters.push(...items.derivative);
                    }
                    if (items.letters) {
                        customMenuItems.letters.push(...items.letters);
                    }
                } else if (this._differentialRegex.test(availableSymbol)) {
                    const items = this.generateMathsDifferentialAndLetters(availableSymbol);
                    if (items.differential) {
                        customMenuItems.mathsDerivatives.push(items.differential);
                        customMenuItems.letters.push(items.differential);
                    }
                    if (items.letters) {
                        customMenuItems.letters.push(...items.letters);
                    }
                } else {
                    // Everything else is a letter, unless we are doing chemistry
                    if (this.props.editorMode === 'chemistry') {
                        // Available chemical elements
                        const item = this.makeChemicalElementMenuItem(availableSymbol);
                        if (item) {
                            customMenuItems.chemicalElements.push(item);
                        }
                    } else {
                        const item = this.makeLetterMenuItem(availableSymbol);
                        if (isDefined(item)) {
                            customMenuItems.letters.push(item);
                        }
                    }
                }
            }
            this.setState((prevState: InequalityModalState) => ({
                menuItems: {
                    ...prevState.menuItems,
                    mathsDerivatives: [ ...prevState.menuItems.mathsDerivatives, ...customMenuItems.mathsDerivatives ],
                    letters: _uniqWith([ ...prevState.menuItems.letters, ...customMenuItems.letters ], (a, b) => _isEqual(a, b))/*.sort((a: MenuItem, b: MenuItem) => {
                        if ((a.type === 'Symbol' && b.type === 'Symbol') || (a.type !== 'Symbol' && b.type !== 'Symbol')) {
                            return a.menu.label.localeCompare(b.menu.label);
                        }
                        if (a.type === 'Derivative' && b.type === 'Differential') {
                            return -1;
                        } else if (a.type === 'Differential' && b.type === 'Derivative') {
                            return 1;
                        }
                        if (a.type === 'Symbol' && b.type !== 'Symbol') {
                            return -1;
                        } else if (a.type !== 'Symbol' && b.type === 'Symbol') {
                            return 1;
                        }
                        return 0;
                    })*/,
                    otherFunctions: [ ...prevState.menuItems.otherFunctions, ...customMenuItems.otherFunctions ],
                    chemicalElements: [ ...prevState.menuItems.chemicalElements, ...customMenuItems.chemicalElements ],
                },
                defaultMenu: false
            }));
        } else {
            if (this.props.editorMode === 'logic') {
                // T and F are reserved in logic. The jury is still out on t and f.
                this.setState((prevState: InequalityModalState) => ({
                    menuItems: {
                        ...prevState.menuItems,
                        upperCaseLetters: "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map( letter => this.makeSingleLetterMenuItem(letter) ),
                        lowerCaseLetters: "abcdeghijklmnopqrsuvwxyz".split("").map( letter => this.makeSingleLetterMenuItem(letter) ),
                    }
                }));
            } else if (this.props.editorMode === 'chemistry') {
                this.setState((prevState: InequalityModalState) => ({
                    menuItems: {
                        ...prevState.menuItems,
                        chemicalElements: this._chemicalElements.map( element => this.makeChemicalElementMenuItem(element) ),
                        chemicalParticles: Object.keys(this._chemicalParticles).map( element => this.makeChemicalElementMenuItem(element)),
                    }
                }));
            } else {
                // Assuming editorMode === 'maths'
                this.setState((prevState: InequalityModalState) => ({
                    menuItems: {
                        ...prevState.menuItems,
                        upperCaseLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map( letter => this.makeSingleLetterMenuItem(letter) ),
                        lowerCaseLetters: "abcdefghijklmnopqrstuvwxyz".split("").map( letter => this.makeSingleLetterMenuItem(letter) ),
                        upperCaseGreekLetters: this._upperCaseGreekLetters.map( letter => this.makeSingleLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter) ),
                        lowerCaseGreekLetters: this._lowerCaseGreekLetters.map( letter => this.makeSingleLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter) ),
                    }
                }));
            }
        }
    }

    public componentWillUnmount(): void {
        window.removeEventListener('keyup', this._handleKeyPress);
        const inequalityElement = this._inequalityModal.current as HTMLDivElement; // document.getElementById('inequality-modal') as HTMLElement;
        inequalityElement.removeEventListener('mousedown', this._onMouseDown);
        inequalityElement.removeEventListener('touchstart', this._onTouchStart);
        inequalityElement.removeEventListener('mousemove', this._onMouseMove);
        inequalityElement.removeEventListener('touchmove', this._onTouchMove);
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.removeEventListener('mouseup', this._onCursorMoveEnd);
        document.body.removeEventListener('touchend', this._onCursorMoveEnd);

        if (this.state.sketch) {
            this.setState((prevState: InequalityModalState) => ({
                sketch: {
                    ...prevState.sketch,
                    onNewEditorState: (s: any) => null,
                    onCloseMenus: () => null,
                    isUserPrivileged: () => this.isUserPrivileged(), // TODO Integrate with currentUser object
                    onNotifySymbolDrag: () => null, // This is probably irrelevant now
                    isTrashActive: () => false,
                }
            }));
            this.setState({ sketch: null });
        }
        const canvas = inequalityElement?.getElementsByTagName('canvas')[0];
        if (canvas) {
            inequalityElement.removeChild(canvas);
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

    private makeSingleLetterMenuItem(letter: string, label?: string) {
        return new MenuItem("Symbol", { letter: letter }, { label: label || letter, texLabel: true, className: `symbol-${letter}` });
    }

    private makeLetterMenuItem(l: string): MenuItem|null|undefined {
        if (!/^[a-zA-Z]/.test(l)) return;
        const letter = l === 'epsilon' ? 'varepsilon' : l;
        const parts = letter.split('_');
        const modifiers = ['prime'];
        // This is going to generate many broken symbols...
        const item = this.makeSingleLetterMenuItem(this._greekLetterMap[parts[0]] || parts[0], this._greekLetterMap[parts[0]] ? `\\${parts[0]}` : parts[0]);
        // ... but that's OK because we are going to fix them now!
        if (parts.length > 1) {
            if (modifiers.includes(parts[1])) {
                item.properties.modifier = parts[1];
                item.menu.label += "'";
            }
            if (!modifiers.includes(parts[parts.length - 1])) {
                const subscriptLetter = parts[parts.length - 1];
                let subscriptSymbol;
                if (isNaN(parseInt(subscriptLetter))) {
                    subscriptSymbol = { type: 'Symbol', properties: { letter: this._greekLetterMap[subscriptLetter] || subscriptLetter, upright: subscriptLetter.length > 1 } }
                } else {
                    subscriptSymbol = { type: 'Num', properties: { significand: subscriptLetter } };
                }
                item.children = { subscript: subscriptSymbol };
                item.menu.label += `_{${this._greekLetterMap[subscriptLetter] ? `\\${subscriptLetter}` : subscriptLetter}}`
                item.menu.className = `${item.menu.className} has-subscript`;
            }
        }
        return item;
    }

    private prepareAbsoluteElement(element?: Element | null) {
        if (element) {
            const menuItem = element.closest('.menu-item');
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
        const labels: any = {
            logic: { and: "\\land", or: "\\lor", xor: '\\veebar', not: "\\lnot", equiv: "=", True: "\\mathsf{T}", False: "\\mathsf{F}" },
            binary: { and: "\\cdot", or: "+", xor: '\\oplus', not: "\\overline{x}", equiv: "=", True: "1", False: "0" }
        };
        return [
            new MenuItem("LogicBinaryOperation", { operation: "and" }, { label: labels[syntax]['and'], texLabel: true, className: 'and' }),
            new MenuItem("LogicBinaryOperation", { operation: "or" }, { label: labels[syntax]['or'], texLabel: true, className: 'or' }),
            new MenuItem("LogicBinaryOperation", { operation: "xor" }, { label: labels[syntax]['xor'], texLabel: true, className: 'xor' }),
            new MenuItem("LogicNot", {}, { label: labels[syntax]['not'], texLabel: true, className: 'not' }),
            new MenuItem("Relation", { relation: "equiv" }, { label: labels[syntax]['equiv'], texLabel: true, className: 'equiv' }),
            new MenuItem("LogicLiteral", { value: true }, { label: labels[syntax]['True'], texLabel: true, className: 'true' }),
            new MenuItem("LogicLiteral", { value: false }, { label: labels[syntax]['False'], texLabel: true, className: 'false' }),
            new MenuItem("Brackets", { type: "round" }, { label: "\\small{(x)}", texLabel: true, className: 'brackets' })
        ];
    }

    private generateMathsBasicFunctionsItems(): MenuItem[] {
        return [
            new MenuItem("BinaryOperation", { operation: "+" }, { label: "+", texLabel: true, className: 'plus' }),
            new MenuItem("BinaryOperation", { operation: "-" }, { label: "-", texLabel: true, className: 'minus' }),
            new MenuItem("BinaryOperation", { operation: "±" }, { label: "\\pm", texLabel: true, className: 'plusminus' }),
            new MenuItem("Fraction", {}, { label: "\\frac{a}{b}", texLabel: true, className: 'fraction' }),
            new MenuItem("Brackets", { type: "round" }, { label: "\\small{(x)}", texLabel: true, className: 'brackets' }),
            new MenuItem("AbsoluteValue", {}, { label: '\\small{|x|}', texLabel: true, className: 'abs' }),
            new MenuItem("Radix", {}, { label: '\\small{\\sqrt{x}}', texLabel: true, className: 'radix sqrt' }),
            new MenuItem("Relation", { relation: '=' }, { label: '=', texLabel: true, className: 'relation equal' }),
            new MenuItem("Relation", { relation: '<' }, { label: '<', texLabel: true, className: 'relation less' }),
            new MenuItem("Relation", { relation: '>' }, { label: '>', texLabel: true, className: 'relation greater' }),
            new MenuItem("Relation", { relation: '<=' }, { label: '\\leq', texLabel: true, className: 'relation less-or-equal' }),
            new MenuItem("Relation", { relation: '>=' }, { label: '\\geq', texLabel: true, className: 'relation greater-or-equal' }),
        ];
    }

    private makeMathsTrigFunctionItem(name: string): MenuItem {
        let children: { [key: string]: any } | null = null;
        let functionName: string;
        let label: string;
        let fontSize: string;
        if (name.substring(0, 3) === 'arc') {
            functionName = name.substring(3);
            if (name.substring(3, 7) === 'sech' || name.substring(3, 8) === 'cosec') {
                label = `\\text{${functionName}}`;
            } else {
                label = `\\${functionName}`;
            }
            label += '^{-1}';
            fontSize = ['arccosech'].includes(name) ? '0.8em' : '1em';
            children = { superscript: { type: 'Num', properties: { significand: '-1' }, children: {} } };
        } else {
            functionName = name;
            if (name.substring(0, 4) === 'sech' || name.substring(0, 5) === 'cosec') {
                label = `\\text{${functionName}}`;
            } else {
                label = `\\${functionName}`;
            }
            fontSize = ['cosech'].includes(name) ? '1em' : '1.2em';
        }
        const item = new MenuItem("Fn", {
            name: functionName,
            innerSuperscript: true,
            allowSubscript: false
        }, {
            label: label,
            texLabel: true,
            className: 'function trig ' + name,
            fontSize: fontSize
        });
        if (children !== null) {
            item.children = children;
        }
        return item;
    }

    private generateMathsTrigFunctionsItems(): MenuItem[] {
        return this._trigFunctionNames.map(this.makeMathsTrigFunctionItem);
    }

    private generateMathsHypFunctionsItems(): MenuItem[] {
        return this._hypFunctionsNames.map(this.makeMathsTrigFunctionItem);
    }

    private makeMathsLogFunctionItem(name: string): MenuItem {
        if (name === 'ln') {
            return new MenuItem('Fn', { name: 'ln', innerSuperscript: false, allowSubscript: false }, { label: '\\text{ln}', texLabel: true, className: 'function ln' });
        } else { // assume log, defaults to base 10, can have other bases
            return new MenuItem('Fn', { name: 'log', innerSuperscript: false, allowSubscript: true }, { label: '\\text{log}', texLabel: true, className: 'function log' });
        }
    }

    private generateMathsLogFunctionsItems(): MenuItem[] {
        return this._logFunctionNames.map(this.makeMathsLogFunctionItem);
    }

    private makeMathsDifferentialItem(parsedDifferential: string[]): MenuItem {
        const nameToLetterMap: { [name: string]: string } = {"delta":"δ","Delta":"∆","d":"d"};
        const nameToLatexMap: { [name: string]: string } = {"delta":"\\delta","Delta":"\\Delta","d":"d"};
        const differentialType: string = parsedDifferential[1];
        const differentialOrder = parsedDifferential[2] || 0;
        const differentialArgument = parsedDifferential[3] || null;
        const differentialLetter = nameToLetterMap[differentialType] || "?";
        const differentialLatex = "\\mathrm{" + ( nameToLatexMap[differentialType] || "?" ) + "}";

        const differentialSymbol = new MenuItem('Differential', { letter: differentialLetter }, { label: differentialLatex, texLabel: true, className: '' });

        if (differentialOrder > 1) {
            differentialSymbol.children = {
                ...differentialSymbol.children,
                order: {
                    type: "Num",
                    properties: {
                        significand: `${differentialOrder}`,
                    }
                }
            };
            differentialSymbol.menu.label = differentialSymbol.menu.label + "^{" + differentialOrder + "}";
        }

        if (differentialArgument) {
            differentialSymbol.children = { ...differentialSymbol.children, argument: this.makeLetterMenuItem(differentialArgument) };
            differentialSymbol.menu.label = differentialSymbol.menu.label + differentialSymbol.children.argument.menu.label;
        }

        return differentialSymbol;
    }

    private generateMathsDefaultDerivativesItems(): MenuItem[] {
        // Do we need to generate special derivatives?
        if (this.isUserPrivileged() && (!this._availableSymbols || this._availableSymbols.length === 0)) {
            const derivativeItem = new MenuItem('Derivative', {}, { label: '\\frac{\\mathrm{d}\\ \\cdot}{\\mathrm{d}\\ \\cdots}', texLabel: true, className: 'derivative' });
            derivativeItem.children = {
                numerator: { type: 'Differential', properties: { letter: 'd' } },
                denominator: { type: 'Differential', properties: { letter: 'd' } }
            }
            return [
                new MenuItem('Differential', { letter: 'd' }, { label: '\\mathrm{d}^{\\circ}\\circ', texLabel: true, className: 'differential-d' }),
                new MenuItem('Differential', { letter: '∆' }, { label: '\\mathrm{\\Delta}^{\\circ}\\circ', texLabel: true, className: 'differential-upper-delta' }),
                new MenuItem('Differential', { letter: 'δ' }, { label: '\\mathrm{\\delta}^{\\circ}\\circ', texLabel: true, className: 'differential-lower-delta' }),
                derivativeItem
            ];
        }
        return [];
    }

    private generateMathsDerivativeAndLetters(symbol: string): { derivative: MenuItem[]; letters: MenuItem[] } {
        const parts = symbol.replace(/^Derivative/, '').split(';').map(s => s.replace(/[()\s]/g, ''));
        const letters = new Array<MenuItem>();
        const top = parts[0];
        if (isDefined(this._greekLetterMap[top]) || /^[a-zA-Z]$/.test(top)) {
            // Do this only if we have a single greek letter or a single latin letter.
            letters.push(this.makeSingleLetterMenuItem(this._greekLetterMap[top] || top, this._greekLetterMap[top] ? '\\' + top : top))
        }
        const pieces = parts.slice(1);
        const orders: { [piece: string]: number } = {};
        // Count how many times one should derive each variable
        for (const piece of pieces) {
            orders[piece] = orders[piece] + 1 || 1;
        }
        const derivativeOrder = Object.values(orders).reduce((a, c) => a + c, 0);
        const denominatorObjects: any[] = [];
        let texBottom = '';
        for (const p of Object.entries(orders)) {
            const letter = p[0];
            letters.push(this.makeSingleLetterMenuItem(this._greekLetterMap[letter] || letter, this._greekLetterMap[letter] ? '\\' + letter : letter));
            const order = p[1];
            const o = {
                type: 'Differential',
                properties: { letter: 'd' }, // TODO Support other types of differentials
                children: {
                    argument: {
                        type: 'Symbol',
                        properties: { letter: this._greekLetterMap[letter] || letter }
                    },
                    order: null as any | null
                }
            };
            texBottom += `\\mathrm{d}${this._greekLetterMap[letter] ? '\\' + letter : letter}`;
            if (order > 1) {
                o.children = { ...o.children, order: {
                    type: 'Num',
                    properties: { significand: `${order}` }
                }};
                texBottom += `^{${order}}`;
            }
            if (!o.children.order) {
                delete o.children.order;
            }
            denominatorObjects.push(o);
        }
        // This sure would look a lot better as a reduce but I can't figure it out.
        let denominator = denominatorObjects.pop();
        while (denominatorObjects.length > 0) {
            const acc = denominatorObjects.pop();
            acc.children.right = denominator;
            denominator = acc;
        }
        // Build up the object
        const texLabel = '\\frac{\\mathrm{d}' + (derivativeOrder > 1 ? `^{${derivativeOrder}}` : '') + `}{${texBottom}}`;
        const derivativeObject = new MenuItem('Derivative', { }, { label: texLabel, texLabel: true, fontSize: '1.5em', className: 'derivative' });
        const numerator = {
            type: 'Differential',
            properties: { letter: 'd' },
            children: derivativeOrder > 1 ? { order: { type: 'Num', properties: { significand: `${derivativeOrder}` } } } : { }
        };
        derivativeObject.children = { numerator, denominator };

        const derivative = [derivativeObject]

        if (isDefined(this._greekLetterMap[top]) || /^[a-zA-Z]$/.test(top)) {
            // Do this only if we have a single greek letter or a single latin letter.
            const argument = {
                type: 'Symbol',
                properties: { letter: this._greekLetterMap[top] || top }
            }
            const compoundNumerator = {
                type: 'Differential',
                properties: { letter: 'd' },
                children: derivativeOrder > 1 ? { argument, order: { type: 'Num', properties: { significand: `${derivativeOrder}` } } } : { argument }
            };
            const compoundTexLabel = '\\frac{\\mathrm{d}' + (derivativeOrder > 1 ? `^{${derivativeOrder}}` : '') + `${this._greekLetterMap[top] || top}}{${texBottom}}`;
            const compoundDerivativeObject = new MenuItem('Derivative', { }, { label: compoundTexLabel, texLabel: true, fontSize: '1.5em', className: 'derivative' });
            compoundDerivativeObject.children = { numerator: compoundNumerator, denominator };
            derivative.push(compoundDerivativeObject);
        }
        return { derivative, letters };
    }

    private generateMathsDifferentialAndLetters(symbol: string): { differential?: MenuItem|null; letters?: MenuItem[]|null } {
        // We wouldn't be here if the regex didn't parse in the first place, so the assertion is justified
        const parsedDifferential = this._differentialRegex.exec(symbol)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        const differentialType = parsedDifferential[1];
        const differentialOrder = parsedDifferential[2] || 0;
        const differentialArgument = parsedDifferential[3] || null;

        if (differentialType === "d" && differentialOrder === 0 && differentialArgument == null) {
            return { letters: [this.makeSingleLetterMenuItem('d')] }
        } else {
            return {
                differential: this.makeMathsDifferentialItem(parsedDifferential as string[]),
                letters: differentialArgument ? [this.makeSingleLetterMenuItem(this._greekLetterMap[differentialArgument] || differentialArgument, this._greekLetterMap[differentialArgument] ? '\\' + differentialArgument : differentialArgument)] : null
            }
        }
    }

    private makeChemicalElementMenuItem = (symbol: string): Nullable<MenuItem> => {
        if (this._chemicalElements.includes(symbol)) {
            return new MenuItem('ChemicalElement', { element: symbol }, { label: `\\text{${symbol}}`, texLabel: true, className: `chemical-element ${symbol}` });
        } else if (this._chemicalParticles.hasOwnProperty(symbol)) {
            return new MenuItem('Particle', this._chemicalParticles[symbol].properties, { ...this._chemicalParticles[symbol].menu, className: `chemical-particle ${symbol}` });
        }
    }

    private makeChemicalStatesMenuItems() {
        return [
            new MenuItem('StateSymbol', { state: 'gas' }, { label: '\\text{(g)}', texLabel: true, className: 'chemical-state gas' }),
            new MenuItem('StateSymbol', { state: 'liquid' }, { label: '\\text{(l)}', texLabel: true, className: 'chemical-state liquid' }),
            new MenuItem('StateSymbol', { state: 'aqueous' }, { label: '\\text{(aq)}', texLabel: true, className: 'chemical-state aqueous' }),
            new MenuItem('StateSymbol', { state: 'solid' }, { label: '\\text{(s)}', texLabel: true, className: 'chemical-state solid' }),
            new MenuItem('StateSymbol', { state: 'metal' }, { label: '\\text{(m)}', texLabel: true, className: 'chemical-state metal' }),
        ]
    }

    private makeChemicalOperationsMenuItems() {
        return [
            new MenuItem('BinaryOperation', { operation: '+' }, { label: '+', texLabel: true, className: 'chemical-operations plus' }),
            new MenuItem('BinaryOperation', { operation: '-' }, { label: '-', texLabel: true, className: 'chemical-operations minus' }),
            new MenuItem('Fraction', { }, { label: '\\frac{a}{b}', texLabel: true, className: 'chemical-operations fraction' }),
            new MenuItem('Relation', { relation: 'rightarrow' }, { label: '\\rightarrow', texLabel: true, className: 'chemical-operations rightarrow' }),
            new MenuItem('Relation', { relation: 'equilibrium' }, { label: '\\rightleftharpoons', texLabel: true, className: 'chemical-operations equilibrium' }),
            new MenuItem('Brackets', { type: 'round', mode: 'chemistry' }, { label: '(x)', texLabel: true, className: 'chemical-operations brackets round' }),
            new MenuItem('Brackets', { type: 'square', mode: 'chemistry' }, { label: '[x]', texLabel: true, className: 'chemical-operations brackets square' }),
            new MenuItem('Relation', { relation: '.' }, { label: '\\cdot', texLabel: true, className: 'chemical-operations dot' }),
        ]
    }

    // Fat arrow form for correct "this" binding (?!)
    private menuItem = (item: MenuItem, index: number) => {
        return <li key={index}
            data-item={JSON.stringify(item)} // TODO Come up with a better way than this.
            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(item.menu.label) }}
            className={ item.menu.className }
            style={{ fontSize: item.menu.fontSize }}
        />;
    }

    // WARNING Cursor coordinates on mobile are floating point and this makes
    // math sad, therefore ROUND EVERYTHING OR FACE MADNESS

    private onMouseDown(e: MouseEvent) {
        // preventDefault here to stop selection on desktop
        if (isDefined(e.currentTarget) && (e.currentTarget as HTMLInputElement).id === 'chem-text-entry-box') {
            // This is better than nothing but doesn't allow the user to
            // select the position of the cursor or select or anything else.
            (e.currentTarget as HTMLInputElement).focus();
            return true;
        }
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
                if (!this.state.trashActive) {
                    this.setState({ trashActive: true });
                }
            } else {
                trashCan.classList.remove('active');
                if (this.state.trashActive) {
                    this.setState({ trashActive: false });
                }
            }
        }

        // No need to run any further if we are not dealing with a menu item.
        if (!this._movingMenuItem) {
            return;
        }

        if (isDefined(this._previousCursor)) {
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

            // Auto-close the menu on small-screens when dragging outside the area
            if (window.innerWidth < 1024) {
                const menuBox = this._menuRef.current?.getBoundingClientRect();
                if (isDefined(menuBox)) {
                    if (this._previousCursor.y <= menuBox.height && y > menuBox.height) {
                        this.setState({ menuOpen: false });
                    }
                }
            }
        }
        if (this._potentialSymbolSpec && this.state.sketch) {
            this.state.sketch.updatePotentialSymbol(this._potentialSymbolSpec as WidgetSpec, x, y);
        }

        this._previousCursor = { x, y };
    }

    private onMenuTabClick(menuName: string) {
        if (this.state.activeMenu === menuName) {
            this.setState({ menuOpen: !this.state.menuOpen });
        } else {
            this.setState({ menuOpen: true, activeMenu: menuName});
        }
    }

    private setSubMenuOpen(submenu: string) {
        this.setState({ menuOpen: true, activeSubMenu: submenu})
    }

    private updateNumberInputValue(n: number) {
        if (n === -1) {
            this.setState((prevState: InequalityModalState) => ({ numberInputValue: -(prevState.numberInputValue || 0) }));
        } else if (isDefined(this.state.numberInputValue)) {
            // I'm sure there's a more concise way...
            if (this.state.numberInputValue < 0) {
                this.setState((prevState: InequalityModalState) => ({ numberInputValue: (prevState.numberInputValue || 0)*10 - n }));
            } else {
                this.setState((prevState: InequalityModalState) => ({ numberInputValue: (prevState.numberInputValue || 0)*10 + n }));
            }
        } else {
            this.setState({ numberInputValue: n });
        }
    }

    private clearNumberInputValue() {
        this.setState({ numberInputValue: void 0 });
    }

    private onQuestionReminderClick() {
        this.setState((prevState: InequalityModalState) => ({ showQuestionReminder: !prevState.showQuestionReminder }) );
    }

    private onUnparsedChemicalElementsChange = (event: FormEvent<HTMLInputElement>) => {
        this.setState({ unparsedChemicalElements: event.currentTarget.value });
    }

    public render(): JSX.Element {
        let lettersMenu: JSX.Element | null = null;
        if (!this.state.disableLetters) {
            if (this.state.defaultMenu) {
                lettersMenu = <div className="top-menu letters">
                    <ul className="sub-menu-tabs">
                        <li className={this.state.activeSubMenu === "lowerCaseLetters" ? 'active' : 'inactive'}
                            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("ab") }}
                            onClick={() => this.setSubMenuOpen("lowerCaseLetters") }
                            onKeyUp={() => this.setSubMenuOpen("lowerCaseLetters") }
                        />
                        <li className={this.state.activeSubMenu === "upperCaseLetters" ? 'active' : 'inactive'}
                            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("AB") }}
                            onClick={() => this.setSubMenuOpen("upperCaseLetters") }
                            onKeyUp={() => this.setSubMenuOpen("upperCaseLetters") }
                        />
                        {this.props.editorMode === 'maths' &&
                            <li className={this.state.activeSubMenu === "lowerCaseGreekLetters" ? 'active' : 'inactive'}
                                dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("αβ") }}
                                onClick={() => this.setSubMenuOpen("lowerCaseGreekLetters") }
                                onKeyUp={() => this.setSubMenuOpen("lowerCaseGreekLetters") }
                            />}
                        {this.props.editorMode === 'maths' &&
                            <li className={this.state.activeSubMenu === "upperCaseGreekLetters" ? 'active' : 'inactive'}
                                dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("ΓΔ") }}
                                onClick={() => this.setSubMenuOpen("upperCaseGreekLetters") }
                                onKeyUp={() => this.setSubMenuOpen("upperCaseGreekLetters") }
                            />}
                    </ul>
                    {this.state.activeSubMenu === "upperCaseLetters" && <ul className="sub-menu uppercaseletters">{
                        this.state.menuItems.upperCaseLetters.map(this.menuItem)
                    }</ul>}
                    {this.state.activeSubMenu === "lowerCaseLetters" && <ul className="sub-menu lowercaseletters">{
                        this.state.menuItems.lowerCaseLetters.map(this.menuItem)
                    }</ul>}

                    {this.props.editorMode === 'maths' && this.state.activeSubMenu === "upperCaseGreekLetters" && <ul className="sub-menu uppercasegreekletters">{
                        this.state.menuItems.upperCaseGreekLetters.map(this.menuItem)
                    }</ul>}
                    {this.props.editorMode === 'maths' && this.state.activeSubMenu === "lowerCaseGreekLetters" && <ul className="sub-menu lowercasegreekletters">{
                        this.state.menuItems.lowerCaseGreekLetters.map(this.menuItem)
                    }</ul>}
                </div>
            } else {
                lettersMenu = <div className="top-menu letters">
                    <ul className="sub-menu letters">
                        {this.state.menuItems.letters.map(this.menuItem)}
                    </ul>
                </div>
            }
        }
        let mathsOtherFunctionsMenu: JSX.Element;
        if (this.state.defaultMenu || (this.state.menuItems.otherFunctions.length === 0 && this.state.menuItems.mathsDerivatives.length === 0)) {
            mathsOtherFunctionsMenu = <div className="top-menu maths other-functions">
                <ul className="sub-menu-tabs">
                    <li className={`trig-functions ${this.state.activeSubMenu === "trigFunctions" ? 'active' : 'inactive'}`}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("\\sin") }}
                        onClick={() => this.setSubMenuOpen("trigFunctions") }
                        onKeyUp={() => this.setSubMenuOpen("trigFunctions") }
                    />
                    <li className={`hyp-functions ${this.state.activeSubMenu === "hypFunctions" ? 'active' : 'inactive'}`}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("\\text{hyp}") }}
                        onClick={() => this.setSubMenuOpen("hypFunctions") }
                        onKeyUp={() => this.setSubMenuOpen("hypFunctions") }
                    />
                    <li className={`log-functions ${this.state.activeSubMenu === "logFunctions" ? 'active' : 'inactive'}`}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("\\text{log}") }}
                        onClick={() => this.setSubMenuOpen("logFunctions") }
                        onKeyUp={() => this.setSubMenuOpen("logFunctions") }
                    />
                    {this.state.menuItems.mathsDerivatives.length > 0 && <li className={`derivatives ${this.state.activeSubMenu === "derivatives" ? 'active' : 'inactive'}`}
                        dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString("\\frac{\\mathrm{d}y}{\\mathrm{d}x}") }}
                        onClick={() => this.setSubMenuOpen("derivatives") }
                        onKeyUp={() => this.setSubMenuOpen("derivatives") }
                    />}
                </ul>
                {this.state.activeSubMenu === "trigFunctions" && <ul className="sub-menu trig-functions">{
                    this.state.menuItems.mathsTrigFunctions.map(this.menuItem)
                }</ul>}
                {this.state.activeSubMenu === 'hypFunctions' && <ul className="sub-menu hyp-functions">{
                    this.state.menuItems.mathsHypFunctions.map(this.menuItem)
                }</ul>}
                {this.state.activeSubMenu === 'logFunctions' && <ul className="sub-menu log-functions">{
                    this.state.menuItems.mathsLogFunctions.map(this.menuItem)
                }</ul>}
                {this.state.activeSubMenu === 'derivatives' && <ul className="sub-menu derivatives">{
                    this.state.menuItems.mathsDerivatives.map(this.menuItem)
                }</ul>}
            </div>;
        } else {
            mathsOtherFunctionsMenu = <div className="top-menu maths other-functions">
                <ul className="sub-menu functions">
                    {this.state.menuItems.otherFunctions.map(this.menuItem)}
                    {this.state.menuItems.mathsDerivatives.map(this.menuItem)}
                </ul>
            </div>
        }

        let functionsTabLabel = '';
        if (this.props.editorMode === 'maths') {
            functionsTabLabel = "+ - \\sqrt{x}";
        } else if (this.props.editorMode === 'logic') {
            if (this.props.logicSyntax === 'logic') {
                functionsTabLabel = "\\wedge\\ \\lnot";
            } else {
                functionsTabLabel = "\\cdot\\ \\overline{x}";
            }
        }
        const mathsOtherFunctionsTabLabel = '\\sin\\ \\int';

        let parsedChemicalElements: Nullable<MenuItem[]>;
        let upperCaseWarning = false;
        if (isDefined(this.state.unparsedChemicalElements)) {
            const splitUnparsed = this.state.unparsedChemicalElements.replace(/[^a-z]+/img, ',').split(',').filter(s => s !== '');
            upperCaseWarning = splitUnparsed.some(e => e[0] !== e[0].toUpperCase());
            const splitChemicalElements = splitUnparsed.filter(s => this._chemicalElements.includes(s));
            parsedChemicalElements = [... new Set(splitChemicalElements.map(this.makeChemicalElementMenuItem).filter(isDefined))];
        }

        const menu: JSX.Element =
        <nav className="inequality-ui" ref={this._menuRef}>
            <div className={"inequality-ui menu-bar" + (this.state.menuOpen ? " open" : " closed")}>
                {this.state.activeMenu === 'numbers' && <div className="top-menu numbers">
                    <div className="keypad-box">
                        <div className="top-row">
                            {'123456'.split('').map(n => <div key={n} className="key menu-item number" role="button" tabIndex={0}
                                data-item={JSON.stringify({ type: 'Num', properties: { significand: n } })}
                                dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(n) }}
                                onClick={() => this.updateNumberInputValue(parseInt(n))}
                                onTouchEnd={() => this.updateNumberInputValue(parseInt(n))}
                                onKeyUp={() => this.updateNumberInputValue(parseInt(n))}
                            >
                            </div>)}
                        </div>
                        <div className="bottom-row">
                            {'7890'.split('').map(n => <div key={n} className="key menu-item number" role="button" tabIndex={0}
                                data-item={JSON.stringify({ type: 'Num', properties: { significand: n } })}
                                dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(n) }}
                                onClick={() => this.updateNumberInputValue(parseInt(n))}
                                onTouchEnd={() => this.updateNumberInputValue(parseInt(n))}
                                onKeyUp={() => this.updateNumberInputValue(parseInt(n))}
                            />)}
                            <div className="key plus-minus" role="button" tabIndex={0}
                                // data-item={JSON.stringify({ type: 'Num', properties: { significand: n } })}
                                dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString('\\pm') }}
                                onClick={() => this.updateNumberInputValue(-1)}
                                onTouchEnd={() => this.updateNumberInputValue(-1)}
                                onKeyUp={() => this.updateNumberInputValue(-1)}
                            />
                        </div>
                    </div>
                    <div className="input-box">
                        <div className={`menu-item ${isDefined(this.state.numberInputValue) ? 'active' : 'inactive'}`}
                            data-item={isDefined(this.state.numberInputValue) ? JSON.stringify({ type: 'Num', properties: { significand: `${this.state.numberInputValue}`} }) : null}
                            dangerouslySetInnerHTML={{ __html: this._vHexagon + katex.renderToString(`${isDefined(this.state.numberInputValue) ? this.state.numberInputValue : ''}`)}}
                        />
                        {isDefined(this.state.numberInputValue) && <div className="clear-number" role="button" tabIndex={0}
                            onClick={() => this.clearNumberInputValue()}
                            onKeyUp={() => this.clearNumberInputValue()}
                        />}
                    </div>
                </div>}
                {this.state.activeMenu === "letters" && lettersMenu}
                {this.state.activeMenu === "basicFunctions" && <div className="top-menu basic-functions">
                    {this.props.editorMode === 'logic' && <ul className="sub-menu">{
                        this.state.menuItems.logicFunctionsItems.map(this.menuItem)
                    }</ul>}
                    {this.props.editorMode === 'maths' && <ul className="sub-menu">{
                        this.state.menuItems.mathsBasicFunctionsItems.map(this.menuItem)
                    }</ul>}
                </div>}
                {this.props.editorMode === 'maths' && this.state.activeMenu === 'mathsOtherFunctions' && mathsOtherFunctionsMenu}
                {(!isDefined(this._availableSymbols) || this._availableSymbols.length === 0) && this.props.editorMode === 'chemistry' && this.state.activeMenu === 'elements' && <div className="top-menu chemistry elements text-entry">
                    <div className="input-box">
                        <Input id="chem-text-entry-box" type="text" placeholder="Type chemical elements here" onMouseDown={e => this.onMouseDown(e as any)} value={this.state.unparsedChemicalElements || ""} onChange={this.onUnparsedChemicalElementsChange} />
                        {upperCaseWarning && <p className="uppercase-warning">Careful: chemical element names start with an upper-case letter.</p>}
                    </div>
                    <div className="items-box">
                        <ul className="sub-menu elements">
                            {isDefined(parsedChemicalElements) && parsedChemicalElements.map(this.menuItem)}
                        </ul>
                    </div>
                </div>}
                { isDefined(this._availableSymbols) && this._availableSymbols.length > 0 && this.props.editorMode === 'chemistry' && this.state.activeMenu === 'elements' && <div className="top-menu chemistry elements">
                    <ul className="sub-menu elements">
                        {this.state.menuItems.chemicalElements.map(this.menuItem)}
                    </ul>
                </div>}
                { (!isDefined(this._availableSymbols) || (isDefined(this._availableSymbols) && this._availableSymbols.length === 0)) && this.props.editorMode === 'chemistry' && this.state.activeMenu === 'particles' && <div className="top-menu chemistry particles">
                    <ul className="sub-menu particles">
                        {this.state.menuItems.chemicalParticles.map(this.menuItem)}
                    </ul>
                </div>}
                {this.props.editorMode === 'chemistry' && this.state.activeMenu === 'states' && <div className="top-menu chemistry states">
                    <ul className="sub-menu states">
                        {this.state.menuItems.chemicalStates.map(this.menuItem)}
                    </ul>
                </div>}
                {this.props.editorMode === 'chemistry' && this.state.activeMenu === 'operations' && <div className="top-menu chemistry operations">
                    <ul className="sub-menu operations">
                        {this.state.menuItems.chemicalOperations.map(this.menuItem)}
                    </ul>
                </div>}
            </div>
            <div id="inequality-menu-tabs" className="menu-tabs">
                <ul>
                    {['maths', 'chemistry'].includes(this.props.editorMode || '') &&
                    <li className={this.state.activeMenu === 'numbers' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString('1\\, 2\\, 3') }}
                        onClick={() => this.onMenuTabClick('numbers')}
                        onKeyUp={() => this.onMenuTabClick('numbers')}
                    />}
                    {!this.state.disableLetters &&
                     ['maths', 'logic'].includes(this.props.editorMode || '') &&
                    <li className={this.state.activeMenu === "letters" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString("Ab\\ \\Delta \\gamma") }}
                        onClick={() => { this.onMenuTabClick("letters"); this.setSubMenuOpen(this.props.editorMode === 'logic' ? "upperCaseLetters" : "lowerCaseLetters"); } }
                        onKeyUp={() => { this.onMenuTabClick("letters"); this.setSubMenuOpen(this.props.editorMode === 'logic' ? "upperCaseLetters" : "lowerCaseLetters"); } }
                    />}
                    {['maths', 'logic'].includes(this.props.editorMode || '') &&
                    <li className={this.state.activeMenu === "basicFunctions" ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString(functionsTabLabel) }}
                        onClick={() => this.onMenuTabClick("basicFunctions")}
                        onKeyUp={() => this.onMenuTabClick("basicFunctions")}
                    />}
                    {this.props.editorMode === 'maths' &&
                    <li className={this.state.activeMenu === 'mathsOtherFunctions' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString(mathsOtherFunctionsTabLabel) }}
                        onClick={() => { this.onMenuTabClick('mathsOtherFunctions'); this.setSubMenuOpen('trigFunctions'); } }
                        onKeyUp={() => { this.onMenuTabClick('mathsOtherFunctions'); this.setSubMenuOpen('trigFunctions'); } }
                    />}
                    {/* Chemistry below */}
                    {this.props.editorMode === 'chemistry' &&
                    <li className={this.state.activeMenu === 'elements' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString(isDefined(this.props.availableSymbols) && this.props.availableSymbols.length > 0 && this.state.menuItems.chemicalElements.map(i => i.type).includes('Particle') ? '\\text{He Li}\\ \\alpha' : '\\text{H He Li}') }}
                        onClick={() => this.onMenuTabClick('elements')}
                        onKeyUp={() => this.onMenuTabClick('elements')}
                    />}
                    {this.props.editorMode === 'chemistry' && this.state.menuItems.chemicalParticles.length > 0 &&
                    <li className={this.state.activeMenu === 'particles' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString('\\alpha\\ \\gamma\\ \\text{e}') }}
                        onClick={() => this.onMenuTabClick('particles')}
                        onKeyUp={() => this.onMenuTabClick('particles')}
                    />}
                    {this.props.editorMode === 'chemistry' &&
                    <li className={this.state.activeMenu === 'states' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString('(aq)\\, (g)\\, (l)') }}
                        onClick={() => this.onMenuTabClick('states')}
                        onKeyUp={() => this.onMenuTabClick('states')}
                    />}
                    {this.props.editorMode === 'chemistry' &&
                    <li className={this.state.activeMenu === 'operations' ? 'active' : 'inactive'}
                        dangerouslySetInnerHTML={{ __html: this._tabTriangle + katex.renderToString('\\rightarrow\\, \\rightleftharpoons\\, +') }}
                        onClick={() => this.onMenuTabClick('operations')}
                        onKeyUp={() => this.onMenuTabClick('operations')}
                    />}
                </ul>
            </div>
        </nav>

        const previewTexString = (this.state.editorState.result || { tex: ""}).tex;

        return <div id="inequality-modal" ref={this._inequalityModal}>
            <div
                className="inequality-ui confirm button"
                role="button" tabIndex={-1}
                onClick={this.close}
                onKeyUp={this.close}>OK</div>
            <div className={`inequality-ui katex-preview ${previewTexString === "" ? "empty" : ""}`} dangerouslySetInnerHTML={{ __html: katex.renderToString(previewTexString) }}></div>
            {!this.state.showQuestionReminder && <div
                className="inequality-ui show-question button"
                role="button" tabIndex={-1}
                onClick={() => { if (!this.state.showQuestionReminder) { this.onQuestionReminderClick() }} }
                onKeyUp={() => { if (!this.state.showQuestionReminder) { this.onQuestionReminderClick() }} }
            >Show Question</div>}
            <div
                className="inequality-ui centre button"
                role="button" tabIndex={-1}
                onClick={() => { if (this.state.sketch) this.state.sketch.centre() }}
                onKeyUp={() => { if (this.state.sketch) this.state.sketch.centre() }}
            >Centre</div>
            <div
                className="inequality-ui help button"
                role="button" tabIndex={-1}
                onClick={() => this.props.showHelpModal(this.props.editorMode || 'modemissing')}
                onKeyUp={() => this.props.showHelpModal(this.props.editorMode || 'modemissing')}
            >Help</div>

            <div id="inequality-trash" className="inequality-ui trash button">Trash</div>
            {this.state.showQuestionReminder && (this.props.questionDoc?.value || (this.props.questionDoc?.children && this.props.questionDoc?.children?.length > 0)) && <div className="question-reminder">
                {this.state.showQuestionReminder && <IsaacContentValueOrChildren value={this.props.questionDoc.value} encoding={this.props.questionDoc.encoding}>
                    {this.props.questionDoc?.children}
                </IsaacContentValueOrChildren>}
                <div
                    className="reminder-toggle"
                    role="button" tabIndex={-1}
                    onClick={() => this.onQuestionReminderClick()}
                    onKeyUp={() => this.onQuestionReminderClick()}
                >Hide Question</div>
            </div>}
            <div className="orientation-warning">The Isaac Equation Editor may only be used in landscape mode. Please rotate your device.</div>
            { menu }
        </div>;
    }
}

export const InequalityModal = connect(null, dispatch => ({
    showHelpModal: (editorMode: string) => dispatch(openActiveModal({
        closeAction: () => { store.dispatch(closeActiveModal()) },
        size: 'xl',
        title: 'Quick Help',
        body: <InequalityHelpModal editorMode={editorMode} />
    }))
}))(InequalityModalComponent);
