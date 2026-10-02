import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import {Tabs} from "../../elements/Tabs";
import { useTranslation } from "react-i18next";

export const MathsBookGcse = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.gcseMaths.pageHelp")}
    </span>;

    return <Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.gcseMaths.title")} help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/2021_maths_book_gcse.jpg" alt={t("sci:books.gcseMaths.coverAlt")}/>
                <PageFragment fragmentId="maths_book_gcse_intro"/>
            </div>
            <div className="book-levels">
                <Tabs style="tabs" tabTitleClass="px-3 py-1 hint-tab-title" tabContentClass="pt-2">
                    {{
                        'Boards for Class and Homework': <Col>
                            <h4>{t("common:books.chaptersHeading")}</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch1_boards'} chapterTitle={t("sci:books.gcseMaths.chapter1Title")} chapterSubHeading={t("sci:books.gcseMaths.chapter1Subheading")} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch2_boards'} chapterTitle={t("sci:books.gcseMaths.chapter2Title")} chapterIcon={'2'} chapterSubHeading={t("sci:books.gcseMaths.chapter2Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch3_boards'} chapterTitle={t("sci:books.gcseMaths.chapter3Title")} chapterIcon={'3'} chapterSubHeading={t("sci:books.gcseMaths.chapter3Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch4_boards'} chapterTitle={t("sci:books.gcseMaths.chapter4Title")} chapterIcon={'4'} chapterSubHeading={t("sci:books.gcseMaths.chapter4Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch5_boards'} chapterTitle={t("sci:books.gcseMaths.chapter5Title")} chapterIcon={'5'} chapterSubHeading={t("sci:books.gcseMaths.chapter5Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch6_boards'} chapterTitle={t("sci:books.gcseMaths.chapter6Title")} chapterIcon={'6'} chapterSubHeading={t("sci:books.gcseMaths.chapter6Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch7_boards'} chapterTitle={t("sci:books.gcseMaths.chapter7Title")} chapterIcon={'7'} chapterSubHeading={t("sci:books.gcseMaths.chapter7Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch8_boards'} chapterTitle={t("sci:books.gcseMaths.chapter8Title")} chapterIcon={'8'} chapterSubHeading={t("sci:books.gcseMaths.chapter8Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch9_boards'} chapterTitle={t("sci:books.gcseMaths.chapter9Title")} chapterIcon={'9'} chapterSubHeading={t("sci:books.gcseMaths.chapter9Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                        </Col>,
                        'Boards Containing all Questions': <Col>
                            <h4>{t("common:books.chaptersHeading")}</h4>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch1_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter1Title")} chapterSubHeading={t("sci:books.gcseMaths.chapter1Subheading")} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch2_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter2Title")} chapterIcon={'2'} chapterSubHeading={t("sci:books.gcseMaths.chapter2Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch3_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter3Title")} chapterIcon={'3'} chapterSubHeading={t("sci:books.gcseMaths.chapter3Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch4_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter4Title")} chapterIcon={'4'} chapterSubHeading={t("sci:books.gcseMaths.chapter4Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch5_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter5Title")} chapterIcon={'5'} chapterSubHeading={t("sci:books.gcseMaths.chapter5Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch6_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter6Title")} chapterIcon={'6'} chapterSubHeading={t("sci:books.gcseMaths.chapter6Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch7_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter7Title")} chapterIcon={'7'} chapterSubHeading={t("sci:books.gcseMaths.chapter7Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch8_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter8Title")} chapterIcon={'8'} chapterSubHeading={t("sci:books.gcseMaths.chapter8Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={6} className="p-2">
                                    <BookChapter chapterId={'gcse_maths_ch9_full_boards'} chapterTitle={t("sci:books.gcseMaths.chapter9Title")} chapterIcon={'9'} chapterSubHeading={t("sci:books.gcseMaths.chapter9Subheading")} chapterSubject={SUBJECTS.MATHS}/>
                                </Col>
                            </Row>
                        </Col>
                    }}
                </Tabs>
            </div>
        </Col>
    </Container>;
};
