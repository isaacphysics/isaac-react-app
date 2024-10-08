import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTutorOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCard} from "../content/IsaacCard";

// A version of the "teacher features" page to showcase tutor account features
export const TutorFeatures = () => {

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTutorOrAbove(user);

    return<Container>
        <Row className="mb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Tutor Features"} />
            </Col>
        </Row>
        <Row className="mb-3">
            <Col md={isDisabled ? 6 : undefined}>
                <p className="subtitle">Isaac Physics provides you with a huge range of resources to support your tutoring of Physics, Maths and Chemistry.</p>
            </Col>
            {isDisabled && <Col md={6} className="text-center text-md-end">
                <Button tag={Link} size="lg" color="secondary" to={isLoggedIn(user) ? "/tutor_account_request" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Tutor Account"}
                </Button>
            </Col>}
        </Row>
        <Row className="isaac-cards-body px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/groups",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#groups"},
                    title: "1. Create a Group",
                    disabled: isDisabled,
                    verticalContent: true,
                    subtitle: "Create and manage student groups."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: PATHS.SET_ASSIGNMENTS,
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#set-assignments"},
                    title: "2. Set Assignments",
                    disabled: isDisabled,
                    verticalContent: true,
                    subtitle: "Set assignments from our skills books, pre-made boards or create your own."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <IsaacCard doc={{ clickUrl: PATHS.ASSIGNMENT_PROGRESS,
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#track-progress"},
                    title: "3. Assignment Progress",
                    disabled: isDisabled,
                    verticalContent: true,
                    subtitle: "View your tutees’ progress through their assignments."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
        </Row>
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-end">Tutor Support and Resources</h3>
            </Col>
        </Row>
        <Row className="isaac-cards-body mb-5 mt-2 px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/support/tutor/general",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"},
                    title: "Tutor FAQ",
                    verticalContent: true,
                    subtitle: "Answers to your questions and how-to guides."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/pages/order_books",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"},
                    title: "Isaac Physics Books",
                    verticalContent: true,
                    subtitle: "Buy one of our Skills Mastery books at cost."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <IsaacCard doc={{ clickUrl: "/pages/pre_made_gameboards",
                    image: {src: "/assets/phy/icons/key_stage_sprite.svg#triple"},
                    title: "Boards by Topic",
                    verticalContent: true,
                    subtitle: isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
        </Row>
    </Container>;
};
