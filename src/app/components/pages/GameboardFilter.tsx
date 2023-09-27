import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    AppState,
    extractDataFromQueryResponse,
    fetchConcepts,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector,
    useGenerateTemporaryGameboardMutation,
    useLazyGetGameboardByIdQuery
} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link, RouteComponentProps, useHistory, withRouter} from "react-router-dom";
import {
    DIFFICULTY_ICON_ITEM_OPTIONS,
    DIFFICULTY_ITEM_OPTIONS,
    getFilteredExamBoardOptions,
    getFilteredStageOptions,
    groupTagSelectionsByParent,
    isAda,
    isDefined,
    isFound,
    isItemEqual,
    isPhy,
    Item,
    NOT_FOUND, PATHS,
    QUESTION_CATEGORY,
    QUESTION_CATEGORY_ITEM_OPTIONS,
    QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER,
    selectOnChange,
    siteSpecific,
    STAGE,
    TAG_ID,
    tags,
    useDeviceSize,
    useUserContext
} from "../../services";
import {NOT_FOUND_TYPE, Tag} from "../../../IsaacAppTypes";
import {GameboardViewer, GameboardViewerInner} from './Gameboard';
import {ShowLoading} from "../handlers/ShowLoading";
import queryString from "query-string";
import {HierarchyFilterHexagonal, HierarchyFilterSummary, Tier} from "../elements/svg/HierarchyFilter";
import {GroupBase} from "react-select";
import {DifficultyFilter} from "../elements/svg/DifficultyFilter";
import {ContentSummaryDTO, GameboardDTO} from "../../../IsaacApiTypes";
import debounce from "lodash/debounce";
import {History} from "history";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import {
    Col,
    Row,
    Input,
    Button,
    Alert,
    Container,
    Card,
    Label,
    UncontrolledTooltip,
    CardFooter,
    CardBody,
    CustomInput
} from "reactstrap";
import {StyledSelect} from "../elements/inputs/StyledSelect";

function itemiseByValue<R extends {value: string}>(values: string[], options: R[]) {
    return options.filter(option => values.includes(option.value));
}
function itemiseTag(tag: Tag) {
    return {value: tag.id, label: tag.title};
}

function itemiseConcepts(concepts: string[]): Item<string>[] {
    return concepts
        .filter(concept => concept !== "")
        .map(concept => ({label: QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER, value: concept}));
}

function toCSV<T>(items: Item<T>[]) {
    return items.map(item => item.value).join(",");
}

function arrayFromPossibleCsv(queryParamValue: string[] | string | null | undefined) {
    if (queryParamValue) {
        return queryParamValue instanceof Array ? queryParamValue : queryParamValue.split(",");
    } else {
        return [];
    }
}

