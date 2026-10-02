import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { isTeacherOrAbove } from "../../services";
import { Trans, useTranslation } from "react-i18next";

// these will change each year – everything else now ought to be the same
const MENTORING_GROUP_ID = 5558;
const MENTORING_GROUP_AUTH_TOKEN = "NVJZGH";
const MENTORING_GROUP_NAME = "Teacher Mentoring 2026-27";

export const TeacherMentoring = () => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == MENTORING_GROUP_ID);

    const groupJoinPrompt = <div className="isaac-callout hi-cyan-25 p-4">
        <img src="/assets/cs/icons/callout/regular-callout.svg" alt="" className="float-end p-0 wf-3 hf-3 mt-n3 me-n3" />
        {user?.loggedIn
            ? <span>
                <Trans i18nKey="common:teacherMentoring.join.loggedIn" components={{ strong: <strong />, joinLink: <Link to={`/account?authToken=${MENTORING_GROUP_AUTH_TOKEN}`} /> }} values={{ groupName: MENTORING_GROUP_NAME }} />
            </span>
            : <><Trans i18nKey="common:teacherMentoring.join.notLoggedIn" components={{ authLink: <Link to={`/account?authToken=${MENTORING_GROUP_AUTH_TOKEN}`} /> }} /></>
        }
        <p className="mt-2 mb-0">{t("common:teacherMentoring.join.freeNote")}</p>
    </div>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("common:teacherMentoring.page.title")} />
        <Row className="mb-3">
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"teacher_mentoring_intro"} />
                {!userInGroup && groupJoinPrompt}
                <PageFragment fragmentId={"teacher_mentoring_info"} />
                {isTeacherOrAbove(user) ? <PageFragment fragmentId={"teacher_mentoring_tabs"} /> : <b>{t("common:teacherMentoring.page.teacherNotice")}</b>}
            </Col>
        </Row>
    </Container>;
};
