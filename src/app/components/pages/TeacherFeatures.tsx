import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSelector} from "react-redux";
import {isLoggedIn, isStudent} from "../../services/user";
import {selectors} from "../../state/selectors";
import {MenuCard} from "../elements/MenuCard";
import {Link} from "react-router-dom";

export const TeacherFeatures = () => {

    const user = useSelector(selectors.user.orNull);

    const isDisabled = (isStudent(user) || !isLoggedIn(user));

    return<Container>
        <Row className="pb-4">
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
            {isDisabled && <Col md={6}>
                <Button tag={Link} size="lg" className="ml-md-auto mr-md-3 mr-lg-5 btn-primary float-right" to={isLoggedIn(user) ? "/pages/contact_us_teacher" : "/register"}>
                    {isLoggedIn(user) ? "Upgrade my Account" : "Get a Teacher Account"}
                </Button>
            </Col>}
        </Row>
        <Row className="teacher-feature-body">
            <Col md="4">
                <MenuCard link={"/groups"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#groups"}
                    title={"1. Create a Group"}
                    disabled={isDisabled}
                    teacherFeature={true}
                    subtitle={"Create and manage class groups, and share them with colleagues."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/set_assignments"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#set-assignments"}
                    title={"2. Set Assignments"}
                    disabled={isDisabled}
                    teacherFeature={true}
                    subtitle={"Set assignments from our skills books, pre-made boards or create your own."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/assignment_progress"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#track-progress"}
                    title={"3. Assignment Progress"}
                    disabled={isDisabled}
                    teacherFeature={true}
                    subtitle={isLoggedIn(user) ? "Track your students’ assignment progress in real-time." : "View your students’ progress through the assignments."}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3 className="h-title-center">Teacher Support</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body mt-2">
            <Col md="4">
                <MenuCard link={"/support/teacher/general"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#teacher-forum"}
                    title={"Teacher FAQ"}
                    teacherFeature={true}
                    subtitle={"Answers to your questions and how-to guides."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/teacher_mentoring"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#use-with-class"}
                    title={"Teacher Mentoring"}
                    teacherFeature={true}
                    subtitle={isLoggedIn(user) ? "Fortnightly support for Physics teachers." : "Fortnightly support for teachers of Physics."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/isaac_embedded_schools"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#groups"}
                    title={"Teacher Ambassadors"}
                    teacherFeature={true}
                    subtitle={isLoggedIn(user) ? "Learn from real teachers how they have embedded Isaac Physics. " : "Learn from practising teachers how they have embedded Isaac Physics."}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3 className="h-title-right">Teacher Resources</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5 mt-2">
            <Col md="4">
                <MenuCard link={"https://www.isaacbooks.org/"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#skills-book-cover"}
                    title={"Isaac Physics Books"}
                    teacherFeature={true}
                    subtitle={"Buy one of our Skills Mastery books at cost."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/pre_made_gameboards"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#triple"}
                    title={"Boards for Lessons"}
                    teacherFeature={true}
                    subtitle={isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/events?types=teacher"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#calendar"}
                    title={"Events"}
                    teacherFeature={true}
                    subtitle={"Attend FREE face-to-face or virtual CPDs."}/>
            </Col>
        </Row>
    </Container>
};
