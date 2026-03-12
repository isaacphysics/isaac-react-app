import {Col, Container, Row} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";

export const PreUniMaths2e = () => {

    const pageHelp = <span>
        The Isaac Physics Pre-University Mathematics for Sciences book, 2nd edition.
    </span>;

    return <Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle="Pre-University Mathematics for Sciences" 
                    help={pageHelp} 
                    // modalId="help_modal_maths_book"
                />
                <img className="book-cover" src="/assets/phy/books/pre_uni_maths_2e.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="pre_uni_maths_intro_2e"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>Chapters:</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch1_boards'} chapterTitle={'Algebra & Number'}
                                chapterSubHeading={'(Sections A-D)'}
                                chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch2_boards'} chapterTitle={'Functions'}
                                chapterSubHeading={'(Sections E-F)'}
                                chapterIcon={'2'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch3_boards'} chapterTitle={'Geometry'}
                                chapterSubHeading={'(Sections G-I)'}
                                chapterIcon={'3'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch4_boards'} chapterTitle={'Calculus'}
                                chapterSubHeading={'(Sections J-L)'}
                                chapterIcon={'4'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch5_boards'} chapterTitle={'Applications to Sciences'}
                                chapterSubHeading={'(Sections M-T)'}
                                chapterIcon={'5'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
