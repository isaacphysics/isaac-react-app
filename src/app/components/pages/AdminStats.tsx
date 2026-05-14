import React from 'react';
import {useGetSiteStatisticsQuery} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";
import {isDefined, SITE_TITLE_SHORT} from "../../services";
import {produce} from "immer";
import { Container, Card, CardBody, Row, Col } from 'reactstrap';
import { useTranslation } from 'react-i18next'

function asPercentage(value: number | undefined, total: number)  {
    return value !== undefined ? Math.round(100 * value / total) : 0;
}

function addTotalToMapOfCounts(counts: {[key: string]: number}) {
    counts['TOTAL'] = 0;
    counts['TOTAL'] = Object.values(counts).reduce((a, b) => a + b, 0);
}

export const AdminStats = () => {
    const { t } = useTranslation()
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
            currentPageTitle={t('site_title_shortStatistics', '{{SITE_TITLE_SHORT}} statistics', { SITE_TITLE_SHORT })}
            breadcrumbTitleOverride="Admin statistics"
            icon={{type: "icon", icon: "icon-progress"}}
        />
        <ShowLoading
            until={maybeAdminStatsWithTotals}
            thenRender={adminStatsWithTotals => {
                return <>
                    <div className="py-3">{t('aHighlevelOverviewOfTheUsersAndActivityOnThePlatform', 'A high-level overview of the users and activity on the platform:')}</div>
                    <Card className="mb-7 px-3 pt-1">
                        <CardBody>
                            <Row>
                                <Col>
                                    <strong>{t('users', 'Users:')}</strong>
                                    <ul className="list-unstyled mb-7">
                                        <li>{t('last6Monthsnbsp', 'Last 6 months:&nbsp;')}
                                            <strong>{(adminStatsWithTotals.activeUsersOverPrevious.sixMonths.TOTAL || 0).toLocaleString()}</strong>
                                        </li>
                                        <li>{t('last2Yearsnbsp', 'Last 2 years:&nbsp;')}
                                            <strong>{(adminStatsWithTotals.activeUsersOverPrevious.twoYears.TOTAL || 0).toLocaleString()}</strong>
                                        </li>
                                        <li>{t('totalExclArchived', 'Total (excl. archived):')} <strong>{(adminStatsWithTotals.userGenders.TOTAL || 0).toLocaleString()}</strong></li>
                                        <li className="mt-3">
                                            <strong>{t('gender', 'Gender')}</strong>
                                            <ul className="list-unstyled">
                                                <li>{t('male', 'Male:')} {(adminStatsWithTotals.userGenders.MALE || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.MALE, adminStatsWithTotals.userGenders.TOTAL)}{t('key4', '%)')}
                                                </li>
                                                <li>{t('female2', 'Female:')} {(adminStatsWithTotals.userGenders.FEMALE || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.FEMALE, adminStatsWithTotals.userGenders.TOTAL)}{t('key4', '%)')}
                                                </li>
                                                <li>{t('other', 'Other:')} {(adminStatsWithTotals.userGenders.OTHER || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.OTHER, adminStatsWithTotals.userGenders.TOTAL)}{t('key4', '%)')}
                                                </li>
                                                <li>{t('preferNotToSay', 'Prefer not to say:')} {(adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY, adminStatsWithTotals.userGenders.TOTAL)}{t('key4', '%)')}
                                                </li>
                                                <li>{t('missingData', 'Missing data:')} {(adminStatsWithTotals.userGenders.UNKNOWN || 0).toLocaleString()} ({
                                                    asPercentage(adminStatsWithTotals.userGenders.UNKNOWN, adminStatsWithTotals.userGenders.TOTAL)}{t('key4', '%)')}
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>Role</strong>
                                            <ul className="list-unstyled">
                                                <li>{t('student2', 'Student:')} {(adminStatsWithTotals.userRoles.STUDENT || 0).toLocaleString()}</li>
                                                <li>{t('tutor', 'Tutor:')} {(adminStatsWithTotals.userRoles.TUTOR || 0).toLocaleString()}</li>
                                                <li>{t('teacher2', 'Teacher:')} {(adminStatsWithTotals.userRoles.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('eventLeader2', 'Event Leader:')} {(adminStatsWithTotals.userRoles.EVENT_LEADER || 0).toLocaleString()}</li>
                                                <li>{t('contentEditor2', 'Content Editor:')} {(adminStatsWithTotals.userRoles.CONTENT_EDITOR || 0).toLocaleString()}</li>
                                                <li>{t('eventManager2', 'Event Manager:')} {(adminStatsWithTotals.userRoles.EVENT_MANAGER || 0).toLocaleString()}</li>
                                                <li>{t('admin2', 'Admin:')} {(adminStatsWithTotals.userRoles.ADMIN || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>{t('profileCompletion', 'Profile Completion')}</strong>
                                            <ul className="list-unstyled">
                                                <li>{t('ukieSchoolProvided', 'UK/IE school provided:')} {
                                                    ((adminStatsWithTotals.userSchoolInfo.PROVIDED || 0) + (adminStatsWithTotals.userSchoolInfo.BOTH_PROVIDED || 0)).toLocaleString()
                                                }
                                                </li>
                                                <li>{t('otherSchoolProvided', 'Other school provided:')} {(adminStatsWithTotals.userSchoolInfo.OTHER_PROVIDED || 0).toLocaleString()}</li>
                                                <li>{t('noSchoolProvided', 'No school provided:')} {(adminStatsWithTotals.userSchoolInfo.NOT_PROVIDED || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>{t('contentStatistics', 'Content Statistics')}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t('questionPageViews', 'Question Page Views:')} {(adminStatsWithTotals.viewQuestionEvents || 0).toLocaleString()}</li>
                                        <li>{t('totalQuestionAttempts', 'Total Question Attempts:')} {(adminStatsWithTotals.answeredQuestionEvents || 0).toLocaleString()}</li>
                                        <li>{t('conceptPageViews', 'Concept Page Views:')} {(adminStatsWithTotals.viewConceptEvents || 0).toLocaleString()}</li>
                                    </ul>

                                </Col>
                                <Col>
                                    <strong>{t('lastSeen2', 'Last Seen')}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t('previous7Days', 'Previous 7 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.activeUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>{t('previous30Days', 'Previous 30 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>{t('previous90Days', 'Previous 90 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>{t('answeringQuestions2', 'Answering Questions')}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t('previous7Days', 'Previous 7 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>{t('previous30Days', 'Previous 30 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString()}</li>
                                            </ul>
                                        </li>
                                        <li>{t('previous90Days', 'Previous 90 days:')}
                                            <ul>
                                                <li>{t('all2', 'All:')} {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString()}</li>
                                                <li>{t('teachers2', 'Teachers:')} {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString()}</li>
                                                <li>{t('students2', 'Students:')} {(adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString()}</li>
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
