import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MenuCard} from "../elements/MenuCard";

export const Gcse = () => {
    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"GCSE Resources"} />
            </Col>
        </Row>
        <Row className="mb-3">
            <Col>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="6">
                <MenuCard link={"/books/phys_book_gcse"} imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Physics Skills Mastery"}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/gameboards?filter=true#de583d25-93c9-4600-a6e3-6ae144b105fd"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Problem Solving"}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="6">
                <MenuCard link={"/pages/isaac_mentor"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Mentoring Schemes"}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/pages/pre_made_gameboards#gcse_to_alevel"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Preparation for A Level"}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5">
            <Col md="6">
                <MenuCard link={"/pages/gcse_quizzes"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Quick Quizzes"}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/events?types=student"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#groups"}
                    title={"Workshops"}/>
            </Col>
        </Row>
    </Container>
};
