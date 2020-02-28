import React from "react";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const Alevel = () => {
    return<Container>
        <Row className="pb-4">
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"A Level Resources"} breadcrumbTitleOverride="A Level Resources" />
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="auto"/>
            <Col md="auto">
                <a href="/gameboards?filter=true#c052917f-5b7b-4b7f-b2a3-41d9de0a17c4" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#question" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Problem Solving
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/pages/university_preparation" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#teacher-hat" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Master Mathematics
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/pages/pre_made_gameboards" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#triple" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Browse Questions by Lessons
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/pages/mentor_menu" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#teacher-hat" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Mentoring Schemes
                    </div>
                </a>
            </Col>
            <Col md="auto"/>
        </Row>
        <Row>
            <Col>
                <h3>Isaac Books</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="auto"/>
            <Col md="auto">
                <a href="/books/pre_uni_maths" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Physics Skills Mastery
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/books/pre_uni_maths" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Mathematics for Sciences
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/books/chemistry_16" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Physical Chemistry Mastery
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/books/pre_uni_maths" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Solving Physics Problems
                    </div>
                </a>
            </Col>
            <Col md="auto"/>
        </Row>
        <Row>
            <Col>
                <h3>Extension Resources</h3>
            </Col>
        </Row>
        <Row className="teacher-feature-body">
            <Col md="auto"/>
            <Col md="auto">
                <a href="/events?types=student" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#groups" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Workshops
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/extraordinary_problems" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#lightning" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Extraordinary Problems
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/pages/spc" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#groups" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Senior Physics Challenge
                    </div>
                </a>
            </Col>
            <Col md="auto">
                <a href="/books/pre_uni_maths" className="hexagon">
                    <img className="hexagon-field" src="/assets/key_stage_sprite.svg#skills-book-cover" alt="Isaac hexagon"></img>
                    <div className="hexagon-title">
                        Quantum Mechanics Primer
                    </div>
                </a>
            </Col>
            <Col md="auto"/>
        </Row>
    </Container>
};
