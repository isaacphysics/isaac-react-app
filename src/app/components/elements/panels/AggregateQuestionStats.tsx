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
        <RS.Row>
            <RS.Col md={6}>
                Questions completed correctly this academic year
                <div className={"mt-2"}>
                    <ProgressBar percentage={fullPercentageThisYear || 0}>
                        {fullPercentageThisYear == null ? "No data" : `${fullCorrectThisYear} of ${fullAttemptThisYear}`}
                    </ProgressBar>
                </div>
            </RS.Col>
            <RS.Col md={6}>
                Question parts completed correctly this academic year
                <div className={"mt-2"}>
                    <ProgressBar percentage={partPercentageThisYear || 0}>
                        {partPercentageThisYear == null ? "No data" : `${partCorrectThisYear} of ${partAttemptThisYear}`}
                    </ProgressBar>
                </div>
            </RS.Col>
        </RS.Row>
        <RS.Row className="mt-3">
            <RS.Col md={6}>
                Questions completed correctly of those attempted
                <div className={"mt-2"}>
                    <ProgressBar percentage={fullPercentage || 0}>
                        {fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}
                    </ProgressBar>
                </div>
            </RS.Col>
            <RS.Col md={6}>
                Question parts correct of those attempted
                <div className={"mt-2"}>
                    <ProgressBar percentage={partPercentage || 0}>
                        {partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}
                    </ProgressBar>
                </div>
            </RS.Col>
        </RS.Row>
    </div>
};
