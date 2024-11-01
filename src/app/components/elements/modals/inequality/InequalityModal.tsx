import React, {FormEvent, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Inequality, WidgetSpec} from "inequality";
import {
    isDefined,
    parsePseudoSymbolicAvailableSymbols,
    sanitiseInequalityState, siteSpecific
} from "../../../../services";
import {IsaacContentValueOrChildren} from "../../../content/IsaacContentValueOrChildren";
import {ContentDTO} from "../../../../../IsaacApiTypes";
import {Input} from "reactstrap";
import classNames from "classnames";
import {Markup} from "../../markup";
import {
    CHEMICAL_ELEMENTS,
    CHEMICAL_PARTICLES,
    EditorMode,
    LogicSyntax,
    MenuItemProps,
    MenuItems
} from "./constants";
import {closeActiveModal, openActiveModal, store, useAppDispatch} from "../../../../state";
import {PageFragment} from "../../PageFragment";
import uniq from "lodash/uniq";
import {
    generateChemicalElementMenuItem,
    generateMenuItems,
    handleMoveCallback,
    onCursorMoveEndCallback,
    prepareInequality,
    setupAndTeardownDocStyleAndListeners
} from "./utils";

// This file contains the React components associated with the Inequality modal

const MenuItem = (props: MenuItemProps) => {
    return <li
        data-item={JSON.stringify(props)} // TODO Come up with a better way than this.
        className={classNames(props.menu.className, "menu-item")}
        style={{fontSize: props.menu.fontSize}}
    >
        <VShape/><Markup encoding={"latex"}>{`$${props.menu.label}$`}</Markup>
    </li>;
};
const buildIndexedMenuItem = (props: MenuItemProps, i: number) => <MenuItem key={i} {...props}/>;

const VHexagon = () =>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 173.5 200" className="v-hexagon" xmlSpace="preserve" enableBackground={"new 0 0 173.5 200"}>
        <polygon points="0.7,50 0.7,150 87.3,200 173.9,150 173.9,50 87.3,0 " />
    </svg>;
const VCircle = () =>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 200 200" className="v-hexagon" xmlSpace="preserve" enableBackground={"new 0 0 200 200"}>
        <circle r={100} cx={100} cy={100} />
    </svg>;
const VShape = siteSpecific(VHexagon, VCircle);

const TabTriangle = () =>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 136 23" className="tab-triangle" xmlSpace="preserve" enableBackground={"new 0 0 76 23"}>
        <polygon points="0,0 136,0 68,23"/>
    </svg>;
const TabShape = siteSpecific(TabTriangle, () => null);

type InequalityMenuTabType = "numbers" | "letters" | "basicFunctions" | "mathsOtherFunctions" | "maths" | "logic" | "elements" | "particles" | "states" | "operations" | null;
type InequalityMenuSubMenuTabType = "upperCaseLetters" | "lowerCaseLetters" | "trigFunctions" | "hypFunctions" | "logFunctions" | "derivatives" | "lowerCaseGreekLetters" | "upperCaseGreekLetters" | null;
const InequalityMenuContext = React.createContext<{activeMenu: [InequalityMenuTabType, InequalityMenuSubMenuTabType], openNewMenuTab: (newMenu: [InequalityMenuTabType, InequalityMenuSubMenuTabType]) => void} | undefined>(undefined);

const InequalityMenuTab = ({menu, latexTitle, subMenu, className, isSubMenu = false}: {menu: InequalityMenuTabType; subMenu?: InequalityMenuSubMenuTabType; latexTitle: string; className?: string; isSubMenu?: boolean}) => {
    const menuContext = useContext(InequalityMenuContext);
    if (!menuContext) return null;
    const {activeMenu: [activeMenu, activeSubMenu], openNewMenuTab} = menuContext;

    const navigate = () => openNewMenuTab([menu, subMenu ?? null]);
    const active = activeMenu === menu && (isSubMenu ? activeSubMenu === subMenu : true);

    return <li className={classNames(active ? "active" : "inactive", className)} onClick={navigate} onKeyUp={navigate}>
        {isSubMenu ? <VShape/> : <TabShape/>}<Markup encoding={"latex"}>{`$${latexTitle}$`}</Markup>
    </li>;
};

