import React, {useEffect, useRef, useState} from 'react';
import {AppState, generateSpecification, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Col, Container, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from '../elements/TitleAndBreadcrumb';
import {GraphChoiceDTO} from '../../../IsaacApiTypes';
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from 'isaac-graph-sketcher/dist/src/GraphSketcher';
import GraphSketcherModal from '../elements/modals/GraphSketcherModal';
import {isStaff} from "../../services";

const GraphSketcherPage = () => {
    const user = useAppSelector((state: AppState) => state && state.user || null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState<GraphChoiceDTO | undefined>();
    const graphSpec = useAppSelector(selectors.questions.graphSketcherSpec);
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const [initialState, setInitialState] = useState<GraphSketcherState>();
    const previewRef = useRef(null);
    const dispatch = useAppDispatch();

    function openModal() {
        setModalVisible(true);
    }

    function closeModal() {
        if (currentAttempt?.value && isStaff(user)) {
            dispatch(generateSpecification({ type: 'graphChoice', value: currentAttempt.value}));
        }
        setModalVisible(false);
    }

    function handleKeyPress(ev: KeyboardEvent) {
        if (ev.code === 'Escape') {
            closeModal();
        }
    }

    useEffect(() => {
        window.addEventListener('keyup', handleKeyPress);

        return () => {
            window.removeEventListener('keyup', handleKeyPress);
        }
    }, []);

    const onGraphSketcherStateChange = (newState: GraphSketcherState) => {
        setInitialState(newState);
        setCurrentAttempt({type: 'graphChoice', value: JSON.stringify(newState)});
        if (previewSketch) {
            previewSketch.state = newState;
            previewSketch.state.curves = previewSketch.state.curves || [];
        }
    };

    useEffect(() => {
        if (previewSketch) return;
        if (makeGraphSketcher && previewRef.current) {
            const { sketch } = makeGraphSketcher(previewRef.current || undefined, 1000, 600, { previewMode: true });
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

    return <div className="pattern-01">
        <Container>
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Graph Sketcher demo page" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="graph-sketcher-question">
                        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role="button" tabIndex={0}>
                            <div ref={previewRef} className={`graph-sketcher-preview`} />
                        </div>
                        {modalVisible && <GraphSketcherModal
                            close={closeModal}
                            onGraphSketcherStateChange={onGraphSketcherStateChange}
                            initialState={initialState}
                        />}
                    </div>
                    {/* TODO af599 This needs checking, not sure why graphSpec is a {[key: number]: string} instead of a string[] */}
                    {graphSpec && Object.keys(graphSpec).map((key) => <pre key={key}>{graphSpec[key as unknown as number]}</pre>)}
                </Col>
            </Row>
        </Container>
    </div>;
};
export default GraphSketcherPage;