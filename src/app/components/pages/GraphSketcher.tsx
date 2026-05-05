import React, {useCallback, useEffect, useRef, useState} from 'react';
import {selectors, useAppSelector, useGenerateAnswerSpecificationMutation} from "../../state";
import {Container} from 'reactstrap';
import {TitleAndBreadcrumb} from '../elements/TitleAndBreadcrumb';
import {GraphChoiceDTO} from '../../../IsaacApiTypes';
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from "isaac-graph-sketcher";
import GraphSketcherModal from '../elements/modals/GraphSketcherModal';
import {ifKeyIsEnter, isDefined, isStaff, useModalWithScroll} from "../../services";

const GraphSketcherPage = () => {
    const user = useAppSelector(selectors.user.orNull);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    const [currentAttempt, setCurrentAttempt] = useState<GraphChoiceDTO | undefined>();
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const [initialState, setInitialState] = useState<GraphSketcherState>();
    const previewRef = useRef(null);
    const [generateGraphSpec, {data: graphSpec}] = useGenerateAnswerSpecificationMutation();

    const onGraphSketcherStateChange = (newState: GraphSketcherState) => {
        setInitialState(newState);
        setCurrentAttempt({type: 'graphChoice', value: JSON.stringify(GraphSketcher.toExternalState(newState))});
        if (previewSketch) {
            previewSketch.state = newState;
            previewSketch.state.curves = previewSketch.state.curves || [];
        }
    };

    const closeModal = useCallback(async () => {
        if (currentAttempt?.value && isStaff(user)) {
            await generateGraphSpec({ type: 'graphChoice', value: currentAttempt.value});
        }
        closeModalAndReturnToScrollPosition();
    }, [currentAttempt?.value, user, generateGraphSpec, closeModalAndReturnToScrollPosition]);

    const handleKeyPress = useCallback(async (ev: KeyboardEvent) => {
        if (ev.code === 'Escape') {
            await closeModal();
        }
    }, [closeModal]);

    useEffect(() => {
        window.addEventListener('keyup', handleKeyPress);

        return () => {
            window.removeEventListener('keyup', handleKeyPress);
        };
    }, [closeModal, handleKeyPress]);

    useEffect(() => {
        if (previewSketch) return;
        if (makeGraphSketcher && previewRef.current) {
            const { sketch } = makeGraphSketcher(previewRef.current || undefined, 1000, 600, { previewMode: true, initialCurves: initialState?.curves });
            if (sketch) {
                sketch.selectedLineType = LineType.BEZIER;
                setPreviewSketch(sketch);
            }
        }
    }, [previewRef, previewSketch]);

    useEffect(() => {
        // Set the state of the preview box whenever currentAttempt changes
        if (previewSketch && currentAttempt?.value) {
            const data: GraphSketcherState = JSON.parse(currentAttempt.value);
            data.canvasWidth = 1000;
            data.canvasHeight = 600;
            data.curves = data.curves || [];
            previewSketch.state = data;
        }
    }, [currentAttempt]);

    return <div>
        <Container>
            <TitleAndBreadcrumb currentPageTitle="Graph Sketcher demo page" icon={{type: "icon", icon: "icon-concept"}} />
            <div className="graph-sketcher-question">
                <div className="sketch-preview" onClick={openModal} onKeyUp={ifKeyIsEnter(openModal)} role="button" tabIndex={0}>
                    <div ref={previewRef} className={`graph-sketcher-preview`} />
                </div>
                {modalVisible && <GraphSketcherModal
                    user={user}
                    close={closeModal}
                    onGraphSketcherStateChange={onGraphSketcherStateChange}
                    initialState={initialState}
                />}
            </div>
            {graphSpec && graphSpec.map((spec, i) => <pre key={i}>{spec}</pre>)}
            <div className="question-content d-flex justify-content-center d-print-none">
                <div><i>{isDefined(currentAttempt?.value) ? "Click on the grid to edit your sketch." : "Click on the grid to start your sketch."}</i></div>
            </div>
        </Container>
    </div>;
};
export default GraphSketcherPage;
