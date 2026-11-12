import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { isTeacherOrAbove } from "../../services";
import { Callout } from "../content/IsaacCallout";

// these will change each year – everything else now ought to be the same
const MENTORING_GROUP_ID = 5558;
const MENTORING_GROUP_AUTH_TOKEN = "NVJZGH";
const MENTORING_GROUP_NAME = "Teacher Mentoring 2026-27";

export const TeacherMentoring = () => {
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == MENTORING_GROUP_ID);

    const groupJoinPrompt = <Callout className="pb-4" style="regular">
        {user?.loggedIn
            ? <span>
                <strong><Link to={`/account?authToken=${MENTORING_GROUP_AUTH_TOKEN}`}>Join the {MENTORING_GROUP_NAME} group</Link></strong>
                {" "}to participate in the programme so that we can assign you the quizzes weekly.
            </span>
            : <><strong><Link to={`/account?authToken=${MENTORING_GROUP_AUTH_TOKEN}`}>Log in or sign up</Link></strong> to join the teacher mentoring group and participate in the programme.</>
        }
        <p className="mt-2 mb-0">All of our resources are completely free. You can join (or leave) the programme at any time.</p>
    </Callout>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Teacher mentoring programme"} />
        <Row className="mb-3">
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"teacher_mentoring_intro"} />
                {!userInGroup && groupJoinPrompt}
                <PageFragment fragmentId={"teacher_mentoring_info"} />
                {isTeacherOrAbove(user) ? <PageFragment fragmentId={"teacher_mentoring_tabs"} /> : <b>You must be signed in with a teacher account to view the weekly resources.</b>}
            </Col>
        </Row>
    </Container>;
};
