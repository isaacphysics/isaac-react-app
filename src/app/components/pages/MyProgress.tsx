import React, { useEffect, useRef, useState } from 'react';
import {
    getMyAnsweredQuestionsByDate,
    getMyProgress,
    getUserAnsweredQuestionsByDate,
    getUserProgress,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetUserSkillsAttemptsQuery
} from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Card, CardBody, Col, Row } from "reactstrap";
import {
    above,
    BookHiddenState,
    HUMAN_QUESTION_TYPES,
    ISAAC_BOOKS_BY_TAG,
    isPhy,
    isTeacherOrAbove,
    PROGRESS_QUESTION_TYPE_MAP,
    safePercentage,
    siteSpecific,
    useDeviceSize
} from "../../services";
import { useParams } from "react-router-dom";
import { PotentialUser } from "../../../IsaacAppTypes";
import { Unauthorised } from "./Unauthorised";
import { AggregateQuestionStats } from "../elements/panels/AggregateQuestionStats";
import { StreakPanel } from "../elements/panels/StreakPanel";
import { Tabs } from "../elements/Tabs";
import { FlushableRef, QuestionProgressCharts } from "../elements/views/QuestionProgressCharts";
import { ActivityGraph } from "../elements/views/ActivityGraph";
import { ProgressBar } from "../elements/views/ProgressBar";
import { ListView } from '../elements/list-groups/ListView';
import { PageContainer } from '../elements/layout/PageContainer';
import { MyAdaSidebar } from '../elements/sidebar/MyAdaSidebar';
import { RevisionChallengeStats } from '../elements/panels/RevisionChallengeStats';
import { skipToken } from '@reduxjs/toolkit/query';
import { ShowLoadingQuery } from '../handlers/ShowLoadingQuery';
import { Trans, useTranslation } from "react-i18next";

const siteSpecificStats: {questionCountByBookTag: {[bookTag in keyof typeof ISAAC_BOOKS_BY_TAG]?: number}, questionTypeStatsList: string[]} = siteSpecific(
    // Physics
    {
        questionTypeStatsList: [
            "isaacMultiChoiceQuestion", "isaacNumericQuestion", "isaacSymbolicQuestion", "isaacSymbolicChemistryQuestion",
            "isaacClozeQuestion", "isaacReorderQuestion", "isaacStringMatchQuestion", "isaacGraphSketcherQuestion", "isaacCoordinateQuestion"
        ],
        questionCountByBookTag: {
            "phys_book_step_up": 432,
            "phys_book_gcse": 534,
            "physics_skills_14": 75,
            "physics_skills_19": 614,
            "physics_linking_concepts": 258,
            "maths_book_gcse": 639,
            "maths_book": 432,
            "maths_book_2e": 490,
            "chemistry_16": 338
        },
    },
    // Computer science
    {
        questionTypeStatsList: [
            "isaacMultiChoiceQuestion", "isaacParsonsQuestion", "isaacNumericQuestion", "isaacStringMatchQuestion",
            "isaacLLMFreeTextQuestion", "isaacSymbolicLogicQuestion", "isaacClozeQuestion", "isaacReorderQuestion"
        ],
        questionCountByBookTag: {},
    }
);

interface MyProgressProps {
    user: PotentialUser;
}

