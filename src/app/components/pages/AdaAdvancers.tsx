import React from "react";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { selectors, useAppSelector, useGetGroupMembershipsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { Trans, useTranslation } from "react-i18next";
import { Callout } from "../content/IsaacCallout";

// these will change each year – everything else now ought to be the same
const ADVANCERS_GROUP_ID = 6477;
const ADVANCERS_GROUP_AUTH_TOKEN = "J9MJTZ";
const ADVANCERS_GROUP_NAME = "Ada Advancers Jan 2027 - May 2028";

export const AdaAdvancers = () => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const userId = (user && user.loggedIn) ? user.id : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(userId);
    const userInGroup = groupMemberships?.some(gm => gm.group.id == ADVANCERS_GROUP_ID);

    const groupJoinPrompt = <Callout className="pb-4" style="regular">
        {user?.loggedIn
            ? <span>
                <Trans i18nKey="ada:advancers.join.loggedIn" components={{ strong: <strong />, joinLink: <Link to={`/account?authToken=${ADVANCERS_GROUP_AUTH_TOKEN}`} /> }} values={{ groupName: ADVANCERS_GROUP_NAME }} />
            </span>
            : <><Trans i18nKey="ada:advancers.join.notLoggedIn" components={{ strong: <strong/>, authLink: <Link to={`/account?authToken=${ADVANCERS_GROUP_AUTH_TOKEN}`} /> }} /></>
        }
        <p className="mt-2 mb-0">{t("ada:advancers.join.freeNote")}</p>
    </Callout>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("ada:advancers.page.title")} />
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
