import React from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {Col, Container, Row} from "reactstrap";
import {IconCard} from "../elements/cards/IconCard";
import {useLinkableSetting} from "../../services/linkableSetting";
import {selectors, useAppSelector, useGetPageFragmentQuery} from "../../state";
import { useTranslation } from "react-i18next";

export const StudentChallenges = () => {
    const { t } = useTranslation();

    const userPreferences = useAppSelector(selectors.user.preferences);
    const {setLinkedSetting} = useLinkableSetting();
    const liveChallengeId = "live_challenge";
    const {isError} = useGetPageFragmentQuery(liveChallengeId);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("common:challenges.pageTitle")} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"student_challenges_intro"} />
                {!isError ?
                    <PageFragment fragmentId={liveChallengeId} />
                    :
                    <>
                        {userPreferences?.EMAIL_PREFERENCE?.EVENTS ?
                            <IconCard
                                card={{
                                    title: t("common:challenges.emptyState.subscribedTitle"),
                                    icon: {name: "icon-events", color: "tertiary"},
                                    bodyText: t("common:challenges.emptyState.subscribedMessage"),
                                }}
                                className={"mx-n3"}
                            />
                            :
                            <IconCard
                                card={{
                                    title: t("common:challenges.emptyState.unsubscribedTitle"),
                                    icon: {name: "icon-events", color: "tertiary"},
                                    bodyText: t("common:challenges.emptyState.unsubscribedMessage"),
                                    clickUrl: "/account#notifications",
                                    buttonText: t("common:challenges.emptyState.notifyButton"),
                                    onButtonClick: () => {setLinkedSetting("events-preference");}
                                }}
                                className={"mx-n3"}
                            />
                        }
                    </>
                }
            </Col>
        </Row>
    </Container>;
};
