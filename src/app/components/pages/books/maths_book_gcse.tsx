import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import {Tabs} from "../../elements/Tabs";
import {BookChapterModal} from "../../elements/modals/BookChapterModal";

export const MathsBookGcse = () => {

    const pageHelp = <span>
        The Isaac Physics GCSE Mathematics book
    </span>;

    return <Container className="maths">
        <BookChapterModal/>
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="Using Essential GCSE Mathematics" help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/2021_maths_book_gcse.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="maths_book_gcse_intro"/>
            </div>
            <div className="book-levels">
                <Tabs tabTitleClass="px-3 py-1 hint-tab-title" tabContentClass="pt-2">
                    {{
                        'Boards for Class and Homework': <Col>
                            <h4>Chapters:</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch1_boards'} chapterTitle={'Solving Maths Problems'} chapterSubHeading={'(Section 1)'} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch2_boards'} chapterTitle={'Skills'} chapterIcon={'2'} chapterSubHeading={'(Sections 2-11)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch3_boards'} chapterTitle={'Algebra'} chapterIcon={'3'} chapterSubHeading={'(Sections 12-22)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch4_boards'} chapterTitle={'Linear Functions'} chapterIcon={'4'} chapterSubHeading={'(Sections 23-25)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch5_boards'} chapterTitle={'Quadratic Functions'} chapterIcon={'5'} chapterSubHeading={'(Sections 26-30)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch6_boards'} chapterTitle={'Inequalities'} chapterIcon={'6'} chapterSubHeading={'(Sections 31-32)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch7_boards'} chapterTitle={'Graphs'} chapterIcon={'7'} chapterSubHeading={'(Sections 33-37)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch8_boards'} chapterTitle={'Geometry'} chapterIcon={'8'} chapterSubHeading={'(Sections 38-50)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch9_boards'} chapterTitle={'Probability and Statistics'} chapterIcon={'9'} chapterSubHeading={'(Sections 51-57)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                        </Col>,
                        'Boards Containing all Questions': <Col>
                            <h4>Chapters:</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch1_full_boards'} chapterTitle={'Solving Maths Problems'} chapterSubHeading={'(Section 1)'} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch2_full_boards'} chapterTitle={'Skills'} chapterIcon={'2'} chapterSubHeading={'(Sections 2-11)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch3_full_boards'} chapterTitle={'Algebra'} chapterIcon={'3'} chapterSubHeading={'(Sections 12-22)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch4_full_boards'} chapterTitle={'Linear Functions'} chapterIcon={'4'} chapterSubHeading={'(Sections 23-25)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch5_full_boards'} chapterTitle={'Quadratic Functions'} chapterIcon={'5'} chapterSubHeading={'(Sections 26-30)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch6_full_boards'} chapterTitle={'Inequalities'} chapterIcon={'6'} chapterSubHeading={'(Sections 31-32)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch7_full_boards'} chapterTitle={'Graphs'} chapterIcon={'7'} chapterSubHeading={'(Sections 33-37)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch8_full_boards'} chapterTitle={'Geometry'} chapterIcon={'8'} chapterSubHeading={'(Sections 38-50)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch9_full_boards'} chapterTitle={'Probability and Statistics'} chapterIcon={'9'} chapterSubHeading={'(Sections 51-57)'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                        </Col>
                    }}
                </Tabs>
            </div>
        </Col>
    </Container>
};
