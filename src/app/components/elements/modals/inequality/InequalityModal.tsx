/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {FormEvent, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {Inequality, makeInequality, WidgetSpec} from "inequality";
import {GREEK_LETTERS_MAP, isDefined} from "../../../../services";
import {IsaacContentValueOrChildren} from '../../../content/IsaacContentValueOrChildren';
import {ContentDTO} from '../../../../../IsaacApiTypes';
import {Input} from "reactstrap";
import classNames from "classnames";
import {Markup} from "../../markup";
import {
    CHEMICAL_ELEMENTS,
    CHEMICAL_PARTICLES,
    DIFFERENTIAL_REGEX,
    EditorMode,
    HYP_FUNCTION_NAMES,
    LOG_FUNCTION_NAMES,
    LogicSyntax,
    LOWER_CASE_GREEK_LETTERS,
    MenuItemProps,
    MenuItems,
    TRIG_FUNCTION_NAMES,
    UPPER_CASE_GREEK_LETTERS
} from "./constants";
import {closeActiveModal, openActiveModal, store, useAppDispatch} from "../../../../state";
import {PageFragment} from "../../PageFragment";
import {isEqual, uniq, uniqWith} from "lodash";
import {
    generateChemicalElementMenuItem,
    generateDefaultMenuItems,
    generateLetterMenuItem,
    generateMathsDerivativeAndLetters,
    generateMathsDifferentialAndLetters,
    generateMathsLogFunctionItem,
    generateMathsTrigFunctionItem,
    generateSingleLetterMenuItem,
    parsePseudoSymbolicAvailableSymbols,
    sanitiseInequalityState
} from "./utils";

const MenuItem = (props: MenuItemProps) => {
    return <li
        data-item={JSON.stringify(props)} // TODO Come up with a better way than this.
        className={classNames(props.menu.className, "menu-item")} 
        style={{fontSize: props.menu.fontSize}}
    >
        <VHexagon/><Markup encoding={"latex"}>{`$${props.menu.label}$`}</Markup>
    </li>;
};
const buildIndexedMenuItem = (props: MenuItemProps, i: number) => <MenuItem key={i} {...props}/>;

export const VHexagon = () =>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 173.5 200" className="v-hexagon" xmlSpace="preserve" enableBackground={"new 0 0 173.5 200"}>
        <polygon points="0.7,50 0.7,150 87.3,200 173.9,150 173.9,50 87.3,0 " />
    </svg>;

export const TabTriangle = () =>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 136 23" className="tab-triangle" xmlSpace="preserve" enableBackground={"new 0 0 76 23"}>
          <polygon points="0,0 136,0 68,23"/>
    </svg>;

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
        {isSubMenu ? <VHexagon/> : <TabTriangle/>}<Markup encoding={"latex"}>{`$${latexTitle}$`}</Markup>
    </li>;
};

