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

    const groupJoinPrompt = <Alert color={"warning"}> {/* a11y? */}
        {user?.loggedIn
            ? <>To participate in the program, join the teacher mentoring group on Ada CS so we can set you questions. You can
                <Link to={"/account?authToken=T33YVV"}> join the group here</Link>.</>

            : <><Link to={"/account?authToken=T33YVV"}>Log in or sign up</Link> to join the teacher mentoring group.</>
        }
        <p className="mt-2">All of our resources are completely free. You can join (or leave) the programme at any time.</p>
    </Alert>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Teacher mentoring programme"} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                {!userInGroup && groupJoinPrompt}
                <PageFragment fragmentId={"teacher_mentoring_2025_fragment"} />
            </Col>
        </Row>
    </Container>;
};