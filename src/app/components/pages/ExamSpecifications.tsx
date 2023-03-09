import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {EXAM_BOARD, EXAM_BOARDS_CS_A_LEVEL, STAGE} from "../../services";
import {useHistory, useLocation} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";

export const ExamSpecifications = () => {
    const history = useHistory();
    const location = useLocation();

    const aLevelExamBoards = Array.from(EXAM_BOARDS_CS_A_LEVEL);
    function setActiveTab(tabIndex: number) {
        if (tabIndex < 1 || tabIndex - 1 > aLevelExamBoards.length) return;
        const hash = tabIndex > 1 ? aLevelExamBoards[tabIndex - 2].toString() : "all"
        history.replace({...location, hash: `#${hash}`}) // This sets activeTab to the index corresponding to the hash
    }
    useEffect(function makeSureTheUrlHashRecordsTabState() { if (!location.hash) setActiveTab(activeTab); });

    const activeTab = aLevelExamBoards.indexOf(location.hash.replace("#","").toLowerCase() as EXAM_BOARD) + 2 || 1;

    // FIXME ADA have both gcse and a level specs here
    const metaDescription = ({
        [STAGE.A_LEVEL]: "Discover our free A level computer science topics and questions. We cover AQA, CIE, OCR, Eduqas, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today."
    })[STAGE.A_LEVEL];

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"} />
        <MetaDescription description={metaDescription} />
        <Tabs className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={"a_level"} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...aLevelExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`a_level_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>
    </Container>;
}