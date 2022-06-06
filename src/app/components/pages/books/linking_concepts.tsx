import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services/constants";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";

export const LinkingConcepts = () => {

    const pageHelp = <span>
        The Isaac Physics Linking Concepts book
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="Linking Concepts in Pre-University Physics" help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/linking_concepts.png" alt="Cover of the book."/>
                <PageFragment fragmentId="phys_linking_concepts_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>Chapters:</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch1_boards'} chapterTitle={'Mechanics I'} chapterSubHeading={'(Sections 1-6)'} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch2_boards'} chapterTitle={'Electricity and Waves'} chapterSubHeading={'(Sections 7-16)'} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch3_boards'} chapterTitle={'Mechanics II'} chapterSubHeading={'(Sections 17-20)'}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch4_boards'} chapterTitle={'Energy and Fields'} chapterSubHeading={'(Sections 21-25)'}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch5_boards'} chapterTitle={'Vectors, Forces and Fields'} chapterSubHeading={'(Sections 26-30)'}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch6_boards'} chapterTitle={'Gases and Exponentials'} chapterSubHeading={'(Sections 31-35)'}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>
};
