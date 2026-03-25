import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { isTeacherOrAbove } from "../../services";

export const TeacherMentoring = () => {
    const groupId = 3182;
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == groupId);

    const groupJoinPrompt = <div className="bg-yellow-300 p-4 mb-3">
        <span className="icon-help ms-0"/>
        {user?.loggedIn
            ? <>To participate in the programme, join the teacher mentoring group on Ada CS so we can set you questions. You can
                <Link to={"/account?authToken=T33YVV"}> join the group here</Link>.</>

            : <><Link to={"/account?authToken=T33YVV"}>Log in or sign up</Link> to join the teacher mentoring group and participate in the programme.</>
        }
        <p className="mt-2">All of our resources are completely free. You can join (or leave) the programme at any time.</p>
    </div>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Teacher mentoring programme"} />
        <Row className="mb-3">
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"teacher_mentoring_2025_intro"} />
                {!userInGroup && groupJoinPrompt}
                <PageFragment fragmentId={"teacher_mentoring_2025_info"} />
                {isTeacherOrAbove(user) ? <PageFragment fragmentId={"teacher_mentoring_2025_tabs"} /> : <b>You must be signed in with a teacher account to view the weekly resources.</b>}
            </Col>
        </Row>
    </Container>;
};