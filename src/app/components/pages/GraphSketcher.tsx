import React, {useEffect, useRef, useState} from 'react';
import {selectors, useAppSelector, useGenerateAnswerSpecificationMutation} from "../../state";
import {Col, Container, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from '../elements/TitleAndBreadcrumb';
import {GraphChoiceDTO} from '../../../IsaacApiTypes';
import {
    GraphSketcher,
    GraphSketcherState,
    LineType,
    makeGraphSketcher
} from "isaac-graph-sketcher";
import GraphSketcherModal from '../elements/modals/GraphSketcherModal';
import {isDefined, isStaff} from "../../services";

const GraphSketcherPage = () => {
    const user = useAppSelector(selectors.user.orNull);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState<GraphChoiceDTO | undefined>();
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const [initialState, setInitialState] = useState<GraphSketcherState>();
    const previewRef = useRef(null);
    const [generateGraphSpec, {data: graphSpec}] = useGenerateAnswerSpecificationMutation();

    function openModal() {
        setModalVisible(true);
    }

    function closeModal() {
        if (currentAttempt?.value && isStaff(user)) {
            generateGraphSpec({ type: 'graphChoice', value: currentAttempt.value});
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
        };
    }, []);

    const onGraphSketcherStateChange = (newState: GraphSketcherState) => {
        setInitialState(newState);
        setCurrentAttempt({type: 'graphChoice', value: JSON.stringify(GraphSketcher.toExternalState(newState))});
        if (previewSketch) {
            previewSketch.state = newState;
            previewSketch.state.curves = previewSketch.state.curves || [];
        }
    };

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
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Graph Sketcher demo page" icon={{type: "icon", icon: "icon-concept"}} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="graph-sketcher-question">
                        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role="button" tabIndex={0}>
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
                </Col>
            </Row>
            <div className="question-content d-flex justify-content-center d-print-none">
                <div><i>{isDefined(currentAttempt?.value) ? "Click on the grid to edit your sketch." : "Click on the grid to start your sketch."}</i></div>
            </div>
        </Container>
    </div>;
};
export default GraphSketcherPage;