interface QueryStringResponse {
    querySelections: Item<TAG_ID>[][];
    queryStages: Item<string>[];
    queryDifficulties: Item<string>[];
    queryQuestionCategories: Item<string>[];
    queryConcepts: Item<string>[];
    queryExamBoards: Item<string>[];
}
function processQueryString(query: string): QueryStringResponse {
    const {subjects, fields, topics, stages, difficulties, questionCategories, concepts, examBoards} = queryString.parse(query);
    const tagHierarchy = tags.getTagHierarchy();

    const stageItems = itemiseByValue(arrayFromPossibleCsv(stages as Nullable<string[] | string>), getFilteredStageOptions());
    const difficultyItems = itemiseByValue(arrayFromPossibleCsv(difficulties as Nullable<string[] | string>), siteSpecific(DIFFICULTY_ITEM_OPTIONS, DIFFICULTY_ICON_ITEM_OPTIONS));
    const examBoardItems = itemiseByValue(arrayFromPossibleCsv(examBoards as Nullable<string[] | string>), getFilteredExamBoardOptions({byStages: stageItems.map(item => item.value as STAGE)}));
    const questionCategoryItems = itemiseByValue(arrayFromPossibleCsv(questionCategories as Nullable<string[] | string>), QUESTION_CATEGORY_ITEM_OPTIONS);
    const conceptItems = itemiseConcepts(arrayFromPossibleCsv(concepts as Nullable<string[] | string>));

    const selectionItems: Item<TAG_ID>[][] = [];
    if (isPhy) {
        let plausibleParentHierarchy = true;
        [subjects, fields, topics].forEach((tier, index) => {
            if (tier && plausibleParentHierarchy) {
                const validTierTags = tags
                    .getSpecifiedTags(tagHierarchy[index], (tier instanceof Array ? tier : tier.split(",")) as TAG_ID[]);
                // Only allow another layer of specificity if only one parent is selected
                plausibleParentHierarchy = validTierTags.length === 1;
                selectionItems.push(validTierTags.map(itemiseTag));
            }
        });
    } else {
        // On CS, the query params do not contain subject and field tag ids, so we set subject to "computer_science" and
        // populate field tags based on selected topics
        selectionItems.push([itemiseTag(tags.getById(TAG_ID.computerScience))]);
        const topicTags = topics ? tags.getSpecifiedTags(tagHierarchy[2], (topics instanceof Array ? topics : topics.split(",")) as TAG_ID[]) : null;
        const fieldTags = topicTags && Array.from(new Set(topicTags.map(tag => tag.parent).filter(isDefined))).map(tagId => itemiseTag(tags.getById(tagId)));
        if (fieldTags) selectionItems.push(fieldTags);
        if (topicTags) selectionItems.push(topicTags.map(itemiseTag));
    }

    return {
        querySelections: selectionItems, queryStages: stageItems, queryDifficulties: difficultyItems, queryQuestionCategories: questionCategoryItems, queryConcepts: conceptItems, queryExamBoards: examBoardItems
    };
}

function generatePhyBoardName(selections: Item<TAG_ID>[][]) {
    if (selections.length === 1) {
        const numberOfSubjects = selections[0].length;
        if (numberOfSubjects === 0 || numberOfSubjects === 4) {
            return "All Subjects";
        }
        // Generates a name for a set of subjects, for example ["Physics", "Maths", "Biology"] ---> "Physics, Maths and Biology"
        return selections[0].reduce((acc, t, i) => acc + t.label + (numberOfSubjects !== i + 1 ? ((numberOfSubjects - (i + 2)) > 0 ? ", " : " and ") : ""), "");
    }
    let selectionIndex = selections.length;
    while(selectionIndex-- > 0) {
        if (selections[selectionIndex].length === 1) {
            return selections[selectionIndex][0].label;
        }
    }
    return "All Subjects";
}

function generateCSBoardName(selections: Item<TAG_ID>[][]) {
    let selectionIndex = selections.length;
    while(selectionIndex-- > 0) {
        if (selections[selectionIndex].length > 0 && selections[selectionIndex].length <= 2) {
            return selections[selectionIndex].map(s => s.label).join(" & ");
        }
    }
    return "Computer Science";
}

function stripSoftHyphens(input: string): string {
    return input.replace(/\u00AD/g, "");
}

// Shared props that both PHY and CS question filters use
interface FilterProps {
    selections : Item<TAG_ID>[][];
    setSelections : React.Dispatch<React.SetStateAction<Item<TAG_ID>[][]>>;
    stages : Item<string>[];
    setStages : React.Dispatch<React.SetStateAction<Item<string>[]>>;
    difficulties : Item<string>[];
    setDifficulties : React.Dispatch<React.SetStateAction<Item<string>[]>>;
    scrollToQuestions: () => void;
    previousBoard?: () => void;
    refresh: () => void;
}

