import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from "isaac-graph-sketcher";
import debounce from "lodash/debounce";
import {IsaacGraphSketcherQuestionDTO} from "../../../../IsaacApiTypes";
import {calculateHexagonProportions, Hexagon} from "../svg/Hexagon";
import classNames from "classnames";
import {
    closeActiveModal,
    openActiveModal,
    store,
    useAppDispatch,
    useGenerateAnswerSpecificationMutation
} from "../../../state";
import {PageFragment} from "../PageFragment";
import {above, isStaff, useDeviceSize, useDeviceHeight} from "../../../services";
import {Immutable} from "immer";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {IsaacContentValueOrChildren} from "../../content/IsaacContentValueOrChildren";
import {fillScreenWithModal} from "./inequality/utils";

interface GraphSketcherModalProps {
    user: Immutable<PotentialUser> | null;
    close: () => void;
    initialState?: GraphSketcherState;
    onGraphSketcherStateChange: (state: GraphSketcherState) => void;
    question?: IsaacGraphSketcherQuestionDTO;
}

const GraphSketcherModal = (props: GraphSketcherModalProps) => {
    const { onGraphSketcherStateChange, close, initialState, user } = props;
    const [drawingColorName, setDrawingColorName] = useState("Blue");
    const [lineType, setLineType] = useState(LineType.BEZIER);

    const [generateGraphSpec, {data: graphSpec}] = useGenerateAnswerSpecificationMutation();
    const [debugSketch, setDebugSketch] = useState<boolean>(false);
    const debugModeEnabled = isStaff(user) && debugSketch;
    const [showSlop, setShowSlop] = useState<boolean>(false);

    const [modalSketch, setModalSketch] = useState<GraphSketcher | undefined | null>();
    const graphSketcherContainer = useRef<HTMLDivElement>(null);

    // Help modal logic
    const dispatch = useAppDispatch();
    const showHelpModal = () => dispatch(openActiveModal({
        closeAction: () => { store.dispatch(closeActiveModal()) },
        size: "xl",
        title: "Quick Help",
        body: <PageFragment fragmentId={`graph_sketcher_help_modal`}/>
    }));

    const generateSpecFromStateIfDebug = useCallback((state?: GraphSketcherState) => {
        if (state && debugModeEnabled) {
            generateGraphSpec({type: 'graphChoice', value: JSON.stringify(GraphSketcher.toExternalState(state))});
        }
    }, [user, debugModeEnabled, generateGraphSpec]);

    // This is debounced here because the graph sketcher upstream calls this
    // on every redraw, which happens on every mouse event.
    const updateGraphSketcherState = useCallback(debounce((newState: GraphSketcherState) => {
        onGraphSketcherStateChange(newState);
        generateSpecFromStateIfDebug(newState);
    }, 250, {trailing: true}), [onGraphSketcherStateChange, generateSpecFromStateIfDebug]);

    useEffect(() => {
        if (modalSketch) {
            modalSketch.updateGraphSketcherState = updateGraphSketcherState;
        }
    }, [modalSketch, updateGraphSketcherState]);

    // Setup and teardown of the graph sketcher p5 instance
    useEffect(function setupOfGraphSketcherP5Instance() {
        const { sketch, p } = makeGraphSketcher(graphSketcherContainer.current ?? undefined, window.innerWidth, window.innerHeight, { previewMode: false, initialCurves: initialState?.curves, allowMultiValuedFunctions: isStaff(user) });

        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            setModalSketch(sketch);
        }
        fillScreenWithModal(true);

        return function teardown() {
            fillScreenWithModal(false);
            sketch?.teardown();
            setModalSketch(null);

            if (graphSketcherContainer.current) {
                for (const canvas of graphSketcherContainer.current.getElementsByTagName('canvas')) {
                    graphSketcherContainer.current.removeChild(canvas);
                }
            }
            p.remove();
        }
    }, []);

    useEffect(() => {
        if (modalSketch) {
            modalSketch.drawingColorName = drawingColorName;
        }
    }, [modalSketch, drawingColorName]);

    useEffect(() => {
        if (modalSketch) {
            modalSketch.selectedLineType = lineType;
        }
    }, [modalSketch, lineType]);

    useEffect(() => {
        modalSketch?.setSlopVisible(showSlop);
    }, [modalSketch, showSlop]);

    const toggleDebugMode = () => {
        setDebugSketch(db => !db);
    };

    const isRedoable = () => {
        return modalSketch?.isRedoable();
    };

    const isUndoable = () => {
        return modalSketch?.isUndoable();
    }

    const undo = () => modalSketch?.undo();

    const redo = () => modalSketch?.redo();

    const deviceSize = useDeviceSize();
    const deviceHeight = useDeviceHeight();
    const hexagonSize = above['sm'](deviceSize) && above['sm'](deviceHeight) ? 74 : 48;
    const colourHexagon = calculateHexagonProportions(hexagonSize/4, 3);

    const copySpecificationToClipboard = useCallback(() => {
        if (graphSpec && graphSpec.length > 0 && graphSpec[0] !== "") {
            navigator.clipboard.writeText(graphSpec.join("\n"));
        }
    }, [graphSpec]);

    const [showQuestionReminder, setShowQuestionReminder] = useState<boolean>(true);
    const onQuestionReminderClick = () => setShowQuestionReminder(prev => !prev);
    const questionDoc = props.question;

    return <div id='graph-sketcher-modal' ref={graphSketcherContainer} style={{border: '5px solid black'}}>
        <div className="graph-sketcher-ui">
            <button title="Redo last change" className={ [ 'button', isRedoable() ? 'visible' : 'hidden' ].join(' ') } onClick={redo} onKeyUp={redo} tabIndex={0} id="graph-sketcher-ui-redo-button">Redo</button>
            <button title="Undo last change" className={ [ 'button', isUndoable() ? 'visible' : 'hidden' ].join(' ') } onClick={undo} onKeyUp={undo} tabIndex={0} id="graph-sketcher-ui-undo-button">Undo</button>
            <div title="Draw polynomial curve" className={ [ 'button', lineType === LineType.BEZIER ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.BEZIER) } onKeyUp={ () => setLineType(LineType.BEZIER) } tabIndex={0} id="graph-sketcher-ui-bezier-button">Polynomial curve</div>
            <div title="Draw straight line" className={ [ 'button', lineType === LineType.LINEAR ? 'active' : '' ].join(' ') } role="button" onClick={ () => setLineType(LineType.LINEAR) } onKeyUp={ () => setLineType(LineType.LINEAR) } tabIndex={0} id="graph-sketcher-ui-linear-button">Straight line</div>
            <button title="Delete selected curve" className={'button'} tabIndex={0} id="graph-sketcher-ui-trash-button">Delete selected curve</button>
            <button title="Delete all curves" className={'button'} tabIndex={0} id="graph-sketcher-ui-reset-button">Delete all curves</button>
            <div className="button" role="button" onClick={close} onKeyUp={close} tabIndex={0} id="graph-sketcher-ui-submit-button">Submit</div>
            <div className="button" role="button" onClick={showHelpModal} onKeyUp={showHelpModal} tabIndex={0} id="graph-sketcher-ui-help-button">Help</div>
            {isStaff(user) && <div className="button" role="button" onClick={toggleDebugMode} onKeyUp={toggleDebugMode} tabIndex={0} id="graph-sketcher-ui-debug-button">Debug</div>}

            {!showQuestionReminder && <div
                className="button"
                id="graph-sketcher-ui-question-button"
                role="button" tabIndex={-1}
                onClick={() => setShowQuestionReminder(true)}
                onKeyUp={() => setShowQuestionReminder(true)}
            >
                Show Question
            </div>}

            {debugModeEnabled && <code id="graph-sketcher-ui-debug-window">
                <b>Debug mode enabled</b><br/><br/>
                {graphSpec && graphSpec.length > 0 && graphSpec[0] !== ""
                    ? <>
                        {graphSpec.map((spec, i) => <pre className={"border-0 p-0 m-0"} key={i}>{spec}</pre>)}
                        <a id="copy-link" onClick={copySpecificationToClipboard}>(copy to clipboard)</a>
                    </>
                    : "Please update the graph to generate a specification."
                }
                <br/><br/>
                <input type="checkbox" id="graph-sketcher-ui-show-slop" tabIndex={0} checked={showSlop} onChange={() => setShowSlop(s => !s)} />
                <label htmlFor="graph-sketcher-ui-show-slop" className="ml-2">Show slop</label>
            </code>}

            <input className={"d-none"} id="graph-sketcher-ui-color-select" value={drawingColorName} readOnly />
            <div id="graph-sketcher-ui-color-select-hexagons">
                <svg width={90} height={90}>
                    <Hexagon
                        {...colourHexagon} id={"blue-hex-colour"}
                        transform={`translate(${hexagonSize/4 + 3 + 5}, 5)`}
                        className={classNames({"active": drawingColorName === "Blue"})}
                        onClick={() => setDrawingColorName("Blue")}
                    />
                    <Hexagon
                        {...colourHexagon} id={"orange-hex-colour"}
                        transform={`translate(5, ${hexagonSize/2 + 5})`}
                        className={classNames({"active": drawingColorName === "Orange"})}
                        onClick={() => setDrawingColorName("Orange")}
                    />
                    <Hexagon
                        {...colourHexagon} id={"green-hex-colour"}
                        transform={`translate(${hexagonSize/2 + 6 + 5}, ${hexagonSize/2 + 5})`}
                        className={classNames({"active": drawingColorName === "Green"})}
                        onClick={() => setDrawingColorName("Green")}
                    />
                </svg>
                <p className={"hover-text"}>Line colour</p>
            </div>
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
        </div>
    </div>
}
export default GraphSketcherModal;