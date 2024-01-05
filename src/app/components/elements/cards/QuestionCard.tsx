import React, { useEffect, useState } from "react";
import { useExpandContent } from "../markup/portals/Tables";
import { useStatefulElementRef } from "../markup/portals/utils";
import { Button, Card, CardBody, Row } from "reactstrap";
import classnames from "classnames";
import { IsaacContent } from "../../content/IsaacContent";
import { IsaacQuestionPageDTO } from "../../../../IsaacApiTypes";

const GoToQuestionFinder = () => (
  <div className="p-2 text-center">
    <h3>
      <strong>All done! Want more questions?</strong>
    </h3>
    <Row className="w-75 mx-auto mt-4 mb-3">
      <Button href="/gameboards/new" className="btn-block btn-lg btn-primary">
        Go to Question Finder
      </Button>
    </Row>
  </div>
);
interface QuestionCardProps {
  setExpanded: (expanded: boolean) => void;
  questionData: IsaacQuestionPageDTO[];
}

const QuestionCard = ({ setExpanded, questionData }: QuestionCardProps) => {
  const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLDivElement>();
  const { expandButton, outerClasses, expanded } = useExpandContent(true, expandRef);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const moreQuestionsAvailable = questionIndex < questionData.length;

  useEffect(() => {
    setExpanded(expanded);
  }, [expanded, setExpanded]);

  return (
    <div className={!expanded ? "question-tile" : ""} data-testid="question-tile">
      <Row className="m-0 d-flex justify-content-between">
        <h3 className="font-weight-normal m-0 align-self-baseline">Quick question!</h3>
        {moreQuestionsAvailable && (
          <Button
            className="next-question bg-transparent border-0 btn-link"
            onClick={() => setQuestionIndex(questionIndex + 1)}
          >
            Next question
          </Button>
        )}
      </Row>
      <Card
        className={classnames(outerClasses, expanded ? "random-question-panel" : "mt-2 pb-2")}
        data-testid="question-content-card"
        style={{ maxHeight: expanded ? "560px" : "450px" }}
      >
        <CardBody className="p-3">
          <div
            id="question-body"
            ref={updateExpandRef}
            style={{ maxHeight: expanded ? "500px" : "400px" }}
            className="overflow-auto hidden-scrollbar"
          >
            {moreQuestionsAvailable ? <IsaacContent doc={questionData[questionIndex]} /> : <GoToQuestionFinder />}
          </div>
          {(expanded || moreQuestionsAvailable) && expandButton}
        </CardBody>
      </Card>
    </div>
  );
};

export default QuestionCard;
