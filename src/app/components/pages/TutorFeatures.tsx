import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTutorOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import { TeacherFeatureCard } from "./TeacherFeatures";

// A version of the "teacher features" page to showcase tutor account features
export const TutorFeatures = () => {

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTutorOrAbove(user);

    return<Container>
        <Row className="mb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Tutor Features"} icon={{type: "hex", icon: "icon-account"}}/>
            </Col>
        </Row>
        <Row className="mb-3">
            <Col md={isDisabled ? 6 : undefined}>
                <p className="subtitle">Isaac Science provides you with a huge range of resources to support your tutoring of Physics, Maths, Chemistry and Biology.</p>
            </Col>
            {isDisabled && <Col md={6} className="text-center text-md-end">
                <Button tag={Link} size="lg" color="keyline" to={isLoggedIn(user) ? "/tutor_account_request" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Tutor Account"}
                </Button>
            </Col>}
        </Row>
        <Row className="isaac-cards-body px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = "/groups"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#groups"
                    title = "1. Create a Group"
                    subtitle = "Create and manage student groups."
                    disabled = {isDisabled}
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = {PATHS.SET_ASSIGNMENTS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#set-assignments"
                    title = "2. Set Assignments"
                    subtitle = "Set assignments from our skills books, pre-made boards or create your own."
                    disabled = {isDisabled}
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = {PATHS.ASSIGNMENT_PROGRESS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#track-progress"
                    title = "3. Assignment Progress"
                    subtitle = "View your tutees’ progress through their assignments."
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h4>Tutor Support and Resources</h4>
        </Row>
        <Row className="isaac-cards-body mb-7 mt-2 px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard               
                    url = "/support/tutor/general"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"
                    title = "Tutor FAQ"
                    subtitle = "Answers to your questions and how-to guides."
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = "/pages/order_books"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"
                    title = "Isaac Books"
                    subtitle = "Buy one of our Skills Mastery books at cost."
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = "/pages/pre_made_gameboards"
                    imgSrc = "/assets/phy/icons/key_stage_sprite.svg#triple"
                    title = "Boards by Topic"
                    subtitle = {isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}
                />
            </Col>
        </Row>
    </Container>;
};
