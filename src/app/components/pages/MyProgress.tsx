import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {getAnsweredQuestionsByDate, getProgress} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {ProgressBar} from "../elements/views/ProgressBar";
import {Tabs} from "../elements/Tabs";
import {QuestionProgressCharts} from "../elements/views/QuestionProgressCharts";
import {DailyStreakGauge} from "../elements/views/DailyStreakGauge";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../services/questions";
import {ActivityGraph} from "../elements/views/ActivityGraph";
import {Assignments} from "../elements/Assignments";
import {filterAssignmentsByStatus} from "../../services/assignments";
import {isStaff, isTeacher} from "../../services/user";
import {TeacherAchievement} from "../elements/TeacherAchievement";
import {COMPETITION_QUESTION_TARGET, IS_CS_PLATFORM} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Unauthorised} from "./Unauthorised";


function safePercentage(correct: number | null | undefined, attempts: number | null | undefined) {
    return (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;
}

interface MyProgressProps {
    user: LoggedInUser;
    match: {params: {userIdOfInterest: string}};
}
export const MyProgress = withRouter(({user, match: {params: {userIdOfInterest}}}: MyProgressProps) => {
    const viewingOwnData = userIdOfInterest === undefined || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

    const dispatch = useDispatch();
    const userProgress = useSelector((state: AppState) => state?.userProgress);
    const myAssignments = useSelector((state: AppState) => state?.assignments || null);
    const achievementsSelector = useSelector((state: AppState) => state?.userProgress?.userSnapshot?.achievementsRecord);
    const answeredQuestionsByDate = useSelector((state: AppState) => state?.answeredQuestionsByDate);

    useEffect(() => {
        if (viewingOwnData && user.loggedIn) {
            dispatch(getProgress());
            dispatch(getAnsweredQuestionsByDate(user.id as number, 0, Date.now(), true));
        } else if (isTeacher(user)) {
            dispatch(getProgress(userIdOfInterest));
            dispatch(getAnsweredQuestionsByDate(userIdOfInterest, 0, Date.now(), true));
        }
    }, [userIdOfInterest]);

    if (!viewingOwnData && !isStaff(user)) {
        return <Unauthorised />
    }

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
    const academicYearQuestionTarget = !!fullCorrectThisYear && fullCorrectThisYear >= COMPETITION_QUESTION_TARGET;

    return <RS.Container id="my-progress" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="My Progress" />
        <RS.Card className="p-3 mt-4">
            <RS.CardTitle tag="h2">
                Question statistics
            </RS.CardTitle>

            <RS.CardBody>
                <RS.Row>
                    <RS.Col className={"col-md-8 pr-5 mt-2"}>
                        <RS.Row>
                            Questions completed correctly this academic year
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={fullPercentageThisYear || 0} targetAchieved={academicYearQuestionTarget}>
                                {fullPercentageThisYear == null ? "No data" : `${fullCorrectThisYear} of ${fullAttemptThisYear}`}
                            </ProgressBar>
                        </RS.Row>
                        <RS.Row>
                            Questions completed correctly of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={fullPercentage || 0}>
                                {fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}
                            </ProgressBar>
                        </RS.Row>
                        <RS.Row className={"mt-3"}>
                            Question parts correct of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={partPercentage || 0}>
                                {partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}
                            </ProgressBar>
                        </RS.Row>
                    </RS.Col>
                    <RS.Col className={"col-md-4"}>
                        <RS.Row>
                            <div className={"text-center-width"}>
                                Daily streak
                            </div>
                        </RS.Row>
                        <RS.Row>
                            <DailyStreakGauge streakRecord={userProgress && userProgress.userSnapshot && userProgress.userSnapshot.streakRecord}/>
                        </RS.Row>
                        <RS.Row>
                            <div id="streak-help" className={"text-center-width"}>
                                Longest streak: {userProgress?.userSnapshot?.streakRecord?.largestStreak || 0} days
                            </div>
                            <RS.UncontrolledTooltip placement="bottom" target="streak-help">
                                <div className="text-left">
                                    The daily streak indicates the number of consecutive days you have been active on Isaac.<br/>
                                    Answer at least <b>three question parts</b> correctly per day to fill up your daily progress bar and increase your streak!
                                </div>
                            </RS.UncontrolledTooltip>
                        </RS.Row>
                    </RS.Col>
                </RS.Row>

                <Tabs className={"my-3"}>
                    {{
                        "Correct Questions": <QuestionProgressCharts
                            subId="correct"
                            questionsByTag={(userProgress?.correctByTag) || {}}
                            questionsByLevel={(userProgress?.correctByLevel) || {}}
                        />,
                        "Attempted Questions": <QuestionProgressCharts
                            subId="attempted"
                            questionsByTag={(userProgress?.attemptsByTag) || {}}
                            questionsByLevel={(userProgress?.attemptsByLevel) || {}}
                        />
                    }}
                </Tabs>

                <div>
                    <RS.Row className={"mt-3"}>
                        <h4>Question parts correct by Type</h4>
                    </RS.Row>
                    <RS.Row>
                        {(Array.from(QUESTION_TYPES.keys()) as string[]).filter((qType: string) => qType != "default").map((qType: string) => {
                            const correct = userProgress?.correctByType?.[qType] || null;
                            const attempts = userProgress?.attemptsByType?.[qType] || null;
                            const percentage = safePercentage(correct, attempts);
                            return <RS.Col key={qType} className={"col-lg-4 mt-2 type-progress-bar"}>
                                <RS.Row className={"px-2"}>
                                    {HUMAN_QUESTION_TYPES.get(qType)} questions correct
                                </RS.Row>
                                <RS.Row className={"px-2"}>
                                    <ProgressBar percentage={percentage || 0}>
                                        {percentage == null ? "No data" : `${correct} of ${attempts}`}
                                    </ProgressBar>
                                </RS.Row>
                            </RS.Col>
                        })}
                    </RS.Row>
                </div>

                {answeredQuestionsByDate && <div>
                    <RS.Row className={"mt-3"}>
                        <h4>Question attempts over time</h4>
                    </RS.Row>
                    <RS.Row>
                        <ActivityGraph answeredQuestionsByDate={answeredQuestionsByDate} />
                    </RS.Row>
                </div>}

            </RS.CardBody>
        </RS.Card>

        {viewingOwnData && isTeacher(user) && <RS.Card className="p-3 mt-3">
            <RS.CardTitle tag="h2">
                Isaac teacher activity
            </RS.CardTitle>
            <RS.CardBody>
                <TeacherAchievement
                    verb="created"
                    count={achievementsSelector && achievementsSelector.TEACHER_GROUPS_CREATED}
                    item="group"
                    createMoreText="Manage groups"
                    createMoreLink="/groups"
                    iconClassName="group-badge"/>

                <TeacherAchievement
                    verb="set"
                    count={achievementsSelector && achievementsSelector.TEACHER_ASSIGNMENTS_SET}
                    item="assignment"
                    createMoreText="Set assignments"
                    createMoreLink="/set_assignments"
                    iconClassName="assignment-badge"/>

                <TeacherAchievement
                    verb="created"
                    count={achievementsSelector && achievementsSelector.TEACHER_GAMEBOARDS_CREATED}
                    item="gameboard"
                    createMoreText="Board builder"
                    createMoreLink="/gameboard_builder"
                    iconClassName="gameboard-badge"/>

                {!IS_CS_PLATFORM && <TeacherAchievement
                    verb="set"
                    count={achievementsSelector && achievementsSelector.TEACHER_BOOK_PAGES_SET}
                    item="book page assignment"
                    createMoreText="Set assignments"
                    createMoreLink="/set_assignments"
                    iconClassName="book-page-badge"/>
                }

                <TeacherAchievement
                    verb="visited"
                    count={achievementsSelector && achievementsSelector.TEACHER_CPD_EVENTS_ATTENDED}
                    item="CPD event"
                    createMoreText="Events"
                    createMoreLink="/events"
                    iconClassName="cpd-badge"/>
            </RS.CardBody>
        </RS.Card>}

        {viewingOwnData && <RS.Card className="p-3 mt-3">
            <RS.CardTitle tag="h2">
                Current assignments
            </RS.CardTitle>
            <RS.CardBody>
                <Assignments assignments={filterAssignmentsByStatus(myAssignments).inProgressRecent} />
            </RS.CardBody>
        </RS.Card>}
    </RS.Container>
});
