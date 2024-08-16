import React, { Dispatch, SetStateAction, useReducer, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col } from "reactstrap";
import { CollapsibleList } from "../CollapsibleList";
import {
    above,
    below,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    groupTagSelectionsByParent,
    isAda,
    isPhy,
    Item,
    SIMPLE_DIFFICULTY_ITEM_OPTIONS,
    siteSpecific,
    STAGE,
    TAG_ID,
    tags,
    useDeviceSize
} from "../../../services";
import { Difficulty, ExamBoard } from "../../../../IsaacApiTypes";
import { QuestionStatus } from "../../pages/QuestionFinder";
import classNames from "classnames";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { DifficultyIcons } from "../svg/DifficultyIcons";
import { GroupBase } from "react-select";
import { HierarchyFilterHexagonal, Tier } from "../svg/HierarchyFilter";
import { openActiveModal, useAppDispatch } from "../../../state";
import { questionFinderDifficultyModal } from "../modals/QuestionFinderDifficultyModal";
import { Spacer } from "../Spacer";


const bookOptions: Item<string>[] = [
    {value: "phys_book_step_up", label: "Step Up to GCSE Physics"},
    {value: "phys_book_gcse", label: "GCSE Physics"},
    {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
    {value: "physics_linking_concepts", label: "Linking Concepts in Pre-Uni Physics"},
    {value: "maths_book_gcse", label: "GCSE Maths"},
    {value: "maths_book", label: "Pre-Uni Maths"},
    {value: "chemistry_16", label: "A-Level Physical Chemistry"}
];

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
        topics: {state: false, subList: false},
        difficulty: {state: false, subList: false},
        books: {state: false, subList: false},
        questionStatus: {state: false, subList: false}
    };
}

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
    searchStatuses: QuestionStatus, setSearchStatuses: Dispatch<SetStateAction<QuestionStatus>>;
    searchBooks: string[], setSearchBooks: Dispatch<SetStateAction<string[]>>;
    excludeBooks: boolean, setExcludeBooks: Dispatch<SetStateAction<boolean>>;
    tiers: Tier[], choices: Item<TAG_ID>[][], selections: Item<TAG_ID>[][], setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>,
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
        tiers, choices, selections, setTierSelection,
        applyFilters, clearFilters, validFiltersSelected, 
        searchDisabled, setSearchDisabled
    } = props;
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tags.allSubcategoryTags.map(groupTagSelectionsByParent);

    const [listState, listStateDispatch] = useReducer(listStateReducer, groupBaseTagOptions, initialiseListState);
    const deviceSize = useDeviceSize();
    const dispatch = useAppDispatch();

    const [filtersVisible, setFiltersVisible] = useState<boolean>(above["lg"](deviceSize));

    const handleFilterPanelExpansion = (e? : React.MouseEvent<HTMLElement>) => {
        e?.stopPropagation();
        if (below["md"](deviceSize)) {
            listStateDispatch({type: "expandAll", expand: false});
            setFiltersVisible(p => !p);
        } else {
            listStateDispatch({
                type: "expandAll",
                expand: !Object.values(listState).some(v => v.state && !v.subList
                )});
        }
    };

    return <Card>
        <CardHeader className="finder-header pl-3" onClick={(e) => {
            // the filters panel can only be collapsed when it is not a sidebar
            // (changing screen size after collapsing does not re-expand it but the options become visible)
            if (below["md"](deviceSize)) handleFilterPanelExpansion(e);
        }}>
            <div>
                <img
                    src="/assets/common/icons/filter-icon.svg"
                    alt="Filter"
                    style={{width: 18}}
                    className="ms-1 me-2"
                />
                <b>Filter by</b>
            </div>
            <Spacer/>
            {validFiltersSelected && <div className="pe-1 pe-lg-0">
                <button
                    className={"text-black pe-lg-0 py-0 me-2 me-lg-0 bg-white bg-opacity-10 btn-link"}
                    onClick={(e) => {
                        e.stopPropagation();
                        clearFilters();
                    }}
                >
                    Clear all
                </button>
            </div>}
            {below["md"](deviceSize) && <div>
                <button
                    className="bg-white bg-opacity-10 p-0"
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
        <CardBody className={classNames("p-0 m-0", {"d-none": below["md"](deviceSize) && !filtersVisible})}>
            <CollapsibleList
                title={listTitles.stage} expanded={listState.stage.state}
                toggle={() => listStateDispatch({type: "toggle", id: "stage", focus: below["md"](deviceSize)})}
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
                        <CollapsibleList
                            title={tag.label} key={index} asSubList
                            expanded={listState[`topics ${sublistDelimiter} ${tag.label}`]?.state}
                            toggle={() => listStateDispatch({type: "toggle", id: `topics ${sublistDelimiter} ${tag.label}`, focus: true})}
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
                title={listTitles.difficulty} expanded={listState.difficulty.state}
                toggle={() => listStateDispatch({type: "toggle", id: "difficulty", focus: below["md"](deviceSize)})}
                numberSelected={searchDifficulties.length}
            >
                <button
                    className="p-0 bg-white h-min-content btn-link d-flex ps-3 py-2"
                    onClick={(e) => {
                        e.preventDefault();
                        dispatch(openActiveModal(questionFinderDifficultyModal()));
                    }}>
                    <b className="small text-start">{siteSpecific("Learn more about difficulty levels", "What do the difficulty levels mean?")}</b>
                </button>
                {SIMPLE_DIFFICULTY_ITEM_OPTIONS.map((difficulty, index) => (
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
                                <span className="me-2">{difficulty.label}</span>
                                <DifficultyIcons difficulty={difficulty.value} blank classnames="mt-n2"/>
                            </div>}
                        />
                    </div>
                ))}
            </CollapsibleList>
            {isPhy && <CollapsibleList
                title={listTitles.books} expanded={listState.books.state}
                toggle={() => listStateDispatch({type: "toggle", id: "books", focus: below["md"](deviceSize)})}
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
                title={listTitles.questionStatus} expanded={listState.questionStatus.state}
                toggle={() => listStateDispatch({type: "toggle", id: "questionStatus", focus: below["md"](deviceSize)})}
                numberSelected={Object.values(searchStatuses).reduce((acc, item) => acc + item, 0)}
            >
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.notAttempted}
                        onChange={() => setSearchStatuses(s => {return {...s, notAttempted: !s.notAttempted};})}
                        label={<div>
                            <span>{siteSpecific("Not started", "Not attempted")}</span>
                            {siteSpecific(
                                <svg
                                    className={"search-item-icon ps-2 icon-status"}
                                    aria-label={"Not started"}>
                                    <use href={`/assets/phy/icons/question-hex.svg#icon`}
                                        xlinkHref={`/assets/phy/icons/question-hex.svg#icon`}/>
                                </svg>,
                                <img
                                    src="/assets/common/icons/not-started.svg"
                                    alt="Not attempted"
                                    className="ps-2 icon-status"
                                />
                            )}
                        </div>}
                    />
                </div>
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.complete}
                        onChange={() => setSearchStatuses(s => {return {...s, complete: !s.complete};})}
                        label={<div>
                            <span>{siteSpecific("Fully correct", "Completed")}</span>
                            {siteSpecific(
                                <svg
                                    className={"search-item-icon ps-2 icon-status correct-fill"}
                                    aria-label={"Fully correct"}>
                                    <use href={`/assets/phy/icons/tick-rp-hex.svg#icon`}
                                        xlinkHref={`/assets/phy/icons/tick-rp-hex.svg#icon`}/>
                                </svg>,
                                <img
                                    src="/assets/common/icons/completed.svg"
                                    alt="Completed"
                                    className="ps-2 icon-status"
                                />
                            )}
                        </div>}
                    />
                </div>
                <div className="w-100 ps-3 py-1 bg-white d-flex align-items-center">
                    <StyledCheckbox
                        color="primary"
                        checked={searchStatuses.incorrect}
                        onChange={() => setSearchStatuses(s => {return {...s, incorrect: !s.incorrect};})}
                        label={<div>
                            <span>{siteSpecific("In progress", "Try again")}</span>
                            {siteSpecific(
                                <svg
                                    className={"search-item-icon ps-2 icon-status almost-fill"}
                                    aria-label={"In progress"}>
                                    <use href={`/assets/phy/icons/incomplete-hex.svg#icon`}
                                        xlinkHref={`/assets/phy/icons/incomplete-hex.svg#icon`}/>
                                </svg>,
                                <img
                                    src="/assets/common/icons/incorrect.svg"
                                    alt="Try again"
                                    className="ps-2 icon-status"
                                />
                            )}
                        </div>}
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
            <Col className="text-center py-3 filter-btn bg-white border-radius-2">
                <Button onClick={() => {
                    applyFilters();
                    setSearchDisabled(true);
                }} disabled={searchDisabled}>
                    Apply filters
                </Button>
            </Col>
        </CardBody>
    </Card>;
}
