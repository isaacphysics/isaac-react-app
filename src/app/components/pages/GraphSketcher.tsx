import React, {useState, useEffect, useRef} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Col, Container, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from '../elements/TitleAndBreadcrumb';
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from '../../../IsaacApiTypes';
import {GraphSketcher, makeGraphSketcher, LineType, GraphSketcherState} from 'isaac-graph-sketcher/src/GraphSketcher';
import {GraphSketcherModal} from '../elements/modals/GraphSketcherModal';

const GraphSketcherPageComponent = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState<GraphChoiceDTO | undefined>();
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const initialState: GraphSketcherState | undefined = undefined;
    const previewRef = useRef(null);

    function openModal() {
        setModalVisible(true);
    }

    function closeModal() {
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
        setCurrentAttempt({type: 'graphChoice', value: JSON.stringify(newState)});
        if (previewSketch) {
            previewSketch.state = newState;
            previewSketch.state.curves = previewSketch.state.curves || [];
        }
    };

    useEffect(() => {
        if (previewSketch) return;
        if (makeGraphSketcher && previewRef.current) {
            const { sketch } = makeGraphSketcher(previewRef.current || undefined, 600, 400, { previewMode: true });
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
            data.canvasWidth = 600;
            data.canvasHeight = 400;
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
                </Col>
            </Row>
        </Container>
    </div>;
}

export const GraphSketcherPage = withRouter(connect()(GraphSketcherPageComponent));