const InequalityMenuNumber = ({n, update}: {n: number, update: () => void}) => {
    return <button
        className="key menu-item number"
        type="button"
        tabIndex={0}
        data-item={JSON.stringify({ type: "Num", properties: { significand: n.toString() } })}
        onClick={update}
    >
        <VShape/><Markup encoding={"latex"}>{`$${n.toString()}$`}</Markup>
    </button>;
};

const MathOtherFunctionsMenu = ({defaultMenu, menuItems, activeSubMenu}: {defaultMenu: boolean; menuItems: MenuItems, activeSubMenu: InequalityMenuSubMenuTabType}) => {
    if (defaultMenu || (menuItems.otherFunctions.length === 0 && menuItems.mathsDerivatives.length === 0)) {
        return <div className="top-menu maths other-functions">
            <ul className="sub-menu-tabs">
                <InequalityMenuTab isSubMenu menu={"mathsOtherFunctions"} subMenu={"trigFunctions"} className={"trig-functions"} latexTitle={"\\sin"}/>
                <InequalityMenuTab isSubMenu menu={"mathsOtherFunctions"} subMenu={"hypFunctions"} className={"hyp-functions"} latexTitle={"\\text{hyp}"}/>
                <InequalityMenuTab isSubMenu menu={"mathsOtherFunctions"} subMenu={"logFunctions"} className={"log-functions"} latexTitle={"\\text{log}"}/>
                {menuItems.mathsDerivatives.length > 0 && <InequalityMenuTab isSubMenu menu={"mathsOtherFunctions"} subMenu={"derivatives"} className={"derivatives"} latexTitle={"\\frac{\\mathrm{d}y}{\\mathrm{d}x}"}/>}
            </ul>
            {activeSubMenu === "trigFunctions" && <ul className="sub-menu trig-functions">{menuItems.mathsTrigFunctions.map(buildIndexedMenuItem)}</ul>}
            {activeSubMenu === "hypFunctions" && <ul className="sub-menu hyp-functions">{menuItems.mathsHypFunctions.map(buildIndexedMenuItem)}</ul>}
            {activeSubMenu === "logFunctions" && <ul className="sub-menu log-functions">{menuItems.mathsLogFunctions.map(buildIndexedMenuItem)}</ul>}
            {activeSubMenu === "derivatives" && <ul className="sub-menu derivatives">{menuItems.mathsDerivatives.map(buildIndexedMenuItem)}</ul>}
        </div>;
    } else {
        return <div className="top-menu maths other-functions">
            <ul className="sub-menu functions">
                {menuItems.otherFunctions.map(buildIndexedMenuItem)}
                {menuItems.mathsDerivatives.map(buildIndexedMenuItem)}
            </ul>
        </div>;
    }
};

const ChemistryOtherFunctionsMenu = ({defaultMenu, menuItems}: {defaultMenu: boolean; menuItems: MenuItems}) => {
    if (defaultMenu || (menuItems.otherChemistryFunctions.length === 0)) {
        return <div className="top-menu chemistry operations">
            <ul className="sub-menu operations">{menuItems.chemicalOperations.map(buildIndexedMenuItem)}</ul>
        </div>;
    } else {
        return <div className="top-menu chemistry operations"> 
            <ul className="sub-menu operations">
                {menuItems.otherChemistryFunctions.map(buildIndexedMenuItem)}
            </ul>
        </div>;
    }
};

