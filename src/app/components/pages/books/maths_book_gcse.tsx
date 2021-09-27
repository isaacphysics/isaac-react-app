import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services/constants";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";

export const MathsBookGcse = () => {

    const pageHelp = <span>
        The Isaac Physics GCSE Mathematics book
    </span>;

    return <Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="GCSE Maths Book" help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/2021_maths_book_gcse.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="maths_book_gcse_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>Chapters:</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch1_boards'} chapterTitle={'Chapter 1'} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch2_boards'} chapterTitle={'Chapter 2'} chapterIcon={'2'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch3_boards'} chapterTitle={'Chapter 3'} chapterIcon={'3'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch4_boards'} chapterTitle={'Chapter 4'} chapterIcon={'4'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch5_boards'} chapterTitle={'Chapter 5'} chapterIcon={'5'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch6_boards'} chapterTitle={'Chapter 6'} chapterIcon={'6'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch7_boards'} chapterTitle={'Chapter 7'} chapterIcon={'7'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch8_boards'} chapterTitle={'Chapter 8'} chapterIcon={'8'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'gcse_maths_ch9_boards'} chapterTitle={'Chapter 9'} chapterIcon={'9'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>
};
