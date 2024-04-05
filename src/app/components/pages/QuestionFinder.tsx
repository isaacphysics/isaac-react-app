import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    searchQuestions,
    useAppDispatch,
    useAppSelector
} from "../../state";
import * as RS from "reactstrap";
import debounce from "lodash/debounce";
import {MultiValue} from "react-select";
import {
    tags,
    DIFFICULTY_ICON_ITEM_OPTIONS,
    EXAM_BOARD_NULL_OPTIONS,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    groupTagSelectionsByParent,
    isAda,
    isPhy,
    isStaff,
    Item,
    logEvent,
    searchResultIsPublic,
    selectOnChange,
    siteSpecific,
    SortOrder,
    sortQuestions,
    STAGE,
    useUserContext,
    STAGE_NULL_OPTIONS,
    useQueryParams,
    arrayFromPossibleCsv,
    toSimpleCSV,
    itemiseByValue
} from "../../services";
import {AudienceContext, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {IsaacSpinner, Loading} from "../handlers/IsaacSpinner";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import { RouteComponentProps, useHistory, withRouter } from "react-router";
import { LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { ShowLoading } from "../handlers/ShowLoading";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { MetaDescription } from "../elements/MetaDescription";
import { CanonicalHrefElement } from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import queryString from "query-string";

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
};

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserContext();
    const params: {[key: string]: string | string[] | undefined} = useQueryParams(false);
    const history = useHistory();
    const eventLog = useRef<object[]>([]).current; // persist state but do not rerender on mutation

    const [searchTopics, setSearchTopics] = useState<string[]>(
        arrayFromPossibleCsv(params.topics)
    );
    const [searchQuery, setSearchQuery] = useState<string>(
        params.query ? decodeURI(params.query instanceof Array ? params.query[0] : params.query) : ""
    );
    const [searchStages, setSearchStages] = useState<STAGE[]>(
        arrayFromPossibleCsv(params.stages) as STAGE[]
    );
    const [searchDifficulties, setSearchDifficulties] = useState<Difficulty[]>(
        arrayFromPossibleCsv(params.difficulties) as Difficulty[]
    );
    const [searchExamBoards, setSearchExamBoards] = useState<ExamBoard[]>(
        arrayFromPossibleCsv(params.examBoards) as ExamBoard[]
    );

    useEffect(function populateExamBoardFromUserContext() {
        if (!EXAM_BOARD_NULL_OPTIONS.includes(userContext.examBoard)) setSearchExamBoards([userContext.examBoard]);
    }, [userContext.examBoard]);
    useEffect(function populateStageFromUserContext() {
        if (!STAGE_NULL_OPTIONS.includes(userContext.stage)) setSearchStages([userContext.stage]);
    }, [userContext.stage]);

    const [searchBook, setSearchBook] = useState<string[]>(
        arrayFromPossibleCsv(params.book)
    );
    const isBookSearch = searchBook.length > 0;

    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(
        params.fasttrack ? true : false
    );
    const [questionsSort, setQuestionsSort] = useState<Record<string, SortOrder>>({});

    const creationContext: AudienceContext = useMemo(() => {
        return !isBookSearch ? {
            stage: searchStages.length > 0 ? searchStages : undefined,
            difficulty: searchDifficulties.length > 0 ? searchDifficulties : undefined,
            examBoard: searchExamBoards.length > 0 ? searchExamBoards : undefined,
        } : {};
    }, [isBookSearch, searchDifficulties, searchExamBoards, searchStages]);

    const questions = useAppSelector((state: AppState) => state && state.questionSearchResult);
    const user = useAppSelector((state: AppState) => state && state.user);

    const searchDebounce = useCallback(
        debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], fasttrack: boolean, startIndex: number) => {
            // Clear front-end sorting so as not to override ElasticSearch's match ranking
            setQuestionsSort({});

            const isBookSearch = book.length > 0; // Tasty.
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }

            const tags = (isBookSearch ? book : [...([topics].map((tags) => tags.join(" ")))].filter((query) => query != "")).join(" ");
            const examBoardString = examBoards.join(",");

            dispatch(searchQuestions({
                searchString: searchString,
                tags,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                fasttrack,
                startIndex,
                limit: 30
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const sortQuestionUpdateState = (sortState: Record<string, SortOrder>, setSortState: React.Dispatch<React.SetStateAction<Record<string, SortOrder>>>, key: string) => (order: string) => {
        const newSortState = {...sortState};
        newSortState[key] = order as SortOrder;
        setSortState(newSortState);
    };

    const tagOptions: { options: Item<string>[]; label: string }[] = isPhy ? tags.allTags.map(groupTagSelectionsByParent) : tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const groupBaseTagOptions: GroupBase<Item<string>>[] = tagOptions;
    const bookOptions: Item<string>[] = [
        {value: "phys_book_step_up", label: "Step Up to GCSE Physics"},
        {value: "phys_book_gcse", label: "GCSE Physics"},
        {value: "physics_skills_19", label: "A Level Physics (3rd Edition)"},
        {value: "physics_linking_concepts", label: "Linking Concepts in Pre-Uni Physics"},
        {value: "maths_book_gcse", label: "GCSE Maths"},
        {value: "maths_book", label: "Pre-Uni Maths"},
        {value: "chemistry_16", label: "A-Level Physical Chemistry"}
    ];

    useEffect(() => {
        searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, searchFastTrack, 0);

        const params: {[key: string]: string} = {};
        if (searchStages.length) params.stages = toSimpleCSV(searchStages);
        if (searchDifficulties.length) params.difficulties = toSimpleCSV(searchDifficulties);
        if (searchTopics.length) params.topics = toSimpleCSV(searchTopics);
        if (searchQuery.length) params.query = encodeURI(searchQuery);
        if (isAda && searchExamBoards.length) params.examBoards = toSimpleCSV(searchExamBoards);
        if (isPhy && searchBook.length) params.book = toSimpleCSV(searchBook);
        if (isPhy && searchFastTrack) params.fasttrack = "set";

        history.replace({search: queryString.stringify(params, {encode: true}), state: location.state});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[searchDebounce, searchQuery, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties]);

    const sortedQuestions = useMemo(() => {
        return questions && sortQuestions(isBookSearch ? {title: SortOrder.ASC} : questionsSort, creationContext)(
            questions.filter(question => {
                const qIsPublic = searchResultIsPublic(question, user);
                if (isBookSearch) return qIsPublic;
                const qTopicsMatch =
                    searchTopics.length === 0 ||
                    (question.tags && question.tags.filter((tag) => searchTopics.includes(tag)).length > 0);

                return qIsPublic && qTopicsMatch;
            })
        );
    }, [questions, user, searchTopics, isBookSearch, questionsSort, creationContext]);

    const pageHelp = <span>
        You can find a question by selecting the areas of interest, stage and difficulties.
        <br/>
        You can select more than one entry in each area.
    </span>;

    const metaDescription = siteSpecific(
        "Find physics, maths, chemistry and biology questions by topic and difficulty.",
        "Search for the perfect computer science questions to study. For revision. For homework. For the classroom."
    );

    return <RS.Container id="finder-page" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={"Question Finder"} help={pageHelp}/>
        <MetaDescription description={metaDescription}/>
        <CanonicalHrefElement/>
        <RS.Card id="finder-panel" className="mx-auto mt-4 mb-5">
            <RS.CardBody className={"px-2 py-3 p-sm-4 pb-5"}>
                <RS.Row className={"mb-3"}>
                    <RS.Col>
                        <span>Specify your search criteria and we will find questions related to your chosen filter(s).</span>
                    </RS.Col>
                </RS.Row>
                <RS.Row>
                    {isPhy && <RS.Col lg={isBookSearch ? 12 : 3} className="text-wrap my-2">
                        <RS.Label htmlFor="question-search-book">Book</RS.Label>
                        <StyledSelect
                            inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                            value={itemiseByValue(searchBook, bookOptions)}
                            onChange={(e) => {
                                selectOnChange(setSearchBook, true)(e);
                                sortQuestionUpdateState(questionsSort, setQuestionsSort, "title");
                            }}
                            options={bookOptions}
                        />
                    </RS.Col>}
                    <RS.Col lg={siteSpecific(9, 12)} className={`text-wrap mt-2 ${isBookSearch ? "d-none" : ""}`}>
                        <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                        <StyledSelect
                            inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                            value={itemiseByValue(searchTopics, groupBaseTagOptions.flatMap(tag => tag.options))}
                            options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action: _action}) => {
                                selectOnChange(setSearchTopics, true)(x);
                            }}
                        />
                    </RS.Col>
                </RS.Row>
                <RS.Row className={isBookSearch ? "d-none" : ""}>
                    <RS.Col lg={6} className={`text-wrap my-2`}>
                        <RS.Label htmlFor="question-search-stage">Stage</RS.Label>
                        <StyledSelect
                            inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={getFilteredStageOptions().filter(o => searchStages.includes(o.value))}
                            options={getFilteredStageOptions()}
                            onChange={selectOnChange(setSearchStages, true)}
                        />
                    </RS.Col>
                    <RS.Col lg={6} className={`text-wrap my-2 ${isBookSearch ? "d-none" : ""}`}>
                        <RS.Label htmlFor="question-search-difficulty">Difficulty</RS.Label>
                        <StyledSelect
                            inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={itemiseByValue(searchDifficulties, DIFFICULTY_ICON_ITEM_OPTIONS)}
                            options={DIFFICULTY_ICON_ITEM_OPTIONS}
                            onChange={selectOnChange(setSearchDifficulties, true)}
                        />
                    </RS.Col>
                    {isAda && <RS.Col lg={6} className={`text-wrap my-2`}>
                        <RS.Label htmlFor="question-search-exam-board">Exam Board</RS.Label>
                        <StyledSelect
                            inputId="question-search-exam-board" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={getFilteredExamBoardOptions({byStages: searchStages}).filter(o => searchExamBoards.includes(o.value))}
                            options={getFilteredExamBoardOptions({byStages: searchStages})}
                            onChange={(s: MultiValue<Item<ExamBoard>>) => selectOnChange(setSearchExamBoards, true)(s)}
                        />
                    </RS.Col>}
                </RS.Row>
                <RS.Row>
                    {isPhy && isStaff(user) && <RS.Col className="text-wrap mb-2">
                        <RS.Form>
                            <RS.Label check><input type="checkbox" checked={searchFastTrack} onChange={e => setSearchFastTrack(e.target.checked)} />{' '}Show FastTrack questions</RS.Label>
                        </RS.Form>
                    </RS.Col>}
                </RS.Row>
                <RS.Row>
                    <RS.Col lg={12} className="text-wrap mt-2">
                        <RS.Label htmlFor="question-search-title">Search</RS.Label>
                        <RS.Input id="question-search-title"
                            type="text"
                            placeholder={siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST")}
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setSearchQuery(e.target.value);
                            }}
                        />
                    </RS.Col>
                </RS.Row>
            </RS.CardBody>
        </RS.Card>
        <RS.Card>
            <RS.CardHeader className="finder-header">
                <RS.Col classname={"pr-0"}>
                    <h3>
                        {sortedQuestions ? <RS.Badge color="primary">{sortedQuestions.length}</RS.Badge> : <IsaacSpinner />} Questions Match
                    </h3>
                </RS.Col>
            </RS.CardHeader>
            <Suspense fallback={<Loading/>}>
                <RS.CardBody className={classNames({"p-0 m-0": isAda})}>
                    <ShowLoading until={sortedQuestions}>
                        {[searchQuery, searchTopics, searchBook, searchStages, searchDifficulties, searchExamBoards].every(v => v.length === 0) ?
                            <em>Please select filters</em> :
                            (sortedQuestions ?
                                (sortedQuestions.length > 0 ?
                                    <LinkToContentSummaryList items={sortedQuestions}/> :
                                    <em>No results found</em>) :
                                <em>No results found</em>)
                        }
                    </ShowLoading>
                </RS.CardBody>
            </Suspense>
        </RS.Card>
    </RS.Container>;
});