const LettersMenu = ({defaultMenu, menuItems, editorMode, activeSubMenu}: {defaultMenu: boolean; menuItems: MenuItems, editorMode: EditorMode, activeSubMenu: InequalityMenuSubMenuTabType}) => {
    if (defaultMenu) {
        return <div className="top-menu letters">
            <ul className="sub-menu-tabs">
                <InequalityMenuTab isSubMenu menu={"letters"} subMenu={"lowerCaseLetters"} latexTitle={"ab"}/>
                <InequalityMenuTab isSubMenu menu={"letters"} subMenu={"upperCaseLetters"} latexTitle={"AB"}/>
                {editorMode === "maths" && <>
                    <InequalityMenuTab isSubMenu menu={"letters"} subMenu={"lowerCaseGreekLetters"} latexTitle={"αβ"}/>
                    <InequalityMenuTab isSubMenu menu={"letters"} subMenu={"upperCaseGreekLetters"} latexTitle={"ΓΔ"}/>
                </>}
            </ul>
            {activeSubMenu === "upperCaseLetters" && <ul className="sub-menu uppercaseletters">{menuItems.upperCaseLetters.map(buildIndexedMenuItem)}</ul>}
            {activeSubMenu === "lowerCaseLetters" && <ul className="sub-menu lowercaseletters">{menuItems.lowerCaseLetters.map(buildIndexedMenuItem)}</ul>}
            {editorMode === "maths" && <>
                {activeSubMenu === "upperCaseGreekLetters" && <ul className="sub-menu uppercasegreekletters">{menuItems.upperCaseGreekLetters.map(buildIndexedMenuItem)}</ul>}
                {activeSubMenu === "lowerCaseGreekLetters" && <ul className="sub-menu lowercasegreekletters">{menuItems.lowerCaseGreekLetters.map(buildIndexedMenuItem)}</ul>}
            </>}
        </div>;
    } else {
        return <div className="top-menu letters">
            <ul className="sub-menu letters">{menuItems.letters.map(buildIndexedMenuItem)}</ul>
        </div>;
    }
};

