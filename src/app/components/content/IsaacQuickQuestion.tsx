import React, {useRef, useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {useDispatch} from "react-redux";
import {closeActiveModal, logAction, openActiveModal} from "../../state/actions";
import {determineFastTrackSecondaryAction, useFastTrackInformation} from "../../services/fastTrack";
import {RouteComponentProps, withRouter} from "react-router";
import uuid from "uuid";
import {PageFragment} from "../elements/PageFragment";

export const IsaacQuickQuestion = withRouter(({doc, location}: {doc: ApiTypes.IsaacQuickQuestionDTO} & RouteComponentProps) => {
    const dispatch = useDispatch();
    const fastTrackInfo = useFastTrackInformation(doc, location);
    const [isVisible, setVisible] = useState(false);
    const [hideOptions, setHideOptions] = useState(false);
    const answer: ContentDTO = doc.answer as ContentDTO;
    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);
    const attemptUuid = useRef(uuid.v4().slice(0, 8));

    const toggle = (payload: string) => {
        if (isVisible) {
            const eventDetails = {type: "QUICK_QUESTION_CORRECT", questionId: doc.id, attemptUuid: attemptUuid.current, correct: payload};
            dispatch(logAction(eventDetails));
            setHideOptions(true);
            attemptUuid.current = uuid.v4().slice(0, 8);
        } else {
            const eventDetails = {type: "QUICK_QUESTION_CONFIDENCE", questionId: doc.id, attemptUuid: attemptUuid.current, confidence: payload};
            dispatch(logAction(eventDetails));
            const isNowVisible = !isVisible;
            setVisible(isNowVisible);
        }
    };

    const hideAnswer = () => {
        setVisible(false);
        setHideOptions(false);
        attemptUuid.current = uuid.v4().slice(0, 8);
    };

    function quickQuestionInformationModal() {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())},
            title: "Information",
            body: <Row className="mb-3">
                <Col>
                    <span>
                    We regularly review and update our resources and would like more information to help us prioritise our
                    work and to help assess the impact of any changes we make. Data captured from these buttons will be
                    grouped and analyse the data by criteria such as exam board and level studied so that we can identify
                    any specific areas of interest or concern.
                    </span>
                </Col>
            </Row>
        }))
    }

    return <form onSubmit={e => e.preventDefault()}>
        <div className="question-component p-md-5">
            <div className={!fastTrackInfo.isFastTrackPage ? "quick-question" : ""}>
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {!fastTrackInfo.isFastTrackPage ?
                    <div className="quick-question-options" hidden={hideOptions}>
                        <Row>
                            <Col md="9">
                                <h4>{isVisible ?  "" : "Click a button to show the answer"}</h4>
                            </Col>
                            <Col md="3" className="text-center">
                                <Button outline color="primary" className="numeric-help" size="sm" onClick={() => quickQuestionInformationModal()}><i>i</i></Button>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col>
                                {isVisible ? "Was your own answer correct?" : "What is your level of confidence that your own answer is correct?"}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="3" md="3" className="ml-auto">
                                <Button color="red" block className={isVisible ? "active" : ""} onClick={() => toggle(isVisible ? "No" : "Low")}>
                                    {isVisible ? "No" : "Low"}
                                </Button>
                            </Col>
                            <Col sm="3" md="3">
                                <Button color="yellow" block className={isVisible ? "active" : ""} onClick={() => toggle(isVisible ? "Probably" : "Medium")}>
                                    {isVisible ? "Partly" : "Medium"}
                                </Button>
                            </Col>
                            <Col sm="3" md="3" className="mr-auto">
                                <Button color="green" block className={isVisible ? "active" : ""} onClick={() => toggle(isVisible ? "Yes" : "High")}>
                                    {isVisible ? "Yes" : "High"}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    :
                    <div className={`d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row mb-4`}>
                        {secondaryAction && <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pr-sm-2 pr-md-0 pr-lg-3`}>
                            <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block" />
                        </div>}
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 "pl-sm-2 pl-md-0 pl-lg-3`}>
                            <input
                                onClick={() => toggle("fasttrack")} value={isVisible ? "Hide answer" : "Show answer"}
                                className={`h-100 btn btn-secondary btn-block {isVisible ? "active" : ""}`}
                            />
                        </div>
                    </div>
                }
                {isVisible && <Row>
                    <Col sm="12">
                        <Alert color="secondary" className="overflow-auto">
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
                {isVisible && <Row>
                    <Col sm="12" md={{size: 10, offset: 1}}>
                        <Button color="secondary" block className={isVisible ? "active" : ""} onClick={hideAnswer}>
                            Hide answer
                        </Button>
                    </Col>
                </Row>
                }
            </div>
        </div>
    </form>;
});
