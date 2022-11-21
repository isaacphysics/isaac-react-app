import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTutorOrAbove} from "../../services";
import {Link} from "react-router-dom";
import {IsaacCard} from "../content/IsaacCard";

// TUTOR TODO a version of the "teacher features" page to showcase tutor accounts. Might need revisiting
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
            {isDisabled && <Col md={6} className="text-center text-md-right">
                <Button tag={Link} size="lg" color="secondary" to={isLoggedIn(user) ? "/tutor_account_request" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Tutor Account"}
                </Button>
            </Col>}
        </Row>
        <Row className="card-deck isaac-cards-body px-3">
            <IsaacCard doc={{ clickUrl: "/groups",
                image: {src: "/assets/phy/teacher_features_sprite.svg#groups"},
                title: "1. Create a Group",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "Create and manage class groups, and share them with colleagues."}}
                       imageClassName="teacher-features"
            />
            <IsaacCard doc={{ clickUrl: "/set_assignments",
                image: {src: "/assets/phy/teacher_features_sprite.svg#set-assignments"},
                title: "2. Set Assignments",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "Set assignments from our skills books, pre-made boards or create your own."}}
                       imageClassName="teacher-features"
            />
            <IsaacCard doc={{ clickUrl: "/assignment_progress",
                image: {src: "/assets/phy/teacher_features_sprite.svg#track-progress"},
                title: "3. Assignment Progress",
                disabled: isDisabled,
                verticalContent: true,
                subtitle: "View your tutees’ progress through their assignments."}}
                       imageClassName="teacher-features"
            />
        </Row>
        {/* TUTOR TODO tutor support section? */}
        <Row className="my-4">
            <Col>
                <h3 className="h-title text-right">Tutor Resources</h3>
            </Col>
        </Row>
        <Row className="card-deck isaac-cards-body mb-5 mt-2 px-3">
            <IsaacCard doc={{ clickUrl: "/pages/order_books",
                image: {src: "/assets/phy/teacher_features_sprite.svg#skills-book-cover"},
                title: "Isaac Physics Books",
                verticalContent: true,
                subtitle: "Buy one of our Skills Mastery books at cost."}}
                       imageClassName="teacher-features"
            />
            <IsaacCard doc={{ clickUrl: "/pages/pre_made_gameboards",
                image: {src: "/assets/phy/key_stage_sprite.svg#triple"},
                title: "Boards for Lessons",
                verticalContent: true,
                subtitle: isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}}
                       imageClassName="teacher-features"
            />
            {/* TUTOR TODO advertise events here for tutors too? (in a less school-oriented way) */}
            {/*<IsaacCard doc={{ clickUrl: "/events?types=student",*/}
            {/*    image: {src: "/assets/phy/teacher_features_sprite.svg#calendar"},*/}
            {/*    title: "Events",*/}
            {/*    verticalContent: true,*/}
            {/*    subtitle: "Browse free events for your KS4 and KS5 students."}}*/}
            {/*           imageClassName="teacher-features"*/}
            {/*/>*/}
        </Row>
    </Container>
};
