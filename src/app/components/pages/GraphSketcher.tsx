import React, {lazy, useCallback, useEffect, useRef, useState} from 'react';
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
import {ifKeyIsEnter, isDefined, isStaff, useModalWithScroll} from "../../services";

const GraphSketcherModal = lazy(() => import('../elements/modals/GraphSketcherModal'));

const GraphSketcherPage = () => {
    const user = useAppSelector(selectors.user.orNull);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    const [currentAttempt, setCurrentAttempt] = useState<GraphChoiceDTO | undefined>(undefined);
    const previewSketch = useRef<GraphSketcher | undefined>(undefined);
    const previewRef = useRef(null);
    const [generateGraphSpec, {data: graphSpec}] = useGenerateAnswerSpecificationMutation();

    const initialModalState: GraphSketcherState | undefined = currentAttempt?.value ? GraphSketcher.toInternalState(JSON.parse(currentAttempt.value)) : undefined;
    
    // loads with previous attempt data in real use
    const [pendingAttemptState, setPendingAttemptState] = useState<GraphSketcherState | undefined>(undefined);

    const updatePreviewState = useCallback((attempt: GraphChoiceDTO | undefined) => {
        // Set the state of the preview box whenever currentAttempt changes
        if (previewSketch.current && attempt?.value) {
            const data: GraphSketcherState = GraphSketcher.toInternalState(JSON.parse(attempt.value));
            data.canvasWidth = 1000;
            data.canvasHeight = 600;
            data.curves = data.curves || [];
            previewSketch.current.state = data;
        }
    }, []);

    const closeModal = useCallback(async () => {
        if (pendingAttemptState) {
            const newAttempt = {type: 'graphChoice', value: JSON.stringify(GraphSketcher.toExternalState(pendingAttemptState))};
            
            setCurrentAttempt(newAttempt);
            updatePreviewState(newAttempt);
            setPendingAttemptState(undefined);

            if (isStaff(user)) {
                await generateGraphSpec({ type: 'graphChoice', value: newAttempt.value});
            }
        }

        closeModalAndReturnToScrollPosition();
        
    }, [pendingAttemptState, closeModalAndReturnToScrollPosition, updatePreviewState, user, generateGraphSpec]);

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
    }, [handleKeyPress]);

    useEffect(() => {
        const { sketch, p: p5 } = makeGraphSketcher(previewRef.current, 1000, 600, { previewMode: true });
        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            previewSketch.current = sketch;
        }

        return () => {
            // teardown sketcher instance on unmount
            previewSketch.current?.teardown();
            p5?.remove();
        };
    }, []);

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
                    onGraphSketcherStateChange={setPendingAttemptState}
                    initialState={initialModalState}
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
