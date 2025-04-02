import React, {useEffect} from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {Col, Container, Row} from "reactstrap";
import {IconCard} from "../elements/cards/IconCard";
import {useLinkableSetting} from "../../services/linkableSetting";
import {selectors, useAppSelector} from "../../state";

export const StudentChallenges = () => {

    const user = useAppSelector(selectors.user.orNull);
    const {setLinkedSetting} = useLinkableSetting();

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Student challenges"} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"student_challenges_fragment"} />
                <IconCard
                    card={{
                        title: "No challenges running",
                        icon: {src: "/assets/cs/icons/event.svg"},
                        bodyText: "There are no challenges running at the moment. Update your communication preferences to be the first to know when they're back.",
                        clickUrl: "/account#notifications",
                        buttonText: "Notify me",
                        onButtonClick: () => {setLinkedSetting("events-preference");}
                    }}/>
            </Col>
        </Row>
    </Container>;
};