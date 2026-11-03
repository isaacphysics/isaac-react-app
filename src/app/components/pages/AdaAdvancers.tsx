import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { Callout } from "../content/IsaacCallout";

// these will change each year – everything else now ought to be the same
const ADVANCERS_GROUP_ID = 6477;
const ADVANCERS_GROUP_AUTH_TOKEN = "J9MJTZ";
const ADVANCERS_GROUP_NAME = "Ada Advancers Jan 2027 - May 2028";

export const AdaAdvancers = () => {
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == ADVANCERS_GROUP_ID);

    const groupJoinPrompt = <Callout className="pb-4" style="regular">
        {user?.loggedIn
            ? <span>
                <strong><Link to={`/account?authToken=${ADVANCERS_GROUP_AUTH_TOKEN}`}>Join the {ADVANCERS_GROUP_NAME} group</Link></strong>
                {" "}to participate in the programme so that we can assign you the quizzes weekly.
            </span>
            : <><Link to={`/account?authToken=${ADVANCERS_GROUP_AUTH_TOKEN}`}>Log in or sign up</Link> to join the Ada advancers group and participate in the programme.</>
        }
        <p className="mt-2 mb-0">All of our resources are completely free. You can leave the programme at any time.</p>
    </Callout>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Ada advancers programme"} />
        <Row className="mb-3">
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"ada_advancers_intro"} />
                {!userInGroup && groupJoinPrompt}
                <PageFragment fragmentId={"ada_advancers_info"} />
                <PageFragment fragmentId={"ada_advancers_tabs"} />
            </Col>
        </Row>
    </Container>;
};
