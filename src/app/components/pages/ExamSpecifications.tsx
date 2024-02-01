import React, {useEffect, useMemo, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {CS_EXAM_BOARDS_BY_STAGE, EXAM_BOARD, STAGE, STAGES_CS, stageLabelMap} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";

export const ExamSpecifications = () => {
    const STAGES_WITH_EXAM_SPECIFICATIONS = useMemo(() => [STAGE.A_LEVEL, STAGE.GCSE], []);
    const [stageTab, setStageTab] = useState<typeof STAGES_CS[number]>(STAGES_CS.includes(window.location.hash.split("/")[0].slice(1) as typeof STAGES_CS[number]) ? window.location.hash.split("/")[0].slice(1) as typeof STAGES_CS[number] : STAGE.A_LEVEL);
    const [examBoardTab, setExamBoardTab] = useState<EXAM_BOARD>(Object.values(EXAM_BOARD).includes(window.location.hash.split("/")[1] as EXAM_BOARD) ? window.location.hash.split("/")[1] as EXAM_BOARD : EXAM_BOARD.AQA);
    const [stageTabOverride, _setStageTabOverride] = useState<number | undefined>(STAGES_WITH_EXAM_SPECIFICATIONS.includes(stageTab) ? STAGES_WITH_EXAM_SPECIFICATIONS.indexOf(stageTab) + 1 : undefined);
    const [examBoardTabOverride, setExamBoardTabOverride] = useState<number | undefined>(CS_EXAM_BOARDS_BY_STAGE[stageTab].includes(examBoardTab) ? CS_EXAM_BOARDS_BY_STAGE[stageTab].indexOf(examBoardTab) + 1 : undefined);
    const [fragmentId, setFragmentId] = useState<string>("");

    const stageExamBoards = CS_EXAM_BOARDS_BY_STAGE[stageTab];

    const metaDescription = ({
        [STAGE.A_LEVEL]: "Discover our free A level computer science topics and questions. We cover AQA, CIE, OCR, Eduqas, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_NATIONAL_5]: "Discover our free National 5 computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_HIGHER]: "Discover our free Higher computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_ADVANCED_HIGHER]: "Discover our free Advanced Higher computer science topics and questions. Learn or revise for your exams with us today.",
    })[stageTab];
        
    const examBoardTabs = STAGES_WITH_EXAM_SPECIFICATIONS.reduce((acc: {[stage: string]: React.JSX.Element}, stage) => ({
        ...acc, 
        [stageLabelMap[stage]]: <Tabs 
            style="tabs" className="pt-3" tabContentClass="pt-3" 
            activeTabOverride={examBoardTabOverride} 
            onActiveTabChange={(n) => {
                setExamBoardTab(CS_EXAM_BOARDS_BY_STAGE[stageTab][n - 1] as EXAM_BOARD);
                setExamBoardTabOverride(undefined);
            }}
        >
            {Object.assign({}, ...stageExamBoards.map(examBoard => ({
                [examBoard.toUpperCase()]: <></>
            })))}
        </Tabs>}), {});

    const stageTabs = <Tabs style={"buttons"} className={"mt-3"} tabContentClass={"mt-3"}
        activeTabOverride={stageTabOverride}
        onActiveTabChange={(n) => {
            setStageTab(STAGES_WITH_EXAM_SPECIFICATIONS[n - 1] as typeof STAGES_CS[number]);
            setExamBoardTab(CS_EXAM_BOARDS_BY_STAGE[stageTab][0] as EXAM_BOARD);
            setExamBoardTabOverride(1);
        }}
    >
        {examBoardTabs}
    </Tabs>;

    useEffect(() => {
        // Since examBoardTab is last in the dependency chain, we would ideally only have this useEffect run when examBoardTab changes.
        // However, since exam boards can be shared among stages, switching from one stage to another can result in the same exam board being selected.
        // In this case, the useEffect wouldn't run at all if we only had examBoardTab as a dependency.
        // This unfortunately means we have to have all tabs in the dependency, meaning we can generate an invalid request between when
        //  the stage has changed but the exam board is yet to update.
        setFragmentId(`${stageTab}_specification_${examBoardTab}`);
        location.replace(`#${stageTab}/${examBoardTab}`);
    }, [examBoardTab, stageTab]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"} />
        <MetaDescription description={metaDescription} />
        {stageTabs}
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={fragmentId}/>
            </Col>
        </Row>
    </Container>;
};