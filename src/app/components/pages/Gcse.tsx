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
                <p className="subtitle">
                    Isaac Physics provides you with a huge range of resources to support your learning of Physics, in the classroom or at home – all for free.
                </p>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="6">
                <MenuCard link={"/books/phys_book_gcse"} imageSrc={"/assets/phy/key_stage_sprite.svg#skills-book-cover"}
                    title={"Physics Skills Mastery Book"} subtitle={"Interactive questions from our Mastering Essential GCSE Physics book."}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/gameboards/new"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#triple"}
                    title={"Question Finder"} subtitle={"Practise your problem solving skills with our level 1 questions."}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="6">
                <MenuCard link={"/pages/isaac_mentor"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#teacher-hat"}
                    title={"Mentoring Scheme"} subtitle={"Weekly gameboards guided by an experienced teacher."}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/pages/pre_made_gameboards#gcse_to_alevel"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#question"}
                    title={"Preparation for A Level"} subtitle={"Questions to smooth your transition to A Level or equivalent."}/>
            </Col>
        </Row>
        <Row className="teacher-feature-body mb-5">
            <Col md="6">
                <MenuCard link={"/pages/gcse_quizzes"}
                    imageSrc={"/assets/phy/key_stage_sprite.svg#lightning"}
                    title={"Quick Quizzes"} subtitle={"Revise the equations needed at GCSE with our quick quizzes."}/>
            </Col>
            <Col md="6">
                <MenuCard link={"/events?types=student"}
                    imageSrc={"/assets/phy/teacher_features_sprite.svg#calendar"}
                    title={"Events"} subtitle={"Find one of our face-to-face or virtual workshops."}/>
            </Col>
        </Row>
    </Container>
};
