import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {getAnsweredQuestionsByDate, getProgress} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {isStaff, isTeacher} from "../../services/user";
import {withRouter} from "react-router-dom";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Unauthorised} from "./Unauthorised";
import {AggregateQuestionStats} from "../elements/panels/AggregateQuestionStats";
import {DailyStreakPanel} from "../elements/panels/DailyStreakPanel";
import {Tabs} from "../elements/Tabs";
import {QuestionProgressCharts} from "../elements/views/QuestionProgressCharts";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../services/questions";
import {ActivityGraph} from "../elements/views/ActivityGraph";
import {ProgressBar} from "../elements/views/ProgressBar";
import {safePercentage} from "../../services/validation";
import {TeacherAchievement} from "../elements/TeacherAchievement";
import {IS_CS_PLATFORM} from "../../services/constants";

interface MyProgressProps {
    user: LoggedInUser;
    match: {params: {userIdOfInterest: string}};
}
export const MyProgress = withRouter(({user, match: {params: {userIdOfInterest}}}: MyProgressProps) => {
    const viewingOwnData = userIdOfInterest === undefined || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

    const dispatch = useDispatch();
    const userProgress = useSelector((state: AppState) => state?.userProgress);
    const achievements = useSelector((state: AppState) => state?.userProgress?.userSnapshot?.achievementsRecord);
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

    return <RS.Container id="my-progress" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle="My progress" />
        <Tabs>{{
            "Question Activity": <div>
                <RS.Row>
                    <RS.Col>
                        <AggregateQuestionStats userProgress={userProgress} />
                    </RS.Col>
                    <RS.Col className={"col-md-4"}>
                        <DailyStreakPanel userProgress={userProgress} />
                    </RS.Col>
                </RS.Row>

                <Tabs className={"my-3"}>
                    {{
                        "Correct Questions": <QuestionProgressCharts
                            subId="correct"
                            questionsByTag={(userProgress?.correctByTag) || {}}
                            questionsByLevel={(userProgress?.correctByLevel) || {}} />,
                        "Attempted Questions": <QuestionProgressCharts
                            subId="attempted"
                            questionsByTag={(userProgress?.attemptsByTag) || {}}
                            questionsByLevel={(userProgress?.attemptsByLevel) || {}} />
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
                            </RS.Col>;
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
            </div>,
            ...(viewingOwnData && isTeacher(user) && {"Isaac teacher activity": <div>
                <TeacherAchievement
                    verb="created"
                    count={achievements && achievements.TEACHER_GROUPS_CREATED}
                    item="group"
                    createMoreText="Manage groups"
                    createMoreLink="/groups"
                    iconClassName="group-badge"/>

                <TeacherAchievement
                    verb="set"
                    count={achievements && achievements.TEACHER_ASSIGNMENTS_SET}
                    item="assignment"
                    createMoreText="Set assignments"
                    createMoreLink="/set_assignments"
                    iconClassName="assignment-badge"/>

                <TeacherAchievement
                    verb="created"
                    count={achievements && achievements.TEACHER_GAMEBOARDS_CREATED}
                    item="gameboard"
                    createMoreText="Board builder"
                    createMoreLink="/gameboard_builder"
                    iconClassName="gameboard-badge"/>

                {!IS_CS_PLATFORM && <TeacherAchievement
                    verb="set"
                    count={achievements && achievements.TEACHER_BOOK_PAGES_SET}
                    item="book page assignment"
                    createMoreText="Set assignments"
                    createMoreLink="/set_assignments"
                    iconClassName="book-page-badge"/>
                }

                <TeacherAchievement
                    verb="visited"
                    count={achievements && achievements.TEACHER_CPD_EVENTS_ATTENDED}
                    item="CPD event"
                    createMoreText="Events"
                    createMoreLink="/events"
                    iconClassName="cpd-badge"/>
            </div>}),
        }}</Tabs>
    </RS.Container>
});
