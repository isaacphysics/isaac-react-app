import React from "react";
import {Button, Card, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTeacherOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import classNames from "classnames";

export const TeacherFeatures = () => {

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTeacherOrAbove(user);

    interface TeacherFeatureCardProps {
        url: string;
        imgSrc: string;
        title: string;
        subtitle: string;
        disabled?: boolean;
    }

    const TeacherFeatureCard = (props: TeacherFeatureCardProps) => {
        const {url, imgSrc, title, subtitle, disabled} = props;
        return <Link to={url} className="h-100 w-100" aria-label={title} aria-disabled={disabled} style={{textDecoration: "none"}}>
            <Card className={classNames("p-3 teacher-features", {"disabled": disabled})}>
                <div className="d-flex justify-content-between">
                    <h5 className="mt-3 me-2">{title}</h5>
                    <img src={imgSrc} alt=""/>
                </div>
                <p>{subtitle}</p>
            </Card>
        </Link>;
    };

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
                <TeacherFeatureCard
                    url = "/groups"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#groups"
                    title = "1. Create a Group"
                    subtitle = "Create and manage class groups, and share them with colleagues."
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
                    subtitle = "View your students’ progress through their assignments."
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h4>Teacher Support</h4>
        </Row>
        <Row className="isaac-cards-body mt-2 px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard               
                    url = "/support/teacher/general"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"
                    title = "Teacher FAQ"
                    subtitle = "Answers to your questions and how-to guides."
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = "/events?types=teacher"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#use-with-class"
                    title = "Teacher CPD"
                    subtitle = "Free short courses to help you use Isaac Physics: by topic or by level of experience with Isaac."
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = "/teacher_emails"
                    imgSrc = "/assets/phy/icons/computer.svg"
                    title = "Teacher Emails"
                    subtitle = "Recent start-of-term emails sent to teachers."
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h4>Teacher Resources</h4>
        </Row>
        <Row className="isaac-cards-body mb-5 mt-2 px-3">
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = "/pages/order_books"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"
                    title = "Isaac Physics Books"
                    subtitle = "Buy one of our Skills Mastery books at cost."
                />
            </Col>
            <Col sm={6} md={4} className="mb-3 mb-md-0">
                <TeacherFeatureCard
                    url = "/pages/pre_made_gameboards"
                    imgSrc = "/assets/phy/icons/key_stage_sprite.svg#triple"
                    title = "Boards by Topic"
                    subtitle = {isLoggedIn(user) ?  "A selection of our questions organised by topic." : "A selection of our questions organised by lesson topic."}
                />
            </Col>
            <Col xs={0} sm={3} className="d-md-none"/>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = "/events?types=student"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#calendar"
                    title = "Events"
                    subtitle = "Browse free events for your KS4 and KS5 students."
                />
            </Col>
        </Row>
    </Container>;
};