interface InequalityMenuProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    editorMode: EditorMode;
    logicSyntax: LogicSyntax;
    defaultMenu: boolean;
    disableLetters: boolean;
    menuItems: MenuItems;
    availableSymbols: string[] | undefined;
}
const InequalityMenu = React.forwardRef<HTMLDivElement, InequalityMenuProps>(({open, setOpen, editorMode, logicSyntax, defaultMenu, disableLetters, menuItems, availableSymbols} : InequalityMenuProps, menuRef) => {
    // Logic for what menu tab is currently open
    const [[activeMenu, activeSubMenu], setActiveMenu] = useState<[InequalityMenuTabType, InequalityMenuSubMenuTabType]>([null, editorMode === "logic" ? "upperCaseLetters" : "lowerCaseLetters"]);
    const openNewMenuTab: (newMenu: [InequalityMenuTabType, InequalityMenuSubMenuTabType]) => void = ([newMenu, newSubMenu]) => {
        if (newMenu === activeMenu && newSubMenu === null) {
            setOpen(false);
            setActiveMenu([null, null]);
        } else {
            setOpen(true);
            setActiveMenu([newMenu, newSubMenu]);
        }
    };

    // Logic for user to enter a custom draggable numerical value
    const [numberInputValue, setNumberInputValue] = useState<number>();
    const updateNumberInputValue = (n: number) => {
        if (!isDefined(numberInputValue) || numberInputValue === 0) return setNumberInputValue(n);
        // Past this point, we know that `numberInputValue` is defined and non-zero
        if (numberInputValue > -100 && numberInputValue < 1000) {
            // Multiple-digit numbers should be limited to 4 characters to fit in the Inequality menu
            setNumberInputValue(numberInputValue * 10 + (Math.sign(numberInputValue) * n));
        }
    };
    const flipNumberInputValueSign = () => {
        if (!isDefined(numberInputValue) || numberInputValue === 0) return setNumberInputValue(0);
        if (numberInputValue >= 1000) {
            setNumberInputValue(-Math.floor(numberInputValue / 10));
        } else {
            setNumberInputValue(-numberInputValue);
        }  
    };
    const clearNumberInputValue = () => setNumberInputValue(undefined);

    // Logic for parsing chemical elements from the chemical element input box and turning them into menu items
    const [unparsedChemicalElements, setUnparsedChemicalElements] = useState<string>();
    const onUnparsedChemicalElementsChange = (event: FormEvent<HTMLInputElement>) => setUnparsedChemicalElements(event.currentTarget.value);
    const [parsedChemicalElements, upperCaseWarning] = useMemo<[MenuItemProps[] | undefined, boolean]>(() => {
        if (isDefined(unparsedChemicalElements)) {
            const splitUnparsed = unparsedChemicalElements.replace(/[^a-z]+/img, ",").split(",").filter(s => s !== "");
            const splitChemicalElements = splitUnparsed.filter(s => CHEMICAL_ELEMENTS.includes(s));
            const upperCaseWarning = splitUnparsed.some(e => e[0] !== e[0].toUpperCase());
            return [uniq(splitChemicalElements).map(generateChemicalElementMenuItem).filter(isDefined), upperCaseWarning];
        }
        return [undefined, false];
    }, [unparsedChemicalElements]);

    let functionsTabLabel = "";
    if (editorMode === "maths") {
        functionsTabLabel = "+ - \\sqrt{x}";
    } else if (editorMode === "logic") {
        if (logicSyntax === "logic") {
            functionsTabLabel = "\\wedge\\ \\lnot";
        } else {
            functionsTabLabel = "\\cdot\\ \\overline{x}";
        }
    }

    return <nav className="inequality-ui" ref={menuRef}>
        <InequalityMenuContext.Provider value={{activeMenu: [activeMenu, activeSubMenu], openNewMenuTab}}>
            <div className={classNames("inequality-ui menu-bar", open ? "open" : "closed")}>
                {activeMenu === "numbers" && <div className="top-menu numbers">
                    <div className="keypad-box">
                        <div className="top-row">
                            {[1,2,3,4,5,6].map(n => <InequalityMenuNumber key={n} n={n} update={() => updateNumberInputValue(n)}/>)}
                        </div>
                        <div className="bottom-row">
                            {[7,8,9,0].map(n => <InequalityMenuNumber key={n} n={n} update={() => updateNumberInputValue(n)}/>)}
                            <button type="button" className={"key plus-minus"} tabIndex={0}
                                onClick={flipNumberInputValueSign}
                            >
                                <VShape/><Markup encoding={"latex"}>{"$\\pm$"}</Markup>
                            </button>
                        </div>
                    </div>
                    <div className="input-box">
                        <div className={classNames("menu-item", isDefined(numberInputValue) ? "active" : "inactive")}
                            data-item={isDefined(numberInputValue) ? JSON.stringify({ type: "Num", properties: { significand: `${numberInputValue}`} }) : null}
                        >
                            {/* The `span` with a `katex` class is for some reason required for the empty hexagon to have correct layout */}
                            <VShape/>{isDefined(numberInputValue) ? <Markup encoding={"latex"} className={"d-block"}>{`$${numberInputValue}$`}</Markup> : <span className={"katex"}/>}
                        </div>
                        {isDefined(numberInputValue) && <div className="clear-number" role="button" tabIndex={0} onClick={clearNumberInputValue} onKeyUp={clearNumberInputValue}/>}
                    </div>
                </div>}
                {activeMenu === "letters" && !disableLetters && <LettersMenu activeSubMenu={activeSubMenu} editorMode={editorMode} menuItems={menuItems} defaultMenu={defaultMenu}/>}
                {activeMenu === "basicFunctions" && <div className="top-menu basic-functions">
                    {editorMode === "logic" && <ul className="sub-menu">{menuItems.logicFunctionsItems.map(buildIndexedMenuItem)}</ul>}
                    {editorMode === "maths" && <ul className="sub-menu">{menuItems.mathsBasicFunctionsItems.map(buildIndexedMenuItem)}</ul>}
                </div>}
                {editorMode === "maths" && activeMenu === "mathsOtherFunctions" && <MathOtherFunctionsMenu activeSubMenu={activeSubMenu} menuItems={menuItems} defaultMenu={defaultMenu}/>}

                {["chemistry", "nuclear"].includes(editorMode) && <>
                    {activeMenu === "elements" && (isDefined(availableSymbols) && availableSymbols.some(symbol => CHEMICAL_ELEMENTS.includes(symbol) || CHEMICAL_PARTICLES.hasOwnProperty(symbol))
                        ? <div className="top-menu chemistry elements">
                            <ul className="sub-menu elements">
                                {menuItems.chemicalElements.map(buildIndexedMenuItem)}
                            </ul>
                        </div>
                        : <div className="top-menu chemistry elements text-entry">
                            <div className="input-box">
                                <Input id="chem-text-entry-box" type="text" placeholder="Type chemical elements here" onMouseDown={e => e.currentTarget.focus()} value={unparsedChemicalElements || ""} onChange={onUnparsedChemicalElementsChange} />
                                {upperCaseWarning && <p className="uppercase-warning">Careful: chemical element names start with an upper-case letter.</p>}
                            </div>
                            <div className="items-box">
                                <ul className="sub-menu elements">
                                    {parsedChemicalElements?.map(buildIndexedMenuItem)}
                                </ul>
                            </div>
                        </div>
                    )}
                    {activeMenu === "particles" && (!isDefined(availableSymbols) || (isDefined(availableSymbols) && availableSymbols.length === 0)) && <div className="top-menu chemistry particles">
                        <ul className="sub-menu particles">
                            {menuItems.chemicalParticles.map(buildIndexedMenuItem)}
                        </ul>
                    </div>}
                    {activeMenu === "states" && (menuItems.otherChemicalStates.length > 0 || menuItems.otherChemistryFunctions.length == 0) && <div className="top-menu chemistry states">
                        <ul className="sub-menu states">
                            {menuItems.chemicalStates.map(buildIndexedMenuItem)}
                        </ul>
                    </div>}
                    {["chemistry", "nuclear"].includes(editorMode) && activeMenu === "operations" && <ChemistryOtherFunctionsMenu menuItems={menuItems} defaultMenu={defaultMenu}/>}
                </>}
            </div>
            <div id="inequality-menu-tabs" className="menu-tabs">
                <ul>
                    {["maths", "chemistry", "nuclear"].includes(editorMode) && <InequalityMenuTab menu={"numbers"} latexTitle={"1\\, 2\\, 3"}/>}
                    {["maths", "logic"].includes(editorMode) && <>
                        {!disableLetters && <InequalityMenuTab menu={"letters"} subMenu={editorMode === "logic" ? "upperCaseLetters" : "lowerCaseLetters"} latexTitle={"Ab\\ \\Delta \\gamma"}/>}
                        <InequalityMenuTab menu={"basicFunctions"} latexTitle={functionsTabLabel}/>
                    </>}
                    {editorMode === "maths" && <InequalityMenuTab menu={"mathsOtherFunctions"} subMenu={"trigFunctions"} latexTitle={"\\sin\\ \\int"}/>}
                    {["chemistry", "nuclear"].includes(editorMode) && <>
                        <InequalityMenuTab menu={"elements"} latexTitle={isDefined(availableSymbols) && availableSymbols.length > 0 && menuItems.chemicalElements.map(i => i.type).includes("Particle") ? "\\text{He Li}\\ \\alpha" : "\\text{H He Li}"}/>
                        {menuItems.chemicalParticles.length > 0 && <InequalityMenuTab menu={"particles"} latexTitle={"\\alpha\\ \\gamma\\ \\text{e}"}/>}
                        {editorMode === "chemistry" && (menuItems.otherChemicalStates.length > 0 || menuItems.otherChemistryFunctions.length == 0) && <InequalityMenuTab menu={"states"} latexTitle={"(aq)\\, (g)\\, (l)"}/>}
                        <InequalityMenuTab menu={"operations"} latexTitle={"\\rightarrow\\, \\rightleftharpoons\\, +"}/>
                    </>}
                </ul>
            </div>
        </InequalityMenuContext.Provider>
    </nav>;
});

