import React from "react";
import {ProgressBar} from "../views/ProgressBar";
import {UserProgress} from "../../../../IsaacAppTypes";
import {safePercentage} from "../../../services";
import { Row, Col } from "reactstrap";
import { useTranslation } from 'react-i18next'

export const AggregateQuestionStats = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const { t } = useTranslation()
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
        <strong>{t('correctQuestions', 'Correct questions')}</strong>
        <Row className="mb-3">
            <Col md={6}>
                <p className="mb-0">{t('thisAcademicYear', 'This academic year:')}</p>
                <ProgressBar percentage={fullPercentageThisYear || 0}>
                    {fullPercentageThisYear == null ? t('noData', 'No data') : t('fullcorrectthisyearOfFullattemptthisyear', '{{fullCorrectThisYear}} of {{fullAttemptThisYear}}', { fullCorrectThisYear, fullAttemptThisYear })}
                </ProgressBar>
            </Col>
            <Col md={6}>
                <p className="mb-0">{t('sinceAccountCreation', 'Since account creation:')}</p>
                <ProgressBar percentage={fullPercentage || 0}>
                    {fullPercentage == null ? t('noData', 'No data') : t('fullcorrectOfFullattempt', '{{fullCorrect}} of {{fullAttempt}}', { fullCorrect, fullAttempt })}
                </ProgressBar>
            </Col>
        </Row>

        <strong>{t('correctQuestionParts', 'Correct question parts')}</strong>
        <Row className="mb-3">
            <Col md={6}>
                <p className="mb-0">{t('thisAcademicYear', 'This academic year:')}</p>
                <ProgressBar percentage={partPercentageThisYear || 0}>
                    {partPercentageThisYear == null ? t('noData', 'No data') : t('partcorrectthisyearOfPartattemptthisyear', '{{partCorrectThisYear}} of {{partAttemptThisYear}}', { partCorrectThisYear, partAttemptThisYear })}
                </ProgressBar>
            </Col>
            <Col md={6}>
                <p className="mb-0">{t('sinceAccountCreation', 'Since account creation:')}</p>
                <ProgressBar percentage={partPercentage || 0}>
                    {partPercentage == null ? t('noData', 'No data') : t('partcorrectOfPartattempt', '{{partCorrect}} of {{partAttempt}}', { partCorrect, partAttempt })}
                </ProgressBar>
            </Col>
        </Row>
    </div>;
};
