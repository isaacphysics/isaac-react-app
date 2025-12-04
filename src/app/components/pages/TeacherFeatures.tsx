import React from "react";
import {Button, Card, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTeacherOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import classNames from "classnames";
import { PageMetadata } from "../elements/PageMetadata";

interface TeacherFeatureCardProps {
    url: string;
    imgSrc: string;
    title: string;
    subtitle: string;
    disabled?: boolean;
}

export const TeacherFeatureCard = (props: TeacherFeatureCardProps) => {
    const {url, imgSrc, title, subtitle, disabled} = props;
    return <Link to={url} className="h-100 w-100" aria-label={title} aria-disabled={disabled} style={{textDecoration: "none"}}>
        <Card className={classNames("p-3 teacher-features h-100", {"disabled": disabled})}>
            <div className="d-flex justify-content-between">
                <h4 className="mt-2 mb-0 me-2">{title}</h4>
                <img src={imgSrc} alt=""/>
            </div>
            <p>{subtitle}</p>
        </Card>
    </Link>;
};

export const TeacherFeatures = () => {
    const user = useAppSelector(selectors.user.orNull);
    const isDisabled = !isLoggedIn(user) || !isTeacherOrAbove(user);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Teacher features"} icon={{type: "icon", icon: "icon-account"}}/>
        <PageMetadata noTitle>
            {isDisabled && <Button tag={Link} size="lg" color="keyline" to={isLoggedIn(user) ? "/pages/contact_us_teacher" : "/register"} className="float-end">
                {isLoggedIn(user) ? "Upgrade my account" : "Get a teacher account"}
            </Button>}
            Isaac provides you with a huge range of resources to support your teaching of science subjects – all for free.
        </PageMetadata>
        <Row className="my-4">
            <h4>Teacher workflow</h4>
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
            <h4>Teacher support</h4>
        </Row>
        <Row className="isaac-cards-body px-3 row-gap-4">
            <Col md={6} lg={4}>
                <TeacherFeatureCard               
                    url = "/support/teacher/general"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"
                    title = "Teacher FAQ"
                    subtitle = "Answers to your questions and how-to guides."
                />
            </Col>
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = "/events?types=teacher"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#use-with-class"
                    title = "Teacher CPD"
                    subtitle = "Free short courses to help you use Isaac: by topic or by level of experience with Isaac."
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = "/teacher_emails"
                    imgSrc = "/assets/phy/icons/computer.svg"
                    title = "Teacher emails"
                    subtitle = "Recent start-of-term emails sent to teachers."
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h4>Teacher resources</h4>
        </Row>
        <Row className="isaac-cards-body mb-7 px-3 row-gap-4">
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = "/pages/order_books"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"
                    title = "Isaac books"
                    subtitle = "Buy one of our Skills Mastery books at cost."
                />
            </Col>
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = "/physics/a_level/question_decks"
                    imgSrc = "/assets/phy/icons/key_stage_sprite.svg#triple"
                    title = "Decks by topic"
                    subtitle = "A selection of our questions organised by topic."
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = "/events?types=student"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#calendar"
                    title = "Events"
                    subtitle = "Browse free events for your KS4 and KS5 students."
                />
            </Col>
        </Row>

        {isDisabled && <div className="d-flex w-100 justify-content-center my-5">
            <Button tag={Link} size="lg" color="keyline" to={isLoggedIn(user) ? "/pages/contact_us_teacher" : "/register"}>
                {isLoggedIn(user) ? "Upgrade my account" : "Get a teacher account"}
            </Button>
        </div>}
    </Container>;
};
