import React from "react";
import {ProgressBar} from "../views/ProgressBar";
import {UserProgress} from "../../../../IsaacAppTypes";
import {safePercentage} from "../../../services";
import { Row, Col } from "reactstrap";
import { useTranslation } from "react-i18next";

export const AggregateQuestionStats = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const { t } = useTranslation();
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

    return <div>
        <strong>{t("common:questionStats.aggregate.correctQuestionsTitle")}</strong>
        <Row className="mb-3">
            <Col md={6}>
                <p className="mb-0">{t("common:questionStats.aggregate.thisAcademicYear")}</p>
                <ProgressBar percentage={fullPercentageThisYear || 0}>
                    {fullPercentageThisYear == null ? t("common:questionStats.aggregate.noData") : t("common:questionStats.aggregate.correctCountOfAttempted", { correctCount: fullCorrectThisYear, attemptedCount: fullAttemptThisYear })}
                </ProgressBar>
            </Col>
            <Col md={6}>
                <p className="mb-0">{t("common:questionStats.aggregate.sinceAccountCreation")}</p>
                <ProgressBar percentage={fullPercentage || 0}>
                    {fullPercentage == null ? t("common:questionStats.aggregate.noData") : t("common:questionStats.aggregate.correctCountOfAttempted", { correctCount: fullCorrect, attemptedCount: fullAttempt })}
                </ProgressBar>
            </Col>
        </Row>

        <strong>{t("common:questionStats.aggregate.correctPartsTitle")}</strong>
        <Row className="mb-3">
            <Col md={6}>
                <p className="mb-0">{t("common:questionStats.aggregate.thisAcademicYear")}</p>
                <ProgressBar percentage={partPercentageThisYear || 0}>
                    {partPercentageThisYear == null ? t("common:questionStats.aggregate.noData") : t("common:questionStats.aggregate.correctCountOfAttempted", { correctCount: partCorrectThisYear, attemptedCount: partAttemptThisYear })}
                </ProgressBar>
            </Col>
            <Col md={6}>
                <p className="mb-0">{t("common:questionStats.aggregate.sinceAccountCreation")}</p>
                <ProgressBar percentage={partPercentage || 0}>
                    {partPercentage == null ? t("common:questionStats.aggregate.noData") : t("common:questionStats.aggregate.correctCountOfAttempted", { correctCount: partCorrect, attemptedCount: partAttempt })}
                </ProgressBar>
            </Col>
        </Row>
    </div>;
};
