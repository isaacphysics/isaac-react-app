import React, {useEffect, useRef} from 'react';
import {
    getMyAnsweredQuestionsByDate,
    getMyProgress,
    getUserAnsweredQuestionsByDate,
    getUserProgress,
    selectors,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Card, CardBody, Col, Container, Row} from "reactstrap";
import {
    HUMAN_QUESTION_TAGS,
    HUMAN_QUESTION_TYPES,
    isPhy,
    isTeacherOrAbove,
    safePercentage,
    siteSpecific
} from "../../services";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {PotentialUser} from "../../../IsaacAppTypes";
import {Unauthorised} from "./Unauthorised";
import {AggregateQuestionStats} from "../elements/panels/AggregateQuestionStats";
import {StreakPanel} from "../elements/panels/StreakPanel";
import {Tabs} from "../elements/Tabs";
import {FlushableRef, QuestionProgressCharts} from "../elements/views/QuestionProgressCharts";
import {ActivityGraph} from "../elements/views/ActivityGraph";
import {ProgressBar} from "../elements/views/ProgressBar";
import {TeacherAchievement} from "../elements/TeacherAchievement";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";

const siteSpecificStats = siteSpecific(
    // Physics
    {
        questionTypeStatsList: [
            "isaacMultiChoiceQuestion", "isaacNumericQuestion", "isaacSymbolicQuestion", "isaacSymbolicChemistryQuestion",
            "isaacClozeQuestion", "isaacReorderQuestion"
        ],
        questionCountByTag: {
            "phys_book_step_up": 432,
            "phys_book_gcse": 533,
            "physics_skills_14": 75,
            "physics_skills_19": 614,
            "physics_linking_concepts": 258,
            "maths_book_gcse": 639,
            "maths_book": 426,
            "chemistry_16": 336
        },
        typeColWidth: "col-lg-6",
        tagColWidth: "col-lg-12"
    },
    // Computer science
    {
        questionTypeStatsList: [
            "isaacMultiChoiceQuestion", "isaacItemQuestion", "isaacParsonsQuestion", "isaacNumericQuestion",
            "isaacStringMatchQuestion", "isaacFreeTextQuestion", "isaacSymbolicLogicQuestion", "isaacClozeQuestion"
        ],
        questionCountByTag: {},
        typeColWidth: "col-lg-4",
        tagColWidth: "col-lg-12"
    }
);

