import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {EXAM_BOARD, EXAM_BOARDS_CS_A_LEVEL, EXAM_BOARDS_CS_GCSE, STAGE} from "../../services";
import {useHistory, useLocation} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";

export const ExamSpecifications = () => {
    const history = useHistory();
    const location = useLocation();

    const [stage, setStage] = useState<STAGE.A_LEVEL | STAGE.GCSE>(STAGE.A_LEVEL);

    const stageExamBoards = Array.from(stage === STAGE.A_LEVEL ? EXAM_BOARDS_CS_A_LEVEL : EXAM_BOARDS_CS_GCSE);
    // 1-indexed for some reason... can we fix Tabs so they are 0-indexed please
    function setActiveTab(tabIndex: number) {
        if (tabIndex < 1 || tabIndex > stageExamBoards.length) return;
        const hash = stageExamBoards[tabIndex - 1].toString();
        history.replace({...location, hash: `#${hash}`}); // This sets activeTab to the index corresponding to the hash
    }
    useEffect(function makeSureTheUrlHashRecordsTabState() { if (!location.hash) setActiveTab(activeTab); });

    const activeTab = stageExamBoards.indexOf(location.hash.replace("#","").toLowerCase() as EXAM_BOARD) + 1 || (() => {setActiveTab(1); return 1;})();

    const metaDescription = ({
        [STAGE.A_LEVEL]: "Discover our free A level computer science topics and questions. We cover AQA, CIE, OCR, Eduqas, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today."
    })[stage];

    const tabs = {
        ["A Level specifications"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.A_LEVEL}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>,
        ["GCSE specifications"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.GCSE}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"} />
        <MetaDescription description={metaDescription} />
        <Tabs activeTabOverride={[STAGE.A_LEVEL, STAGE.GCSE].indexOf(stage) + 1}
              onActiveTabChange={(aT) => setStage(([STAGE.A_LEVEL, STAGE.GCSE].at(aT - 1) ?? STAGE.A_LEVEL) as STAGE.A_LEVEL | STAGE.GCSE)}
              style={"buttons"} tabContentClass={"mt-3"} className={"mt-3"}
        >
            {tabs}
        </Tabs>
    </Container>;
}