import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";

export const PhysBookYrNine = () => {

    const pageHelp = <span>
        The Isaac Physics Step up to GCSE Physics book
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="Step up to GCSE Physics" help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/phys_book_yr9.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="phys_book_yr9_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>Chapters:</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch1_boards'} chapterTitle={'Force and Motion'} chapterSubHeading={'(Sections 1-15)'} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch2_boards'} chapterTitle={'Electricity'} chapterSubHeading={'(Sections 16-23)'} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch3_boards'} chapterTitle={'Energy and Balance'} chapterSubHeading={'(Sections 24-29)'}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch4_boards'} chapterTitle={'Materials and Forces'} chapterSubHeading={'(Sections 30-34)'}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch5_boards'} chapterTitle={'Calculation Practice'} chapterSubHeading={'(Sections 35-38)'}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch6_boards'} chapterTitle={'Extra Questions'} chapterSubHeading={'(Sections 39-48)'}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>
};
