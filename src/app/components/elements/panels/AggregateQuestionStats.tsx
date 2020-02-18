import React from "react";
import * as RS from "reactstrap";
import {ProgressBar} from "../views/ProgressBar";
import {UserProgress} from "../../../../IsaacAppTypes";
import {safePercentage} from "../../../services/validation";

export const AggregateQuestionStats = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const fullCorrect = userProgress?.totalQuestionsCorrect;
    const fullCorrectThisYear = userProgress?.totalQuestionsCorrectThisAcademicYear;
    const fullAttempt = userProgress?.totalQuestionsAttempted;
    const fullAttemptThisYear = userProgress?.totalQuestionsAttemptedThisAcademicYear;
    const partCorrect = userProgress?.totalQuestionsCorrect;
    const partCorrectThisYear = userProgress?.totalQuestionPartsCorrectThisAcademicYear;
    const partAttempt = userProgress?.totalQuestionsAttempted;
    const partAttemptThisYear = userProgress?.totalQuestionPartsAttemptedThisAcademicYear;
    const fullPercentage = safePercentage(fullCorrect, fullAttempt);
    const fullPercentageThisYear = safePercentage(fullCorrectThisYear, fullAttemptThisYear);
    const partPercentage = safePercentage(partCorrect, partAttempt);
    const partPercentageThisYear = safePercentage(partCorrectThisYear, partAttemptThisYear);

    return <div>
        <h2 className="h4">Correct questions</h2>
        <RS.Row className="mb-3">
            <RS.Col md={6}>
                <h3 className="h6">This academic year:</h3>
                <ProgressBar percentage={fullPercentageThisYear || 0}>
                    {fullPercentageThisYear == null ? "No data" : `${fullCorrectThisYear} of ${fullAttemptThisYear}`}
                </ProgressBar>
            </RS.Col>
            <RS.Col md={6}>
                <h3 className="h6">Since account creation:</h3>
                <ProgressBar percentage={fullPercentage || 0}>
                    {fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}
                </ProgressBar>
            </RS.Col>
        </RS.Row>

        <h2 className="h4">Correct question parts</h2>
        <RS.Row className="mb-3">
            <RS.Col md={6}>
                <h3 className="h6">This academic year:</h3>
                <ProgressBar percentage={partPercentageThisYear || 0}>
                    {partPercentageThisYear == null ? "No data" : `${partCorrectThisYear} of ${partAttemptThisYear}`}
                </ProgressBar>
            </RS.Col>
            <RS.Col md={6}>
                <h3 className="h6">Since account creation:</h3>
                <ProgressBar percentage={partPercentage || 0}>
                    {partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}
                </ProgressBar>
            </RS.Col>
        </RS.Row>
    </div>
};
