import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSelector} from "react-redux";
import {isLoggedIn, isStudent} from "../../services/user";
import {selectors} from "../../state/selectors";
import {Link} from "react-router-dom";
import {IsaacCard} from "../content/IsaacCard";

export const TeacherFeatures = () => {

    const user = useSelector(selectors.user.orNull);

    const isDisabled = (isStudent(user) || !isLoggedIn(user));

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
            {isDisabled && <Col md={6} className="text-center text-md-right">
                <Button tag={Link} size="lg" color="secondary" to={isLoggedIn(user) ? "/pages/contact_us_teacher" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Teacher Account"}
                </Button>
            </Col>}
        </Row>
        <Row className="card-deck isaac-cards-body px-3">
            <IsaacCard doc={{ clickUrl: "/groups",
                image: {src: "/assets/phy/teacher_features_sprite.svg#groups"},
                title: "1. Create a Group",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "Create and manage class groups, and share them with colleagues."}}/>
            <IsaacCard doc={{ clickUrl: "/set_assignments",
                image: {src: "/assets/phy/teacher_features_sprite.svg#set-assignments"},
                title: "2. Set Assignments",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "Set assignments from our skills books, pre-made boards or create your own."}}/>
            <IsaacCard doc={{ clickUrl: "/assignment_progress",
                image: {src: "/assets/phy/teacher_features_sprite.svg#track-progress"},
                title: "3. Assignment Progress",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "View your students’ progress through their assignments."}}/>
        </Row>
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-center">Teacher Support</h3>
            </Col>
        </Row>
        <Row className="card-deck isaac-cards-body mt-2 px-3">
            <IsaacCard doc={{ clickUrl: "/support/teacher/general",
                image: {src: "/assets/phy/teacher_features_sprite.svg#teacher-forum"},
                title: "Teacher FAQ",
                verticalContent: true,
                subtitle: "Answers to your questions and how-to guides."}}/>
            <IsaacCard doc={{ clickUrl: "/pages/teacher_mentoring",
                image: {src: "/assets/phy/teacher_features_sprite.svg#use-with-class"},
                title: "Teacher Mentoring",
                verticalContent: true,
                subtitle: isLoggedIn(user) ? "Fortnightly support for Physics teachers." : "Fortnightly support for teachers of Physics."}}/>
            <IsaacCard doc={{ clickUrl: "/pages/isaac_embedded_schools",
                image: {src: "/assets/phy/teacher_features_sprite.svg#groups"},
                title: "Teacher Ambassadors",
                verticalContent: true,
                subtitle: isLoggedIn(user) ? "Learn from real teachers how they have embedded Isaac Physics. " : "Learn from practising teachers how they have embedded Isaac Physics."}}/>
        </Row>
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-right">Teacher Resources</h3>
            </Col>
        </Row>
        <Row className="card-deck isaac-cards-body mb-5 mt-2 px-3">
            <IsaacCard doc={{ clickUrl: "/pages/isaac_books",
                image: {src: "/assets/phy/teacher_features_sprite.svg#skills-book-cover"},
                title: "Isaac Physics Books",
                verticalContent: true,
                subtitle: "Buy one of our Skills Mastery books at cost."}}/>
            <IsaacCard doc={{ clickUrl: "/pages/pre_made_gameboards",
                image: {src: "/assets/phy/key_stage_sprite.svg#triple"},
                title: "Boards for Lessons",
                verticalContent: true,
                subtitle: isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}}/>
            <IsaacCard doc={{ clickUrl: "/events?types=teacher",
                image: {src: "/assets/phy/teacher_features_sprite.svg#calendar"},
                title: "Events",
                verticalContent: true,
                subtitle: "Attend FREE face-to-face or virtual CPDs."}}/>
        </Row>
    </Container>
};
