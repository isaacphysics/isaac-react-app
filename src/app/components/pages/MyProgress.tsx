import React, { useEffect, useRef, useState } from 'react';
import {
    getMyAnsweredQuestionsByDate,
    getMyProgress,
    getUserAnsweredQuestionsByDate,
    getUserProgress,
    selectors,
    useAppDispatch,
    useAppSelector
} from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Card, CardBody, Col, Row } from "reactstrap";
import {
    below,
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
    const { userIdOfInterest = "" } = useParams();
    const viewingOwnData = userIdOfInterest === "" || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

    const dispatch = useAppDispatch();
    const myProgress = useAppSelector(selectors.user.progress);
    const userProgress = useAppSelector(selectors.teacher.userProgress);
    const myAnsweredQuestionsByDate = useAppSelector(selectors.user.answeredQuestionsByDate);
    const userAnsweredQuestionsByDate = useAppSelector(selectors.teacher.userAnsweredQuestionsByDate);
    const [chartTab, setChartTab] = useState<"correct" | "attempted">("correct");
    const screenSize = useDeviceSize();

    useEffect(() => {
        if (viewingOwnData && user.loggedIn) {
            dispatch(getMyProgress());
            dispatch(getMyAnsweredQuestionsByDate(user.id as number, 0, Date.now(), false));
        } else if (isTeacherOrAbove(user)) {
            dispatch(getUserProgress(userIdOfInterest));
            dispatch(getUserAnsweredQuestionsByDate(userIdOfInterest, 0, Date.now(), false));
        }
    }, [dispatch, userIdOfInterest, viewingOwnData, user]);

    const flushRef: FlushableRef = useRef();

    // Only teachers and above can see other users progress. The API checks if the other user has shared data with the
    // current user or not.
    if (!viewingOwnData && !isTeacherOrAbove(user)) {
        return <Unauthorised />;
    }

    const progress = (!viewingOwnData && isTeacherOrAbove(user)) ? userProgress : myProgress;
    const answeredQuestionsByDate = (!viewingOwnData && isTeacherOrAbove(user)) ? userAnsweredQuestionsByDate : myAnsweredQuestionsByDate;

    const userName = `${progress?.userDetails?.givenName || ""}${progress?.userDetails?.givenName ? " " : ""}${progress?.userDetails?.familyName || ""}`;
    const pageTitle = viewingOwnData ? "My progress" : `Progress for ${userName || "user"}`;

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
                        <h4>Question parts correct by type</h4>
                        <Row className="d-flex justify-content-center">
                            {siteSpecificStats.questionTypeStatsList.map((qType: string) => {
                                const groupedTypes = PROGRESS_QUESTION_TYPE_MAP[qType] || [qType];
                                const correct = groupedTypes.reduce((sum, type) => sum + (progress?.correctByType?.[type] || 0), 0);
                                const attempts = groupedTypes.reduce((sum, type) => sum + (progress?.attemptsByType?.[type] || 0), 0);
                                const percentage = safePercentage(correct, attempts);
                                return <Col key={qType} lg={4} className="mt-2 type-progress-bar">
                                    <div className={"p-2"}>
                                        {HUMAN_QUESTION_TYPES[qType]} questions
                                    </div>
                                    <div className={"px-2"}>
                                        <ProgressBar percentage={percentage || 0}>
                                            {percentage == null ? "None attempted" : `${correct} of ${attempts}`}
                                        </ProgressBar>
                                    </div>
                                </Col>;
                            })}
                        </Row>
                    </div>

                    {isPhy && <div className="mt-4">
                        <h4>Isaac Books</h4>
                        Questions completed correctly, against questions attempted for each of our <a href={"/books"}>books</a>.
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
                                        {book.title} questions
                                    </div>
                                    <div className={"px-2"}>
                                        <ProgressBar percentage={correctPercentage} primaryTitle={`${correct} correct out of ${total}`} secondaryPercentage={attemptedPercentage} secondaryTitle={`${attempted} attempted out of ${total}`} type={bookTag}>
                                            <span aria-hidden>{`${correct} of ${total}`}</span>
                                        </ProgressBar>
                                    </div>
                                </Col>;
                            })}
                        </Row>
                    </div>}

                    {answeredQuestionsByDate && <div className="mt-4">
                        <h4>Question attempts over time</h4>
                        <div>
                            <ActivityGraph answeredQuestionsByDate={answeredQuestionsByDate} />
                        </div>
                    </div>}
                    <Row id="progress-questions">
                        {progress?.mostRecentQuestions && progress?.mostRecentQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                            <h4>Most recently answered questions</h4>
                            <ListView type="item" items={progress.mostRecentQuestions} fullWidth={below["lg"](screenSize)} className="bordered"/>
                        </Col>}
                        {progress?.oldestIncompleteQuestions && progress?.oldestIncompleteQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                            <h4>Oldest unsolved questions</h4>
                            <ListView type="item" items={progress.oldestIncompleteQuestions} fullWidth={below["lg"](screenSize)} className="bordered"/>
                        </Col>}
                    </Row>
                </div>
            </CardBody>
        </Card>
    </PageContainer>;
};
export default MyProgress;
