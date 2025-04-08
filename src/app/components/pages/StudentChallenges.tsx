import React from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {Col, Container, Row} from "reactstrap";
import {IconCard} from "../elements/cards/IconCard";
import {useLinkableSetting} from "../../services/linkableSetting";
import {selectors, useAppSelector, useGetPageFragmentQuery} from "../../state";

export const StudentChallenges = () => {

    const userPreferences = useAppSelector(selectors.user.preferences);
    const {setLinkedSetting} = useLinkableSetting();
    const liveChallengeId = "live_challenge";
    const {data} = useGetPageFragmentQuery(liveChallengeId);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Student challenges"} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"student_challenges_intro"} />
                {data ?
                    <PageFragment fragmentId={liveChallengeId} />
                    :
                    <>
                        {userPreferences?.EMAIL_PREFERENCE?.EVENTS ?
                            <IconCard
                                card={{
                                    title: "The next challenge",
                                    icon: {src: "/assets/cs/icons/event.svg"},
                                    bodyText: "There are no challenges running at the moment, but you're subscribed to " +
                                        "our mailing list and will be the first to know about the next one!",
                                }}
                                className={"mx-n3"}
                            />
                            :
                            <IconCard
                                card={{
                                    title: "The next challenge",
                                    icon: {src: "/assets/cs/icons/event.svg"},
                                    bodyText: "There are no challenges running at the moment. Update your communication" +
                                        " preferences to be the first to know about the next challenge.",
                                    clickUrl: "/account#notifications",
                                    buttonText: "Notify me",
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