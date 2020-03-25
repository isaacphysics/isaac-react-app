import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {isLoggedIn, isStudent} from "../../services/user";
import classNames from "classnames";
import {Hexagon} from "../elements/Hexagon";

export const TeacherFeatures = () => {

    const user = useSelector((state: AppState) => state && state.user);

    const isDisabled = (isStudent(user) || !isLoggedIn(user));
    const teacherLinkClass = classNames({"hexagon": true, "disabled": isDisabled});
    const teacherImgClass = classNames({"hexagon-field": true, "disabled": isDisabled});

    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Teacher Features"} />
            </Col>
        </Row>
        <Row className="pb-4">
            <Col>
                <h3>Isaac For Teachers</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body justify-content-md-center">
            {isStudent(user) || !isLoggedIn(user) ?
                <Col md="auto">
                    <Hexagon link={"/teacher_account_request"}
                        imageSrc={"/assets/teacher_features_sprite.svg#teacher-hat"}
                        title={"1. Tell us you are a teacher"}/>
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
                <a href="groups" className={teacherLinkClass}>
                    <img className={teacherImgClass} src="/assets/teacher_features_sprite.svg#groups" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        2. Create and manage groups
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/set_assignments" className={teacherLinkClass}>
                    <img className={teacherImgClass} src="/assets/teacher_features_sprite.svg#set-assignments" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        3. Set Assignments
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/assignment_progress" className={teacherLinkClass}>
                    <img className={teacherImgClass} src="/assets/teacher_features_sprite.svg#track-progress" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        4. Track group progress
                    </div>
                </a>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3>Isaac Activities</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5 justify-content-md-center">
            <Col md="auto">
                <Hexagon link={"/supportTeacher"}
                    imageSrc={"/assets/teacher_features_sprite.svg#use-with-class"}
                    title={"Teacher Support"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/events"}
                    imageSrc={"/assets/teacher_features_sprite.svg#calendar"}
                    title={"Teacher and Student Events"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/books"}
                    imageSrc={"/assets/key_stage_sprite.svg#skills-book-cover"}
                    title={"Books of core skills problems"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"http://www.talkphysics.org/groups/isaac-physics/"}
                    imageSrc={"/assets/teacher_features_sprite.svg#teacher-forum"}
                    title={"Teacher Forum (TalkPhysics)"}/>
            </Col>
        </Row>
    </Container>
};
