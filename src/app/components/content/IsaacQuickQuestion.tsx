import React, {useMemo, useState} from "react";
import {Alert, Button, Col, Row} from "reactstrap";
import {ContentDTO, IsaacQuickQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {logAction, useAppDispatch} from "../../state";
import {determineFastTrackSecondaryAction, FastTrackPageProperties, isAda, isPhy, siteSpecific, useFastTrackInformation} from "../../services";
import {ConfidenceQuestions, useConfidenceQuestionsValues} from "../elements/inputs/ConfidenceQuestions";
import classNames from "classnames";
import {useLocation} from "react-router-dom";

// We have 3 possible styles for the Show/Hide options (default, fast-track and confidence questions)

interface OptionsProps {
    isVisible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    toggle: () => void;
    doc: IsaacQuickQuestionDTO;
    fastTrackInfo: FastTrackPageProperties;
}

function DefaultOptions({isVisible, toggle}: OptionsProps) {
    return <Row>
        <Col sm={12} md={siteSpecific({size: 10, offset: 1}, {size: 12})}>
            <Button color="secondary" block className={classNames({"active": isVisible})} onClick={toggle}>
                {isVisible ? "Hide answer" : "Show answer"}
            </Button>
        </Col>
    </Row>;
}

function FastTrackOptions({isVisible, toggle, fastTrackInfo}: OptionsProps) {
    const secondaryAction = determineFastTrackSecondaryAction(fastTrackInfo);

    return <div
        className={"d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row mb-4"}>
        {secondaryAction &&
        <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 pe-sm-2 pe-md-0 pe-lg-3"}>
            <input {...secondaryAction} className="h-100 btn btn-outline-primary w-100"/>
        </div>}
        <div className={"m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ps-sm-2 ps-md-0 ps-lg-3"}>
            <input
                onClick={toggle} value={isVisible ? "Hide answer" : "Show answer"}
                className={classNames("h-100 btn btn-secondary w-100", {"active": isVisible})}
            />
        </div>
    </div>;
}

function ConfidenceOptions({isVisible, setVisible, doc, fastTrackInfo}: OptionsProps) {
    const {confidenceState, setConfidenceState, validationPending, setValidationPending, confidenceDisabled} = useConfidenceQuestionsValues(
        doc.showConfidence,
        "quick_question",
        (newCS) => {
            if (newCS === "followUp") setVisible(true);
        }
    );

    const hideAnswer = () => {
        setVisible(false);
        setConfidenceState("initial");
    };
    return <>
        <ConfidenceQuestions state={confidenceState} setState={setConfidenceState}
            validationPending={validationPending} setValidationPending={setValidationPending}
            disableInitialState={confidenceDisabled}
            identifier={doc.id} type={"quick_question"}
        />
        {isVisible && <Row className="mt-3 no-print">
            <Col sm={12} md={!fastTrackInfo.isFastTrackPage ? siteSpecific({size: 10, offset: 1}, {size: 12}) : {}}>
                <Button color="secondary" type={"button"} block className={classNames("active", {"hide-answer": isAda})} onClick={hideAnswer}>
                    Hide answer
                </Button>
            </Col>
        </Row>}
    </>;
}

export const IsaacQuickQuestion = ({doc}: {doc: IsaacQuickQuestionDTO}) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const fastTrackInfo = useFastTrackInformation(doc, location);
    const [isVisible, setVisible] = useState(false);
    const answer: ContentDTO = doc.answer as ContentDTO;

    const {recordConfidence} = useConfidenceQuestionsValues(
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
            void dispatch(logAction(eventDetails));
        }
    };

    // Select which one of the 3 above options styles we need
    const Options = useMemo(() => {
        return fastTrackInfo.isFastTrackPage ? FastTrackOptions : (recordConfidence ? ConfidenceOptions : DefaultOptions);
    }, [fastTrackInfo.isFastTrackPage, recordConfidence]);

    return <form onSubmit={e => e.preventDefault()}>
        <div className={classNames("question-component", {"p-md-4": isAda})}>
            <div className={classNames({"quick-question": !fastTrackInfo.isFastTrackPage})}>
                {isAda &&
                    <div className="quick-question-title">
                        <h3>Try it yourself!</h3>
                    </div>
                }
                <div className="question-content clearfix">
                    <IsaacContentValueOrChildren {...doc} />
                </div>
                {<Options isVisible={isVisible} setVisible={setVisible} toggle={toggle} fastTrackInfo={fastTrackInfo} doc={doc} />}
                {isVisible && <Row>
                    <Col sm={12} md={!fastTrackInfo.isFastTrackPage ? siteSpecific({size: 10, offset: 1}, {size: 12}) : {}}>
                        <Alert className={classNames("quick-q-alert", {"pb-0": isPhy})} color={isAda ? "hide" : "secondary"}>
                            <IsaacContentValueOrChildren {...answer} />
                        </Alert>
                    </Col>
                </Row>}
            </div>
        </div>
    </form>;
};
