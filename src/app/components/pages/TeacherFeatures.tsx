import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {isLoggedIn, isStudent} from "../../services/user";
import {Hexagon} from "../elements/Hexagon";
import {openIsaacBooksModal} from "../../state/actions";

export const TeacherFeatures = () => {

    const user = useSelector((state: AppState) => state && state.user);
    const dispatch = useDispatch();

    const isDisabled = (isStudent(user) || !isLoggedIn(user));

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
                        imageSrc={"/assets/phy/teacher_features_sprite.svg#teacher-hat"}
                        title={"1. Tell us you are a teacher"}/>
                </Col> :
                <Col md="auto">
                    <div className="hexagon">
                        <img className="hexagon" src="/assets/phy/teacher_features_sprite.svg#teacher-hat" alt="" />
                        <div className="hexagon-title">
                            1. You are now a teacher!
                        </div>
                    </div>
                </Col>
            }
            <Col md="auto">
                <Hexagon link={"/groups"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#groups"}
                    title={"2. Create and manage groups"}
                    disabled={isDisabled}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/set_assignments"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#set-assignments"}
                    title={"3. Set Assignments"}
                    disabled={isDisabled}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/assignment_progress"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#track-progress"}
                    title={"4. Track group progress"}
                    disabled={isDisabled}/>
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
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#use-with-class"}
                    title={"Teacher Support"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/events"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#calendar"}
                    title={"Teacher and Student Events"}/>
            </Col>
            <Col md="auto">
                <button className="hexagon hexagon-btn-link" onClick={() => dispatch(openIsaacBooksModal())} >
                    <img className="hexagon hexagon-btn" src="/assets/phy/key_stage_sprite.svg#skills-book-cover" alt="" />
                    <div className="hexagon-title">
                        Books of core skills problems
                    </div>
                </button>
            </Col>
            <Col md="auto">
                <Hexagon link={"http://www.talkphysics.org/groups/isaac-physics/"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#teacher-forum"}
                    title={"Teacher Forum (TalkPhysics)"}/>
            </Col>
        </Row>
    </Container>
};
