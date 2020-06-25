import React from "react";
import {Card, CardBody, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {openALevelBookChoiceModal} from "../../state/actions";
import {useDispatch} from "react-redux";
import {MenuCard} from "../elements/MenuCard";

export const Alevel = () => {

    const dispatch = useDispatch();

    return <Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"A Level Resources"} />
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="4">
                <MenuCard link={"/gameboards?filter=true#c052917f-5b7b-4b7f-b2a3-41d9de0a17c4"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Question Finder"} subtitle={"Practise your problem solving skills."}/>
            </Col>
            <Col md="4">
                <button className="menu-card" onClick={() => dispatch(openALevelBookChoiceModal())} >
                    <Card outline color="green">
                        <CardTitle>
                            <h4>Physics Skills Mastery</h4>
                        </CardTitle>
                        <CardBody>
                            <Row>
                                <Col md="3">
                                    <img className="menu-card" src="/assets/phy/key_stage_sprite.svg#skills-book-cover" alt="" />
                                </Col>
                                <Col md="9">
                                    <aside>
                                        Check your answers to our Mastering Essential Pre-University Physics book.
                                    </aside>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </button>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/isaac_mentor"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Mentoring Schemes"} subtitle={"Weekly gameboards guided by an experienced teacher."}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="4">
                <MenuCard link={"/pages/master_maths"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Master Mathematics"} subtitle={"Revise your maths skills with easier and harder questions."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/books/pre_uni_maths"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Maths for Sciences"} subtitle={"The collection of our Maths questions on the platform."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/pre_made_gameboards"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#triple"}
                    title={"Questions by Lessons"} subtitle={"A selection of our questions organised by lesson topic."}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3 className="h-title-center">Additional Resources</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="4">
                <MenuCard link={"/books/chemistry_16"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Physical Chemistry Mastery"} subtitle={"Check your answers to our Mastering Essential Pre-University Physical Chemistry book."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/events?types=student"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#calendar"}
                    title={"Events"} subtitle={"Find one of our face-to-face or virtual events."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/extraordinary_problems"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Extraordinary Problems"} subtitle={"Apply your physics skills to model real, complex situations."}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5">
            <Col md="4">
                <MenuCard link={"/books/solve_physics_problems"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Solving Physics Problems"} subtitle={"A practical guide to solving unfamiliar problems using pre-university Physics."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/pages/spc"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#groups"}
                    title={"Senior Physics Challenge"} subtitle={"Apply for our popular residential summer school."}/>
            </Col>
            <Col md="4">
                <MenuCard link={"/books/quantum_mechanics_primer"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Quantum Mechanics Primer"} subtitle={"A first year university introduction to quantum mechanics."}/>
            </Col>
        </Row>
    </Container>
};
