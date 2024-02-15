import React, { useState } from "react";
import { Alert, Button, Col, Row } from "reactstrap";
import { ContentDTO, IsaacQuickQuestionDTO } from "../../../IsaacApiTypes";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { logAction, useAppDispatch } from "../../state";
import { ConfidenceQuestions, useConfidenceQuestionsValues } from "../elements/inputs/ConfidenceQuestions";
import classNames from "classnames";

function DefaultOptions({
  isVisible,
  setIsVisible,
  doc,
}: Readonly<{
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  doc: IsaacQuickQuestionDTO;
}>) {
  const dispatch = useAppDispatch();
  const toggle = () => {
    const isNowVisible = !isVisible;
    setIsVisible(isNowVisible);
    if (isNowVisible) {
      const eventDetails = { type: "QUICK_QUESTION_SHOW_ANSWER", questionId: doc.id };
      dispatch(logAction(eventDetails));
    }
  };

  return (
    <Row>
      <Col sm="12" md={{ size: 10, offset: 1 }}>
        <Button color="secondary" block className={classNames({ active: isVisible })} onClick={toggle}>
          {isVisible ? "Hide answer" : "Show answer"}
        </Button>
      </Col>
    </Row>
  );
}

function ConfidenceOptions({
  isVisible,
  setIsVisible,
  doc,
}: Readonly<{
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  doc: IsaacQuickQuestionDTO;
}>) {
  const { confidenceState, setConfidenceState, validationPending, setValidationPending, confidenceDisabled } =
    useConfidenceQuestionsValues(doc.showConfidence, "quick_question", (newCS) => {
      if (newCS === "followUp") setIsVisible(true);
    });

  const hideAnswer = () => {
    setIsVisible(false);
    setConfidenceState("initial");
  };
  return (
    <>
      <ConfidenceQuestions
        state={confidenceState}
        setState={setConfidenceState}
        validationPending={validationPending}
        setValidationPending={setValidationPending}
        disableInitialState={confidenceDisabled}
        identifier={doc.id}
        type={"quick_question"}
      />
      {isVisible && (
        <Row className="mt-3">
          <Col sm="12" md={{ size: 10, offset: 1 }}>
            <Button color="secondary" type={"button"} block className="active hide-answer" onClick={hideAnswer}>
              Hide answer
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
}

export const IsaacQuickQuestion = ({ doc }: { doc: IsaacQuickQuestionDTO }) => {
  const [isVisible, setIsVisible] = useState(false);
  const answer: ContentDTO = doc.answer as ContentDTO;

  const { recordConfidence } = useConfidenceQuestionsValues(doc.showConfidence, "quick_question", (newCS) => {
    if (newCS === "followUp") setIsVisible(true);
  });

  const commonProps = { isVisible, setIsVisible, doc };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="question-component p-md-5">
        <div className="quick-question">
          <div className="quick-question-title">
            <h3>Try it yourself!</h3>
          </div>
          <div className="question-content clearfix">
            <IsaacContentValueOrChildren {...doc} />
          </div>
          {recordConfidence ? <ConfidenceOptions {...commonProps} /> : <DefaultOptions {...commonProps} />}
          {isVisible && (
            <Row>
              <Col sm="12" md={{ size: 10, offset: 1 }}>
                <Alert color="hide">
                  <IsaacContentValueOrChildren {...answer} />
                </Alert>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </form>
  );
};
