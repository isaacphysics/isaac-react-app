import * as RS from "reactstrap";
import {StreakGauge} from "../views/StreakGauge";
import React from "react";
import {UserProgress} from "../../../../IsaacAppTypes";

export const StreakPanel = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const largestWeeklyStreak = userProgress?.userSnapshot?.weeklyStreakRecord?.largestStreak || 0;
    const currentDailyStreak = userProgress?.userSnapshot?.dailyStreakRecord?.currentStreak || 0;
    return <div className={"align-items-center"}>
        <div className={"text-center-width"}>
            Weekly Streak
        </div>
        <div className={"progress-gauge text-center-width ms-4 me-4"}>
            <StreakGauge streakRecord={userProgress?.userSnapshot}/>
        </div>
        <div id="streak-help" className={"text-center-width"}>
            Longest streak: {largestWeeklyStreak}&nbsp;Week{largestWeeklyStreak !== 1 && "s"}<br/>
            {currentDailyStreak !== 0 && `Daily streak: ${currentDailyStreak} Day${currentDailyStreak !== 1 ? "s" : ""}`}
        </div>
        <RS.UncontrolledTooltip placement="bottom" target="streak-help">
            <div className="text-start">
                The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/>
                Answer at least <b>ten question parts</b> correctly per week to fill up your daily progress bar and increase your streak!
            </div>
        </RS.UncontrolledTooltip>
    </div>
};