interface PhysicsFilterProps extends FilterProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    showBookQuestions : boolean;
    setShowBookQuestions : React.Dispatch<React.SetStateAction<boolean>>;
}
const PhysicsFilter = ({tiers, choices, showBookQuestions, setShowBookQuestions, selections, setSelections, stages, setStages, difficulties, setDifficulties, refresh, scrollToQuestions, previousBoard} : PhysicsFilterProps) => {

    function setTierSelection(tierIndex: number) {
        return ((values: Item<TAG_ID>[]) => {
            const newSelections = selections.slice(0, tierIndex);
            newSelections.push(values);
            setSelections(newSelections);
        }) as React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
    }

    const deviceSize = useDeviceSize();
    const [filterExpanded, setFilterExpanded] = useState(deviceSize != "xs");

    return <Card id="filter-panel" className="mt-4 px-2 py-3 p-sm-4 pb-5">
        <Row>
            <Col sm={8} lg={9}>
                <button className="bg-transparent w-100 p-0" onClick={() => setFilterExpanded(!filterExpanded)}>
                    <Row>
                        <Col lg={6} className="mt-3 mt-lg-0">
                            <Label className="d-block text-left d-sm-flex mb-0 pointer-cursor">
                                <span>Topics:</span>
                                <span><HierarchyFilterSummary {...{tiers, choices, selections}} /></span>
                            </Label>
                        </Col>
                    </Row>
                </button>
            </Col>
            <Col sm={4} lg={3} className={`text-center mt-3 mb-4 m-sm-0`}>
                {filterExpanded ?
                    <Button color={"link"} block className="filter-action" onClick={scrollToQuestions}>
                        Scroll to questions...
                    </Button>
                    :
                    <Button color={"link"} className="filter-action" onClick={() => setFilterExpanded(true)}>
                        Edit question filters
                    </Button>
                }
            </Col>
        </Row>

        {filterExpanded && <>
            <Row className="mb-sm-4">
                <Col xs={12}>
                    <div className="mb-1"><strong>Click these buttons to choose your question gameboard</strong></div>
                </Col>
                <Col lg={4}>
                    <div>
                        <Label className={`mt-2 mt-lg-0`} htmlFor="stage-selector">
                            I am interested in stage...
                            <span id={`stage-help-tooltip`} className="icon-help ml-1" />
                            <UncontrolledTooltip target={`stage-help-tooltip`} placement="bottom">
                                {"Find questions that are suitable for this stage of school learning."} <br />
                                {"Further\u00A0A covers Further\u00A0Maths concepts or topics a little beyond some A\u00A0Level syllabuses."}
                            </UncontrolledTooltip>
                        </Label>
                        <StyledSelect id="stage-selector" onChange={selectOnChange(setStages, false)} value={stages} options={getFilteredStageOptions()} />
                    </div>
                    <div>
                        <Label className={`mt-2  mt-lg-3`} htmlFor="difficulty-selector">
                            I would like questions for...
                            <span id={`difficulty-help-tooltip`} className="icon-help ml-1" />
                            <UncontrolledTooltip target={`difficulty-help-tooltip`} placement="bottom" >
                                Practice questions let you directly apply one idea -<br />
                                P1 covers revision of a previous stage or topics near the beginning of a course,<br />
                                P3 covers later topics.<br />
                                Challenge questions are solved by combining multiple concepts and creativity.<br />
                                C1 can be attempted near the beginning of your course,<br />
                                C3 require more creativity and could be attempted later in a course.
                            </UncontrolledTooltip>
                        </Label>
                        <DifficultyFilter difficultyOptions={DIFFICULTY_ITEM_OPTIONS} difficulties={difficulties} setDifficulties={setDifficulties} />
                        {/*<StyledSelect id="difficulty-selector" onChange={selectOnChange(setDifficulties, false)} isClearable isMulti value={difficulties} options={DIFFICULTY_ITEM_OPTIONS} />*/}
                    </div>
                </Col>
                <Col lg={8}>
                    <Label className={`mt-4 mt-lg-0`}>
                        Topics:
                    </Label>
                    <HierarchyFilterHexagonal {...{tiers, choices, selections, setTierSelection}} />
                </Col>
            </Row>

            <Col className="mt-2">
                <CustomInput
                    type="checkbox"
                    id="show-book-questions-checkbox"
                    label="Include Isaac book questions"
                    checked={showBookQuestions}
                    onChange={() => {setShowBookQuestions(!showBookQuestions);}}
                />
            </Col>
        
            {/* Buttons */}
            <Row className="mt-4">
                <Col>
                    {previousBoard && <Button size="sm" color="primary" outline onClick={previousBoard}>
                        <span className="d-md-inline d-none">Undo Shuffle</span> &#9100;
                    </Button>}
                </Col>
                <Col className="text-right">
                    <Button size="sm" color="primary" outline onClick={refresh}>
                        <span className="d-md-inline d-none">Shuffle Questions</span> ⟳
                    </Button>
                </Col>
            </Row>
        </>}
        <Button color="link" className="filter-go-to-questions" onClick={scrollToQuestions}>
            Go to Questions...
        </Button>
        <Button
            color="link" id="expand-filter-button" onClick={() => setFilterExpanded(!filterExpanded)}
            className={filterExpanded ? "open" : ""} aria-label={filterExpanded ? "Collapse Filter" : "Expand Filter"}
        />
    </Card>;
};

