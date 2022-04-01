import {Button, Col, Row} from "reactstrap";
import React from "react";
import {closeActiveModal, logAction, openActiveModal} from "../../../state/actions";
import {useDispatch} from "react-redux";
import uuid from "uuid";
import {Confidence, UserEmailPreferences} from "../../../../IsaacAppTypes";
import {confidenceOptions} from "../../../services/confidence";
import classNames from "classnames";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";


interface QuestionConfidenceProps {
    hideOptions: boolean;
    setHideOptions: (e: boolean) => void;
    isVisible: boolean;
    setVisible: (e: boolean) => void;
    identifier: any;
    attemptUuid: React.MutableRefObject<string>;
    type: Confidence;
    correct?: boolean;
    answer?: any;
}

export const ConfidenceQuestions = ({hideOptions, setHideOptions, isVisible, setVisible, identifier, attemptUuid, type, correct, answer}: QuestionConfidenceProps) => {
    const dispatch = useDispatch();
    const isCs = SITE_SUBJECT === SITE.CS;

    const confidenceVariables = confidenceOptions(type);

    const twoParts = confidenceVariables?.secondQuestion;

    const toggle = (payload?: string) => {
        if (isVisible) {
            if (type === "question") {
                const eventDetails = {
                    type: "QUICK_QUESTION_CORRECT",
                    questionId: identifier,
                    attemptUuid: attemptUuid.current,
                    correct: payload,
                    answer: answer,
                    answerCorrect: correct
                };
                dispatch(logAction(eventDetails));
            } else {
                const eventDetails = {
                    type: "QUICK_QUESTION_CORRECT",
                    questionId: identifier,
                    attemptUuid: attemptUuid.current,
                    correct: payload
                };
                dispatch(logAction(eventDetails));
            }
            setHideOptions(true);
            attemptUuid.current = uuid.v4().slice(0, 8);
        } else {
            const eventDetails = {type: "QUICK_QUESTION_CONFIDENCE", questionId: identifier, attemptUuid: attemptUuid.current, confidence: payload};
            dispatch(logAction(eventDetails));
            const isNowVisible = !isVisible;
            setVisible(isNowVisible);
            if (!twoParts) {
                setHideOptions(true);
                attemptUuid.current = uuid.v4().slice(0, 8);
            }
        }
    };

    function confidenceInformationModal() {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())},
            title: "Information",
            body: <Row className="mb-3">
                <Col>
                    <span>
                    We regularly review and update the Isaac platform’s content and would like your input in order to
                    prioritise content and assess the impact of updates. Data captured with these buttons will help us
                    identify priority areas.
                    </span>
                </Col>
            </Row>
        }))
    }

    return <div className={"quick-question-options " + classNames({"quick-question-secondary": SITE_SUBJECT === SITE.CS && isVisible})} hidden={hideOptions}>
        {!isVisible && <Row>
            <Col md="9">
                <h4>{confidenceVariables?.title}</h4>
            </Col>
            <Col md="3" className="text-center not-mobile">
                <Button outline color="primary" className="confidence-help" size="sm" onClick={() => confidenceInformationModal()}><i>i</i></Button>
            </Col>
        </Row>}
        <Row className="mb-2">
            <Col>
                {isVisible ? confidenceVariables?.secondQuestion : confidenceVariables?.firstQuestion}
            </Col>
        </Row>
        <Row>
            <Col sm="3" md="3" className="mx-auto mb-2">
                <Button color={isCs && isVisible ? "negative-answer" : "negative"} block className={isVisible ? "active" : ""} type="submit" onClick={() => toggle(isVisible ? confidenceVariables?.secondOptions?.negative : confidenceVariables?.firstOptions?.negative)}>
                    {isVisible ? confidenceVariables?.secondOptions?.negative : confidenceVariables?.firstOptions?.negative}
                </Button>
            </Col>
            <Col sm="3" md="3" className="mx-auto mb-2">
                <Button color={isCs && isVisible ? "neutral-answer" : "neutral"} block className={isVisible ? "active" : ""} type="submit" onClick={() => toggle(isVisible ? confidenceVariables?.secondOptions?.neutral : confidenceVariables?.firstOptions?.neutral)}>
                    {isVisible ? confidenceVariables?.secondOptions?.neutral : confidenceVariables?.firstOptions?.neutral}
                </Button>
            </Col>
            <Col sm="3" md="3" className="mx-auto mb-2">
                <Button color={isCs && isVisible ?"positive-answer" : "positive"} block className={isVisible ? "active" : ""} type="submit" onClick={() => toggle(isVisible ? confidenceVariables?.secondOptions?.positive : confidenceVariables?.firstOptions?.positive)}>
                    {isVisible ? confidenceVariables?.secondOptions?.positive : confidenceVariables?.firstOptions?.positive}
                </Button>
            </Col>
        </Row>
    </div>;
};
