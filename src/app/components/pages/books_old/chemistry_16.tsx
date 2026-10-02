import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const Chemistry16 = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.chemistry16.helpText")}
    </span>;

    return <Container className="chemistry">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.chemistry16.title")} help={pageHelp} /> {/* modalId="help_modal_chemistry_book"/> */}
                <img className="book-cover" src="/assets/phy/books/chemistry_16.jpg" alt={t("common:books.coverAltText")}/>
                <PageFragment fragmentId="chemistry_16_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("common:books.chaptersTitle")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_a_boards'} chapterTitle={t("sci:books.chemistry16.chapterA")} chapterIcon={'A'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_b_boards'} chapterTitle={t("sci:books.chemistry16.chapterB")} chapterIcon={'B'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_c_boards'} chapterTitle={t("sci:books.chemistry16.chapterC")} chapterIcon={'C'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_d_boards'} chapterTitle={t("sci:books.chemistry16.chapterD")} chapterIcon={'D'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_e_boards'} chapterTitle={t("sci:books.chemistry16.chapterE")} chapterIcon={'E'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_f_boards'} chapterTitle={t("sci:books.chemistry16.chapterF")} chapterIcon={'F'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_g_boards'} chapterTitle={t("sci:books.chemistry16.chapterG")} chapterIcon={'G'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_h_boards'} chapterTitle={t("sci:books.chemistry16.chapterH")} chapterIcon={'H'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_i_boards'} chapterTitle={t("sci:books.chemistry16.chapterI")} chapterIcon={'I'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_j_boards'} chapterTitle={t("sci:books.chemistry16.chapterJ")} chapterIcon={'J'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_k_boards'} chapterTitle={t("sci:books.chemistry16.chapterK")} chapterIcon={'K'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_l_boards'} chapterTitle={t("sci:books.chemistry16.chapterL")} chapterIcon={'L'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'chem_16_m_boards'} chapterTitle={t("sci:books.chemistry16.chapterM")} chapterIcon={'M'} chapterSubject={SUBJECTS.CHEMISTRY}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
