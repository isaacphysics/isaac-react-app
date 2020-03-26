import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Hexagon} from "../elements/Hexagon";

export const Gcse = () => {
    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"GCSE Resources"} />
            </Col>
        </Row>
        <Row className="teacher-feature-body justify-content-md-center">
            <Col md="auto">
                <Hexagon link={"/books/phys_book_gcse"} imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Physics Skills Mastery"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/gameboards?filter=true#de583d25-93c9-4600-a6e3-6ae144b105fd"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Problem Solving"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/mentor_menu"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Mentoring Schemes"}/>
            </Col>
            <Col md="auto">
                <Hexagon link={"/pages/pre_made_gameboards#gcse_to_alevel"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Preparation for A Level"}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5 justify-content-md-center">
            <Col className="hexagon-offset hexagon-offset-large" md="auto">
                <Hexagon link={"/pages/gcse_quizzes"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Quick Quizzes"}/>
            </Col>
            <Col className="hexagon-offset-large" md="auto">
                <Hexagon link={"/events?types=student"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#groups"}
                    title={"Workshops"}/>
            </Col>
        </Row>
    </Container>
};