const MyProgress = ({user}: MyProgressProps) => {
    const { t } = useTranslation();
    const { userIdOfInterest = "" } = useParams();
    const viewingOwnData = userIdOfInterest === "" || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

    const dispatch = useAppDispatch();
    const myProgress = useAppSelector(selectors.user.progress);
    const userProgress = useAppSelector(selectors.teacher.userProgress);
    const [chartTab, setChartTab] = useState<"correct" | "attempted">("correct");
    const deviceSize = useDeviceSize();

    useEffect(() => {
        if (viewingOwnData && user.loggedIn) {
            void dispatch(getMyProgress());
            void dispatch(getMyAnsweredQuestionsByDate(user.id as number, 0, Date.now(), false));
        } else if (isTeacherOrAbove(user)) {
            void dispatch(getUserProgress(userIdOfInterest));
            void dispatch(getUserAnsweredQuestionsByDate(userIdOfInterest, 0, Date.now(), false));
        }
    }, [dispatch, userIdOfInterest, viewingOwnData, user]);

    const flushRef: FlushableRef = useRef();

    // Only teachers and above can see other users progress. The API checks if the other user has shared data with the
    // current user or not.
    if (!viewingOwnData && !isTeacherOrAbove(user)) {
        return <Unauthorised />;
    }

    const progress = (!viewingOwnData && isTeacherOrAbove(user)) ? userProgress : myProgress;

    const userName = `${progress?.userDetails?.givenName || ""}${progress?.userDetails?.givenName ? " " : ""}${progress?.userDetails?.familyName || ""}`;
    const pageTitle = viewingOwnData ? t("site:progress.pageTitle") : t("common:progress.otherUserTitle", { userName: userName || "user" });

    return <PageContainer id="my-progress"
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={pageTitle} icon={{type: "icon", icon: "icon-progress"}} disallowLaTeX />
        }
        sidebar={siteSpecific(
            undefined, 
            <MyAdaSidebar />
        )}
    >
        <Card className="mt-4">
            <CardBody>
                <div>
                    <Row>
                        <Col>
                            <RevisionChallengeStats userProgress={progress} />
                            <AggregateQuestionStats userProgress={progress} />
                        </Col>
                        {isPhy && <Col className="align-self-center" xs={12} md={3}>
                            <StreakPanel userProgress={progress} />
                        </Col>}
                    </Row>

                    <Card className="mt-4">
                        <CardBody>
                            <Tabs style="tabs" tabContentClass="mt-4" onActiveTabChange={(tabIndex) => {
                                setChartTab(tabIndex === 1 ? "correct" : "attempted");
                                if (flushRef.current) flushRef.current();
                            }}>
                                {{"Correct questions": undefined, "Attempted questions": undefined}}
                            </Tabs>
                            <QuestionProgressCharts
                                subId={chartTab}
                                flushRef={flushRef}
                                userProgress={progress}
                            />
                        </CardBody>
                    </Card>

                    <div className="mt-4">
                        <h4>{t("common:progress.questionPartsTitle")}</h4>
                        <Row className="d-flex justify-content-center">
                            {siteSpecificStats.questionTypeStatsList.map((qType: string) => {
                                const groupedTypes = PROGRESS_QUESTION_TYPE_MAP[qType] || [qType];
                                const correct = groupedTypes.reduce((sum, type) => sum + (progress?.correctByType?.[type] || 0), 0);
                                const attempts = groupedTypes.reduce((sum, type) => sum + (progress?.attemptsByType?.[type] || 0), 0);
                                const percentage = safePercentage(correct, attempts);
                                return <Col key={qType} lg={4} className="mt-2 type-progress-bar">
                                    <div className={"p-2"}>
                                        {t("common:progress.questionTypeLabel", { questionType: HUMAN_QUESTION_TYPES[qType] })}
                                    </div>
                                    <div className={"px-2"}>
                                        <ProgressBar percentage={percentage || 0}>
                                            {percentage == null ? t("common:progress.noneAttempted") : t("common:progress.correctOfAttempts", { correct, attempts })}
                                        </ProgressBar>
                                    </div>
                                </Col>;
                            })}
                        </Row>
                    </div>

                    {isPhy && <div className="mt-4">
                        <h4>{t("sci:progress.isaacBooksTitle")}</h4>
                        {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="sci:progress.isaacBooksDescription" components={{ booksLink: <a href={"/books"} /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                        <Row>
                            {Object.entries(siteSpecificStats.questionCountByBookTag).map(([bookTag, total]) => {
                                const book = ISAAC_BOOKS_BY_TAG[bookTag as keyof typeof ISAAC_BOOKS_BY_TAG];
                                const correct = Math.min(progress?.correctByTag?.[bookTag] || 0, total);
                                const attempted = Math.min(progress?.attemptsByTag?.[bookTag] || 0, total);
                                const correctPercentage = safePercentage(correct, total) || 0;
                                const attemptedPercentage = safePercentage(attempted, total) || 0;
                                const showBook = !!book && total > 0 && (attempted > 0 || book.hidden !== BookHiddenState.HIDDEN);
                                return showBook &&  <Col key={bookTag} lg={12} className="mt-2 type-progress-bar">
                                    <div className={"px-2"}>
                                        {t("sci:progress.bookQuestionLabel", { bookTitle: book.title })}
                                    </div>
                                    <div className={"px-2"}>
                                        <ProgressBar percentage={correctPercentage} primaryTitle={t("sci:progress.bookCorrectOutOf", { correct, total })} secondaryPercentage={attemptedPercentage} secondaryTitle={t("sci:progress.bookAttemptedOutOf", { attempted, total })} type={bookTag}>
                                            <span aria-hidden>{t("sci:progress.bookCorrectOfTotal", { correct, total })}</span>
                                        </ProgressBar>
                                    </div>
                                </Col>;
                            })}
                        </Row>
                    </div>}

                    {isPhy
                        ? <QuestionAndSkillsAttemptsOverTime viewingOwnData={viewingOwnData} user={user} userIdOfInterest={userIdOfInterest} />
                        : <div className="mt-4">
                            <h4> {t("ada:progress.questionAttemptsOverTime")}</h4>
                            <QuestionAttemptsOverTime viewingOwnData={viewingOwnData} user={user} />
                        </div>}

                    <Row id="progress-questions">
                        {progress?.mostRecentQuestions && progress?.mostRecentQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                            <h4>{t("common:progress.mostRecentTitle")}</h4>
                            <ListView 
                                type="item" 
                                items={progress.mostRecentQuestions} 
                                style={deviceSize !== "md" ? "stacked" : undefined}
                                className="bordered"
                            />
                        </Col>}
                        {progress?.oldestIncompleteQuestions && progress?.oldestIncompleteQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                            <h4>{t("common:progress.oldestUnsolvedTitle")}</h4>
                            <ListView 
                                type="item" 
                                items={progress.oldestIncompleteQuestions}
                                style={deviceSize !== "md" ? "stacked" : undefined}
                                className="bordered"
                            />
                        </Col>}
                    </Row>
                </div>
            </CardBody>
        </Card>
    </PageContainer>;
};

const QuestionAndSkillsAttemptsOverTime = ({viewingOwnData, user, userIdOfInterest}: UserProps) => {
    const { t } = useTranslation();
    return <Card className="mt-4 attempts-min-height">
        <CardBody className='h-100 d-flex flex-column'>
            <h4>{t("common:progress.attemptsOverTime")}</h4>
            <div className='flex-grow-1 d-flex flex-column'>
                <Tabs style="tabs" tabContentClass='mt-4' renderHiddenTabs={false}>
                    {{
                        "Questions": <QuestionAttemptsOverTime viewingOwnData={viewingOwnData} user={user}/>,
                        "Skills": <SkillsAttemptsOverTime user={user} viewingOwnData={viewingOwnData} userIdOfInterest={userIdOfInterest} />
                    }}
                </Tabs>
            </div>
        </CardBody>
    </Card>;
};

const SkillsAttemptsOverTime = ({ viewingOwnData, user, userIdOfInterest }: UserProps) => {
    const { t } = useTranslation();
    const deviceSize = useDeviceSize();
    let userId: string | typeof skipToken = skipToken;
    if (viewingOwnData && user.loggedIn && user.id) {
        userId = user.id.toString();
    } else if (isTeacherOrAbove(user)) {
        userId = userIdOfInterest;
    }
    const query = useGetUserSkillsAttemptsQuery(userId);

    return <Row data-bs-theme="maths" className="flex-row-reverse flex-md-row row-gap-3">
        <Col md={9} className="d-flex align-items-center order-1 order-md-0 graph-min-height">
            <ShowLoadingQuery 
                query={query}
                defaultErrorTitle={t("common:progress.skillsAttemptsError")}
                thenRender={(data) => {
                    return <ActivityGraph
                        id="skills-attempts"
                        answeredQuestionsByDate={data ? data.mental_maths_overall : {}} 
                        caption={t("common:progress.mentalMathsCaption")} 
                        emptyText={<span>
                            <br/>
                            {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:progress.mentalMathsEmptyState" components={{ mentalMathsLink: <a href='/pages/app_page_mental_maths_overall' target='blank' /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                        </span>}
                        color="var(--subject-color-300)"
                    />;
                }}
            />
        </Col>
        <Col md={3} id="legend" className={above['md'](deviceSize) ? "border-start" : ""}>
            <div className='mb-md-2'>
                <strong>{t("common:progress.legendSubjects")}</strong> 
                <i className="icon icon-chevron-right icon-inline icon-color-black" />
                <strong>{t("common:progress.legendMaths")}</strong>
            </div>
            <div className='legend-item'>{t("common:progress.legendMentalMaths")}</div>
        </Col>
    </Row>;
};

const QuestionAttemptsOverTime = ({ viewingOwnData, user }: { viewingOwnData: boolean, user: PotentialUser}) => {
    const { t } = useTranslation();
    const myAnsweredQuestionsByDate = useAppSelector(selectors.user.answeredQuestionsByDate);
    const userAnsweredQuestionsByDate = useAppSelector(selectors.teacher.userAnsweredQuestionsByDate);
    const answeredQuestionsByDate = (!viewingOwnData && isTeacherOrAbove(user)) ? userAnsweredQuestionsByDate : myAnsweredQuestionsByDate;
    
    return answeredQuestionsByDate && <ActivityGraph
        id="question-attempts"
        answeredQuestionsByDate={answeredQuestionsByDate}
        caption={t("site:progress.questionAttemptsCaption")}
        color={siteSpecific("#FEA102",  "#FF4DC9")}/>;
};

type UserProps = { viewingOwnData: boolean, user: PotentialUser, userIdOfInterest: string }
export default MyProgress;