interface MyProgressProps extends RouteComponentProps<{userIdOfInterest: string}> {
    user: PotentialUser;
}
const MyProgress = withRouter((props: MyProgressProps) => {
    const { user, match } = props;
    const { userIdOfInterest } = match.params;
    const viewingOwnData = userIdOfInterest === undefined || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

    const dispatch = useAppDispatch();
    const myProgress = useAppSelector(selectors.user.progress);
    const userProgress = useAppSelector(selectors.teacher.userProgress);
    const achievements = useAppSelector(selectors.user.achievementsRecord);
    const myAnsweredQuestionsByDate = useAppSelector(selectors.user.answeredQuestionsByDate);
    const userAnsweredQuestionsByDate = useAppSelector(selectors.teacher.userAnsweredQuestionsByDate);

    useEffect(() => {
        if (viewingOwnData && user.loggedIn) {
            dispatch(getMyProgress());
            dispatch(getMyAnsweredQuestionsByDate(user.id as number, 0, Date.now(), false));
        } else if (isTeacherOrAbove(user)) {
            dispatch(getUserProgress(userIdOfInterest));
            dispatch(getUserAnsweredQuestionsByDate(userIdOfInterest, 0, Date.now(), false));
        }
    }, [dispatch, userIdOfInterest, viewingOwnData, user]);

    const tabRefs: FlushableRef[] = [useRef(), useRef()];

    // Only teachers and above can see other users progress. The API checks if the other user has shared data with the
    // current user or not.
    if (!viewingOwnData && !isTeacherOrAbove(user)) {
        return <Unauthorised />
    }

    const progress = (!viewingOwnData && isTeacherOrAbove(user)) ? userProgress : myProgress;
    const answeredQuestionsByDate = (!viewingOwnData && isTeacherOrAbove(user)) ? userAnsweredQuestionsByDate : myAnsweredQuestionsByDate;

    const userName = `${progress?.userDetails?.givenName || ""}${progress?.userDetails?.givenName ? " " : ""}${progress?.userDetails?.familyName || ""}`;
    const pageTitle = viewingOwnData ? "My progress" : `Progress for ${userName || "user"}`;

    return <Container id="my-progress" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={pageTitle} disallowLaTeX />
        <Card className="mt-4">
            <CardBody>
                <Tabs>{{
                    "Question activity": <div>
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
                                <Tabs tabContentClass="mt-4" onActiveTabChange={(tabIndex) => {
                                    const flush = tabRefs[tabIndex - 1].current;
                                    if (flush) {
                                        // Don't call the flush in an event handler that causes the render, that's too early.
                                        // Call it once that's done.
                                        requestAnimationFrame(() => {
                                            flush();
                                            // You'd think this wouldn't do anything, but it fixes the vertical position of the
                                            // legend. I'm beginning to dislike this library.
                                            flush();
                                        });
                                    }
                                }}>
                                    {{
                                        "Correct questions": <QuestionProgressCharts
                                            subId="correct"
                                            questionsByTag={(progress?.correctByTag) || {}}
                                            questionsByLevel={(progress?.correctByLevel) || {}}
                                            questionsByStageAndDifficulty={(progress?.correctByStageAndDifficulty) || {}}
                                            flushRef={tabRefs[0]} />,
                                        "Attempted questions": <QuestionProgressCharts
                                            subId="attempted"
                                            questionsByTag={(progress?.attemptsByTag) || {}}
                                            questionsByLevel={(progress?.attemptsByLevel) || {}}
                                            questionsByStageAndDifficulty={(progress?.attemptsByStageAndDifficulty) || {}}
                                            flushRef={tabRefs[1]}/>
                                    }}
                                </Tabs>
                            </CardBody>
                        </Card>

                        <div className="mt-4">
                            <h4>Question parts correct by Type</h4>
                            <Row>
                                {siteSpecificStats.questionTypeStatsList.map((qType: string) => {
                                    const correct = progress?.correctByType?.[qType] || null;
                                    const attempts = progress?.attemptsByType?.[qType] || null;
                                    const percentage = safePercentage(correct, attempts);
                                    return <Col key={qType} className={`${siteSpecificStats.typeColWidth} mt-2 type-progress-bar`}>
                                        <div className={"px-2"}>
                                            {HUMAN_QUESTION_TYPES[qType]} questions correct
                                        </div>
                                        <div className={"px-2"}>
                                            <ProgressBar percentage={percentage || 0}>
                                                {percentage == null ? "No data" : `${correct} of ${attempts}`}
                                            </ProgressBar>
                                        </div>
                                    </Col>;
                                })}
                            </Row>
                        </div>

                        {answeredQuestionsByDate && <div className="mt-4">
                            <h4>Question attempts over time</h4>
                            <div>
                                <ActivityGraph answeredQuestionsByDate={answeredQuestionsByDate} />
                            </div>
                        </div>}
                        <Row id="progress-questions">
                            {progress?.mostRecentQuestions && progress?.mostRecentQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                                <h4>Most recently answered questions</h4>
                                <LinkToContentSummaryList items={progress.mostRecentQuestions}/>
                            </Col>}
                            {progress?.oldestIncompleteQuestions && progress?.oldestIncompleteQuestions.length > 0 && <Col md={12} lg={6} className="mt-4">
                                <h4>Oldest unsolved questions</h4>
                                <LinkToContentSummaryList items={progress.oldestIncompleteQuestions}/>
                            </Col>}
                        </Row>
                    </div>
                }}</Tabs>
            </CardBody>
        </Card>
    </Container>
});
export default MyProgress;
