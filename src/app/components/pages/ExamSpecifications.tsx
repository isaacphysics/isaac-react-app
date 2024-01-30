import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {CS_COUNTRY_DISPLAY_NAME, CS_EXAM_BOARDS_BY_STAGE, CS_STAGES_BY_COUNTRY, CS_SUPPORTED_COUNTRIES, EXAM_BOARD, STAGE, STAGES_CS, stageLabelMap} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";

export const ExamSpecifications = () => {
    const [countryTab, setCountryTab] = useState<typeof CS_SUPPORTED_COUNTRIES[number]>("uk");
    const [stageTab, setStageTab] = useState<typeof STAGES_CS[number]>(STAGE.A_LEVEL);
    const [stageOverride, setStageOverride] = useState<number | undefined>(undefined);
    const [examBoardTab, setExamBoardTab] = useState<EXAM_BOARD>(EXAM_BOARD.AQA);
    const [examBoardTabOverride, setExamBoardTabOverride] = useState<number | undefined>(undefined);
    const [fragmentId, setFragmentId] = useState<string>("");

    const stageExamBoards = CS_EXAM_BOARDS_BY_STAGE[stageTab];

    const metaDescription = ({
        [STAGE.A_LEVEL]: "Discover our free A level computer science topics and questions. We cover AQA, CIE, OCR, Eduqas, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_NATIONAL_5]: "Discover our free National 5 computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_HIGHER]: "Discover our free Higher computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_ADVANCED_HIGHER]: "Discover our free Advanced Higher computer science topics and questions. Learn or revise for your exams with us today.",
    })[stageTab];
        
    const examBoardTabs = CS_STAGES_BY_COUNTRY[countryTab].reduce((acc: {[stage: string]: React.JSX.Element}, stage) => ({
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

    const stageTabs = CS_SUPPORTED_COUNTRIES.reduce((acc, country) => ({
        ...acc, 
        [CS_COUNTRY_DISPLAY_NAME[country]]: <Tabs style={"buttons"} className={"mt-3"} tabContentClass={"mt-3"} 
            activeTabOverride={stageOverride}
            onActiveTabChange={(aT) => setStageTab((CS_STAGES_BY_COUNTRY[country][aT - 1] as typeof STAGES_CS[number]))}
        >
            {examBoardTabs}
        </Tabs>
    }), {});

    const countryTabs = <Tabs style={"tabs"} className={"mt-3"} tabContentClass={"mt-3"}
        onActiveTabChange={(aT) => setCountryTab(CS_SUPPORTED_COUNTRIES[aT - 1] ?? "uk")}
    >
        {stageTabs}
    </Tabs>;

    useEffect(() => {
        // Since examBoardTab is last in the dependency chain, we would ideally only have this useEffect run when examBoardTab changes.
        // However, since exam boards can be shared among stages, switching from one stage to another can result in the same exam board being selected.
        // In this case, the useEffect wouldn't run at all if we only had examBoardTab as a dependency.
        // This unfortunately means we have to have all three tabs in the dependency, meaning we can generate an invalid request between when
        //  the stage has changed but the exam board hasn't.
        setFragmentId(`${stageTab}_specification_${examBoardTab}`);
        // history.replace(`#${countryTab}/${stageTab}/${examBoardTab}`);
    }, [examBoardTab, stageTab, countryTab]);

    // When changing the stage, set the exam board to the first one for that stage
    useEffect(() => {
        setExamBoardTab(CS_EXAM_BOARDS_BY_STAGE[stageTab][0] as EXAM_BOARD);
        setExamBoardTabOverride(1);
    }, [stageTab]);

    useEffect(() => {
        setStageTab(CS_STAGES_BY_COUNTRY[countryTab][0] as typeof STAGES_CS[number]);
        setStageOverride(1);
    }, [countryTab]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"} />
        <MetaDescription description={metaDescription} />
        {countryTabs}
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={fragmentId}/>
            </Col>
        </Row>
    </Container>;
};