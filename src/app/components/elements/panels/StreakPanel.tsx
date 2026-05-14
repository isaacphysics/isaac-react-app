import {StreakGauge} from "../views/StreakGauge";
import React from "react";
import {UserProgress} from "../../../../IsaacAppTypes";
import { Col, Row, UncontrolledTooltip } from "reactstrap";
import { useTranslation, Trans } from 'react-i18next'

export const StreakPanel = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const { t } = useTranslation()
    const largestWeeklyStreak = userProgress?.userSnapshot?.weeklyStreakRecord?.largestStreak || 0;
    const currentDailyStreak = userProgress?.userSnapshot?.dailyStreakRecord?.currentStreak || 0;
    return <div className={"d-flex flex-column align-items-center"}>
        <b className={"text-center-width mb-2"}>
            {t('weeklyStreak', 'Weekly Streak')}
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
        <div id="streak-help" className={"text-center-width mt-2"}>{t('longestStreakLargestweeklystreaknbspweek', 'Longest streak: {{largestWeeklyStreak}}&nbsp;Week', { largestWeeklyStreak })}{largestWeeklyStreak !== 1 && "s"}<br/>
            {currentDailyStreak >= 14 && t('dailyStreakCurrentdailystreakDays', 'Daily streak: {{currentDailyStreak}} Days', { currentDailyStreak })}
        </div>
        <UncontrolledTooltip placement="bottom" target="streak-help">
            <div className="text-start"><Trans i18nKey="theWeeklyStreakIndicatesTheNumberOfConsecutiveWeeksYouHaveBeenActiveOnIsaacbrAnswerAtLeastBtenQuestionPartsbCorrectlyPerWeekToFillUpYourDailyProgressBarAndIncreaseYourStreak">The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/>
                Answer at least <b>ten question parts</b> correctly per week to fill up your daily progress bar and increase your streak!</Trans></div>
        </UncontrolledTooltip>
    </div>;
};
