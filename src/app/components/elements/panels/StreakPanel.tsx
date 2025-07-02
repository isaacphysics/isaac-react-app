import {StreakGauge} from "../views/StreakGauge";
import React from "react";
import {UserProgress} from "../../../../IsaacAppTypes";
import { Col, Row, UncontrolledTooltip } from "reactstrap";

export const StreakPanel = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const largestWeeklyStreak = userProgress?.userSnapshot?.weeklyStreakRecord?.largestStreak || 0;
    const currentDailyStreak = userProgress?.userSnapshot?.dailyStreakRecord?.currentStreak || 0;
    return <div className={"d-flex flex-column align-items-center"}>
        <b className={"text-center-width mb-2"}>
            Weekly Streak
        </b>
        <Row>
            <Col size={4} className="d-md-none"/>
            <Col size={4}>
                <div className={"progress-gauge text-center-width ms-4 me-4"}>
                    <StreakGauge streakRecord={userProgress?.userSnapshot}/>
                </div>
            </Col>
            <Col size={4} className="d-md-none"/>
        </Row>
        <div id="streak-help" className={"text-center-width mt-2"}>
            Longest streak: {largestWeeklyStreak}&nbsp;Week{largestWeeklyStreak !== 1 && "s"}<br/>
            {currentDailyStreak >= 14 && `Daily streak: ${currentDailyStreak} Days`}
        </div>
        <UncontrolledTooltip placement="bottom" target="streak-help">
            <div className="text-start">
                The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/>
                Answer at least <b>ten question parts</b> correctly per week to fill up your daily progress bar and increase your streak!
            </div>
        </UncontrolledTooltip>
    </div>;
};
