import React, { Dispatch, SetStateAction, useReducer, useState } from "react";
import { Button, CardBody, CardHeader, Col } from "reactstrap";
import { CollapsibleList } from "../CollapsibleList";
import {
    above,
    below,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    groupTagSelectionsByParent,
    ISAAC_BOOKS,
    isAda,
    isPhy,
    Item,
    SIMPLE_DIFFICULTY_ITEM_OPTIONS,
    siteSpecific,
    STAGE,
    TAG_ID,
    TAG_LEVEL,
    tags,
    useDeviceSize,
} from "../../../services";
import { Difficulty, ExamBoard } from "../../../../IsaacApiTypes";
import { pageStageToSearchStage, QuestionStatus } from "../../pages/QuestionFinder";
import classNames from "classnames";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { DifficultyIcons } from "../svg/DifficultyIcons";
import { GroupBase } from "react-select";
import { HierarchyFilterTreeList, Tier } from "../svg/HierarchyFilter";
import { openActiveModal, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { questionFinderDifficultyModal } from "../modals/QuestionFinderDifficultyModal";
import { Spacer } from "../Spacer";

const sublistDelimiter = " >>> ";
type TopLevelListsState = {
    stage: {state: boolean, subList: boolean},
    examBoard: {state: boolean, subList: boolean},
    topics: {state: boolean, subList: boolean},
    difficulty: {state: boolean, subList: boolean},
    books: {state: boolean, subList: boolean},
    questionStatus: {state: boolean, subList: boolean},
};
type OpenListsState = TopLevelListsState & {
    [sublistId: string]: {state: boolean, subList: boolean}
};
type ListStateActions = {type: "toggle", id: string, focus: boolean}
    | {type: "expandAll", expand: boolean};
function listStateReducer(state: OpenListsState, action: ListStateActions): OpenListsState {
    switch (action.type) {
        case "toggle":
            return action.focus
                ? Object.fromEntries(Object.keys(state).map(
                    (title) => [
                        title,
                        {
                            // Close all lists except this one
                            state: action.id === title && !(state[action.id]?.state)
                            // But if this is a sublist don't change top-level lists
                            || (state[action.id]?.subList
                                && !(state[title]?.subList)
                                && state[title]?.state),
                            subList: state[title]?.subList
                        }
                    ])
                ) as OpenListsState
                : {...state, [action.id]: {
                    state: !(state[action.id]?.state),
                    subList: state[action.id]?.subList
                }};
        case "expandAll":
            return Object.fromEntries(Object.keys(state).map(
                (title) => [
                    title,
                    {
                        state: action.expand && !(state[title]?.subList),
                        subList: state[title]?.subList
                    }
                ])) as OpenListsState;
        default:
            return state;
    }
}
function initialiseListState(tags: GroupBase<Item<string>>[]): OpenListsState {
    const subListState = Object.fromEntries(
        tags.filter(tag => tag.label)
            .map(tag => [
                `topics ${sublistDelimiter} ${tag.label}`,
                {state: false, subList: true}
            ])
    );
    return {
        ...subListState,
        stage: {state: true, subList: false},
        examBoard: {state: false, subList: false},
        topics: {state: isPhy, subList: false},
        difficulty: {state: false, subList: false},
        books: {state: false, subList: false},
        questionStatus: {state: false, subList: false}
    };
}

const listTitles: { [field in keyof TopLevelListsState]: string } = {
    stage: siteSpecific("Learning Stage", "Stage"),
    examBoard: "Exam board",
    topics: siteSpecific("Topic", "Topics"),
    difficulty: siteSpecific("Difficulty", "Question difficulty"),
    books: "Book",
    questionStatus: siteSpecific("Status", "Question status")
};

export type ChoiceTree = Partial<Record<TAG_ID | TAG_LEVEL, Item<TAG_ID>[]>>;

export function getChoiceTreeLeaves(tree: ChoiceTree[]) {
    let leaves: Item<TAG_ID>[] = [];
    for (let index = 0; index < tree.length; index++) {
        if (index === 0)
            leaves.push(...tree[0][TAG_LEVEL.subject] ?? []);
        else {
            const parentIds = Object.values(tree[index]).flat().map(item => tags.getById(item.value).parent);
            leaves = leaves.filter(l => !parentIds.includes(l.value))
            Object.values(tree[index]).forEach(v => leaves.push(...v)); 
        }
    }

    return leaves;
}

export interface QuestionFinderFilterPanelProps {
    searchDifficulties: Difficulty[]; setSearchDifficulties: Dispatch<SetStateAction<Difficulty[]>>;
    searchTopics: string[], setSearchTopics: Dispatch<SetStateAction<string[]>>;
    searchStages: STAGE[], setSearchStages: Dispatch<SetStateAction<STAGE[]>>;
    searchExamBoards: ExamBoard[], setSearchExamBoards: Dispatch<SetStateAction<ExamBoard[]>>;
    searchStatuses: QuestionStatus, setSearchStatuses: Dispatch<SetStateAction<QuestionStatus>>;
    searchBooks: string[], setSearchBooks: Dispatch<SetStateAction<string[]>>;
    excludeBooks: boolean, setExcludeBooks: Dispatch<SetStateAction<boolean>>;
    choices: ChoiceTree[]; 
    selections: ChoiceTree[], setSelections: Dispatch<SetStateAction<ChoiceTree[]>>;
    applyFilters: () => void; clearFilters: () => void;
    validFiltersSelected: boolean; 
    searchDisabled: boolean;
    setSearchDisabled: Dispatch<SetStateAction<boolean>>;
}
export function QuestionFinderFilterPanel(props: QuestionFinderFilterPanelProps) {
    const {
        searchDifficulties, setSearchDifficulties,
        searchTopics, setSearchTopics,
        searchStages, setSearchStages,
        searchExamBoards, setSearchExamBoards,
        searchStatuses, setSearchStatuses,
        searchBooks, setSearchBooks,
        excludeBooks, setExcludeBooks,
        choices, selections, setSelections,
        applyFilters, clearFilters, validFiltersSelected, 
        searchDisabled, setSearchDisabled
    } = props;
    const groupBaseTagOptions: GroupBase<Item<string>>[] = siteSpecific(tags.allSubjectTags.map(groupTagSelectionsByParent), tags.allSubcategoryTags.map(groupTagSelectionsByParent));

    const [listState, listStateDispatch] = useReducer(listStateReducer, groupBaseTagOptions, initialiseListState);
    const deviceSize = useDeviceSize();
    const dispatch = useAppDispatch();
    const pageContext = useAppSelector(selectors.pageContext.context);
    const bookOptions = ISAAC_BOOKS.filter(b => !b.hidden).filter(book => 
        (!pageContext?.subject || book.subject === pageContext?.subject)
        && (!pageContext?.stage?.length || book.stages.some(x => pageContext?.stage?.includes(x)))
    );

    const [filtersVisible, setFiltersVisible] = useState<boolean>(above["lg"](deviceSize));

    const handleFilterPanelExpansion = (e? : React.MouseEvent<HTMLElement>) => {
        e?.stopPropagation();
        if (below["md"](deviceSize)) {
            listStateDispatch({
                type: "expandAll", 
                expand: false
            });
            setFiltersVisible(p => !p);
        } else {
            listStateDispatch({
                type: "expandAll",
                expand: !Object.values(listState).some(v => v.state && !v.subList)
            });
        }
    };

    return <div data-bs-theme="neutral" className={classNames({"card": isAda})}>
        <CardHeader className="finder-header pl-3" onClick={(e) => {
            // the filters panel can only be collapsed when it is not a sidebar
            // (changing screen size after collapsing does not re-expand it but the options become visible)
            if (below["md"](deviceSize)) handleFilterPanelExpansion(e);
        }}>
            {siteSpecific(
                <h6 className="filter-question-text">Filter questions by</h6>,
                <>
                    <div>
                        <img src="/assets/common/icons/filter-icon.svg" alt="Filter" style={{width: 18}} className="ms-1 me-2"/>
                        <b>Filter by</b>
                    </div>
                    <Spacer/>
                    {validFiltersSelected && <div className="pe-1 pe-lg-0">
                        <button
                            className={classNames("text-black pe-lg-0 py-0 me-2 me-lg-0 bg-opacity-10 btn-link", {"bg-white": isAda})}
                            onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                        >
                            Clear all
                        </button>
                    </div>}
                </>)}
            {below["md"](deviceSize) && isAda && <div>
                <button
                    className="bg-opacity-10 p-0 bg-white"
                    onClick={handleFilterPanelExpansion}
                >
                    <img
                        className={classNames(
                            "icon-dropdown-90",
                            {"active": above["lg"](deviceSize)
                                ? Object.values(listState).some(v => v.state && !v.subList)
                                : filtersVisible})}
                        src={"/assets/common/icons/chevron_right.svg"} alt="" />
                </button>
            </div>}
        </CardHeader>
        <CardBody className={classNames("p-0 m-0", {"d-none": isAda && below["md"](deviceSize) && !filtersVisible})}>
            {(isAda || pageStageToSearchStage(pageContext?.stage).length !== 1) && <CollapsibleList
                title={listTitles.stage} expanded={listState.stage.state}
                toggle={() => listStateDispatch({type: "toggle", id: "stage", focus: below["md"](deviceSize)})}
                numberSelected={(isAda && searchStages.includes(STAGE.ALL)) ? searchStages.length - 1 : searchStages.length}
            >
                {getFilteredStageOptions().filter(stage => pageStageToSearchStage(pageContext?.stage).includes(stage.value) || !pageContext?.stage?.length).map((stage, index) => (
                    <div className={classNames("w-100 ps-3 py-1", {"bg-white": isAda, "ms-2": isPhy, "checkbox-region": isPhy && searchStages.includes(stage.value)})} key={index}>
                        <StyledCheckbox
                            color="primary"
                            checked={searchStages.includes(stage.value)}
                            onChange={() => setSearchStages(s => s.includes(stage.value) ? s.filter(v => v !== stage.value) : [...s, stage.value])}
                            label={<span>{stage.label}</span>}
                        />
                    </div>
                ))}
            </CollapsibleList>}
            {isAda && <CollapsibleList
                title={listTitles.examBoard} expanded={listState.examBoard.state}
                toggle={() => listStateDispatch({type: "toggle", id: "examBoard", focus: below["md"](deviceSize)})}
                numberSelected={searchExamBoards.length}
            >
                {getFilteredExamBoardOptions({byStages: searchStages}).map((board, index) => (
                    <div className="w-100 ps-3 py-1 bg-white" key={index}>
                        <StyledCheckbox
                            color="primary"
                            checked={searchExamBoards.includes(board.value)}
                            onChange={() => setSearchExamBoards(s => s.includes(board.value) ? s.filter(v => v !== board.value) : [...s, board.value])}
                            label={<span>{board.label}</span>}
                        />
                    </div>
                ))}
            </CollapsibleList>}
            <CollapsibleList
                title={listTitles.topics} expanded={listState.topics.state}
                toggle={() => listStateDispatch({type: "toggle", id: "topics", focus: below["md"](deviceSize)})}
                numberSelected={siteSpecific(getChoiceTreeLeaves(selections).filter(l => l.value !== pageContext?.subject).length, searchTopics.length)}
            >
                {siteSpecific(
                    <div>
                        <HierarchyFilterTreeList root {...{
                            tier: pageContext?.subject ? 1 : 0,
                            index: pageContext?.subject as TAG_ID ?? TAG_LEVEL.subject,
                            choices, selections, setSelections,
                            questionFinderFilter: true
                        }}/>
                    </div>,
                    groupBaseTagOptions.map((tag, index) => (
                        <CollapsibleList
                            title={tag.label} key={index} asSubList
                            expanded={listState[`topics ${sublistDelimiter} ${tag.label}`]?.state}
                            toggle={() => listStateDispatch({type: "toggle", id: `topics ${sublistDelimiter} ${tag.label}`, focus: true})}
                        >
                            {tag.options.map((topic, index) => (
                                <div className={classNames("w-100 ps-3 py-1", {"bg-white": isAda})} key={index}>
                                    <StyledCheckbox
                                        color="primary"
                                        checked={searchTopics.includes(topic.value)}
                                        onChange={() => setSearchTopics(
                                            s => s.includes(topic.value)
                                                ? s.filter(v => v !== topic.value)
                                                : [...s, topic.value]
                                        )}
                                        label={<span>{topic.label}</span>}
                                        className="ps-3"
                                    />
                                </div>
                            ))}
                        </CollapsibleList>
                    )))}
            </CollapsibleList>

            <CollapsibleList
                title={listTitles.difficulty} expanded={listState.difficulty.state}
                toggle={() => listStateDispatch({type: "toggle", id: "difficulty", focus: below["md"](deviceSize)})}
                numberSelected={searchDifficulties.length}
            >
                <button
                    className={classNames("p-0 h-min-content btn-link d-flex ps-3 py-2", {"bg-white": isAda, "bg-transparent": isPhy})}
                    onClick={(e) => {
                        e.preventDefault();
                        dispatch(openActiveModal(questionFinderDifficultyModal()));
                    }}>
                    <b className="small text-start">{siteSpecific("Learn more about difficulty levels", "What do the difficulty levels mean?")}</b>
                </button>
                {SIMPLE_DIFFICULTY_ITEM_OPTIONS.map((difficulty, index) => (
                    <div className={classNames("w-100 ps-3 py-1", {"bg-white": isAda, "ms-2": isPhy, "checkbox-region": isPhy && searchDifficulties.includes(difficulty.value)})} key={index}>
                        <StyledCheckbox
                            color="primary"
                            checked={searchDifficulties.includes(difficulty.value)}
                            onChange={() => setSearchDifficulties(
                                s => s.includes(difficulty.value)
                                    ? s.filter(v => v !== difficulty.value)
                                    : [...s, difficulty.value]
                            )}
                            label={<div className="d-flex align-items-center">
                                <span className="me-2">{difficulty.label}</span>
                                <DifficultyIcons difficulty={difficulty.value} blank className={classNames({"mt-n2": isAda, "mt-2": isPhy})}/>
                            </div>}
                        />
                    </div>
                ))}
            </CollapsibleList>
            {isPhy && bookOptions.length > 0 && <CollapsibleList
                title={listTitles.books} expanded={listState.books.state}
                toggle={() => listStateDispatch({type: "toggle", id: "books", focus: below["md"](deviceSize)})}
                numberSelected={excludeBooks ? 1 : searchBooks.length}
            >
                <>
                    <div className={classNames("w-100 ps-3 py-1 ms-2", {"checkbox-region": excludeBooks})}>
                        <StyledCheckbox
                            color="primary"
                            checked={excludeBooks}
                            onChange={() => setExcludeBooks(p => !p)}
                            label={<span className="me-2">Exclude skills book questions</span>}
                        />
                    </div>
                    {bookOptions.map((book, index) => (
                        <div className={classNames("w-100 ps-3 py-1 ms-2", {"checkbox-region": searchBooks.includes(book.tag) && !excludeBooks})} key={index}>
                            <StyledCheckbox
                                color="primary" disabled={excludeBooks}
                                checked={searchBooks.includes(book.tag) && !excludeBooks}
                                onChange={() => setSearchBooks(
                                    s => s.includes(book.tag)
                                        ? s.filter(v => v !== book.tag)
                                        : [...s, book.tag]
                                )}
                                label={<span className="me-2">{book.shortTitle ?? book.title}</span>}
                            />
                        </div>
                    ))}
                </>
            </CollapsibleList>}
            <CollapsibleList
                title={listTitles.questionStatus} expanded={listState.questionStatus.state}
                toggle={() => listStateDispatch({type: "toggle", id: "questionStatus", focus: below["md"](deviceSize)})}
                numberSelected={Object.values(searchStatuses).reduce((acc, item) => acc + item, 0)}
            >
                <div className={classNames("w-100 ps-3 py-1 d-flex align-items-center", {"bg-white": isAda, "ms-2": isPhy, "checkbox-region": isPhy && searchStatuses.notAttempted})}>
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.notAttempted}
                        onChange={() => setSearchStatuses(s => {return {...s, notAttempted: !s.notAttempted};})}
                        label={siteSpecific(
                            <div className="d-flex">
                                Not started
                                <img className="ps-2" src={`/assets/phy/icons/redesign/status-not-started.svg`} alt="Not started"/>
                            </div>,
                            <div>
                                Not attempted
                                <img className="ps-2 icon-status" src="/assets/common/icons/not-started.svg" alt="Not attempted" />
                            </div>
                        )}
                    />
                </div>
                <div className={classNames("w-100 ps-3 py-1 d-flex align-items-center", {"bg-white": isAda, "ms-2": isPhy, "checkbox-region": isPhy && searchStatuses.complete})}>
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.complete}
                        onChange={() => setSearchStatuses(s => {return {...s, complete: !s.complete};})}
                        label={siteSpecific(
                            <div className="d-flex">
                                Fully correct
                                <img className="ps-2" src={`/assets/phy/icons/redesign/status-correct.svg`} alt="Fully correct"/> 
                            </div>,
                            <div>
                                Completed
                                <img className="ps-2 icon-status" src="/assets/common/icons/completed.svg" alt="Completed" />
                            </div>
                        )}
                    />
                </div>
                <div className={classNames("w-100 ps-3 py-1 d-flex align-items-center", {"bg-white": isAda, "ms-2": isPhy, "checkbox-region": isPhy && searchStatuses.tryAgain})}>
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.tryAgain}
                        onChange={() => setSearchStatuses(s => {return {...s, tryAgain: !s.tryAgain};})}
                        label={siteSpecific(
                            <div className="d-flex">
                                In progress
                                <img className="ps-2" src={`/assets/phy/icons/redesign/status-in-progress.svg`} alt="In Progress"/> 
                            </div>,
                            <div>
                                Try again
                                <img className="ps-2 icon-status" src="/assets/common/icons/incorrect.svg" alt="Try again" />
                            </div>
                        )}
                    />
                </div>
            </CollapsibleList>
            {/* TODO: implement once necessary tags are available
            <div className="pb-2">
                <hr className="m-0 filter-separator"/>
            </div>
            {isAda && <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                <StyledCheckbox
                    color="primary"
                    checked={questionStatuses.llmMarked}
                    onChange={() => setQuestionStatuses(s => {return {...s, llmMarked: !s.llmMarked};})}
                    label={<span>
                        {"Include "}
                        <button
                        className="p-0 bg-white h-min-content btn-link"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: add modal
                            console.log("show LLM modal here");
                        }}>
                            LLM marked
                        </button>
                        {" questions"}
                    </span>}
                />
            </div>}*/}
            {isAda && <Col className="text-center py-3 filter-btn bg-white border-radius-2">
                <Button onClick={() => {
                    applyFilters();
                    setSearchDisabled(true);
                }} disabled={searchDisabled}>
                    Apply filters
                </Button>
            </Col>}
        </CardBody>
    </div>;
}
