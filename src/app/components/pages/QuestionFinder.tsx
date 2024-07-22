import React, { useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    AppState,
    clearQuestionSearch,
    searchQuestions,
    updateCurrentUser,
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
    selectOnChange,
    siteSpecific,
    STAGE,
    useUserViewingContext,
    STAGE_NULL_OPTIONS,
    useQueryParams,
    arrayFromPossibleCsv,
    toSimpleCSV,
    itemiseByValue,
    TAG_ID,
    itemiseTag,
    isLoggedIn,
    SEARCH_RESULTS_PER_PAGE
} from "../../services";
import {ContentSummaryDTO, Difficulty, ExamBoard} from "../../../IsaacApiTypes";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import { RouteComponentProps, useHistory, withRouter } from "react-router";
import { LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { ShowLoading } from "../handlers/ShowLoading";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { MetaDescription } from "../elements/MetaDescription";
import { CanonicalHrefElement } from "../navigation/CanonicalHrefElement";
import { HierarchyFilterHexagonal, Tier, TierID } from "../elements/svg/HierarchyFilter";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import classNames from "classnames";
import queryString from "query-string";
import { PageFragment } from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

const selectStyle = {
    className: "basic-multi-select", classNamePrefix: "select",
    menuPortalTarget: document.body, styles: {menuPortal: (base: object) => ({...base, zIndex: 9999})}
};

function processTagHierarchy(subjects: string[], fields: string[], topics: string[]): Item<TAG_ID>[][] {
    const tagHierarchy = tags.getTagHierarchy();
    const selectionItems: Item<TAG_ID>[][] = [];

    let plausibleParentHeirarchy = true;
    [subjects, fields, topics].forEach((tier, index) => {
        if (tier && plausibleParentHeirarchy) {
            const validTierTags = tags.getSpecifiedTags(
                tagHierarchy[index], tier as TAG_ID[]
            );
            plausibleParentHeirarchy = validTierTags.length === 1;
            selectionItems.push(validTierTags.map(itemiseTag));
        }
    });

    return selectionItems;
}

export const QuestionFinder = withRouter(({location}: RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserViewingContext();
    const params: {[key: string]: string | string[] | undefined} = useQueryParams(false);
    const history = useHistory();
    const eventLog = useRef<object[]>([]).current; // persist state but do not rerender on mutation

    const [searchTopics, setSearchTopics] = useState<string[]>(
        arrayFromPossibleCsv(params.topics)
    );
    const [searchQuery, setSearchQuery] = useState<string>(
        params.query ? (params.query instanceof Array ? params.query[0] : params.query) : ""
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

    const userPreferences = useAppSelector((state: AppState) => state?.userPreferences);
    const [searchBook, setSearchBook] = useState<string[]>(arrayFromPossibleCsv(params.book));
    const [searchFastTrack, setSearchFastTrack] = useState<boolean>(!!params.fasttrack);
    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const subjects = arrayFromPossibleCsv(params.subjects);
    const fields = arrayFromPossibleCsv(params.fields);
    const topics = arrayFromPossibleCsv(params.topics);
    const [selections, setSelections] = useState<Item<TAG_ID>[][]>(
        processTagHierarchy(subjects, fields, topics)
    );

    const [hideCompleted, setHideCompleted] = useState(!!params.hideCompleted);

    const choices = [tags.allSubjectTags.map(itemiseTag)];
    let index;
    for (index = 0; index < selections.length && index < 2; index++)  {
        const selection = selections[index];
        if (selection.length !== 1) break;
        choices.push(tags.getChildren(selection[0].value).map(itemiseTag));
    }

    const tiers: Tier[] = [
        {id: "subjects" as TierID, name: "Subject"},
        {id: "fields" as TierID, name: "Field"},
        {id: "topics" as TierID, name: "Topic"}
    ].map(tier => ({...tier, for: "for_" + tier.id})).slice(0, index + 1);

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

    const {results: questions, totalResults: totalQuestions, nextSearchOffset} = useAppSelector((state: AppState) => state && state.questionSearchResult) || {};
    const user = useAppSelector((state: AppState) => state && state.user);

    const searchDebounce = useCallback(
                            debounce((searchString: string, topics: string[], examBoards: string[], book: string[], stages: string[], difficulties: string[], hierarchySelections: Item<TAG_ID>[][], tiers: Tier[], fasttrack: boolean, hideCompleted: boolean, startIndex: number) => {
            if ([searchString, topics, book, stages, difficulties, examBoards].every(v => v.length === 0) && hierarchySelections.every(v => v.length === 0) && !fasttrack) {
                // Nothing to search for
                dispatch(clearQuestionSearch);
                return;
            }

            const filterParams: Record<TierID, string[] | undefined> = {} as Record<TierID, string[] | undefined>;
            if (isPhy) {
                const allTags: TAG_ID[] = [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology];
                tiers.forEach((tier, i) => {
                    if (!hierarchySelections[i] || hierarchySelections[i].length === 0) {
                        if (i === 0) {
                            filterParams[tier.id] = allTags;
                        }
                        return;
                    }
                    filterParams[tier.id] = hierarchySelections[i].map(item => item.value);
                });
            } else {
                filterParams["topics"] = [...topics].filter((query) => query != "");
            }
            const examBoardString = examBoards.join(",");

            dispatch(searchQuestions({
                searchString: searchString,
                tags: "", // Tags currently not used
                fields: filterParams.fields?.join(",") || undefined,
                subjects: filterParams.subjects?.join(",") || undefined,
                topics: filterParams.topics?.join(",") || undefined,
                books: book.join(",") || undefined,
                stages: stages.join(",") || undefined,
                difficulties: difficulties.join(",") || undefined,
                examBoards: examBoardString,
                fasttrack,
                hideCompleted,
                startIndex,
                limit: SEARCH_RESULTS_PER_PAGE + 1 // request one more than we need, as to know if there are more results
            }));

            logEvent(eventLog,"SEARCH_QUESTIONS", {searchString, topics, examBoards, book, stages, difficulties, fasttrack, startIndex});
        }, 250),
        []
    );

    const setTierSelection = (tierIndex: number) => {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, tierIndex);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    };

    useEffect(() => {
        // If a certain stage excludes a selected examboard remove it from query params
        if (isAda) {
            setSearchExamBoards(
                getFilteredExamBoardOptions({byStages: searchStages})
                    .filter(o => searchExamBoards.includes(o.value))
                    .map(o => o.value)
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchStages]);

    useEffect(() => {
        setPageCount(1);
        setDisableLoadMore(false);
        setDisplayQuestions(undefined);
        searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, selections, tiers, searchFastTrack, hideCompleted, 0);

        const params: {[key: string]: string} = {};
        if (searchStages.length) params.stages = toSimpleCSV(searchStages);
        if (searchDifficulties.length) params.difficulties = toSimpleCSV(searchDifficulties);
        if (searchQuery.length) params.query = encodeURIComponent(searchQuery);
        if (isAda && searchTopics.length) params.topics = toSimpleCSV(searchTopics);
        if (isAda && searchExamBoards.length) params.examBoards = toSimpleCSV(searchExamBoards);
        if (isPhy && searchBook.length) params.book = toSimpleCSV(searchBook);
        if (isPhy && searchFastTrack) params.fasttrack = "set";
        if (hideCompleted) params.hideCompleted = "set";

        if (isPhy) {
            tiers.forEach((tier, i) => {
                if (!selections[i] || selections[i].length === 0) {
                    return;
                }
                params[tier.id] = selections[i].map(item => item.value).join(",");
            });
        }

        history.replace({search: queryString.stringify(params, {encode: false}), state: location.state});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[searchDebounce, searchQuery, searchTopics, searchExamBoards, searchBook, searchFastTrack, searchStages, searchDifficulties, selections, hideCompleted]);

    const questionList = useMemo(() => {
        if (questions) {
            if (questions.length < SEARCH_RESULTS_PER_PAGE + 1) {
                setDisableLoadMore(true);
            } else {
                setDisableLoadMore(false);
            }

            return questions.slice(0, SEARCH_RESULTS_PER_PAGE);
        }
    }, [questions]);

    const [displayQuestions, setDisplayQuestions] = useState<ContentSummaryDTO[] | undefined>(undefined);
    const [pageCount, setPageCount] = useState(1);

    useEffect(() => {
        if (displayQuestions && nextSearchOffset && pageCount > 1) {
            setDisplayQuestions(dqs => [...dqs ?? [], ...questionList ?? []]);
        } else {
            setDisplayQuestions(questionList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionList]);

    const [revisionMode, setRevisionMode] = useState(!!userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS);

    useEffect(() => {
        if (revisionMode) {
            setHideCompleted(false);
        }
    }, [revisionMode]);

    const debouncedRevisionModeUpdate = useCallback(debounce(() => {
        if (user && isLoggedIn(user)) {
            const userToUpdate = {...user, password: null};
            const userPreferencesToUpdate = {
                DISPLAY_SETTING: {...userPreferences?.DISPLAY_SETTING, HIDE_QUESTION_ATTEMPTS: !userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS}
            };
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, undefined, null, user, false));
        }}, 250, {trailing: true}
    ), []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSearch = useCallback(
        debounce((searchTerm: string) => {
            setSearchQuery(searchTerm);
        }, 500),
        [setSearchQuery]
    );

    const pageHelp = <span>
        You can find a question by selecting the areas of interest, stage and difficulties.
        <br/>
        You can select more than one entry in each area.
    </span>;

    const metaDescription = siteSpecific(
        "Find physics, maths, chemistry and biology questions by topic and difficulty.",
        "Search for the perfect computer science questions to study. For revision. For homework. For the classroom."
    );

    const loadingPlaceholder = <div className="w-100 text-center pb-2">
        <h2 aria-hidden="true" className="pt-5">Searching...</h2>
        <IsaacSpinner />
    </div>;

    return <RS.Container id="finder-page" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={"Question Finder"} help={pageHelp}/>
        <MetaDescription description={metaDescription}/>
        <CanonicalHrefElement/>
        <PageFragment fragmentId={"question_finder_intro"} ifNotFound={RenderNothing} />
        <RS.Card id="finder-panel" className="mx-auto mt-4 mb-5">
            <RS.CardBody className={"px-2 py-3 p-sm-4 pb-5"}>
                <RS.Row className={"mb-3"}>
                    <RS.Col>
                        <span>Specify your search criteria and we will find questions related to your chosen filter(s).</span>
                    </RS.Col>
                </RS.Row>
                <RS.Row>
                    <RS.Col lg={6} className={`text-wrap my-2`}>
                        <RS.Label htmlFor="question-search-stage">Stage</RS.Label>
                        <StyledSelect
                            inputId="question-search-stage" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={getFilteredStageOptions().filter(o => searchStages.includes(o.value))}
                            options={getFilteredStageOptions()}
                            onChange={selectOnChange(setSearchStages, true)}
                        />
                    </RS.Col>
                    <RS.Col lg={6} className="text-wrap my-2">
                        <RS.Label htmlFor="question-search-difficulty">Difficulty</RS.Label>
                        <StyledSelect
                            inputId="question-search-difficulty" isClearable isMulti placeholder="Any" {...selectStyle}
                            value={itemiseByValue(searchDifficulties, DIFFICULTY_ICON_ITEM_OPTIONS)}
                            options={DIFFICULTY_ICON_ITEM_OPTIONS}
                            onChange={selectOnChange(setSearchDifficulties, true)}
                        />
                    </RS.Col>
                    {isAda && <RS.Col lg={6} className="text-wrap my-2">
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
                    <RS.Col lg={siteSpecific(9, 12)} className={`text-wrap mt-2`}>
                        <RS.Label htmlFor="question-search-topic">Topic</RS.Label>
                        {siteSpecific(
                            <HierarchyFilterHexagonal {...{tiers, choices, selections: selections, setTierSelection}} />,
                            <StyledSelect
                                inputId="question-search-topic" isMulti placeholder="Any" {...selectStyle}
                                value={itemiseByValue(searchTopics, groupBaseTagOptions.flatMap(tag => tag.options))}
                                options={groupBaseTagOptions} onChange={(x : readonly Item<string>[], {action: _action}) => {
                                    selectOnChange(setSearchTopics, true)(x);
                                }}
                            />
                        )}
                    </RS.Col>
                </RS.Row>
                <RS.Row>
                    {isPhy && <RS.Col lg={12} className="text-wrap my-2">
                        <RS.Label htmlFor="question-search-book">Book</RS.Label>
                        <StyledSelect
                            inputId="question-search-book" isClearable placeholder="None" {...selectStyle}
                            value={itemiseByValue(searchBook, bookOptions)}
                            onChange={(e) => {
                                selectOnChange(setSearchBook, true)(e);
                            }}
                            options={bookOptions}
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
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </RS.Col>
                </RS.Row>

                {user && isLoggedIn(user) && <RS.Row>
                    <RS.Form>
                        <RS.Col className="mt-4">
                            <div className="d-flex">
                                <StyledCheckbox
                                    checked={revisionMode}
                                    onChange={() => {
                                        setRevisionMode(r => !r);
                                        debouncedRevisionModeUpdate();
                                    }}
                                    label={<p>Revision mode</p>}
                                />
                                <span id="revision-mode-checkbox" className="icon-help"/>
                                <RS.UncontrolledTooltip target="revision-mode-checkbox" placement="top" autohide={false}>
                                    Revision mode hides your previous answers, so you can practice questions that you have answered before.
                                </RS.UncontrolledTooltip>
                            </div>
                            <div className="d-flex">
                                <StyledCheckbox
                                    checked={hideCompleted}
                                    onChange={() => setHideCompleted(h => !h)}
                                    label={<p>Hide completed questions</p>}
                                    disabled={revisionMode}
                                />
                            </div>
                        </RS.Col>
                    </RS.Form>
                </RS.Row>}
            </RS.CardBody>
        </RS.Card>
        <RS.Card>
            <RS.CardHeader className="finder-header">
                <RS.Col className={"pe-0"}>
                    <h3>
                        Results
                    </h3>
                </RS.Col>
            </RS.CardHeader>
            <RS.CardBody className={classNames({"p-0 m-0": isAda && displayQuestions?.length})}>
                <ShowLoading until={displayQuestions} placeholder={loadingPlaceholder}>
                    {[searchQuery, searchTopics, searchBook, searchStages, searchDifficulties, searchExamBoards].every(v => v.length === 0) &&
                     selections.every(v => v.length === 0) ?
                        <em>Please select filters</em> :
                        (displayQuestions?.length ?
                            <>
                                <LinkToContentSummaryList items={displayQuestions.map(q => ({...q, correct: revisionMode ? undefined : q.correct}) as ContentSummaryDTO)}/>
                                <RS.Row>
                                    <RS.Col className="d-flex justify-content-center mb-3">
                                        <RS.Button
                                            onClick={() => {
                                                searchDebounce(searchQuery, searchTopics, searchExamBoards, searchBook, searchStages, searchDifficulties, selections, tiers, searchFastTrack, hideCompleted, nextSearchOffset ? nextSearchOffset - 1 : 0);
                                                setPageCount(c => c + 1);
                                                setDisableLoadMore(true);
                                            }}
                                            disabled={disableLoadMore}
                                        >
                                            Load more
                                        </RS.Button>
                                    </RS.Col>
                                </RS.Row>
                                {displayQuestions && (totalQuestions ?? 0) > displayQuestions.length &&
                                <div role="status" className={"alert alert-light border"}>
                                        {`${totalQuestions} questions match your criteria.`}<br/>
                                        Not found what you&apos;re looking for? Try refining your search filters.
                                </div>}
                            </> :
                            <em>No results found</em>)
                    }
                </ShowLoading>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
});