const InequalityMenuNumber = ({n, update}: {n: number, update: () => void}) => {
    return <div
        className="key menu-item number"
        role="button"
        tabIndex={0}
        data-item={JSON.stringify({ type: "Num", properties: { significand: n.toString() } })}
        onClick={update}
        onTouchEnd={update}
        onKeyUp={update}
    >
        <VHexagon/><Markup encoding={"latex"}>{`$${n.toString()}$`}</Markup>
    </div>
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
        </div>
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
const InequalityMenu = React.forwardRef<HTMLDivElement, InequalityMenuProps>(({open, setOpen, editorMode, logicSyntax, defaultMenu, disableLetters, menuItems, availableSymbols}, menuRef) => {
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
    }

    // Logic for user to enter a custom draggable numerical value
    const [numberInputValue, setNumberInputValue] = useState<number>();
    const updateNumberInputValue = (n: number) => {
        if (!isDefined(numberInputValue) || numberInputValue === 0) return setNumberInputValue(n);
        // Past this point, we know that `numberInputValue` is defined and non-zero
        setNumberInputValue(numberInputValue * 10 + (Math.sign(numberInputValue) * n));
    }
    const flipNumberInputValueSign = () => setNumberInputValue(-(numberInputValue ?? 0));
    const clearNumberInputValue = () => setNumberInputValue(undefined);

    // Logic for parsing chemical elements from the chemical element input box and turning them into menu items
    const [unparsedChemicalElements, setUnparsedChemicalElements] = useState<string>();
    const onUnparsedChemicalElementsChange = (event: FormEvent<HTMLInputElement>) => setUnparsedChemicalElements(event.currentTarget.value);
    const [parsedChemicalElements, upperCaseWarning] = useMemo<[MenuItemProps[] | undefined, boolean]>(() => {
        if (isDefined(unparsedChemicalElements)) {
            const splitUnparsed = unparsedChemicalElements.replace(/[^a-z]+/img, ',').split(',').filter(s => s !== '');
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
                            <div className={"key plus-minus"} role="button" tabIndex={0}
                                 onClick={flipNumberInputValueSign}
                                 onTouchEnd={flipNumberInputValueSign}
                                 onKeyUp={flipNumberInputValueSign}
                            >
                                <VHexagon/><Markup encoding={"latex"}>{"$\\pm$"}</Markup>
                            </div>
                        </div>
                    </div>
                    <div className="input-box">
                        <div className={classNames("menu-item", isDefined(numberInputValue) ? "active" : "inactive")}
                             data-item={isDefined(numberInputValue) ? JSON.stringify({ type: 'Num', properties: { significand: `${numberInputValue}`} }) : null}
                        >
                            {/* The `span` with a `katex` class is for some reason required  */}
                            <VHexagon/>{isDefined(numberInputValue) ? <Markup encoding={"latex"} className={"d-block"}>{`$${numberInputValue}$`}</Markup> : <span className={"katex"}/>}
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

                {editorMode === "chemistry" && <>
                    {activeMenu === "elements" && (isDefined(availableSymbols) && availableSymbols.length > 0
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
                    {activeMenu === "states" && <div className="top-menu chemistry states">
                        <ul className="sub-menu states">
                            {menuItems.chemicalStates.map(buildIndexedMenuItem)}
                        </ul>
                    </div>}
                    {editorMode === 'chemistry' && activeMenu === "operations" && <div className="top-menu chemistry operations">
                        <ul className="sub-menu operations">
                            {menuItems.chemicalOperations.map(buildIndexedMenuItem)}
                        </ul>
                    </div>}
                </>}
            </div>
            <div id="inequality-menu-tabs" className="menu-tabs">
                <ul>
                    {["maths", "chemistry"].includes(editorMode) && <>
                        <InequalityMenuTab menu={"numbers"} latexTitle={"1\\, 2\\, 3"}/>
                        {!disableLetters && <InequalityMenuTab menu={"letters"} subMenu={editorMode === 'logic' ? "upperCaseLetters" : "lowerCaseLetters"} latexTitle={"Ab\\ \\Delta \\gamma"}/>}
                        <InequalityMenuTab menu={"basicFunctions"} latexTitle={functionsTabLabel}/>
                    </>}
                    {editorMode === "maths" && <InequalityMenuTab menu={"mathsOtherFunctions"} subMenu={"trigFunctions"} latexTitle={"\\sin\\ \\int"}/>}
                    {editorMode === "chemistry" && <>
                        <InequalityMenuTab menu={"elements"} latexTitle={isDefined(availableSymbols) && availableSymbols.length > 0 && menuItems.chemicalElements.map(i => i.type).includes("Particle") ? "\\text{He Li}\\ \\alpha" : "\\text{H He Li}"}/>
                        {menuItems.chemicalParticles.length > 0 && <InequalityMenuTab menu={"particles"} latexTitle={"\\alpha\\ \\gamma\\ \\text{e}"}/>}
                        <InequalityMenuTab menu={"operations"} latexTitle={"(aq)\\, (g)\\, (l)"}/>
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
    editorMode: EditorMode;
    logicSyntax?: LogicSyntax;
    questionDoc?: ContentDTO;
}
const InequalityModal = ({availableSymbols, logicSyntax, editorMode, close, onEditorStateChange, questionDoc, initialEditorSymbols}: InequalityModalProps) => {
    const parsedAvailableSymbols = useMemo(() => Array.from(new Set(parsePseudoSymbolicAvailableSymbols(availableSymbols))).filter(s => s.trim() !== ''), [availableSymbols]);

    const inequalityModalRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isTrashActive = useRef<boolean>(false);

    const [showQuestionReminder, setShowQuestionReminder] = useState<boolean>(true);
    const onQuestionReminderClick = () => setShowQuestionReminder(prev => !prev);
    
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const disableLetters = availableSymbols?.includes('_no_alphabet') ?? false;

    // Setting up the Inequality `sketch` object
    const sketch = useRef<Nullable<Inequality>>(null);
    useLayoutEffect(() => {
        console.log("initialising sketch with: ", inequalityModalRef.current);
        // TODO seems like the sketch is broken because the inequality modal div element disappears from underneath it
        // Using `createRef` instead seems to half fix it for some reason
        const { sketch: newSketch } = makeInequality(
            inequalityModalRef.current,
            window.innerWidth,
            window.innerHeight,
            initialEditorSymbols,
            {
                editorMode: editorMode ?? "logic",
                logicSyntax: logicSyntax ?? "logic",
                textEntry: false,
                fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf'
            }
        );
        if (!isDefined(newSketch)) {
            throw new Error("Unable to initialize inequality.");
        }
        newSketch.log = {
            initialState: [],
            actions: [{
                event: "OPEN",
                timestamp: Date.now()
            }]
        };
        newSketch.onCloseMenus = () => undefined;
        newSketch.isTrashActive = () => isTrashActive.current;
        newSketch.onNewEditorState = (state: any) => {
            const modal = inequalityModalRef.current;
            if (modal) {
                const newState = sanitiseInequalityState(state);
                setEditorState((prev: any) => ({...prev, ...newState}));
                onEditorStateChange?.(newState);
            }
        };
        sketch.current = newSketch;
        return () => {
            if (sketch.current) {
                sketch.current.onNewEditorState = () => null;
                sketch.current.onCloseMenus = () => null;
                sketch.current.isTrashActive = () => false;
                sketch.current = null;
            }
        };
    }, [inequalityModalRef.current]);
    const [editorState, setEditorState] = useState<any>({});
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
        closeAction: () => { store.dispatch(closeActiveModal()) },
        size: 'xl',
        title: 'Quick Help',
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

    const prepareAbsoluteElement = useCallback((element?: Element | null) => {
        if (element) {
            const menuItem = element.closest<HTMLElement>(".menu-item");
            if (menuItem) {
                potentialSymbolSpec.current = JSON.parse(menuItem.getAttribute("data-item") || "");
                movingMenuItem.current = (menuItem.cloneNode(true) as HTMLElement);
                movingMenuItem.current.id = 'moving-menu-item';
                movingMenuItem.current.style.position = 'absolute';
                movingMenuItem.current.style.opacity = '0.5';
                movingMenuItem.current.style.zIndex = '255';
                movingMenuItem.current.style.pointerEvents = 'none';
                document.body.appendChild(movingMenuItem.current);

                disappearingMenuItem.current = menuItem;
                disappearingMenuItem.current.style.opacity = "0";

                movingMenuBar.current = menuItem.closest<HTMLElement>(".sub-menu");
            }
        }
    }, []);

    const handleMove = useCallback((target: HTMLElement, x: number, y: number) => {
        const trashCan = document.getElementById('inequality-trash');
        if (trashCan) {
            const trashCanRect = trashCan.getBoundingClientRect();
            if (trashCanRect && x >= trashCanRect.left && x <= trashCanRect.right && y >= trashCanRect.top && y <= trashCanRect.bottom) {
                trashCan.classList.add('active');
                isTrashActive.current = true;
            } else {
                trashCan.classList.remove('active');
                isTrashActive.current = false;
            }
        }

        // No need to run any further if we are not dealing with a menu item.
        if (!movingMenuItem.current) return;

        if (previousCursor.current) {
            const dx =  x - previousCursor.current.x;
            if (movingMenuBar.current) {
                const menuBarRect = movingMenuBar.current.getBoundingClientRect();
                const menuItems = movingMenuBar.current.getElementsByClassName('menu-item');
                const lastMenuItem = menuItems.item(menuItems.length-1);
                if (lastMenuItem) {
                    const newUlLeft = Math.min(0, menuBarRect.left + dx);
                    const lastMenuItemRect = lastMenuItem.getBoundingClientRect();
                    if (lastMenuItemRect.right > window.innerWidth || dx >= 0) {
                        movingMenuBar.current.style.left = `${newUlLeft}px`;
                    }
                }
            }
            movingMenuItem.current.style.top = `${y}px`;
            movingMenuItem.current.style.left = `${x}px`;

            // Auto-close the menu on small-screens when dragging outside the area
            if (window.innerWidth < 1024) {
                const menuBox = menuRef.current?.getBoundingClientRect();
                if (isDefined(menuBox)) {
                    if (previousCursor.current.y <= menuBox.height && y > menuBox.height) {
                        setMenuOpen(false);
                    }
                }
            }
        }
        if (potentialSymbolSpec.current && sketch.current) {
            sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, x, y);
        }

        previousCursor.current = { x, y };
    }, []);

    const onMouseDown = useCallback((e: MouseEvent) => {
        // preventDefault here to stop selection on desktop
        e.preventDefault();
        previousCursor.current = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
        const element = document.elementFromPoint(previousCursor.current.x, previousCursor.current.y);
        prepareAbsoluteElement(element);
        if (potentialSymbolSpec.current && sketch.current) {
            sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, previousCursor.current.x, previousCursor.current.y);
        }
    }, []);

    const onTouchStart = useCallback((e: TouchEvent) =>  {
        // DO NOT preventDefault here
        previousCursor.current = { x: Math.round(e.touches[0].clientX), y: Math.round(e.touches[0].clientY) };
        const element = document.elementFromPoint(previousCursor.current.x, previousCursor.current.y);
        prepareAbsoluteElement(element);
        if (potentialSymbolSpec.current && sketch.current) {
            sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, previousCursor.current.x, previousCursor.current.y);
        }
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        handleMove(e.target as HTMLElement, Math.round(e.clientX), Math.round(e.clientY));
    }, []);

	const onTouchMove = useCallback((e: TouchEvent) => {
        // preventDefault here to stop iOS' elastic-banding while moving around (messes with coordinates)
        e.preventDefault();
        handleMove(e.target as HTMLElement, Math.round(e.touches[0].clientX), Math.round(e.touches[0].clientY));
    }, []);

	const onCursorMoveEnd = useCallback(() => {
        // No need to run if we are not dealing with a menu item.
        if (!movingMenuItem.current) return;

        const menuTabs = document.getElementById('inequality-menu-tabs') as Element;
        const menuTabsRect = menuTabs ? menuTabs.getBoundingClientRect() : null;

        const trashCan = document.getElementById('inequality-trash') as Element;
        const trashCanRect = trashCan ? trashCan.getBoundingClientRect() : null;

        if (previousCursor.current && sketch.current) {
            if (menuTabsRect && previousCursor.current.y <= menuTabsRect.top) {
                sketch.current.abortPotentialSymbol();
            } else if (trashCanRect &&
                previousCursor.current.x >= trashCanRect.left &&
                previousCursor.current.x <= trashCanRect.right &&
                previousCursor.current.y >= trashCanRect.top &&
                previousCursor.current.y <= trashCanRect.bottom) {
                sketch.current.abortPotentialSymbol();
            } else {
                sketch.current.commitPotentialSymbol();
            }
        }

        previousCursor.current = null;
        document.body.removeChild(movingMenuItem.current);
        if (disappearingMenuItem.current) {
            disappearingMenuItem.current.style.opacity = '1';
            disappearingMenuItem.current = null;
        }
        movingMenuItem.current = null;
        movingMenuBar.current = null;
        potentialSymbolSpec.current = null;
    }, []);

    const handleKeyPress = useCallback((ev: KeyboardEvent) => {
        if (ev.code === 'Escape') close();
    }, []);

    // --- Rendering ---

    const [menuItems, defaultMenu] = useMemo<[MenuItems, boolean]>(() => {
        const baseItems = generateDefaultMenuItems(parsedAvailableSymbols, logicSyntax);

        if (isDefined(parsedAvailableSymbols) && Array.isArray(parsedAvailableSymbols) && parsedAvailableSymbols.length > 0) {
            // ~~~ Assuming these are only letters... might become more complicated in the future.
            // THE FUTURE IS HERE! Sorry.
            const customMenuItems: {mathsDerivatives: MenuItemProps[]; letters: MenuItemProps[]; otherFunctions: MenuItemProps[]; chemicalElements: MenuItemProps[]} = {
                mathsDerivatives: new Array<MenuItemProps>(),
                letters: new Array<MenuItemProps>(),
                otherFunctions: new Array<MenuItemProps>(),
                chemicalElements: new Array<MenuItemProps>(),
            };

            parsedAvailableSymbols.forEach((l) => {
                const availableSymbol = l.trim();
                if (availableSymbol.endsWith('()')) {
                    // Functions
                    const functionName = availableSymbol.replace('()', '');
                    if (TRIG_FUNCTION_NAMES.includes(functionName)) {
                        customMenuItems.otherFunctions.push(generateMathsTrigFunctionItem(functionName));
                    } else if (HYP_FUNCTION_NAMES.includes(functionName)) {
                        customMenuItems.otherFunctions.push(generateMathsTrigFunctionItem(functionName));
                    } else if (LOG_FUNCTION_NAMES.includes(functionName)) {
                        customMenuItems.otherFunctions.push(generateMathsLogFunctionItem(functionName));
                    } else {
                        // What
                        // eslint-disable-next-line no-console
                        console.warn(`Could not parse available symbol "${availableSymbol} as a function"`);
                    }
                } else if (availableSymbol.startsWith('Derivative')) {
                    const items = generateMathsDerivativeAndLetters(availableSymbol);
                    if (items.derivative) {
                        customMenuItems.mathsDerivatives.push(...items.derivative);
                        customMenuItems.letters.push(...items.derivative);
                    }
                    if (items.letters) {
                        customMenuItems.letters.push(...items.letters);
                    }
                } else if (DIFFERENTIAL_REGEX.test(availableSymbol)) {
                    const items = generateMathsDifferentialAndLetters(availableSymbol);
                    if (items.differential) {
                        customMenuItems.mathsDerivatives.push(items.differential);
                        customMenuItems.letters.push(items.differential);
                    }
                    if (items.letters) {
                        customMenuItems.letters.push(...items.letters);
                    }
                } else {
                    // Everything else is a letter, unless we are doing chemistry
                    if (editorMode === "chemistry") {
                        // Available chemical elements
                        const item = generateChemicalElementMenuItem(availableSymbol);
                        if (item) {
                            customMenuItems.chemicalElements.push(item);
                        }
                    } else {
                        const item = generateLetterMenuItem(availableSymbol);
                        if (isDefined(item)) {
                            customMenuItems.letters.push(item);
                        }
                    }
                }
            });
            return [{
                ...baseItems,
                mathsDerivatives: [ ...baseItems.mathsDerivatives, ...customMenuItems.mathsDerivatives ],
                letters: uniqWith([ ...baseItems.letters, ...customMenuItems.letters ], (a, b) => isEqual(a, b))/*.sort((a: MenuItem, b: MenuItem) => {
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
                otherFunctions: [ ...baseItems.otherFunctions, ...customMenuItems.otherFunctions ],
                chemicalElements: [ ...baseItems.chemicalElements, ...customMenuItems.chemicalElements ],
            }, false] as [MenuItems, boolean];
        } else {
            if (editorMode === "logic") {
                // T and F are reserved in logic. The jury is still out on t and f.
                return [{
                    ...baseItems,
                    upperCaseLetters: "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map(letter => generateSingleLetterMenuItem(letter)),
                    lowerCaseLetters: "abcdeghijklmnopqrsuvwxyz".split("").map(letter => generateSingleLetterMenuItem(letter)),
                }, true] as [MenuItems, boolean];
            } else if (editorMode === "chemistry") {
                return [{
                    ...baseItems,
                    chemicalElements: CHEMICAL_ELEMENTS.map(generateChemicalElementMenuItem),
                    chemicalParticles: Object.keys(CHEMICAL_PARTICLES).map(generateChemicalElementMenuItem),
                }, true] as [MenuItems, boolean];
            } else {
                // Assuming editorMode === 'maths'
                return [{
                    ...baseItems,
                    upperCaseLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => generateSingleLetterMenuItem(letter)),
                    lowerCaseLetters: "abcdefghijklmnopqrstuvwxyz".split("").map(letter => generateSingleLetterMenuItem(letter)),
                    upperCaseGreekLetters: UPPER_CASE_GREEK_LETTERS.map( letter => generateSingleLetterMenuItem(GREEK_LETTERS_MAP[letter] || letter, GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter) ),
                    lowerCaseGreekLetters: LOWER_CASE_GREEK_LETTERS.map( letter => generateSingleLetterMenuItem(GREEK_LETTERS_MAP[letter] || letter, GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter) ),
                }, true] as [MenuItems, boolean];
            }
        }
    }, [parsedAvailableSymbols]);

    useEffect(() => {
        window.addEventListener("keyup", handleKeyPress);

        if (inequalityModalRef.current) {
            inequalityModalRef.current.addEventListener("mousedown", onMouseDown);
            inequalityModalRef.current.addEventListener("touchstart", onTouchStart);
            inequalityModalRef.current.addEventListener("mousemove", onMouseMove);
            inequalityModalRef.current.addEventListener("touchmove", onTouchMove);
        }
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.addEventListener("mouseup", onCursorMoveEnd);
        document.body.addEventListener("touchend", onCursorMoveEnd);

        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = '100vw';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.touchAction = 'none';
        document.body.style.overflow = "hidden";
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.touchAction = 'none';

        return () => {
            window.removeEventListener("keyup", handleKeyPress);

            if (inequalityModalRef.current) {
                inequalityModalRef.current.removeEventListener('mousedown', onMouseDown);
                inequalityModalRef.current.removeEventListener('touchstart', onTouchStart);
                inequalityModalRef.current.removeEventListener('mousemove', onMouseMove);
                inequalityModalRef.current.removeEventListener('touchmove', onTouchMove);
            }
            // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
            document.body.removeEventListener("mouseup", onCursorMoveEnd);
            document.body.removeEventListener("touchend", onCursorMoveEnd);

            document.documentElement.style.width = '';
            document.documentElement.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.touchAction = 'auto';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = 'auto';

            const canvas = inequalityModalRef.current?.getElementsByTagName('canvas')[0];
            if (canvas) {
                inequalityModalRef.current.removeChild(canvas);
            }
        };
    }, [inequalityModalRef.current]);

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

        <div id="inequality-trash" className="inequality-ui trash button">Trash</div>

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

        <div className="orientation-warning">The Isaac Equation Editor may only be used in landscape mode. Please rotate your device.</div>

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
export default InequalityModal;