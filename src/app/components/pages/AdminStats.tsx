import React from 'react';
import {useGetSiteStatisticsQuery} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";
import {isDefined, SITE_TITLE_SHORT} from "../../services";
import {produce} from "immer";
import { Container, Card, CardBody, Row, Col } from 'reactstrap';

function asPercentage(value: number | undefined, total: number)  {
    return value !== undefined ? Math.round(100 * value / total) : 0;
}

function addTotalToMapOfCounts(counts: {[key: string]: number}) {
    counts['TOTAL'] = 0;
    counts['TOTAL'] = Object.values(counts).reduce((a, b) => a + b, 0);
}

export const AdminStats = () => {
    const {data: adminStats} = useGetSiteStatisticsQuery();

    const maybeAdminStatsWithTotals = produce(adminStats, adminStats => {
        if (!isDefined(adminStats)) return;
        // Add total value to each of the active user ranges
        for (const timeRange in adminStats.activeUsersOverPrevious) {
            if (adminStats.activeUsersOverPrevious.hasOwnProperty(timeRange)) {
                addTotalToMapOfCounts(adminStats.activeUsersOverPrevious[timeRange]);
            }
        }
        // Add total value to each of the answered user ranges
        for (const timeRange in adminStats.answeringUsersOverPrevious) {
            if (adminStats.answeringUsersOverPrevious.hasOwnProperty(timeRange)) {
                addTotalToMapOfCounts(adminStats.answeringUsersOverPrevious[timeRange]);
            }
        }
        addTotalToMapOfCounts(adminStats.userGenders);
        addTotalToMapOfCounts(adminStats.userSchoolInfo);
    });

    return <Container id="admin-stats-page">
        <TitleAndBreadcrumb
            currentPageTitle={`${SITE_TITLE_SHORT} statistics`}
            breadcrumbTitleOverride="Admin statistics"
            icon={{type: "icon", icon: "icon-progress"}}
        />
        <ShowLoading
            until={maybeAdminStatsWithTotals}
            thenRender={adminStatsWithTotals => {
                return <>
                    <div className="py-3">A high-level overview of the users and activity on the platform:</div>
                    <Card className="mb-7 px-3 pt-1">
                        <CardBody>
                            <Row>
                                <Col>
                                    <strong>Users:</strong>
                                    <ul className="list-unstyled mb-7">
                                        <li>Last 6 months:&nbsp;
                                            <strong>{(adminStatsWithTotals.activeUsersOverPrevious.sixMonths.TOTAL || 0).toLocaleString()}</strong>
                                        </li>
                                        <li>Last 2 years:&nbsp;
                                            <strong>{(adminStatsWithTotals.activeUsersOverPrevious.twoYears.TOTAL || 0).toLocaleString()}</strong>
                                        </li>
                                        <li>Total (excl. archived): <strong>{(adminStatsWithTotals.userGenders.TOTAL || 0).toLocaleString()}</strong></li>
                                        <li className="mt-3">
                                            <strong>Gender</strong>
                                            <ul className="list-unstyled">
                                                <li>Male: {(adminStatsWithTotals.userGenders.MALE || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.MALE, adminStatsWithTotals.userGenders.TOTAL)}%)
                                                </li>
                                                <li>Female: {(adminStatsWithTotals.userGenders.FEMALE || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.FEMALE, adminStatsWithTotals.userGenders.TOTAL)}%)
                                                </li>
                                                <li>Other: {(adminStatsWithTotals.userGenders.OTHER || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.OTHER, adminStatsWithTotals.userGenders.TOTAL)}%)
                                                </li>
                                                <li>Prefer not to say: {(adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY, adminStatsWithTotals.userGenders.TOTAL)}%)
                                                </li>
                                                <li>Missing data: {(adminStatsWithTotals.userGenders.UNKNOWN || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.UNKNOWN, adminStatsWithTotals.userGenders.TOTAL)}%)
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>Role</strong>
                                            <ul className="list-unstyled">
                                                <li>Student: {(adminStatsWithTotals.userRoles.STUDENT || 0).toLocaleString()}</li>
                                                <li>Tutor: {(adminStatsWithTotals.userRoles.TUTOR || 0).toLocaleString()}</li>
                                                <li>Teacher: {(adminStatsWithTotals.userRoles.TEACHER || 0).toLocaleString()}</li>
                                                <li>Event Leader: {(adminStatsWithTotals.userRoles.EVENT_LEADER || 0).toLocaleString()}</li>
                                                <li>Content Editor: {(adminStatsWithTotals.userRoles.CONTENT_EDITOR || 0).toLocaleString()}</li>
                                                <li>Event Manager: {(adminStatsWithTotals.userRoles.EVENT_MANAGER || 0).toLocaleString()}</li>
                                                <li>Admin: {(adminStatsWithTotals.userRoles.ADMIN || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>Profile Completion</strong>
                                            <ul className="list-unstyled">
                                                <li>UK/IE school provided: {
                                                    ((adminStatsWithTotals.userSchoolInfo.PROVIDED || 0) + (adminStatsWithTotals.userSchoolInfo.BOTH_PROVIDED || 0)).toLocaleString()
                                                }
                                                </li>
                                                <li>Other school provided: {(adminStatsWithTotals.userSchoolInfo.OTHER_PROVIDED || 0).toLocaleString()}</li>
                                                <li>No school provided: {(adminStatsWithTotals.userSchoolInfo.NOT_PROVIDED || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>Content Statistics</strong>
                                    <ul className="list-unstyled">
                                        <li>Question Page Views: {(adminStatsWithTotals.viewQuestionEvents || 0).toLocaleString()}</li>
                                        <li>Total Question Attempts: {(adminStatsWithTotals.answeredQuestionEvents || 0).toLocaleString()}</li>
                                        <li>Concept Page Views: {(adminStatsWithTotals.viewConceptEvents || 0).toLocaleString()}</li>
                                    </ul>

                                </Col>
                                <Col>
                                    <strong>Last Seen</strong>
                                    <ul className="list-unstyled">
                                        <li>Previous 7 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>Previous 30 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>Previous 90 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>Answering Questions</strong>
                                    <ul className="list-unstyled">
                                        <li>Previous 7 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>Previous 30 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>Previous 90 days:
                                            <ul>
                                                <li>All: {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>Teachers: {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>Students: {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </>;
            }}
        />
    </Container>;
};
