import React, {useEffect} from 'react';
import {AppState, getAdminSiteStats, useAppDispatch, useAppSelector} from "../../state";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";

function asPercentage(value: number | undefined, total: number)  {
    return value !== undefined ? Math.round(100 * value / total) : 0;
}

function addTotalToMapOfCounts(counts: {[key: string]: number}) {
    counts['TOTAL'] = 0;
    counts['TOTAL'] = Object.values(counts).reduce((a, b) => a + b, 0);
}

export const AdminStats = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(getAdminSiteStats());}, []);
    const adminStats = useAppSelector((state: AppState) => state?.adminStats || null);

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
            {adminStats && <React.Fragment>
                <div className="py-3">A high-level overview of the users and activity on the platform:</div>
                <RS.Card className="mb-5 px-3 pt-1">
                    <RS.CardBody>
                        <RS.Row>
                            <RS.Col>
                                <strong>Users:</strong>
                                <ul className="list-unstyled mb-5">
                                    <li>Last 6 months:&nbsp;
                                        <strong>{(adminStats.activeUsersOverPrevious.sixMonths.TOTAL || 0).toLocaleString()}</strong>
                                    </li>
                                    <li>Last 2 years:&nbsp;
                                        <strong>{(adminStats.activeUsersOverPrevious.twoYears.TOTAL || 0).toLocaleString()}</strong>
                                    </li>
                                    <li>Total accounts: <strong>{(adminStats.userGenders.TOTAL || 0).toLocaleString()}</strong></li>
                                    <li className="mt-3">
                                        <strong>Gender</strong>
                                        <ul className="list-unstyled">
                                            <li>Male: {adminStats.userGenders.MALE || 0} ({
                                                asPercentage(adminStats.userGenders.MALE, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Female: {adminStats.userGenders.FEMALE || 0} ({
                                                asPercentage(adminStats.userGenders.FEMALE, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Other: {adminStats.userGenders.OTHER || 0} ({
                                                asPercentage(adminStats.userGenders.OTHER, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Prefer not to say: {adminStats.userGenders.PREFER_NOT_TO_SAY || 0} ({
                                                asPercentage(adminStats.userGenders.PREFER_NOT_TO_SAY, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                            <li>Missing data: {adminStats.userGenders.UNKNOWN || 0} ({
                                                asPercentage(adminStats.userGenders.UNKNOWN, adminStats.userGenders.TOTAL)}%)
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="mt-3">
                                        <strong>Role</strong>
                                        <ul className="list-unstyled">
                                            <li>Student: {adminStats.userRoles.STUDENT || 0}</li>
                                            <li>Teacher: {adminStats.userRoles.TEACHER || 0}</li>
                                            <li>Event Leader: {adminStats.userRoles.EVENT_LEADER || 0}</li>
                                            <li>Content Editor: {adminStats.userRoles.CONTENT_EDITOR || 0}</li>
                                            <li>Event Manager: {adminStats.userRoles.EVENT_MANAGER || 0}</li>
                                            <li>Admin: {adminStats.userRoles.ADMIN || 0}</li>
                                        </ul>
                                    </li>
                                    <li className="mt-3">
                                        <strong>Profile Completion</strong>
                                        <ul className="list-unstyled">
                                            <li>UK/IE school provided: {
                                                (adminStats.userSchoolInfo.PROVIDED || 0) + (adminStats.userSchoolInfo.BOTH_PROVIDED || 0)
                                            }
                                            </li>
                                            <li>Other school provided: {adminStats.userSchoolInfo.OTHER_PROVIDED || 0}</li>
                                            <li>No school provided: {adminStats.userSchoolInfo.NOT_PROVIDED || 0}</li>
                                        </ul>
                                    </li>
                                </ul>

                                <strong>Content Statistics</strong>
                                <ul className="list-unstyled">
                                    <li>Question Page Views: {(adminStats.viewQuestionEvents || 0).toLocaleString()}</li>
                                    <li>Total Question Attempts: {(adminStats.answeredQuestionEvents || 0).toLocaleString()}</li>
                                    <li>Concept Page Views: {(adminStats.viewConceptEvents || 0).toLocaleString()}</li>
                                </ul>

                            </RS.Col>
                            <RS.Col>
                                <strong>Last Seen</strong>
                                <ul className="list-unstyled">
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

                                <strong>Answering Questions</strong>
                                <ul className="list-unstyled">
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
                            </RS.Col>
                        </RS.Row>
                    </RS.CardBody>
                </RS.Card>
            </React.Fragment>}
        </ShowLoading>
    </RS.Container>;
};
