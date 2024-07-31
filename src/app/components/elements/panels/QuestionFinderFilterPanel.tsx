import React, { Dispatch, SetStateAction, useReducer } from "react";
import { Button, Card, CardBody, CardHeader, Col } from "reactstrap";
import { CollapsibleList } from "../CollapsibleList";
import { DIFFICULTY_ITEM_OPTIONS, getFilteredExamBoardOptions, getFilteredStageOptions, groupTagSelectionsByParent, isAda, isPhy, Item, siteSpecific, STAGE, TAG_ID, tags } from "../../../services";
import { Difficulty, ExamBoard } from "../../../../IsaacApiTypes";
import { QuestionStatus } from "../../pages/QuestionFinder";
import classNames from "classnames";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { DifficultyIcons } from "../svg/DifficultyIcons";
import { GroupBase } from "react-select";
import { HierarchyFilterHexagonal, Tier } from "../svg/HierarchyFilter";


const bookOptions: Item<string>[] = [
    {value: "phys_book_step_up", label: "Step Up to GCSE Physics"},
    {value: "phys_book_gcse", label: "GCSE Physics"},
    {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
    {value: "physics_linking_concepts", label: "Linking Concepts in Pre-Uni Physics"},
    {value: "maths_book_gcse", label: "GCSE Maths"},
    {value: "maths_book", label: "Pre-Uni Maths"},
    {value: "chemistry_16", label: "A-Level Physical Chemistry"}
];
function simplifyDifficultyLabel(difficultyLabel: string): string {
    const labelLength = difficultyLabel.length;
    const type = difficultyLabel.slice(0, labelLength - 4);
    const level = difficultyLabel.slice(labelLength - 2, labelLength - 1);
    return type + level;
}

const sublistDelimiter = " >>> ";
type TopLevelListsState = {
    stage: boolean,
    examBoard: boolean,
    topics: boolean,
    difficulty: boolean,
    books: boolean,
    questionStatus: boolean,
};
type OpenListsState = TopLevelListsState & {
    [sublistId: string]: boolean
};
type ListStateActions = {type: "toggle", id: string} | {type: "expandAll", expand: boolean};
function listStateReducer(state: OpenListsState, action: ListStateActions): OpenListsState {
    switch (action.type) {
        case "toggle":
            return {...state, [action.id]: !(state[action.id])};
        case "expandAll":
            return Object.fromEntries(Object.keys(state).map((title) => [title, action.expand])) as OpenListsState;
        default:
            return state;
    }
}
const initialListState: TopLevelListsState = {
    stage: true,
    examBoard: false,
    topics: false,
    difficulty: false,
    books: false,
    questionStatus: false
};

const listTitles: { [field in keyof TopLevelListsState]: string } = {
    stage: "Stage",
    examBoard: "Exam board",
    topics: "Topics",
    difficulty: siteSpecific("Difficulty", "Question difficulty"),
    books: "Book",
    questionStatus: siteSpecific("Status", "Question status")
};

interface QuestionFinderFilterPanelProps {
    searchDifficulties: Difficulty[]; setSearchDifficulties: Dispatch<SetStateAction<Difficulty[]>>;
    searchTopics: string[], setSearchTopics: Dispatch<SetStateAction<string[]>>;
    searchStages: STAGE[], setSearchStages: Dispatch<SetStateAction<STAGE[]>>;
    searchExamBoards: ExamBoard[], setSearchExamBoards: Dispatch<SetStateAction<ExamBoard[]>>;
    questionStatuses: QuestionStatus, setQuestionStatuses: Dispatch<SetStateAction<QuestionStatus>>;
    searchBooks: string[], setSearchBooks: Dispatch<SetStateAction<string[]>>;
    excludeBooks: boolean, setExcludeBooks: Dispatch<SetStateAction<boolean>>;
    tiers: Tier[], choices: Item<TAG_ID>[][], selections: Item<TAG_ID>[][], setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>,
    applyFilters: () => void; clearFilters: () => void;
    filtersSelected: boolean; searchDisabled: boolean;
}
export function QuestionFinderFilterPanel(props: QuestionFinderFilterPanelProps) {
    const {
        searchDifficulties, setSearchDifficulties,
        searchTopics, setSearchTopics,
        searchStages, setSearchStages,
        searchExamBoards, setSearchExamBoards,
        questionStatuses, setQuestionStatuses,
        searchBooks, setSearchBooks,
        excludeBooks, setExcludeBooks,
        tiers, choices, selections, setTierSelection,
        applyFilters, clearFilters, filtersSelected, searchDisabled
    } = props;
    const [listState, listStateDispatch] = useReducer(listStateReducer, initialListState);
    const anyExpandedLists = Object.values(listState).some(v => v);

    const tagOptions: { options: Item<string>[]; label: string }[] = isPhy ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;

    return <Card>
        <CardHeader className="finder-header pl-3">
            <Col xs={2}>
                <img
                    src="/assets/common/icons/filter-icon.svg"
                    alt="Filter"
                    style={{width: 18}}
                    className="ms-1"
                />
            </Col>
            <Col className={"px-0 mt-1"}>
                <b>Filter by</b>
            </Col>
            {filtersSelected && <div className="pe-1">
                <button
                    className={"text-black mt-1 bg-white bg-opacity-10 btn-link"}
                    onClick={clearFilters}
                >Clear all</button>
            </div>}
            <div>
                <button
                    className="bg-white bg-opacity-10 p-0"
                    onClick={() => listStateDispatch({type: "expandAll", expand: !anyExpandedLists})}
                >
                    <img className={classNames("icon-dropdown-90", {"active": anyExpandedLists})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
                </button>
            </div>
        </CardHeader>
        <CardBody className="p-0 m-0">
            <CollapsibleList
                title={listTitles.stage} expanded={listState.stage}
                toggle={() => listStateDispatch({type: "toggle", id: "stage"})}
                numberSelected={searchStages.length}
            >
                {getFilteredStageOptions().map((stage, index) => (
                    <div className="w-100 ps-3 py-1 bg-white" key={index}>
                        <StyledCheckbox
                            color="primary"
                            checked={searchStages.includes(stage.value)}
                            onChange={() => setSearchStages(s => s.includes(stage.value) ? s.filter(v => v !== stage.value) : [...s, stage.value])}
                            label={<span>{stage.label}</span>}
                        />
                    </div>
                ))}
            </CollapsibleList>
            {isAda && <CollapsibleList
                title={listTitles.examBoard} expanded={listState.examBoard}
                toggle={() => listStateDispatch({type: "toggle", id: "examBoard"})}
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
                title={listTitles.topics} expanded={listState.topics}
                toggle={() => listStateDispatch({type: "toggle", id: "topics"})}
                numberSelected={siteSpecific(
                    // Find the last non-zero tier in the tree
                    // FIXME: Use `filter` and `at` when Safari supports it
                    selections.map(tier => tier.length)
                        .reverse()
                        .find(l => l > 0),
                    searchTopics.length
                )}
            >
                {siteSpecific(
                    <div>
                        <HierarchyFilterHexagonal {...{tiers, choices, selections: selections, questionFinderFilter: true, setTierSelection}} />
                    </div>,
                    groupBaseTagOptions.map((tag, index) => (
                        // TODO: make subList
                        <CollapsibleList
                            title={tag.label} key={index} asSubList
                            expanded={listState[`topics ${sublistDelimiter} ${tag.label}`]}
                            toggle={() => listStateDispatch({type: "toggle", id: `topics ${sublistDelimiter} ${tag.label}`})}
                        >
                            {tag.options.map((topic, index) => (
                                <div className="w-100 ps-3 py-1 bg-white" key={index}>
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
                    )))
                }
            </CollapsibleList>

            <CollapsibleList
                title={listTitles.difficulty} expanded={listState.difficulty}
                toggle={() => listStateDispatch({type: "toggle", id: "difficulty"})}
                numberSelected={searchDifficulties.length}
            >
                <div className="ps-3">
                    <button
                        className="p-0 bg-white h-min-content btn-link"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: add modal
                            console.log("show difficulty modal here");
                    }}>
                        <small><b>What do the different difficulty levels mean?</b></small>
                    </button>
                </div>
                {DIFFICULTY_ITEM_OPTIONS.map((difficulty, index) => (
                    <div className="w-100 ps-3 py-1 bg-white" key={index}>
                        <StyledCheckbox
                            color="primary"
                            checked={searchDifficulties.includes(difficulty.value)}
                            onChange={() => setSearchDifficulties(
                                s => s.includes(difficulty.value)
                                    ? s.filter(v => v !== difficulty.value)
                                    : [...s, difficulty.value]
                            )}
                            label={<div className="d-flex align-items-center">
                                <span className="me-2">{simplifyDifficultyLabel(difficulty.label)}</span>
                                <DifficultyIcons difficulty={difficulty.value} blank={true} classnames="mt-n2"/>
                            </div>}
                        />
                    </div>
                ))}
            </CollapsibleList>
            {isPhy && <CollapsibleList
                title={listTitles.books} expanded={listState.books}
                toggle={() => listStateDispatch({type: "toggle", id: "books"})}
                numberSelected={excludeBooks ? 1 : searchBooks.length}
            >
                <>
                    <div className="w-100 ps-3 py-1 bg-white">
                        <StyledCheckbox
                            color="primary"
                            checked={excludeBooks}
                            onChange={() => setExcludeBooks(p => !p)}
                            label={<span className="me-2">Exclude skills book questions</span>}
                        />
                    </div>
                    {bookOptions.map((book, index) => (
                        <div className="w-100 ps-3 py-1 bg-white" key={index}>
                            <StyledCheckbox
                                color="primary" disabled={excludeBooks}
                                checked={searchBooks.includes(book.value) && !excludeBooks}
                                onChange={() => setSearchBooks(
                                    s => s.includes(book.value)
                                        ? s.filter(v => v !== book.value)
                                        : [...s, book.value]
                                )}
                                label={<span className="me-2">{book.label}</span>}
                            />
                        </div>
                    ))}
                </>
            </CollapsibleList>}
            <CollapsibleList
                title={listTitles.questionStatus} expanded={listState.questionStatus}
                toggle={() => listStateDispatch({type: "toggle", id: "questionStatus"})}
                numberSelected={Object.values(questionStatuses).reduce((acc, item) => acc + item, 0)}
            >
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={questionStatuses.hideCompleted}
                        onChange={() => setQuestionStatuses(s => {return {...s, hideCompleted: !s.hideCompleted};})}
                        label={<div>
                            <span>Hide complete</span>
                        </div>}
                    />
                </div>
                {/* TODO: implement new completeness filters
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={questionStatuses.notAttempted}
                        onChange={() => setQuestionStatuses(s => {return {...s, notAttempted: !s.notAttempted};})}
                        label={<div>
                            <span>Not attempted</span>
                            <img
                                src="/assets/common/icons/not-started.svg"
                                alt="Not attempted"
                                style={{width: 23}}
                                className="ms-1"
                            />
                        </div>}
                    />
                </div>
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={questionStatuses.complete}
                        onChange={() => setQuestionStatuses(s => {return {...s, complete: !s.complete};})}
                        label={<div>
                            <span>Completed</span>
                            <img
                                src="/assets/common/icons/completed.svg"
                                alt="Completed"
                                style={{width: 23}}
                                className="ms-1"
                            />
                        </div>}
                    />
                </div>
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={questionStatuses.incorrect}
                        onChange={() => setQuestionStatuses(s => {return {...s, incorrect: !s.incorrect};})}
                        label={<div>
                            <span>Try again</span>
                            <img
                                src="/assets/common/icons/incorrect.svg"
                                alt="Try again"
                                style={{width: 23}}
                                className="ms-1"
                            />
                        </div>}
                    />
                </div>*/}
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
            <Col className="text-center my-3 filter-btn">
                <Button onClick={applyFilters} disabled={searchDisabled}>
                    Apply filters
                </Button>
            </Col>
        </CardBody>
    </Card>;
}