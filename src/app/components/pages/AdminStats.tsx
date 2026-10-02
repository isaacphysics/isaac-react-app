import React from 'react';
import {useGetSiteStatisticsQuery} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShowLoading} from "../handlers/ShowLoading";
import {isDefined, SITE_TITLE_SHORT} from "../../services";
import {produce} from "immer";
import { Container, Card, CardBody, Row, Col } from 'reactstrap';
import { Trans, useTranslation } from "react-i18next";

function asPercentage(value: number | undefined, total: number)  {
    return value !== undefined ? Math.round(100 * value / total) : 0;
}

function addTotalToMapOfCounts(counts: {[key: string]: number}) {
    counts['TOTAL'] = 0;
    counts['TOTAL'] = Object.values(counts).reduce((a, b) => a + b, 0);
}

export const AdminStats = () => {
    const { t } = useTranslation();
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
            currentPageTitle={t("common:admin.stats.title", { siteTitle: SITE_TITLE_SHORT })}
            breadcrumbTitleOverride="Admin statistics"
            icon={{type: "icon", icon: "icon-progress"}}
        />
        <ShowLoading
            until={maybeAdminStatsWithTotals}
            thenRender={adminStatsWithTotals => {
                return <>
                    <div className="py-3">{t("common:admin.stats.overview")}</div>
                    <Card className="mb-7 px-3 pt-1">
                        <CardBody>
                            <Row>
                                <Col>
                                    <strong>{t("common:admin.stats.users.heading")}</strong>
                                    <ul className="list-unstyled mb-7">
                                        <li><Trans i18nKey="common:admin.stats.users.sixMonths" components={{ strong: <strong /> }} values={{ activeUsersSixMonths: (adminStatsWithTotals.activeUsersOverPrevious.sixMonths.TOTAL || 0).toLocaleString() }} />
                                        </li>
                                        <li><Trans i18nKey="common:admin.stats.users.twoYears" components={{ strong: <strong /> }} values={{ activeUsersTwoYears: (adminStatsWithTotals.activeUsersOverPrevious.twoYears.TOTAL || 0).toLocaleString() }} />
                                        </li>
                                        <li><Trans i18nKey="common:admin.stats.users.total" components={{ strong: <strong /> }} values={{ totalUsers: (adminStatsWithTotals.userGenders.TOTAL || 0).toLocaleString() }} /></li>
                                        <li className="mt-3">
                                            <strong>{t("common:admin.stats.users.gender")}</strong>
                                            <ul className="list-unstyled">
                                                <li>{t("common:admin.stats.users.gender.male", { count: (adminStatsWithTotals.userGenders.MALE || 0).toLocaleString(), percentage: asPercentage(adminStatsWithTotals.userGenders.MALE, adminStatsWithTotals.userGenders.TOTAL) })}
                                                </li>
                                                <li>{t("common:admin.stats.users.gender.female", { count: (adminStatsWithTotals.userGenders.FEMALE || 0).toLocaleString(), percentage: asPercentage(adminStatsWithTotals.userGenders.FEMALE, adminStatsWithTotals.userGenders.TOTAL) })}
                                                </li>
                                                <li>{t("common:admin.stats.users.gender.other", { count: (adminStatsWithTotals.userGenders.OTHER || 0).toLocaleString(), percentage: asPercentage(adminStatsWithTotals.userGenders.OTHER, adminStatsWithTotals.userGenders.TOTAL) })}
                                                </li>
                                                <li>{t("common:admin.stats.users.gender.preferNotToSay", { count: (adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY || 0).toLocaleString(), percentage: asPercentage(adminStatsWithTotals.userGenders.PREFER_NOT_TO_SAY, adminStatsWithTotals.userGenders.TOTAL) })}
                                                </li>
                                                <li>{t("common:admin.stats.users.gender.missing", { count: (adminStatsWithTotals.userGenders.UNKNOWN || 0).toLocaleString(), percentage: asPercentage(adminStatsWithTotals.userGenders.UNKNOWN, adminStatsWithTotals.userGenders.TOTAL) })}
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>{t("common:admin.stats.users.role")}</strong>
                                            <ul className="list-unstyled">
                                                <li>{t("common:admin.stats.users.role.student", { count: (adminStatsWithTotals.userRoles.STUDENT || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.tutor", { count: (adminStatsWithTotals.userRoles.TUTOR || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.teacher", { count: (adminStatsWithTotals.userRoles.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.eventLeader", { count: (adminStatsWithTotals.userRoles.EVENT_LEADER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.contentEditor", { count: (adminStatsWithTotals.userRoles.CONTENT_EDITOR || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.eventManager", { count: (adminStatsWithTotals.userRoles.EVENT_MANAGER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.role.admin", { count: (adminStatsWithTotals.userRoles.ADMIN || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                        <li className="mt-3">
                                            <strong>{t("common:admin.stats.users.profileCompletion")}</strong>
                                            <ul className="list-unstyled">
                                                <li>{t("common:admin.stats.users.profileCompletion.ukIeSchool", { count: ((adminStatsWithTotals.userSchoolInfo.PROVIDED || 0) + (adminStatsWithTotals.userSchoolInfo.BOTH_PROVIDED || 0)).toLocaleString() })}
                                                </li>
                                                <li>{t("common:admin.stats.users.profileCompletion.otherSchool", { count: (adminStatsWithTotals.userSchoolInfo.OTHER_PROVIDED || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.users.profileCompletion.noSchool", { count: (adminStatsWithTotals.userSchoolInfo.NOT_PROVIDED || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>{t("common:admin.stats.content.heading")}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t("common:admin.stats.content.questionPageViews", { count: (adminStatsWithTotals.viewQuestionEvents || 0).toLocaleString() })}</li>
                                        <li>{t("common:admin.stats.content.questionAttempts", { count: (adminStatsWithTotals.answeredQuestionEvents || 0).toLocaleString() })}</li>
                                        <li>{t("common:admin.stats.content.conceptPageViews", { count: (adminStatsWithTotals.viewConceptEvents || 0).toLocaleString() })}</li>
                                    </ul>

                                </Col>
                                <Col>
                                    <strong>{t("common:admin.stats.lastSeen.heading")}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t("common:admin.stats.lastSeen.sevenDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.lastSeen.sevenDays.all", { count: (adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.sevenDays.teachers", { count: (adminStatsWithTotals.activeUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.sevenDays.students", { count: (adminStatsWithTotals.activeUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                        <li>{t("common:admin.stats.lastSeen.thirtyDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.lastSeen.thirtyDays.all", { count: (adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.thirtyDays.teachers", { count: (adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.thirtyDays.students", { count: (adminStatsWithTotals.activeUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                        <li>{t("common:admin.stats.lastSeen.ninetyDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.lastSeen.ninetyDays.all", { count: (adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.ninetyDays.teachers", { count: (adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.lastSeen.ninetyDays.students", { count: (adminStatsWithTotals.activeUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <strong>{t("common:admin.stats.answering.heading")}</strong>
                                    <ul className="list-unstyled">
                                        <li>{t("common:admin.stats.answering.sevenDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.answering.sevenDays.all", { count: (adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.sevenDays.teachers", { count: (adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.sevenDays.students", { count: (adminStatsWithTotals.answeringUsersOverPrevious.sevenDays.STUDENT || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                        <li>{t("common:admin.stats.answering.thirtyDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.answering.thirtyDays.all", { count: (adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.thirtyDays.teachers", { count: (adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.thirtyDays.students", { count: (adminStatsWithTotals.answeringUsersOverPrevious.thirtyDays.STUDENT || 0).toLocaleString() })}</li>
                                            </ul>
                                        </li>
                                        <li>{t("common:admin.stats.answering.ninetyDays")}
                                            <ul>
                                                <li>{t("common:admin.stats.answering.ninetyDays.all", { count: (adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TOTAL || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.ninetyDays.teachers", { count: (adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.TEACHER || 0).toLocaleString() })}</li>
                                                <li>{t("common:admin.stats.answering.ninetyDays.students", { count: (adminStatsWithTotals.answeringUsersOverPrevious.ninetyDays.STUDENT || 0).toLocaleString() })}</li>
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