interface InequalityModalProps {
    availableSymbols?: string[];
    close: () => void;
    onEditorStateChange?: (state: any) => void;
    initialEditorSymbols: any;
    editorSeed?: any;
    editorMode: EditorMode;
    logicSyntax?: LogicSyntax;
    questionDoc?: ContentDTO;
}
const InequalityModal = ({availableSymbols, logicSyntax, editorMode, close, onEditorStateChange, questionDoc, initialEditorSymbols, editorSeed}: InequalityModalProps) => {
    const parsedAvailableSymbols = useMemo(() => Array.from(new Set(parsePseudoSymbolicAvailableSymbols(availableSymbols))).filter(s => s.trim() !== ""), [availableSymbols]);

    const inequalityModalRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isTrashActive = useRef<boolean>(false);

    const [showQuestionReminder, setShowQuestionReminder] = useState<boolean>(true);
    const onQuestionReminderClick = () => setShowQuestionReminder(prev => !prev);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const disableLetters = availableSymbols?.includes("_no_alphabet") ?? false;

    // Setting up the Inequality `sketch` object
    const sketch = useRef<Nullable<Inequality>>(null);
    const [editorState, setEditorState] = useState<any>({});
    useLayoutEffect(() => {
        return prepareInequality({
            sketch,
            inequalityModalRef,
            isTrashActive,
            initialEditorSymbols,
            editorMode,
            logicSyntax,
            onEditorStateChange,
            setEditorState
        });
    }, [!!inequalityModalRef]);
    useEffect(() => {
        if (!isDefined(sketch.current)) return;
        sketch.current.onNewEditorState = (state: any) => {
            const modal = inequalityModalRef.current;
            if (modal) {
                const newState = sanitiseInequalityState(state);
                setEditorState((prev: any) => ({...prev, ...newState}));
                onEditorStateChange?.(newState);
            }
        };
    }, [onEditorStateChange]);

    // Help modal logic
    const dispatch = useAppDispatch();
    const showHelpModal = () => dispatch(openActiveModal({
        closeAction: () => { store.dispatch(closeActiveModal()); },
        size: "xl",
        title: "Quick Help",
        body: <PageFragment fragmentId={`eqn_editor_help_modal_${editorMode}`}/>
    }));

    // --- Event handlers (mouse, touch and keyboard) ---

    // WARNING Cursor coordinates on mobile are floating point and this makes
    // math sad, therefore ROUND EVERYTHING OR FACE MADNESS

    const previousCursor = useRef<{x: number; y: number} | null>(null);
    const potentialSymbolSpec = useRef<MenuItemProps | null>(null);
    const movingMenuItem = useRef<HTMLElement | null>(null);
    const movingMenuBar = useRef<HTMLElement | null>(null);
    const disappearingMenuItem = useRef<HTMLElement | null>(null);
    const isMouseDown = useRef<boolean>(false);
    const isDragging = useRef<boolean>(false);

    const handlerState = {
        previousCursor,
        potentialSymbolSpec,
        movingMenuItem,
        movingMenuBar,
        disappearingMenuItem,
        sketch
    };

    const prepareAbsoluteElement = useCallback((element?: Element | null) => {
        if (element) {
            const menuItem = element.closest<HTMLElement>(".menu-item");
            if (menuItem) {
                potentialSymbolSpec.current = JSON.parse(menuItem.getAttribute("data-item") || "");
                movingMenuItem.current = (menuItem.cloneNode(true) as HTMLElement);
                movingMenuItem.current.id = "moving-menu-item";
                movingMenuItem.current.style.position = "absolute";
                movingMenuItem.current.style.opacity = "0.5";
                movingMenuItem.current.style.zIndex = "255";
                movingMenuItem.current.style.pointerEvents = "none";
                document.body.appendChild(movingMenuItem.current);

                disappearingMenuItem.current = menuItem;
                disappearingMenuItem.current.style.opacity = "0";

                movingMenuBar.current = menuItem.closest<HTMLElement>(".sub-menu");
            }
        }
    }, []);

    const handleMove = useCallback((target: HTMLElement, x: number, y: number) => {
        return handleMoveCallback(handlerState, isTrashActive, menuRef, setMenuOpen, x, y);
    }, []);

    const onMouseDown = useCallback((e: MouseEvent) => {
        // preventDefault here to stop selection on desktop
        e.preventDefault();
        isMouseDown.current = true;
        previousCursor.current = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
        if (potentialSymbolSpec.current && sketch.current) {
            sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, previousCursor.current.x, previousCursor.current.y);
        }
    }, []);

    const onTouchStart = useCallback((e: TouchEvent) =>  {
        // DO NOT preventDefault here
        previousCursor.current = { x: Math.round(e.touches[0].clientX), y: Math.round(e.touches[0].clientY) };
        if (potentialSymbolSpec.current && sketch.current) {
            sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, previousCursor.current.x, previousCursor.current.y);
        }
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current && isMouseDown.current && previousCursor.current) {
            const element = document.elementFromPoint(previousCursor.current.x, previousCursor.current.y);
            prepareAbsoluteElement(element);
            isDragging.current = true;
        }
        handleMove(e.target as HTMLElement, Math.round(e.clientX), Math.round(e.clientY));
    }, []);

    const onTouchMove = useCallback((e: TouchEvent) => {
        // preventDefault here to stop iOS' elastic-banding while moving around (messes with coordinates)
        e.preventDefault();

        if (!isDragging.current && previousCursor.current) {
            const element = document.elementFromPoint(previousCursor.current.x, previousCursor.current.y);
            prepareAbsoluteElement(element);
            isDragging.current = true;
        }
        handleMove(e.target as HTMLElement, Math.round(e.touches[0].clientX), Math.round(e.touches[0].clientY));
    }, []);

    const onCursorMoveEnd = useCallback(() => {
        isDragging.current = false;
        isMouseDown.current = false;
        onCursorMoveEndCallback(handlerState);
    }, []);

    const handleKeyPress = useCallback((ev: KeyboardEvent) => {
        if (ev.code === "Escape") close();
    }, []);

    // --- Resetting to seed value ---
    const resetToInitialState = () => {
        // loadTestCase should probably be renamed to resetSymbolsTo or something (in the inequality package)
        sketch.current?.loadTestCase(editorSeed ?? "");
    };

    // --- Rendering ---

    const [menuItems, defaultMenu] = useMemo<[MenuItems, boolean]>(() => {
        return generateMenuItems({editorMode, logicSyntax: logicSyntax, parsedAvailableSymbols});
    }, [parsedAvailableSymbols]);

    useEffect(() => {
        return setupAndTeardownDocStyleAndListeners({
            inequalityModalRef,
            handleKeyPress,
            onMouseDown,
            onTouchStart,
            onMouseMove,
            onTouchMove,
            onCursorMoveEnd
        });
    }, [!!inequalityModalRef]);

    const previewTexString = editorState.result?.tex as string;

    return <div id="inequality-modal" ref={inequalityModalRef}>
        <div
            className="inequality-ui confirm button"
            role="button" tabIndex={-1}
            onClick={close}
            onKeyUp={close}
        >
            OK
        </div>
        <Markup encoding={"latex"} className={classNames("d-block inequality-ui katex-preview", previewTexString === "" ? "empty" : "")}>
            {previewTexString ? "$" + previewTexString + "$" : undefined}
        </Markup>
        {!showQuestionReminder && <div
            className="inequality-ui show-question button"
            role="button" tabIndex={-1}
            onClick={() => setShowQuestionReminder(true)}
            onKeyUp={() => setShowQuestionReminder(true)}
        >
            Show Question
        </div>}
        <div
            className="inequality-ui centre button"
            role="button" tabIndex={-1}
            onClick={() => sketch.current?.centre()}
            onKeyUp={() => sketch.current?.centre()}
        >
            Centre
        </div>
        <div
            className="inequality-ui help button"
            role="button" tabIndex={-1}
            onClick={showHelpModal}
            onKeyUp={showHelpModal}
        >
            Help
        </div>

        <div id="inequality-reset" className="inequality-ui reset button"
            role="button" tabIndex={-1} onClick={resetToInitialState} onKeyUp={resetToInitialState}
        >
            Reset
        </div>
        <div id="inequality-trash" className={"inequality-ui trash button trash-with-reset"}>Trash</div>

        {showQuestionReminder && (questionDoc?.value || (questionDoc?.children && questionDoc?.children?.length > 0)) && <div className="question-reminder">
            <IsaacContentValueOrChildren value={questionDoc.value} encoding={questionDoc.encoding}>
                {questionDoc?.children}
            </IsaacContentValueOrChildren>
            <div
                className="reminder-toggle"
                role="button" tabIndex={-1}
                onClick={onQuestionReminderClick}
                onKeyUp={onQuestionReminderClick}
            >Hide Question</div>
        </div>}

        <div className="orientation-warning">Our equation editor works best in landscape mode.</div>

        <InequalityMenu
            menuItems={menuItems}
            open={menuOpen}
            setOpen={setMenuOpen}
            defaultMenu={defaultMenu}
            availableSymbols={parsedAvailableSymbols}
            ref={menuRef}
            editorMode={editorMode}
            logicSyntax={logicSyntax ?? "logic"}
            disableLetters={disableLetters}
        />
    </div>;
};

InequalityMenu.displayName = "InequalityMenu";

export default InequalityModal;
