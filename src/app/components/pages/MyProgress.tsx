import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    getProgress,
} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {ProgressBar} from "../elements/ProgressBar";
import {Tabs} from "../elements/Tabs";
import {QuestionProgressGraphs} from "../elements/QuestionProgressGraphs";
import {DailyStreakGauge} from "../elements/DailyStreakGauge";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../services/questions";
import {TestD3} from "../elements/TestD3";



export const MyProgress = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userProgress = useSelector((state: AppState) => state && state.userProgress);

    useEffect(() => {
        if (!userProgress) {
            dispatch(getProgress());
        }
    }, [user]);

    const safePercentage = (correct: number | null | undefined, attempts: number | null | undefined) => (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;

    const fullCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const fullAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const partCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const partAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const fullPercentage = safePercentage(fullCorrect, fullAttempt);
    const partPercentage = safePercentage(partCorrect, partAttempt);


    return <RS.Container id="my-progress">
        <TitleAndBreadcrumb currentPageTitle="My Progress"/>
        <RS.Card className="p-3 mt-4 mb-5">
            <RS.CardBody>
                <RS.Row>
                    <RS.Col className={"col-md-8 pr-5"}>
                        <RS.Row>
                            Questions completed correctly of those attempted
                        </RS.Row>
                        <RS.Row>
                            <ProgressBar percentage={fullPercentage || 0} description={fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}/>
                        </RS.Row>
                        <RS.Row>
                            Question parts correct of those attempted
                        </RS.Row>
                        <RS.Row>
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
                            <DailyStreakGauge/>
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

                <RS.Row>
                    <div>
                        Question parts correct by Type
                    </div>
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
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};