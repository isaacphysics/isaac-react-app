import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTeacherOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCard} from "../content/IsaacCard";

export const TeacherFeatures = () => {

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTeacherOrAbove(user);

    return<Container>
        <Row className="mb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Teacher Features"} />
            </Col>
        </Row>
        <Row className="mb-3">
            {isDisabled ?
                <Col md={6}>
                    <p className="subtitle">
                    Isaac Physics provides you with a huge range of resources to support your teaching of Physics – all for free.                 </p>
                </Col>:
                <Col>
                    <p className="subtitle">
                        Isaac Physics provides you with a huge range of resources to support your teaching of Physics – all for free.                 </p>
                </Col>}
            {isDisabled && <Col md={6} className="text-center text-md-end">
                <Button tag={Link} size="lg" color="secondary" to={isLoggedIn(user) ? "/pages/contact_us_teacher" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Teacher Account"}
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
                    subtitle: "Create and manage class groups, and share them with colleagues."}}
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
                    subtitle: "View your students’ progress through their assignments."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
        </Row>
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-center">Teacher Support</h3>
            </Col>
        </Row>
        <Row className="isaac-cards-body mt-2 px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/support/teacher/general",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"},
                    title: "Teacher FAQ",
                    verticalContent: true,
                    subtitle: "Answers to your questions and how-to guides."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/events?types=teacher",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#use-with-class"},
                    title: "Teacher CPD",
                    verticalContent: true,
                    subtitle: "Free short courses to help you use Isaac Physics: by topic or by level of experience with Isaac."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <IsaacCard doc={{ clickUrl: "/teacher_emails",
                    image: {src: "/assets/phy/icons/computer.svg"},
                    title: "Teacher Emails",
                    disabled: isDisabled,
                    verticalContent: true,
                    subtitle: "Recent start-of-term emails sent to teachers."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
        </Row>
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-end">Teacher Resources</h3>
            </Col>
        </Row>
        <Row className="isaac-cards-body mb-5 mt-2 px-3">
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
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <IsaacCard doc={{ clickUrl: "/pages/pre_made_gameboards",
                    image: {src: "/assets/phy/icons/key_stage_sprite.svg#triple"},
                    title: "Boards by Topic",
                    verticalContent: true,
                    subtitle: isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <IsaacCard doc={{ clickUrl: "/events?types=student",
                    image: {src: "/assets/phy/icons/teacher_features_sprite.svg#calendar"},
                    title: "Events",
                    verticalContent: true,
                    subtitle: "Browse free events for your KS4 and KS5 students."}}
                imageClassName="teacher-features"
                className="w-100"
                />
            </Col>
        </Row>
    </Container>;
};