// Takes a list of "raw" concepts, and returns a map which takes a tag Item, and gives a GroupedOptionsType<Item<string>> containing itemised concepts which relate to that tag
const itemiseAndGroupConceptsByTag = (conceptDTOs : ContentSummaryDTO[]) => ((tag : Item<TAG_ID>) => {
    return {
        label: tag.label,
        options: conceptDTOs.reduce((acc : Item<string>[], dto) =>
            (dto.tags?.includes(tag.value) && dto.id && dto.title)
                ? [...acc, {value: dto.id, label: dto.title}]
                : acc,
            [])
    };
});
interface CSFilterProps extends FilterProps {
    examBoards : Item<string>[];
    setExamBoards : React.Dispatch<React.SetStateAction<Item<string>[]>>;
    concepts : Item<string>[];
    setConcepts : React.Dispatch<React.SetStateAction<Item<string>[]>>;
}
const CSFilter = ({selections, setSelections, stages, setStages, difficulties, setDifficulties, examBoards, setExamBoards, concepts, setConcepts, previousBoard, scrollToQuestions, refresh} : CSFilterProps) => {
    const dispatch = useAppDispatch();

    const topicChoices = tags.allSubcategoryTags.map(groupTagSelectionsByParent);
    const conceptDTOs = useAppSelector((state: AppState) => selections[2]?.length > 0 ? state?.concepts?.results : undefined);
    const [conceptChoices, setConceptChoices] = useState<GroupBase<Item<string>>[]>([]);

    const selectedTopics = selections[2];
    useEffect(() => {
        if (selectedTopics) {
            dispatch(fetchConcepts(undefined, toCSV(selectedTopics)));
        }
    }, [dispatch, selectedTopics]);
    useEffect(function updateConceptChoices() {
        const newChoices = selectedTopics?.map(itemiseAndGroupConceptsByTag(conceptDTOs ?? [])) ?? [];
        setConceptChoices(newChoices);
        const availableConcepts = newChoices.flatMap(c => c.options);
        if (availableConcepts.length > 0) {
            const conceptsFilteredByAvailable = concepts.filter(c => availableConcepts.find(ac => isItemEqual(Object.is, ac, c)) !== undefined);
            if (concepts.filter(c => c.label === QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER).length > 0) {
                setConcepts(concepts.reduce((acc: Item<string>[], c) => {
                    const newLabel = availableConcepts.find(ac => ac.value === c.value)?.label;
                    return newLabel ? acc.concat([{value: c.value, label: newLabel}]) : acc;
                }, []));
            } else if (conceptsFilteredByAvailable.length !== concepts.length) {
                setConcepts(conceptsFilteredByAvailable);
            }
        }
    }, [conceptDTOs, concepts]);

    function setTierSelection(topics: Item<TAG_ID>[]) {
        let strands : Set<Tag> = new Set();
        topics.forEach(t => {
            const parent = tags.getById(t.value).parent;
            if (parent) {
                strands = strands.add(tags.getById(parent));
            }
        });
        // Selections always have all 3 tiers in CS
        setSelections([[itemiseTag(tags.getById(TAG_ID.computerScience))], Array.from(strands).map(itemiseTag), topics]);
    }

    return <Card id="filter-panel" className="mx-auto mt-4 mb-5">
        <CardBody className={"px-2 py-3 p-sm-4 pb-5"}>
            <Row className={"mb-3"}>
                <Col>
                    <span>Specify your search criteria and we will generate a random selection of up to 10 questions for your chosen filter(s). Shuffle the questions to get a new random selection.</span>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Label className={`mt-2 mt-lg-0`} htmlFor="stage-selector">
                        I am interested in stage...
                        <span id={`stage-help-tooltip`} className="icon-help ml-1" />
                        <UncontrolledTooltip target={`stage-help-tooltip`} placement="bottom">
                            Find questions that are suitable for this stage of learning.
                        </UncontrolledTooltip>
                    </Label>
                    <StyledSelect id="stage-selector" onChange={selectOnChange(setStages, false)} value={stages} options={getFilteredStageOptions({includeNullOptions: isAda})} />
                </Col>
                <Col md={6}>
                    <Label className={`mt-2 mt-lg-0`} htmlFor="exam-boards">
                        and exam board...
                    </Label>
                    <StyledSelect
                        inputId="exam-boards" isClearable placeholder="Any"
                        value={examBoards}
                        options={getFilteredExamBoardOptions({byStages: stages.map(item => item.value as STAGE)})}
                        onChange={selectOnChange(setExamBoards, false)}
                    />
                </Col>
            </Row>
            <Row className="mt-lg-3 mb-sm-3">
                <Col md={6}>
                    <Label className={`mt-2 mt-lg-0`} htmlFor="difficulty-selector">
                        with difficulty levels...
                        <span id={`difficulty-help-tooltip`} className="icon-help ml-1" />
                        <UncontrolledTooltip target={`difficulty-help-tooltip`} placement="bottom" >
                            Practice questions require you to directly apply a single concept:<br/>
                            P1 questions cover a single foundation concept.<br/>
                            P2 questions cover a single progression concept.<br/>
                            Challenge questions require you to apply multiple concepts:<br/>
                            C1 questions cover more than one foundation concept.<br/>
                            C2 questions cover more than one concept which must be selected and combined with skill.
                        </UncontrolledTooltip>
                    </Label>
                    <StyledSelect
                        id="difficulty-selector" isClearable isMulti
                        options={DIFFICULTY_ICON_ITEM_OPTIONS}
                        value={difficulties}
                        onChange={selectOnChange(setDifficulties, false)}
                        placeholder={"All difficulties"}
                    />
                </Col>
                <Col md={6}>
                    <Label className={`mt-2 mt-lg-0`} htmlFor="question-search-topic">from topics...</Label>
                    <StyledSelect
                        inputId="question-search-topic" isMulti isClearable placeholder="Any" value={selections[2]}
                        options={topicChoices} onChange={(v, _) => {
                        if ((Array.isArray(v) && v.length === 0) || v === null) {
                            setConcepts([]);
                        }
                        return selectOnChange(setTierSelection, false)(v);
                    }}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Label className={`mt-2 mt-lg-0`} htmlFor="concepts">and concepts...</Label>
                    {concepts?.filter(c => c.label === QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER).length === 0 ?
                        <StyledSelect
                            inputId="concepts" isMulti isClearable isDisabled={!(selectedTopics && selectedTopics.length > 0)}
                            placeholder={selectedTopics?.length > 0 ? "Any" : "Please select one or more topics"}
                            value={concepts} options={conceptChoices} onChange={selectOnChange(setConcepts, false)}
                        /> :
                        <IsaacSpinner/>}
                </Col>
            </Row>

            {/* Buttons */}
            <Row className={"mt-4"}>
                <Col>
                    {previousBoard && <Button size="sm" color="secondary" outline onClick={previousBoard}>
                        <span className="d-md-inline d-none">Undo Shuffle</span> <span className={"font-size-1-25 d-inline-block"}>&#9100;</span>
                    </Button>}
                </Col>
                <Col className="text-right">
                    <Button size="sm" color="secondary" outline onClick={refresh}>
                        <span className="d-md-inline d-none">Shuffle Questions</span> <span className={"font-size-1-25 d-inline-block"}>⟳</span>
                    </Button>
                </Col>
            </Row>
        </CardBody>

        <CardFooter tag={Button} color="secondary" className="w-100" onClick={scrollToQuestions}>
            Scroll straight to questions<img className={"ml-3"} src={"/assets/chevron_down_white.svg"} alt=""/>
        </CardFooter>
    </Card>;
};

