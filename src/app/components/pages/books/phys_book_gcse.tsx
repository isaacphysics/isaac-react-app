import {Col, Container, Row} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import {Tabs} from "../../elements/Tabs";

export const PhysBookGcse = () => {

    const pageHelp = <span>
        The Isaac Physics Mastering Essential GCSE Physics book
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="Mastering Essential GCSE Physics" help={pageHelp} modalId="gcse_book_help" />
                <img className="book-cover" src="/assets/phy/books/phys_book_gcse.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="phys_book_gcse_intro"/>
            </div>
            <div className="book-levels">
                <Tabs tabTitleClass="px-3 py-1 hint-tab-title" tabContentClass="pt-2" activeTabOverride={2}>
                    {{
                        'Boards for Class and Homework': <Col>
                            <h4>Chapters:</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch1_boards'} chapterTitle={'Skills'}
                                                 chapterSubHeading={'(Sections 1-7)'} chapterIcon={'1'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch2_boards'} chapterTitle={'Mechanics'}
                                                 chapterSubHeading={'(Sections 8-21)'} chapterIcon={'2'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch3_boards'} chapterTitle={'Electricity'}
                                                 chapterSubHeading={'(Sections 22-29)'} chapterIcon={'3'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch4_boards'} chapterTitle={'Energy'}
                                                 chapterSubHeading={'(Sections 30-37)'} chapterIcon={'4'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch5_boards'} chapterTitle={'Waves and Optics'}
                                                 chapterSubHeading={'(Sections 38-50)'} chapterIcon={'5'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch6_boards'} chapterTitle={'Nuclear'}
                                                 chapterSubHeading={'(Sections 51-58)'} chapterIcon={'6'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch7_boards'} chapterTitle={'Gas'}
                                                 chapterSubHeading={'(Sections 59-62)'} chapterIcon={'7'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                        </Col>,
                        'Boards Containing all Questions': <Col>
                            <h4>Chapters:</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch1_boards'} chapterTitle={'Skills'}
                                                 chapterSubHeading={'(Sections 1-7)'} chapterIcon={'1'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch2_boards'} chapterTitle={'Mechanics'}
                                                 chapterSubHeading={'(Sections 8-21)'} chapterIcon={'2'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch3_boards'} chapterTitle={'Electricity'}
                                                 chapterSubHeading={'(Sections 22-29)'} chapterIcon={'3'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch4_boards'} chapterTitle={'Energy'}
                                                 chapterSubHeading={'(Sections 30-37)'} chapterIcon={'4'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch5_boards'} chapterTitle={'Waves and Optics'}
                                                 chapterSubHeading={'(Sections 38-50)'} chapterIcon={'5'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch6_boards'} chapterTitle={'Nuclear'}
                                                 chapterSubHeading={'(Sections 51-58)'} chapterIcon={'6'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch7_boards'} chapterTitle={'Gas'}
                                                 chapterSubHeading={'(Sections 59-62)'} chapterIcon={'7'}
                                                 chapterSubject={SUBJECTS.PHYSICS}/>
                                </Col>
                            </Row>
                        </Col>
                    }}
                </Tabs>
            </div>
        </Col>
    </Container>
};
