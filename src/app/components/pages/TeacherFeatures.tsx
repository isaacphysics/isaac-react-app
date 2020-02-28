import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {isLoggedIn, isStudent} from "../../services/user";
import classNames from "classnames";

export const TeacherFeatures = () => {

    const user = useSelector((state: AppState) => state && state.user);

    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Teacher Features"} breadcrumbTitleOverride="Teacher Features" />
            </Col>
        </Row>
        <Row className="pb-4">
            <Col>
                <h3>Isaac For Teachers</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="auto"/>
            {isStudent(user) || !isLoggedIn(user) ?
                <Col md="auto">
                    <a href="/teacher_account_request" className="hexagon">
                        <img className="hexagon-field" src="/assets/teacher_features_sprite.svg#teacher-hat" alt="Isaac hexagon"></img>
                        <div className="hexagon-title">
                            1. Tell us you are a teacher
                        </div>
                    </a>
                </Col> :
                <Col md="auto">
                    <div className="hexagon">
                        <img className="hexagon-field" src="/assets/teacher_features_sprite.svg#teacher-hat" alt="Isaac hexagon"></img>
                        <div className="hexagon-title">
                            1. You are now a teacher!
                        </div>
                    </div>
                </Col>
            }
            <Col md="auto">
                <a href="groups" className={classNames({"hexagon": true, "disabled": (isStudent(user) || !isLoggedIn(user))})}>
                    <img className={classNames({"hexagon-field": true, "disabled": (isStudent(user) || !isLoggedIn(user))})} src="/assets/teacher_features_sprite.svg#groups" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        2. Create and manage groups
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/set_assignments" className={classNames({"hexagon": true, "disabled": (isStudent(user) || !isLoggedIn(user))})}>
                    <img className={classNames({"hexagon-field": true, "disabled": (isStudent(user) || !isLoggedIn(user))})} src="/assets/teacher_features_sprite.svg#set-assignments" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        3. Set Assignments
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/assignment_progress" className={classNames({"hexagon": true, "disabled": (isStudent(user) || !isLoggedIn(user))})}>
                    <img className={classNames({"hexagon-field": true, "disabled": (isStudent(user) || !isLoggedIn(user))})} src="/assets/teacher_features_sprite.svg#track-progress" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        4. Track group progress
                    </div>
                </a>
            </Col>
            <Col md="auto"/>
        </Row>
        <Row>
            <Col>
                <h3>Isaac Activities</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5">
            <Col md="auto"/>
            <Col md="auto">
                <a href="/supportTeacher" className="hexagon">
                    <img className="hexagon-field" src="/assets/teacher_features_sprite.svg#use-with-class" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Teacher Support
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/events" className="hexagon">
                    <img className="hexagon-field" src="/assets/teacher_features_sprite.svg#calendar" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Teacher and Student Events
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/books" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Books of core skills problems
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="http://www.talkphysics.org/groups/isaac-physics/" target="_blank" rel="noopener noreferrer" className="hexagon">
                    <img className="hexagon-field" src="/assets/teacher_features_sprite.svg#teacher-forum" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Teacher Forum (TalkPhysics)
                    </div>
                </a>
            </Col>
            <Col md="auto"/>
        </Row>
    </Container>
};
