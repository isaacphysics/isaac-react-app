import React, {useEffect, useState} from "react";
import {Button, Col, Container, Row} from "reactstrap";
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

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`${stage === STAGE.A_LEVEL ? "A Level" : "GCSE"} exam specifications`} />
        <MetaDescription description={metaDescription} />
        <Row>
            <Col xs={12} md={6} className={"text-center"}>
                <Button className={"w-100 w-md-auto"} onClick={() => setStage(STAGE.A_LEVEL)} outline={stage !== STAGE.A_LEVEL}>A Level specifications</Button>
            </Col>
            <Col xs={12} md={6} className={"text-center mt-3 mt-md-0"}>
                <Button className={"w-100 w-md-auto"} onClick={() => setStage(STAGE.GCSE)} outline={stage !== STAGE.GCSE}>GCSE specifications</Button>
            </Col>
        </Row>
        <hr/>
        <Tabs className="pt-3" tabContentClass="pt-3" activeTabOverride={activeTab} refreshHash={stage} onActiveTabChange={setActiveTab}>
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <Row>
                    <Col lg={{size: 8, offset: 2}}>
                        <PageFragment fragmentId={`${stage}_specification_${examBoard}`}/>
                    </Col>
                </Row>
            })))}
        </Tabs>
    </Container>;
}