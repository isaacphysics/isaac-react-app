import React from "react";
import { ProgressBar } from "../views/ProgressBar";
import { UserProgress } from "../../../../IsaacAppTypes";
import { safePercentage } from "../../../services";
import { Col, Row } from "reactstrap";

export const AggregateQuestionStats = ({ userProgress }: { userProgress?: UserProgress | null }) => {
  const fullCorrect = userProgress?.totalQuestionsCorrect;
  const fullAttempt = userProgress?.totalQuestionsAttempted;
  const fullCorrectThisYear = userProgress?.totalQuestionsCorrectThisAcademicYear;
  const fullAttemptThisYear = userProgress?.totalQuestionsAttemptedThisAcademicYear;
  const partCorrect = userProgress?.totalQuestionPartsCorrect;
  const partAttempt = userProgress?.totalQuestionPartsAttempted;
  const partCorrectThisYear = userProgress?.totalQuestionPartsCorrectThisAcademicYear;
  const partAttemptThisYear = userProgress?.totalQuestionPartsAttemptedThisAcademicYear;
  const fullPercentage = safePercentage(fullCorrect, fullAttempt);
  const fullPercentageThisYear = safePercentage(fullCorrectThisYear, fullAttemptThisYear);
  const partPercentage = safePercentage(partCorrect, partAttempt);
  const partPercentageThisYear = safePercentage(partCorrectThisYear, partAttemptThisYear);

  return (
    <div>
      <strong>Correct questions</strong>
      <Row className="mb-3">
        <Col md={6}>
          <p className="mb-0">This academic year:</p>
          <ProgressBar percentage={fullPercentageThisYear || 0}>
            {fullPercentageThisYear == null ? "No data" : `${fullCorrectThisYear} of ${fullAttemptThisYear}`}
          </ProgressBar>
        </Col>
        <Col md={6}>
          <p className="mb-0">Since account creation:</p>
          <ProgressBar percentage={fullPercentage || 0}>
            {fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}
          </ProgressBar>
        </Col>
      </Row>

      <strong>Correct question parts</strong>
      <Row className="mb-3">
        <Col md={6}>
          <p className="mb-0">This academic year:</p>
          <ProgressBar percentage={partPercentageThisYear || 0}>
            {partPercentageThisYear == null ? "No data" : `${partCorrectThisYear} of ${partAttemptThisYear}`}
          </ProgressBar>
        </Col>
        <Col md={6}>
          <p className="mb-0">Since account creation:</p>
          <ProgressBar percentage={partPercentage || 0}>
            {partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}
          </ProgressBar>
        </Col>
      </Row>
    </div>
  );
};
