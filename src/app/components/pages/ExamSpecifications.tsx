import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {PageFragment} from "../elements/PageFragment";
import {CS_EXAM_BOARDS_BY_STAGE, EXAM_BOARD, STAGE, STAGES_CS, stageLabelMap} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {ExamBoard} from "../../../IsaacApiTypes";
import { selectors } from "../../state";
import { useSelector } from "react-redux";

interface ExamSpecificationsProps {
    // Show only tabs for the following stages
    stageFilter?: STAGE[]
    // Show only tabs for the following exam boards
    examBoardFilter?: ExamBoard[],
    title?: string
}

const getStageFromURL = (stageFilter: STAGE[]) => {
    const urlStage = window.location.hash.split("/")[0].slice(1);
    return stageFilter.includes(urlStage as typeof STAGES_CS[number])
        ? urlStage as typeof STAGES_CS[number]
        : stageFilter[0];
};

const getExamBoardFromURL = (examBoardFilter: ExamBoard[]) => {
    const urlExamBoard = window.location.hash.split("/")[1];
    return examBoardFilter.includes(urlExamBoard as EXAM_BOARD)
        ? urlExamBoard as EXAM_BOARD
        : examBoardFilter[0];
};

export const getFilteredExamBoardsByStage = (stages: STAGE[], examBoards: ExamBoard[]) => {
    return Object.fromEntries(
        Object.entries(CS_EXAM_BOARDS_BY_STAGE).filter(([stage, _board]) => {
            return stages.includes(stage as STAGE);
        }).map(([stage, boards]) => [stage, boards.filter(board => examBoards.includes(board))])
    );
};

export const ExamSpecifications = ({stageFilter, examBoardFilter, title}: ExamSpecificationsProps) => {
    const STAGES: STAGE[] = stageFilter ?? [STAGE.A_LEVEL, STAGE.GCSE];
    const EXAM_BOARDS: ExamBoard[] = examBoardFilter ?? [EXAM_BOARD.AQA, EXAM_BOARD.CIE, EXAM_BOARD.OCR, EXAM_BOARD.EDUQAS, EXAM_BOARD.EDEXCEL];
    const FILTERED_EXAM_BOARDS_BY_STAGE = getFilteredExamBoardsByStage(STAGES, EXAM_BOARDS);

    const user = useSelector(selectors.user.orNull);
    const userContexts = user?.loggedIn ? user.registeredContexts : null;
    
    let defaultStage = getStageFromURL(STAGES) as typeof STAGES_CS[number];
    let defaultExamBoard = getExamBoardFromURL(EXAM_BOARDS);

    if (userContexts) {
        for (const userContext of userContexts) {
            const userContextStage = userContext.stage as typeof STAGES_CS[number];
            const userContextExamBoard = userContext.examBoard;
            if (userContextStage && STAGES.includes(userContextStage)) {
                defaultStage  = userContextStage;
            }
            if (userContextExamBoard && FILTERED_EXAM_BOARDS_BY_STAGE[defaultStage].includes(userContextExamBoard)) {
                defaultExamBoard = userContextExamBoard;
            }
        }
    }

    const [stageTab, setStageTab] = useState<typeof STAGES_CS[number]>(defaultStage);
    const [examBoardTab, setExamBoardTab] = useState<ExamBoard>(defaultExamBoard);
    const [stageTabOverride, _setStageTabOverride] = useState<number | undefined>(Object.keys(FILTERED_EXAM_BOARDS_BY_STAGE).indexOf(stageTab) + 1 || undefined);
    const [examBoardTabOverride, setExamBoardTabOverride] = useState<number | undefined>(FILTERED_EXAM_BOARDS_BY_STAGE[stageTab].indexOf(examBoardTab) + 1 || undefined);
    const [fragmentId, setFragmentId] = useState<string>("");

    const stageExamBoards = FILTERED_EXAM_BOARDS_BY_STAGE[stageTab];

    const metaDescription = ({
        [STAGE.A_LEVEL]: "Discover our free A level computer science topics and questions. We cover AQA, CIE, OCR, Eduqas, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.GCSE]: "Discover our free GCSE computer science topics and questions. We cover AQA, Edexcel, Eduqas, OCR, and WJEC. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_NATIONAL_5]: "Discover our free National 5 computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_HIGHER]: "Discover our free Higher computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.SCOTLAND_ADVANCED_HIGHER]: "Discover our free Advanced Higher computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.CORE]: "Discover our free Core computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.ADVANCED]: "Discover our free Advanced computer science topics and questions. Learn or revise for your exams with us today.",
        [STAGE.POST_18]: "Discover our free Post-18 computer science topics and questions. Learn or revise for your exams with us today.", // Not used, but needed for typing
    })[stageTab];

    const examBoardTabs = Object.keys(FILTERED_EXAM_BOARDS_BY_STAGE).reduce((acc: {[stage: string]: React.JSX.Element}, stage) => ({
        ...acc,
        [stageLabelMap[stage as STAGE]]: <Tabs
            style="tabs" className="pt-3" tabContentClass="pt-3"
            activeTabOverride={examBoardTabOverride}
            onActiveTabChange={(n) => {
                setExamBoardTab(FILTERED_EXAM_BOARDS_BY_STAGE[stageTab][n - 1] as EXAM_BOARD);
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
            const newStage = Object.keys(FILTERED_EXAM_BOARDS_BY_STAGE)[n - 1] as typeof STAGES_CS[number];
            const newExamBoard = FILTERED_EXAM_BOARDS_BY_STAGE[newStage].includes(examBoardTab) ? examBoardTab : FILTERED_EXAM_BOARDS_BY_STAGE[newStage][0];
            setStageTab(newStage);
            setExamBoardTab(newExamBoard as EXAM_BOARD);
            setExamBoardTabOverride(FILTERED_EXAM_BOARDS_BY_STAGE[newStage].indexOf(newExamBoard) + 1);
        }}
    >
        {examBoardTabs}
    </Tabs>;

    useEffect(() => {
        setFragmentId(`${stageTab}_specification_${examBoardTab}`);
        location.replace(`#${stageTab}/${examBoardTab}`);
    }, [examBoardTab, stageTab]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={title ?? "Exam specification"} intermediateCrumbs={[{title: "Exam specifications", to: "/exam_specifications"}]} />
        <MetaDescription description={metaDescription} />
        {stageTabs}
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                {fragmentId && <PageFragment fragmentId={fragmentId}/>}
            </Col>
        </Row>
    </Container>;
};
