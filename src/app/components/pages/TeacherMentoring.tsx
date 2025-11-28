import React from "react";
import { Alert, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";

export const TeacherMentoring = () => {
    const groupId = 3182;
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == groupId);

    const groupJoinBanner = <Alert color={"warning"}>
        <p>
            To participate in the program you must:
            <ul className="mt-2">
                <li>
                    <b>Have a teacher account</b> on Ada Computer Science.
                    If you don&apos;t yet have an account, <Link to = "/register/teacher/details">sign up here</Link>.
                </li>
                <li>
                    <b>Join the teacher mentoring group</b> on Ada CS so we can set you questions. You can
                    <Link to={"/account?authToken=T33YVV"}> join the group here</Link>.
                </li>
            </ul>
            All of our resources are completely free. <b>You can join (or leave) the programme at any time.</b>
        </p>
    </Alert>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Teacher mentoring programme"} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                {!userInGroup && groupJoinBanner}
                <PageFragment fragmentId={"teacher_mentoring_2025_fragment"} />
            </Col>
        </Row>
    </Container>;
};