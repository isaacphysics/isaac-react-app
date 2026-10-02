import {Col, Container, Row} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import {Tabs} from "../../elements/Tabs";
import { useTranslation } from "react-i18next";

export const PhysBookGcse = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.gcse.titleHelp")}
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.gcse.title")} help={pageHelp} /> {/* modalId="help_modal_gcse_book" /> */}
                <img className="book-cover" src="/assets/phy/books/phys_book_gcse.jpg" alt={t("sci:books.gcse.coverAlt")}/>
                <PageFragment fragmentId="phys_book_gcse_intro"/>
            </div>
            <div className="book-levels">
                <Tabs style="tabs" tabTitleClass="px-3 py-1 hint-tab-title" tabContentClass="pt-2" activeTabOverride={2}>
                    {{
                        'Boards for Class and Homework': <Col>
                            <h4>{t("common:books.chapters.heading")}</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch1_boards'} chapterTitle={t("sci:books.gcse.ch1Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch1Subtitle")} chapterIcon={'1'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch2_boards'} chapterTitle={t("sci:books.gcse.ch2Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch2Subtitle")} chapterIcon={'2'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch3_boards'} chapterTitle={t("sci:books.gcse.ch3Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch3Subtitle")} chapterIcon={'3'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch4_boards'} chapterTitle={t("sci:books.gcse.ch4Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch4Subtitle")} chapterIcon={'4'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch5_boards'} chapterTitle={t("sci:books.gcse.ch5Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch5Subtitle")} chapterIcon={'5'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch6_boards'} chapterTitle={t("sci:books.gcse.ch6Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch6Subtitle")} chapterIcon={'6'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_quick_ch7_boards'} chapterTitle={t("sci:books.gcse.ch7Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch7Subtitle")} chapterIcon={'7'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                        </Col>,
                        'Boards Containing all Questions': <Col>
                            <h4>{t("common:books.chapters.heading")}</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch1_boards'} chapterTitle={t("sci:books.gcse.ch1Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch1Subtitle")} chapterIcon={'1'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch2_boards'} chapterTitle={t("sci:books.gcse.ch2Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch2Subtitle")} chapterIcon={'2'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch3_boards'} chapterTitle={t("sci:books.gcse.ch3Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch3Subtitle")} chapterIcon={'3'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch4_boards'} chapterTitle={t("sci:books.gcse.ch4Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch4Subtitle")} chapterIcon={'4'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch5_boards'} chapterTitle={t("sci:books.gcse.ch5Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch5Subtitle")} chapterIcon={'5'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch6_boards'} chapterTitle={t("sci:books.gcse.ch6Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch6Subtitle")} chapterIcon={'6'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_ch7_boards'} chapterTitle={t("sci:books.gcse.ch7Title")}
                                        chapterSubHeading={t("sci:books.gcse.ch7Subtitle")} chapterIcon={'7'}
                                        chapterSubject={SUBJECTS.PHYSICS}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    }}
                </Tabs>
            </div>
        </Col>
    </Container>;
};
