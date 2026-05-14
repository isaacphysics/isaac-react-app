import React, { useEffect } from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { IconCard } from "../elements/cards/IconCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";
import { isLoggedIn, isTeacherOrAbove, SITE_TITLE } from "../../services";
import { ImageBlock } from "../elements/layout/ImageBlock";
import classNames from "classnames";
import { ExternalLink } from "../elements/ExternalLink";
import { useTranslation } from 'react-i18next'

export const TeacherResources = () => {
    const { t } = useTranslation()
    useEffect( () => {document.title = t('teachers', 'Teachers — ') + SITE_TITLE;}, []);
    const {data: studentChallengesPods} = useGetNewsPodListQuery({subject: "student_challenges"});
    const featuredStudentChallengePod = studentChallengesPods?.[0];

    const user = useAppSelector(selectors.user.orNull);
    return <div id="teacher-resources">
        <section id="resources-header" className="bg-dark-pink-200" aria-labelledby="resources-header-heading">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock className="text-white">
                        <h1 id="resources-header-heading" className="font-size-1-75 font-size-md-2-5">
                            <span className="text-pink">/</span><br/>
                            {t('adaCsForTeachers', 'Ada CS for teachers')}
                        </h1>
                        <p>
                            {t('selfmarkingAssignmentsStudentProgressTrackingAndExamPrepSupportAdanbspcsIsFullOfFreeToolsAndResourcesToSupportClassworkHomeworkAndExamPrep', 'Self-marking assignments, student progress tracking and exam prep support. Ada&nbsp;CS is\n                            full of free tools and resources to support classwork, homework and exam prep.')}
                        </p>
                        {(!isLoggedIn(user) && <>
                            <Button color="keyline" className="bg-white" to="/register" tag={Link}>{t('signUpToAdanbspcs', 'Sign up to Ada&nbsp;CS')}</Button>    
                        </>) || isTeacherOrAbove(user) && <>
                            <Button color="keyline" className="bg-white" to="/dashboard" tag={Link}>{t('goToMynbspadaOverview', 'Go to My&nbsp;Ada Overview')}</Button>
                        </> || <>
                            <Button color="keyline" className="bg-white" to="/teacher_account_request" tag={Link}>{t('upgradeToATeacherAccount', 'Upgrade to a teacher account')}</Button>    
                        </>}
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-1-wide.png" alt=""  />
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="curriculum" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice reverseUnderBreakpoint>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/questions.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>{t('aFullCurriculumOfTopics', 'A full curriculum of topics')}</h2>
                        <p>{t('weHaveOver50LearningTopicsThatCoverEverythingYouNeedToTeachComputerScienceFromComputingSystemsAndNetworksToAiMachineLearningAndMuchMore', 'We have over 50 learning topics that cover everything you need to teach computer science. From computing systems and networks, to AI, machine learning, and much more.')}</p>
                        <p>{t('theyaposreCreatedByExpertEducatorsAndAreRegularlyUpdatedYouCanEvenFilterContentForDifferentAgeGroupsAndExams', 'They&apos;re created by expert educators and are regularly updated. You can even filter content for different age groups and exams.')}</p>
                        <Button tag={Link} to={"/topics"}>{t('exploreAllTopics', 'Explore all topics')}</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="tools" aria-labelledby="tools-header">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/swirls.svg" alt=""/>
                <TextBlock md={8} className={classNames({"mb-3": !isLoggedIn(user)})}>
                    <h2 id="tools-header">{t('toolsToHelpYouTeach', 'Tools to help you teach')}</h2>
                    <p>{t('anAdaCsAccountMakesItEasyToAssessYourStudentsSetAssignmentsToReinforceLearningFromLessonsAndUseOurPremadeTestsToCheckStudentKnowledge', 'An Ada CS account makes it easy to assess your students. Set assignments to reinforce learning from lessons and use our pre-made tests to check student knowledge.')}</p>
                    <div className="pb-2 mb-3">
                        {(!isLoggedIn(user) && <> 
                            <Button className="me-3" to={"/register"} tag={Link}>{t('createAnAccount', 'Create an account')}</Button>
                            <Button color="keyline" to={"/login"} tag={Link}>{t('logIn2', 'Log in')}</Button>
                        </>) || (isTeacherOrAbove(user) && <>
                            <Button to={"/dashboard"} tag={Link}>{t('goToMynbspada', 'Go to My&nbsp;Ada')}</Button>
                        </>) || <>
                            <Button to={"/teacher_account_request"} tag={Link}>{t('upgradeToATeacherAccount', 'Upgrade to a teacher account')}</Button>
                        </>}
                    </div>
                </TextBlock>
                <ColumnSlice>
                    <IconCard card={{
                        title: t('seeContentSpecificToYou', 'See content specific to you'),
                        icon: {name: "icon-tune", color: "secondary"},
                        bodyText: t('setYourLocationLevelAndExamBoardAndWellShowYouTheContentMostRelevantToYou', 'Set your location, level, and exam board, and we\'ll show you the content most relevant to you.'),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/account" : undefined,
                        buttonText: t('setYourPreferences', 'Set your preferences'),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t('createStudentGroups', 'Create student groups'),
                        icon: {name: "icon-group", color: "secondary"},
                        bodyText: t('organiseYourStudentsIntoGroupsAndSetWorkAppropriateForEachGroup', 'Organise your students into groups and set work appropriate for each group.'),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/groups" : undefined,
                        buttonText: t('createAGroup', 'Create a group'),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t('setAssignments', 'Set assignments'),
                        icon: {name: "icon-file", color: "secondary"},
                        bodyText: t('createSelfmarkingAssignmentsForYourStudentsThereAreOver1000QuestionsForYouToChooseFrom', 'Create self-marking assignments for your students. There are over 1000 questions for you to choose from.'),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/quizzes/set" : undefined,
                        buttonText: t('setAnAssignment', 'Set an assignment'),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t('reviewYourMarkbook', 'Review your markbook'),
                        icon: {name: "icon-search", color: "secondary"},
                        bodyText: t('trackStudentProgressWithAPersonalMarkbookToHelpPinpointAreasToWorkOn', 'Track student progress with a personal markbook to help pinpoint areas to work on.'),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/my_markbook" : undefined,
                        buttonText: "View markbook",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="testimonial" className="bg-black">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        {t('ldquoadaComputerScienceHasEliminatedTheNeedForTextbooksForALevelComputerScienceThereIsRarelyANeedForAnyOtherSourcesOfInformationWhenPlanningLessonsAndItapossFreerdquo', '&ldquo;Ada Computer Science has eliminated the need for textbooks for A level computer science. There is rarely a need for any other sources of information when planning lessons and it&apos;s free!&rdquo;')}
                    </h2>
                    <p>{t('mattArnmorComputerScienceTeacher', '– Matt Arnmor, computer science teacher')}</p>
                </TextBlock>
            </Container>
        </section>
        <section id="cpd" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
                    <h2>{t('professionalDevelopment', 'Professional development')}</h2>
                    <p>{t('learnNewSkillsAndBuildConfidenceWithOurFreeCoursesForContinuingProfessionalDevelopmentCpdTheyaposreDesignedToSupportYouWhateverYourLevelOfExperience', 'Learn new skills and build confidence with our free courses for continuing professional development (CPD). They&apos;re designed to support you, whatever your level of experience.')}</p>
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t('freeOnlineCourses', 'Free online courses'),
                        image: {src: "/assets/cs/decor/teacher-2.png"},
                        bodyText: t('joinOneOfOurSelfguidedCoursesForTeachersCoveringAWideRangeOfComputingTopics', 'Join one of our self-guided courses for teachers covering a wide range of computing topics.'),
                        clickUrl: "/pages/online_courses",
                        buttonText: "Learn more",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t('teacherMentoring', 'Teacher mentoring'),
                        image: {src: "/assets/cs/decor/teacher-3.png"},
                        bodyText: t('getSupportThroughOurOnlineProgrammeForNewlyQualifiedAndNonspecialistComputerScienceTeachers', 'Get support through our online programme for newly qualified and non-specialist computer science teachers.'),
                        clickUrl: "/teacher_mentoring",
                        buttonText: "Learn more",
                        className: "bg-cultured-grey",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="student-challenges" className="bg-cyan-200">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>{t('studentChallenges', 'Student challenges')}</h2>
                        <p>{t('encourageAndRewardStudentSuccessWithOurStudentChallengeProgrammeDesignedToInspireAchievementAtEveryStageOfTheirStudies', 'Encourage and reward student success with our student challenge programme, designed to inspire achievement at every stage of their studies.')}</p>
                        <Button tag={Link} to={"/pages/student_challenges"}>{t('findOutMore', 'Find out more')}</Button>
                    </TextBlock>
                    {featuredStudentChallengePod ? <IconCard card={{
                        title: featuredStudentChallengePod.title ?? "",
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: featuredStudentChallengePod.value ?? "",
                        tag: featuredStudentChallengePod.subtitle ?? "",
                        clickUrl: featuredStudentChallengePod.url ?? "",
                        buttonText: "Read more",
                        buttonStyle: "link",
                    }}/> : <IconCard card={{
                        title: t('thereAreNoActiveChallengesAtTheMoment', 'There are no active challenges at the moment.'),
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: t('checkBackSoon', 'Check back soon!'),
                    }}/>}
                </ColumnSlice>
            </Container>
        </section>
        <section id="more-resources" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
                    <h2>{t('moreTeachingResources', 'More teaching resources')}</h2>
                    <p>{t('supportLessonPlansIdeasAndToolsFromTheRaspberryPiFoundationapossWorldclassRangeOfComputerScienceResources', 'Support, lesson plans, ideas, and tools from the Raspberry Pi Foundation&apos;s world-class range of computer science resources.')}</p>
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t('researchProjects', 'Research projects'),
                        image: {src: "/assets/cs/decor/teacher-4.png"},
                        bodyText: t('discoverGroundbreakingResearchThatAdvancesTheUnderstandingOfHowPeopleLearnAboutComputingTheseProjectsAreACollaborationBetweenTheRaspberryPiFoundationAndTheUniversityOfCambridge', 'Discover groundbreaking research that advances the understanding of how people learn about computing. These projects are a collaboration between the Raspberry Pi Foundation and the University of Cambridge.'),
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/research/projects",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t('helloWorldMagazine', 'Hello World magazine'),
                        image: {src: "/assets/cs/decor/hello-world.png"},
                        bodyText: t('getAGlobalPerspectiveOnComputingEducationWithHelloWorldOurMagazineAndPodcastForEducatorsShareYourExpertiseAndWriteForUs', 'Get a global perspective on computing education with Hello World – our magazine and podcast for educators. Share your expertise and write for us!'),
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/hello-world",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t('codeEditorForEducation', 'Code Editor for Education'),
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: t('ourFreeCodeEditorMakesItEasyForYoungPeopleToLearnTextbasedProgrammingItsSafeAgeappropriateAndSuitableForUseInTheClassroom', 'Our free code editor makes it easy for young people to learn text-based programming. It\'s safe, age-appropriate, and suitable for use in the classroom.'),
                        buttonText: "Learn more",
                        clickUrl: "https://editor.raspberrypi.org/en/education",
                        className: "bg-cultured-grey",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="try-isaac">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/isaac-subject-logos.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>{t('teachingScienceOrMaths', 'Teaching science or maths?')}</h2>
                        <p>{t('checkOutIsaacScienceOurPartnerPlatformPackedWithFreeToolsAndResourcesToHelpYouTeachPhysicsChemistryBiologyAndMaths', 'Check out Isaac Science, our partner platform packed with free tools and resources to help you teach physics, chemistry, biology and maths.')}</p>
                        <ExternalLink asButton href='https://isaacscience.org'>
                            {t('goToIsaacScience', 'Go to Isaac Science')}
                        </ExternalLink>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="help-and-support" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="py-4 position-relative">
                    <img className="full-background-img border-radius-3 bg-dark-pink-300" src="/assets/cs/decor/help-slice-purple.svg" alt=""/>
                    <TextBlock className="py-3 text-center text-white">
                        <h3>{t('needHelp', 'Need help?')}</h3>
                        <p>{t('ourTeacherSupportPageHasLotsOfInformationForCommonQuestionsAndIssues', 'Our teacher support page has lots of information for common questions and issues.')}</p>
                        <Button color="keyline" className="bg-white" to="/support/teacher/general" tag={Link}>{t('teacherSupport', 'Teacher support')}</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
