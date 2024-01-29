import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {CS_EXAM_BOARDS_BY_STAGE, EXAM_BOARD, STAGE, STAGES_CS} from "../../services";
import {useHistory, useLocation} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";

export const ExamSpecifications = () => {
    const history = useHistory();
    const location = useLocation();

    const [stage, setStage] = useState<typeof STAGES_CS[number]>(STAGE.A_LEVEL);

    const stageExamBoards = CS_EXAM_BOARDS_BY_STAGE[stage];
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
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_NATIONAL_5]: "Discover our free National 5 computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_HIGHER]: "Discover our free Higher computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_ADVANCED_HIGHER]: "Discover our free Advanced Higher computer science topics and questions. Learn or revise for your exams with us today.",
    })[stage];

    const tabs = {
        ["A Level"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.A_LEVEL}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>,
        ["GCSE"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.GCSE}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>,
        ["National 5"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.SCOTLAND_NATIONAL_5}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>,
        ["Higher"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.SCOTLAND_HIGHER}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>,
        ["Advanced Higher"]: <Tabs style="tabs" className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${STAGE.SCOTLAND_ADVANCED_HIGHER}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"} />
        <MetaDescription description={metaDescription} />
        <Tabs activeTabOverride={STAGES_CS.indexOf(stage) + 1}
              onActiveTabChange={(aT) => setStage((STAGES_CS.at(aT - 1) ?? STAGE.A_LEVEL))}
              style={"buttons"} tabContentClass={"mt-3"} className={"mt-3"}
        >
            {tabs}
        </Tabs>
    </Container>;
}