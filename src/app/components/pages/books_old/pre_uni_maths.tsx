import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const PreUniMaths = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("common:books.preUniMaths.helpText")}
    </span>;

    return <Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("common:books.preUniMaths.title")} help={pageHelp} /> {/* modalId="help_modal_maths_book"/> */}
                <img className="book-cover" src="/assets/phy/books/pre_uni_maths.jpg" alt={t("common:books.coverAltText")}/>
                <PageFragment fragmentId="pre_uni_maths_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("common:books.chaptersLabel")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl1_boards'} chapterTitle={t("common:books.preUniMaths.level1Title")} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl2_boards'} chapterTitle={t("common:books.preUniMaths.level2Title")} chapterIcon={'2'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl3_boards'} chapterTitle={t("common:books.preUniMaths.level3Title")} chapterIcon={'3'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl4_boards'} chapterTitle={t("common:books.preUniMaths.level4Title")} chapterIcon={'4'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl5_boards'} chapterTitle={t("common:books.preUniMaths.level5Title")} chapterIcon={'5'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl6_boards'} chapterTitle={t("common:books.preUniMaths.level6Title")} chapterIcon={'6'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_lvl7_boards'} chapterTitle={t("common:books.preUniMaths.level7Title")} chapterIcon={'7'} chapterSubject={SUBJECTS.MATHS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
