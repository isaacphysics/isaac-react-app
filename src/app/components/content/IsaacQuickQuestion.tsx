import React, {useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import {ContentDTO, IsaacQuickQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {useDispatch} from "react-redux";
import {logAction} from "../../state/actions";
import {determineFastTrackSecondaryAction, useFastTrackInformation} from "../../services/fastTrack";
import {ConfidenceQuestions, useConfidenceQuestionsValues} from "../elements/inputs/ConfidenceQuestions";
import {isCS} from "../../services/siteConstants";
import classNames from "classnames";
import {useLocation} from "react-router-dom";

export const IsaacQuickQuestion = ({doc}: {doc: IsaacQuickQuestionDTO}) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const fastTrackInfo = useFastTrackInformation(doc, location);
    const [isVisible, setVisible] = useState(false);
    const answer: ContentDTO = doc.answer as ContentDTO;
    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);

    // Confidence questions
    const {confidenceState, setConfidenceState, recordConfidence, confidenceDisabled} = useConfidenceQuestionsValues(
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
            <Col sm="12" md={{size: 10, offset: 1}}>
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
            <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pr-sm-2 pr-md-0 pr-lg-3"}>
                <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block"/>
            </div>}
            <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pl-sm-2 pl-md-0 pl-lg-3"}>
                <input
                    onClick={toggle} value={isVisible ? "Hide answer" : "Show answer"}
                    className={classNames("h-100 btn btn-secondary btn-block", {"active": isVisible})}
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
                                 disableInitialState={confidenceDisabled}
                                 identifier={doc.id} type={"quick_question"} />
            {isVisible && <Row className="mt-3">
                <Col sm="12" md={!fastTrackInfo.isFastTrackPage ? {size: 10, offset: 1} : {}}>
                    <Button color="secondary" type={"button"} block className={classNames("active", {"hide-answer": isCS})} onClick={hideAnswer}>
                        Hide answer
                    </Button>
                </Col>
            </Row>}
        </>;
    }

    // Select which one of the 3 above options styles we need
    const Options = fastTrackInfo.isFastTrackPage ? FastTrackOptions : (recordConfidence ? ConfidenceOptions : DefaultOptions)

    return <form onSubmit={e => e.preventDefault()}>
        <div className="question-component p-md-5">
            <div className={classNames({"quick-question": !fastTrackInfo.isFastTrackPage})}>
                {isCS &&
                    <div className="quick-question-title">
                        <h3>Try it yourself!</h3>
                    </div>
                }
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {<Options/>}
                {isVisible && <Row>
                    <Col sm="12" md={!fastTrackInfo.isFastTrackPage ? {size: 10, offset: 1} : {}}>
                        <Alert color={isCS ? "hide" : "secondary"}>
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
            </div>
        </div>
    </form>;
};