export const GameboardFilter = withRouter(({location}: RouteComponentProps) => {
    const userContext = useUserContext();
    const {querySelections, queryStages, queryDifficulties, queryConcepts, queryExamBoards} = processQueryString(location.search);

    const history = useHistory();

    const [gameboard, setGameboard] = useState<GameboardDTO | NOT_FOUND_TYPE | null | undefined>();
    const gameboardIdAnchor = location.hash ? location.hash.slice(1) : null;
    const [ generateTemporaryGameboard ] = useGenerateTemporaryGameboardMutation();
    const [ loadGameboard ] = useLazyGetGameboardByIdQuery();

    useEffect(() => {
        if (isFound(gameboard) && gameboard.id !== gameboardIdAnchor) {
            history.replace({search: location.search, hash: gameboard.id});
        } else if (gameboardIdAnchor && gameboard === NOT_FOUND) {
            // A request returning "gameboard not found" should clear the gameboard.id from the url hash anchor
            history.replace({search: location.search});
        }
    }, [gameboard, gameboardIdAnchor]);

    const gameboardRef = useRef<HTMLDivElement>(null);

    const [selections, setSelections] = useState<Item<TAG_ID>[][]>(querySelections);

    const choices = [tags.allSubjectTags.map(itemiseTag)];
    let i;
    if (isPhy) {
        for (i = 0; i < selections.length && i < 2; i++) {
            const selection = selections[i];
            if (selection.length !== 1) break;
            choices.push(tags.getChildren(selection[0].value).map(itemiseTag));
        }
    } else {
        i = 2;
    }

    const tiers: Tier[] = siteSpecific([
            {id: "subjects", name: "Subject"},
            {id: "fields", name: "Field"},
            {id: "topics", name: "Topic"},
        ],
        [
            {id: "subjects", name: "Category"},
            {id: "fields", name: "Strand"},
            {id: "topics", name: "Topic"},
        ]).map(tier => ({...tier, for: "for_" + tier.id})).slice(0, i + 1);

    const [stages, setStages] = useState<Item<string>[]>(
        queryStages.length > 0 ? queryStages : itemiseByValue([userContext.stage], getFilteredStageOptions()));
    useEffect(function keepStagesInSyncWithUserContext() {
        if (stages.length === 0) setStages(itemiseByValue([userContext.stage], getFilteredStageOptions()));
    }, [userContext.stage]);

    const [difficulties, setDifficulties] = useState<Item<string>[]>(queryDifficulties);
    const [showBookQuestions, setShowBookQuestions] = useState<boolean>(true);

    // const [questionCategories, setQuestionCategories] = useState<Item<string>[]>(queryQuestionCategories);

    const [examBoards, setExamBoards] = useState<Item<string>[]>(
        queryExamBoards.length > 0 ? queryExamBoards : itemiseByValue([userContext.examBoard], getFilteredExamBoardOptions({byStages: stages.map(item => item.value as STAGE)})));
    useEffect(function keepExamBoardsInSyncWithUserContext() {
        if (examBoards.length === 0) setExamBoards(itemiseByValue([userContext.examBoard], getFilteredExamBoardOptions({byStages: stages.map(item => item.value as STAGE)})));
    }, [userContext.examBoard]);

    const [concepts, setConcepts] = useState<Item<string>[]>(queryConcepts);

    const [boardStack, setBoardStack] = useState<string[]>([]);

    // Title changing states and logic
    const [customBoardTitle, setCustomBoardTitle] = useState<string>();
    const [pendingCustomBoardTitle, setPendingCustomBoardTitle] = useState<string>();
    const defaultBoardTitle = stripSoftHyphens(siteSpecific(generatePhyBoardName, generateCSBoardName)(selections));
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

    function loadNewGameboard(stages: Item<string>[], difficulties: Item<string>[], concepts: Item<string>[],
                              examBoards: Item<string>[], selections: Item<TAG_ID>[][], boardTitle: string,
                              history: History) {
        // Load a gameboard
        const params: {[key: string]: string} = {};
        if (stages.length) params.stages = stages.find(s => s.value === STAGE.ALL) ? "" : toCSV(stages);
        if (difficulties.length) params.difficulties = toCSV(difficulties);
        if (concepts.length) params.concepts = toCSV(concepts);
        if (isAda && examBoards.length) params.examBoards = toCSV(examBoards);
        if (isPhy) {params.questionCategories = `${QUESTION_CATEGORY.QUICK_QUIZ},${QUESTION_CATEGORY.PROBLEM_SOLVING}${showBookQuestions ? "," + QUESTION_CATEGORY.BOOK_QUESTIONS : ""}`;}
        params.title = boardTitle;

        // Populate query parameters with the selected subjects, fields, and topics
        tiers.forEach((tier, i) => {
            if (!selections[i] || selections[i].length === 0) {
                if (i === 0) {
                    params[tier.id] = siteSpecific(
                        TAG_ID.physics + "," + TAG_ID.maths + "," + TAG_ID.chemistry + "," + TAG_ID.biology,
                        TAG_ID.computerScience
                    );
                }
                return;
            }
            params[tier.id] = toCSV(selections[i]);
        });

        generateTemporaryGameboard(params).then(extractDataFromQueryResponse).then((gameboard) => {
            setGameboard(gameboard);
            // Don't add subject and strands to CS URL
            if (isAda) {
                if (tiers[0]?.id) delete params[tiers[0].id];
                if (tiers[1]?.id) delete params[tiers[1].id];
            }
            delete params.questionCategories;
            history.replace({search: queryString.stringify(params, {encode: false})});
        });
    }

    // This is a leading debounced version of loadNewGameboard, used with the shuffle questions button - this stops
    // users from spamming the generateTemporaryGameboard endpoint by clicking the button fast
    const debouncedLeadingLoadGameboard = useCallback(debounce(loadNewGameboard, 200, {leading: true, trailing: false}),
        [selections, stages, difficulties, concepts, examBoards, showBookQuestions]);

    useEffect(() => {
        if (gameboardIdAnchor && (!isFound(gameboard) || gameboardIdAnchor !== gameboard.id)) {
            const newBoardPromise = loadGameboard(gameboardIdAnchor, true);
            newBoardPromise.then(extractDataFromQueryResponse).then(setGameboard);
        } else {
            setBoardStack([]);
            loadNewGameboard(stages, difficulties, concepts, examBoards, selections, customBoardTitle ?? defaultBoardTitle, history);
        }
    }, [selections, stages, difficulties, concepts, examBoards, showBookQuestions]);

    function refresh() {
        if (isFound(gameboard)) {
            if (!boardStack.includes(gameboard.id as string)) {
                boardStack.push(gameboard.id as string);
                setBoardStack(boardStack);
            }
            debouncedLeadingLoadGameboard(stages, difficulties, concepts, examBoards, selections, customBoardTitle ?? defaultBoardTitle, history);
        }
    }

    function previousBoard() {
        if (boardStack.length > 0) {
            const oldBoardId = boardStack.pop() as string;
            setBoardStack(boardStack);
            const newBoardPromise = loadGameboard(oldBoardId, true);
            newBoardPromise.then(extractDataFromQueryResponse).then(setGameboard);
        }
    }

    const pageHelp = <span>
        You can build a {siteSpecific("gameboard", "quiz")} by selecting the areas of interest, stage and difficulties.
        <br />
        You can select more than one entry in each area.
    </span>;

    function scrollToQuestions() {
        if (gameboardRef.current) {
            gameboardRef.current.scrollIntoView({behavior: "smooth"});
        }
    }

    // Shared props that both PHY and CS filters use
    const filterProps : FilterProps = {
        difficulties,
        setDifficulties,
        selections,
        setSelections,
        stages,
        setStages,
        previousBoard: boardStack.length > 0 ? previousBoard : undefined,
        scrollToQuestions,
        refresh
    };

    const metaDescriptionCS = "Search for the perfect computer science questions to study. For revision. For homework. For the classroom.";

    return <Container id="gameboard-generator" className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Choose your Questions", "Question Finder")} help={pageHelp} modalId="gameboard_filter_help"/>
        {isAda && <MetaDescription description={metaDescriptionCS} />}
        <CanonicalHrefElement />

        {/* The site-specific question filtering UI */}
        {siteSpecific(
            <PhysicsFilter {...filterProps} tiers={tiers} choices={choices} showBookQuestions={showBookQuestions} setShowBookQuestions={setShowBookQuestions}/>,
            <CSFilter
                {...filterProps}
                examBoards={examBoards} setExamBoards={setExamBoards}
                concepts={concepts} setConcepts={setConcepts}
            />
        )}

        <div id={"gameboard-section"}>
            {isFound(gameboard) && <div className={classNames({"p-4": isAda, "mt-4 mb-3": isPhy})}>
                <div id={"gameboard-title-section"} className={"row"} ref={gameboardRef}>
                    {siteSpecific(
                        // PHY
                        <Col xs={12} lg={"auto"} >
                            <h3>{defaultBoardTitle}</h3>
                        </Col>,
                        // CS
                        <>
                            <Col xs={12} lg={"auto"} >
                                {isEditingTitle
                                    ? <Input defaultValue={customBoardTitle ?? gameboard?.title}
                                                onChange={e => setPendingCustomBoardTitle(e.target.value)}
                                                className={"mb-2 mb-lg-0"} />
                                    : <h3>{customBoardTitle ?? gameboard?.title}</h3>
                                }
                            </Col>
                            <Col xs={12} sm={isEditingTitle ? 7 : 4} lg={isEditingTitle ? 4 : 2}>
                                {isEditingTitle ? <>
                                        <Button className={"mb-n2"} size={"sm"} color="link" onClick={() => {
                                            setIsEditingTitle(false);
                                            // Only save the title if the input element changed it
                                            if (pendingCustomBoardTitle) {
                                                setCustomBoardTitle(pendingCustomBoardTitle);
                                            }
                                        }}>
                                            Save title
                                        </Button>
                                        <Button size={"sm"} color="link" className={"ml-2 mb-n2"} onClick={() => setIsEditingTitle(false)}>
                                            Cancel
                                        </Button>
                                    </> :
                                    <Button className={"mb-n2"} size={"sm"} color="link" onClick={() => {
                                        setIsEditingTitle(true);
                                        setPendingCustomBoardTitle(undefined);
                                    }}>
                                        Edit title
                                    </Button>}
                            </Col>
                        </>
                    )}
                    <Col xs={8} lg={"auto"} className="ml-auto text-right">
                        <Button size={siteSpecific("md", "sm")} tag={Link} color="secondary"
                                   to={`${PATHS.ADD_GAMEBOARD}/${gameboard.id}/${customBoardTitle ?? gameboard.title}`}
                                   onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)}
                        >
                            {siteSpecific(<>Save to My&nbsp;Gameboards</>, "Save to my quizzes")}
                        </Button>
                    </Col>
                </div>
                {isAda && <hr/>}
            </div>}

            <div className={classNames({"pb-4": isPhy})}>
                <ShowLoading
                    until={gameboard}
                    thenRender={gameboard  => siteSpecific(
                        <GameboardViewer gameboard={gameboard} />,
                        <GameboardViewerInner gameboard={gameboard}/>
                    )}
                    ifNotFound={<Alert color="warning">No questions found matching the criteria.</Alert>}
                />
            </div>
        </div>

    </Container>;
});
