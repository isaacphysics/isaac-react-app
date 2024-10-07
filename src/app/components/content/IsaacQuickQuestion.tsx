import React, {useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import {ContentDTO, IsaacQuickQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {logAction, useAppDispatch} from "../../state";
import {determineFastTrackSecondaryAction, isAda, siteSpecific, useFastTrackInformation} from "../../services";
import {ConfidenceQuestions, useConfidenceQuestionsValues} from "../elements/inputs/ConfidenceQuestions";
import classNames from "classnames";
import {useLocation} from "react-router-dom";

export const IsaacQuickQuestion = ({doc}: {doc: IsaacQuickQuestionDTO}) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const fastTrackInfo = useFastTrackInformation(doc, location);
    const [isVisible, setVisible] = useState(false);
    const answer: ContentDTO = doc.answer as ContentDTO;
    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);

    // Confidence questions
    const {confidenceState, setConfidenceState, validationPending, setValidationPending, recordConfidence, confidenceDisabled} = useConfidenceQuestionsValues(
        doc.showConfidence,
        "quick_question",
        (newCS) => {
            if (newCS === "followUp") setVisible(true);
        }
    );

    const toggle = () => {
        const isNowVisible = !isVisible;
        setVisible(isNowVisible);
        if (isNowVisible) {
            const eventDetails = {type: "QUICK_QUESTION_SHOW_ANSWER", questionId: doc.id};
            dispatch(logAction(eventDetails));
        }
    };

    // We have 3 possible styles for the Show/Hide options (default, fast-track and confidence questions)

    function DefaultOptions() {
        return <Row>
            <Col sm={12} md={siteSpecific({size: 10, offset: 1}, {size: 12})}>
                <Button color="secondary" block className={classNames({"active": isVisible})} onClick={toggle}>
                    {isVisible ? "Hide answer" : "Show answer"}
                </Button>
            </Col>
        </Row>;
    }

    function FastTrackOptions() {
        return <div
            className={"d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row mb-4"}>
            {secondaryAction &&
            <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pe-sm-2 pe-md-0 pe-lg-3"}>
                <input {...secondaryAction} className="h-100 btn btn-outline-primary"/>
            </div>}
            <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ps-sm-2 ps-md-0 ps-lg-3"}>
                <input
                    onClick={toggle} value={isVisible ? "Hide answer" : "Show answer"}
                    className={classNames("h-100 btn btn-secondary", {"active": isVisible})}
                />
            </div>
        </div>;
    }

    function ConfidenceOptions() {
        const hideAnswer = () => {
            setVisible(false);
            setConfidenceState("initial");
        };
        return <>
            <ConfidenceQuestions state={confidenceState} setState={setConfidenceState}
                                 validationPending={validationPending} setValidationPending={setValidationPending}
                                 disableInitialState={confidenceDisabled}
                                 identifier={doc.id} type={"quick_question"} />
            {isVisible && <Row className="mt-3 no-print">
                <Col sm={12} md={!fastTrackInfo.isFastTrackPage ? siteSpecific({size: 10, offset: 1}, {size: 12}) : {}}>
                    <Button color="secondary" type={"button"} block className={classNames("active", {"hide-answer": isAda})} onClick={hideAnswer}>
                        Hide answer
                    </Button>
                </Col>
            </Row>}
        </>;
    }

    // Select which one of the 3 above options styles we need
    const Options = fastTrackInfo.isFastTrackPage ? FastTrackOptions : (recordConfidence ? ConfidenceOptions : DefaultOptions);

    return <form onSubmit={e => e.preventDefault()}>
        <div className={`question-component ${siteSpecific("p-md-5", "p-md-4")}`}>
            <div className={classNames({"quick-question": !fastTrackInfo.isFastTrackPage})}>
                {isAda &&
                    <div className="quick-question-title">
                        <h3>Try it yourself!</h3>
                    </div>
                }
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {<Options/>}
                {isVisible && <Row>
                    <Col sm={12} md={!fastTrackInfo.isFastTrackPage ? siteSpecific({size: 10, offset: 1}, {size: 12}) : {}}>
                        <Alert className={"quick-q-alert"} color={isAda ? "hide" : "secondary"}>
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
            </div>
        </div>
    </form>;
};
