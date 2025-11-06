import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTutorOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import { TeacherFeatureCard } from "./TeacherFeatures";
import { PageMetadata } from "../elements/PageMetadata";

// A version of the "teacher features" page to showcase tutor account features
export const TutorFeatures = () => {

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTutorOrAbove(user);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Tutor features"} icon={{type: "icon", icon: "icon-account"}}/>
        <PageMetadata noTitle>
            {isDisabled && <Button tag={Link} size="lg" color="keyline" to={isLoggedIn(user) ? "/tutor_account_request" : "/register"} className="float-end">
                {isLoggedIn(user) ? "Upgrade my account" : "Get a tutor account"}
            </Button>}
            Isaac Science provides you with a huge range of resources to support your tutoring of science subjects.
        </PageMetadata>
        <Row className="my-4">
            <h4>Tutor workflow</h4>
        </Row>
        <Row className="isaac-cards-body px-3 row-gap-4">
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = "/groups"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#groups"
                    title = "1. Create a group"
                    subtitle = "Create and manage class groups, and share them with colleagues."
                    disabled = {isDisabled}
                />
            </Col>
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = {PATHS.SET_ASSIGNMENTS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#set-assignments"
                    title = "2. Set assignments"
                    subtitle = "Set assignments from our skills books, pre-made boards or create your own."
                    disabled = {isDisabled}
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = {PATHS.ASSIGNMENT_PROGRESS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#track-progress"
                    title = "3. Assignment progress"
                    subtitle = "View your students’ progress through their assignments."
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h4>Tutor support and resources</h4>
        </Row>
        <Row className="isaac-cards-body mb-7 px-3 row-gap-4">
            <Col sm={6} md={4}>
                <TeacherFeatureCard               
                    url = "/support/tutor/general"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"
                    title = "Tutor FAQ"
                    subtitle = "Answers to your questions and how-to guides."
                />
            </Col>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = "/pages/order_books"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"
                    title = "Isaac books"
                    subtitle = "Buy one of our Skills Mastery books at cost."
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = "/physics/a_level/question_decks"
                    imgSrc = "/assets/phy/icons/key_stage_sprite.svg#triple"
                    title = "Decks by topic"
                    subtitle = "A selection of our questions organised by topic."
                />
            </Col>
        </Row>
    </Container>;
};
