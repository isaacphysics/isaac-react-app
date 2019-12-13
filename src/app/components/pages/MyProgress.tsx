import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    getProgress, loadMyAssignments,
} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {ProgressBar} from "../elements/ProgressBar";
import {Tabs} from "../elements/Tabs";
import {QuestionProgressGraphs} from "../elements/QuestionProgressGraphs";
import {DailyStreakGauge} from "../elements/DailyStreakGauge";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../services/questions";
import {TestD3} from "../elements/TestD3";
import {ActivityGraph} from "../elements/ActivityGraph";
import {MyAssignments} from "./MyAssignments";
import {Assignments} from "../elements/Assignments";
import {filterAssignmentsByStatus} from "../../services/assignments";



export const MyProgress = () => {
    const dispatch = useDispatch();
    const userProgress = useSelector((state: AppState) => state && state.userProgress);
    const myAssignments = useSelector((state: AppState) => state && state.assignments || null);

    useEffect(() => {
        if (!userProgress) {
            dispatch(getProgress());
        }
    }, [userProgress]);

    // useEffect(() => {
    //     if (!myAssignments) {
    //         dispatch(loadMyAssignments());
    //     }
    // }, [myAssignments]);

    const safePercentage = (correct: number | null | undefined, attempts: number | null | undefined) => (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;

    const fullCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const fullAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const partCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const partAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const fullPercentage = safePercentage(fullCorrect, fullAttempt);
    const partPercentage = safePercentage(partCorrect, partAttempt);


    return <RS.Container id="my-progress">
        <TitleAndBreadcrumb currentPageTitle="My Progress"/>
        <RS.Card className="p-3 mt-4">
            <RS.CardTitle tag="h2">
                Statistics
            </RS.CardTitle>
            <RS.CardBody>
                <RS.Row>
                    <RS.Col className={"col-md-8 pr-5 mt-2"}>
                        <RS.Row>
                            Questions completed correctly of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={fullPercentage || 0} description={fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}/>
                        </RS.Row>
                        <RS.Row className={"mt-3"}>
                            Question parts correct of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={partPercentage || 0} description={partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}/>
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
                            <div className={"text-center-width"}>
                                Longest streak: {userProgress && userProgress.userSnapshot && userProgress.userSnapshot.streakRecord && userProgress.userSnapshot.streakRecord.largestStreak} days [tooltip here]
                            </div>
                        </RS.Row>
                    </RS.Col>
                </RS.Row>
                <Tabs className={"my-3"}>
                    {{
                        "Correct Questions": <QuestionProgressGraphs subId="correct" questionsByTag={(userProgress && userProgress.correctByTag) || {}} questionsByLevel={(userProgress && userProgress.correctByLevel) || {}}/>,
                        "Attempted Questions": <QuestionProgressGraphs subId="attempted" questionsByTag={(userProgress && userProgress.attemptsByTag) || {}} questionsByLevel={(userProgress && userProgress.attemptsByLevel) || {}}/>
                    }}
                </Tabs>

                <RS.Row className={"mt-3"}>
                    <h4>
                        Question parts correct by Type
                    </h4>
                </RS.Row>
                <RS.Row>
                    {(Array.from(QUESTION_TYPES.keys()) as string[]).filter((qType: string) => qType != "default").map((qType: string) => {
                        const correct = userProgress && userProgress.correctByType && userProgress.correctByType[qType] || null;
                        const attempts = userProgress && userProgress.attemptsByType && userProgress.attemptsByType[qType] || null;
                        const percentage = safePercentage(correct, attempts);
                        return <RS.Col key={qType} className={"col-lg-4 mt-2 type-progress-bar"}>
                            <RS.Row className={"px-2"}>
                                {HUMAN_QUESTION_TYPES.get(qType)} questions correct
                            </RS.Row>
                            <RS.Row className={"px-2"}>
                                <ProgressBar percentage={percentage || 0} description={percentage == null ? "No data" : `${correct} of ${attempts}`}/>
                            </RS.Row>
                        </RS.Col>
                    })}
                </RS.Row>
                <RS.Row className={"mt-3"}>
                    <h4>
                        Question attempts over time
                    </h4>
                </RS.Row>
                <RS.Row>
                    <ActivityGraph/>
                </RS.Row>
            </RS.CardBody>
        </RS.Card>
        <RS.Card className="p-3 mt-3 mb-5">
            <RS.CardTitle tag="h2">
                Current assignments
            </RS.CardTitle>
            <RS.CardBody>
                <Assignments assignments={filterAssignmentsByStatus(myAssignments).inProgressRecent}/>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};