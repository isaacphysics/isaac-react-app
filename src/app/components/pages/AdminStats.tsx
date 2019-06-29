import React, {useEffect} from 'react';
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {getAdminSiteStats} from "../../state/actions";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AdminStatsState, AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";

const stateToProps = (state: AppState) => ({
    adminStats: state && state.adminStats || null,
});

const dispatchToProps = {getAdminSiteStats};

interface AdminPageProps {
    adminStats: AdminStatsState;
    getAdminSiteStats: () => void;
}

function asPercentage(value: number | undefined, total: number)  {
    return value !== undefined ? Math.round(100 * value / total) : 0;
}

function addTotalToMapOfCounts (counts: {[key: string]: number}) {
    counts['TOTAL'] = Object.values(counts).reduce((a, b) => a + b, 0);
}

const AdminStatsPageComponent = ({adminStats, getAdminSiteStats}: AdminPageProps) => {
    useEffect(() => {
        getAdminSiteStats();
    }, []);


    if (adminStats != null) {
        // Add total value to each of the active user ranges
        for (let timeRange in adminStats.activeUsersOverPrevious) {
            if (adminStats.activeUsersOverPrevious.hasOwnProperty(timeRange)) {
                addTotalToMapOfCounts(adminStats.activeUsersOverPrevious[timeRange]);
            }
        }
        // Add total value to each of the answered user ranges
        for (let timeRange in adminStats.answeringUsersOverPrevious) {
            if (adminStats.answeringUsersOverPrevious.hasOwnProperty(timeRange)) {
                addTotalToMapOfCounts(adminStats.answeringUsersOverPrevious[timeRange]);
            }
        }
        addTotalToMapOfCounts(adminStats.userGenders);
        addTotalToMapOfCounts(adminStats.userSchoolInfo)
    }

    return <RS.Container id="admin-stats-page">
        <TitleAndBreadcrumb currentPageTitle="Isaac statistics" breadcrumbTitleOverride="Admin statistics" />

        <ShowLoading until={adminStats}>
            {adminStats && <div className={"mt-3"}>
                <span>A high-level overview of the users and activity on the platform:</span>
                <RS.Row className={"mt-1 mb-4"}>
                    <RS.Col>
                        <ul>
                            <li>
                                <strong>Users:</strong>
                                <ul>
                                    <li>Active Last 6 Months:&nbsp;
                                        <strong>{(adminStats.activeUsersOverPrevious.sixMonths.TOTAL | 0).toLocaleString()}</strong>
                                    </li>
                                    <li>Registered: <strong>{(adminStats.userGenders.TOTAL | 0).toLocaleString()}</strong></li>
                                    <li className={"mb-2"}>
                                        <strong>Gender</strong>
                                        <ul>
                                            <li>Male: {adminStats.userGenders.MALE || 0} ({
                                                asPercentage(adminStats.userGenders.MALE, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Female: {adminStats.userGenders.FEMALE || 0} ({
                                                asPercentage(adminStats.userGenders.FEMALE, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Other: {adminStats.userGenders.OTHER || 0} ({
                                                asPercentage(adminStats.userGenders.OTHER, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Unknown: {adminStats.userGenders.UNKNOWN || 0} ({
                                                asPercentage(adminStats.userGenders.UNKNOWN, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                        </ul>
                                    </li>
                                    <li className={"mb-2"}>
                                        <strong>Role</strong>
                                        <ul>
                                            <li>Student: {adminStats.userRoles.STUDENT || 0}</li>
                                            <li>Teacher: {adminStats.userRoles.TEACHER || 0}</li>
                                            <li>Event Manager: {adminStats.userRoles.EVENT_MANAGER || 0}</li>
                                            <li>Content Editor: {adminStats.userRoles.CONTENT_EDITOR || 0}</li>
                                            <li>Admin: {adminStats.userRoles.ADMIN || 0}</li>
                                        </ul>
                                    </li>
                                    <li className={"mb-2"}>
                                        <strong>Profile Completion</strong>
                                        <ul>
                                            <li>UK/IE school provided: {
                                                (adminStats.userSchoolInfo.PROVIDED || 0) + (adminStats.userSchoolInfo.BOTH_PROVIDED || 0)
                                            }
                                            </li>
                                            <li>Other school provided: {adminStats.userSchoolInfo.OTHER_PROVIDED || 0}</li>
                                            <li>No school provided: {adminStats.userSchoolInfo.NOT_PROVIDED || 0}</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Question Statistics</strong>
                                <ul>
                                    <li>Question Page Views: {(adminStats.viewQuestionEvents || 0).toLocaleString()}</li>
                                    <li>Total Question Attempts: {(adminStats.answeredQuestionEvents || 0).toLocaleString()}</li>
                                </ul>
                            </li>
                        </ul>
                    </RS.Col>
                    <RS.Col>
                        <ul>
                            <li className={"mb-2"}>
                                <strong>Last Seen</strong>
                                <ul>
                                    <li>Previous 7 days:
                                        <ul>
                                            <li>All: {adminStats.activeUsersOverPrevious.sevenDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.activeUsersOverPrevious.sevenDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.activeUsersOverPrevious.sevenDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                    <li>Previous 30 days:
                                        <ul>
                                            <li>All: {adminStats.activeUsersOverPrevious.thirtyDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.activeUsersOverPrevious.thirtyDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.activeUsersOverPrevious.thirtyDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                    <li>Previous 90 days:
                                        <ul>
                                            <li>All: {adminStats.activeUsersOverPrevious.ninetyDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.activeUsersOverPrevious.ninetyDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.activeUsersOverPrevious.ninetyDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Answering Questions</strong>
                                <ul>
                                    <li>Previous 7 days:
                                        <ul>
                                            <li>All: {adminStats.answeringUsersOverPrevious.sevenDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.answeringUsersOverPrevious.sevenDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.answeringUsersOverPrevious.sevenDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                    <li>Previous 30 days:
                                        <ul>
                                            <li>All: {adminStats.answeringUsersOverPrevious.thirtyDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.answeringUsersOverPrevious.thirtyDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.answeringUsersOverPrevious.thirtyDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                    <li>Previous 90 days:
                                        <ul>
                                            <li>All: {adminStats.answeringUsersOverPrevious.ninetyDays.TOTAL || 0}</li>
                                            <li>Teachers: {adminStats.answeringUsersOverPrevious.ninetyDays.TEACHER || 0}</li>
                                            <li>Students: {adminStats.answeringUsersOverPrevious.ninetyDays.STUDENT || 0}</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </RS.Col>
                </RS.Row>
            </div>}
        </ShowLoading>
    </RS.Container>;
};

export const AdminStats = connect(stateToProps, dispatchToProps)(AdminStatsPageComponent);
