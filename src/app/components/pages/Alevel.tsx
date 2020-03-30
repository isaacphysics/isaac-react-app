import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Hexagon} from "../elements/Hexagon";
import {openALevelBookChoiceModal} from "../../state/actions";
import {useDispatch} from "react-redux";

export const Alevel = () => {

    const dispatch = useDispatch();

    return <Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"A Level Resources"} />
            </Col>
        </Row>
        <Row className="teacher-feature-body justify-content-md-center">
            <Col md="auto">
                <Hexagon link={"/gameboards?filter=true#c052917f-5b7b-4b7f-b2a3-41d9de0a17c4"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Problem Solving"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/master_maths"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Master Mathematics"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/pre_made_gameboards"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#triple"}
                    title={"Browse Questions by Lessons"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/mentor_menu"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Mentoring Schemes"}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3>Isaac Books</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body justify-content-md-center">
            <Col md="auto">
                <button className="hexagon hexagon-btn-link" onClick={() => dispatch(openALevelBookChoiceModal())} >
                    <img className="hexagon hexagon-btn" src="/assets/phy/key_stage_sprite.svg#skills-book-cover" alt="Isaac Hexagon" />
                    <div className="hexagon-title">
                        Physics Skills Mastery
                    </div>
                </button>
            </Col>
            <Col md="auto">
                <Hexagon link={"/books/pre_uni_maths"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Mathematics for Sciences"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/books/chemistry_16"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Physical Chemistry Mastery"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/books/solve_physics_problems"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Solving Physics Problems"}/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h3>Extension Resources</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5 justify-content-md-center">
            <Col md="auto">
                <Hexagon link={"/events?types=student"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#groups"}
                    title={"Workshops"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/extraordinary_problems"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#lightning"}
                    title={"Extraordinary Problems"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/spc"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#groups"}
                    title={"Senior Physics Challenge"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/books/quantum_mechanics_primer"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Quantum Mechanics Primer"}/>
            </Col>
        </Row>
    </Container>
};
