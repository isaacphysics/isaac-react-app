import React from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageMetadata} from "../elements/PageMetadata";
import {AffixButton} from "../elements/AffixButton";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { TextBlock } from "../elements/layout/TextBlock";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { useTranslation } from 'react-i18next'


export const AdaCSOverviewPage = () => {
    const { t } = useTranslation()
    return <Container data-bs-theme={undefined} className="ada-overview-page">
        <TitleAndBreadcrumb
            currentPageTitle={"Computer Science"}
            icon={{
                type: "img",
                subject: undefined,
                icon: "/assets/common/logos/ada_logo_stamp_aqua.svg",
                width: "75px",
                height: "75px",
            }}
        />
        <div>
            <PageMetadata title={t('adaComputerScience', 'Ada Computer Science')} />
            <p>
                {t('adaComputerScienceIsAFreeLearningPlatformForComputingTeachersAndStudentsDevelopedByTheRaspberryPiFoundationInPartnershipWithTheIsaacScienceTeamAtTheUniversityOfCambridgeItIsTailoredToSupportLearnersAged1419AdaComputerScienceOffersStructuredResourcesToSupportBothTeachersAndStudentsTheseIncludeConceptPagesInteractiveQuestionsAndTeacherToolsAmongstAWideRangeOfOtherResourcesDesignedToEnhanceComputerScienceEducation', 'Ada Computer Science is a free learning platform for computing teachers and students.\n                Developed by the Raspberry Pi Foundation in partnership with the Isaac Science team at the University of Cambridge,\n                it is tailored to support learners aged 14-19. Ada Computer Science offers structured resources to support both\n                teachers and students. These include concept pages, interactive questions, and teacher tools, amongst a\n                wide range of other resources designed to enhance computer science education.')}
            </p>

            <ColumnSlice>
                <TextBlock>
                    <h2>{t('forStudents', 'For students')}</h2>
                    <div>
                        {t('exploreInteractiveResourcesDesignedToHelpYouStudyComputerScience', 'Explore interactive resources designed to help you study computer science:')}
                        <ul>
                            <li>{t('learnThroughAFullCurriculumOfTopicsExplainedInConceptPages', 'Learn through a full curriculum of topics explained in concept pages.')}</li>
                            <li>{t('practiseAndTestYourUnderstandingWithInteractiveQuestions', 'Practise and test your understanding with interactive questions.')}</li>
                            <li>{t('trackYourProgressAndIdentifyAreasToImprove', 'Track your progress and identify areas to improve.')}</li>
                            <li>{t('joinTermlyChallengesToTestYourKnowledgeAndSkills', 'Join termly challenges to test your knowledge and skills.')}</li>
                        </ul>
                    </div>
                </TextBlock>
                <ImageBlock>
                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/learner-1.png" alt=""/>
                </ImageBlock>
            </ColumnSlice>

            <ColumnSlice reverseUnderBreakpoint>
                <ImageBlock>
                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-1.png" alt=""/>
                </ImageBlock>
                <TextBlock>
                    <h2>{t('forTeachers', 'For teachers')}</h2>
                    <div>
                        {t('accessStructuredResourcesToHelpYouDeliverHighqualityComputerScienceEducation', 'Access structured resources to help you deliver high-quality computer science education:')}
                        <ul>
                            <li>{t('teachWithOver50CurriculumalignedTopicsCoveringTheFullBreadthOfComputerScience', 'Teach with over 50 curriculum-aligned topics covering the full breadth of computer science.')}</li>
                            <li>{t('setSelfmarkingAssignmentsToSaveTimeAndSupportIndependentLearning', 'Set self-marking assignments to save time and support independent learning.')}</li>
                            <li>{t('trackStudentProgressWithAPersonalMarkbookToIdentifyAreasForImprovement', 'Track student progress with a personal markbook to identify areas for improvement.')}</li>
                        </ul>
                    </div>
                </TextBlock>
            </ColumnSlice>

            <div className="text-center py-4">
                <AffixButton
                    color="solid"
                    target={"_blank"}
                    href={"https://adacomputerscience.org"}
                    affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}
                    className="px-9 py-3 fs-6 position-relative"
                >
                    {t('goToAdaCs', 'Go to Ada CS')}
                </AffixButton>
            </div>

        </div>
    </Container>;
};
