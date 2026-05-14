import React from "react";
import { Col } from "reactstrap";
import { siteSpecific } from "../../../services";
import { closeActiveModal, store } from "../../../state";
import { ActiveModalProps } from "../../../../IsaacAppTypes";
import { useTranslation } from 'react-i18next'

const QuestionFinderDifficultyModal = () => {
    const { t } = useTranslation()
    return <Col>
        {siteSpecific(<p>
            {t('practiceQuestionsLetYouDirectlyApplyOneIdea', 'Practice questions let you directly apply one idea.')}
            <ul>
                <li>
                    {t('p1CoversRevisionOfAPreviousStageOrTopicsNearTheBeginningOfACourse', 'P1 covers revision of a previous stage or topics near the beginning of a course')}
                </li>
                <li>
                    {t('p3CoversLaterTopics', 'P3 covers later topics.')}
                </li>
            </ul>
            {t('challengeQuestionsAreSolvedByCombiningMultipleConceptsAndCreativity', 'Challenge questions are solved by combining multiple concepts and creativity.')}
            <ul>
                <li>
                    {t('c1CanBeAttemptedNearTheBeginningOfYourCourse', 'C1 can be attempted near the beginning of your course')}
                </li>
                <li>
                    {t('c3RequireMoreCreativityAndCouldBeAttemptedLaterInACourse', 'C3 require more creativity and could be attempted later in a course.')}
                </li>
            </ul>
        </p>, <p>
            {t('weSplitOurQuestionsIntoTwoCategories', 'We split our questions into two categories:')}
            <ul>
                <li>
                    {t('practiceQuestionsFocusOnOneConcept', 'Practice questions focus on one concept')}
                </li>
                <li>
                    {t('challengeQuestionsCombineMultipleConcepts', 'Challenge questions combine multiple concepts')}
                </li>
            </ul>
        </p>)}
    </Col>;
};

export const questionFinderDifficultyModal = () : ActiveModalProps => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: siteSpecific("Difficulty Levels", "What do the difficulty levels mean?"),
        body: <QuestionFinderDifficultyModal />,
    };
};
