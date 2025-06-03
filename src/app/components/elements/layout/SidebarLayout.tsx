import React, { ChangeEvent, Dispatch, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Col, ColProps, RowProps, Input, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Form, Label } from "reactstrap";
import partition from "lodash/partition";
import classNames from "classnames";
import { AssignmentDTO, ContentSummaryDTO, GameboardDTO, GameboardItem, IsaacBookIndexPageDTO, IsaacConceptPageDTO, QuestionDTO, QuizAssignmentDTO, QuizAttemptDTO, RegisteredUserDTO, Stage } from "../../../../IsaacApiTypes";
import { above, ACCOUNT_TAB, ACCOUNT_TABS, AUDIENCE_DISPLAY_FIELDS, below, BOARD_ORDER_NAMES, BoardCompletions, BoardCreators, BoardLimit, BoardSubjects, BoardViews, confirmThen, determineAudienceViews, EventStageMap,
    EventStatusFilter, EventTypeFilter, filterAssignmentsByStatus, filterAudienceViewsByProperties, getDistinctAssignmentGroups, getDistinctAssignmentSetters, getHumanContext, getThemeFromContextAndTags, HUMAN_STAGES,
    ifKeyIsEnter, isAda, isDefined, PHY_NAV_SUBJECTS, isTeacherOrAbove, QuizStatus, siteSpecific, TAG_ID, tags, STAGE, useDeviceSize, LearningStage, HUMAN_SUBJECTS, ArrayElement, isFullyDefinedContext, isSingleStageContext,
    Item, stageLabelMap, extractTeacherName, determineGameboardSubjects, PATHS, getQuestionPlaceholder, getFilteredStageOptions, 
    isPhy,
    ISAAC_BOOKS,
    BookHiddenState, TAG_LEVEL} from "../../../services";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { mainContentIdSlice, selectors, useAppDispatch, useAppSelector, useGetQuizAssignmentsAssignedToMeQuery } from "../../../state";
import { Link, useHistory, useLocation } from "react-router-dom";
import { AppGroup, AssignmentBoardOrder, PageContextState, MyAssignmentsOrder, Tag, ContentSidebarContext } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";
import { QuestionFinderFilterPanel, QuestionFinderFilterPanelProps } from "../panels/QuestionFinderFilterPanel";
import { AssignmentState } from "../../pages/MyAssignments";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { Spacer } from "../Spacer";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { GroupSelector } from "../../pages/Groups";
import { QuizRubricButton, QuizView, SectionProgress } from "../quiz/QuizContentsComponent";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { formatISODateOnly, getFriendlyDaysUntil } from "../DateString";
import queryString from "query-string";
import { EventsPageQueryParams } from "../../pages/Events";
import { StyledDropdown } from "../inputs/DropdownInput";
import { StyledSelect } from "../inputs/StyledSelect";
import { CollapsibleList } from "../CollapsibleList";
import { extendUrl } from "../../pages/subjectLandingPageComponents";
import { getProgressIcon } from "../../pages/Gameboard";
import { tags as tagsService } from "../../../services";
import { Markup } from "../markup";

export const SidebarLayout = (props: RowProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Row {...rest} className={classNames("sidebar-layout", className)}/>, props.children);
};

export const MainContent = (props: ColProps) => {
    const { className, ...rest } = props;
    
    const dispatch = useAppDispatch();
    dispatch(mainContentIdSlice.actions.set("page-content"));

    return siteSpecific(<Col id="page-content" xs={12} lg={8} xl={9} {...rest} className={classNames(className, "order-0 order-lg-1")} />, props.children);
};

interface QuestionLinkProps {
    question: QuestionDTO;
    gameboardId?: string;
}

const QuestionLink = (props: React.HTMLAttributes<HTMLLIElement> & QuestionLinkProps) => {
    const { question, gameboardId, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);
    const audienceFields = filterAudienceViewsByProperties(determineAudienceViews(question.audience), AUDIENCE_DISPLAY_FIELDS);
    const link = isDefined(gameboardId) ? `/questions/${question.id}?board=${gameboardId}` : `/questions/${question.id}`;

    return <li key={question.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, question.tags ?? [])}>
        <Link to={link} className="py-2">
            {isDefined(gameboardId) ? <span className={classNames(getProgressIcon(question).icon, "mt-1 mx-2")} style={{minWidth: "16px"}}/> : <i className="icon icon-question-thick"/>}
            <div className="d-flex flex-column w-100">
                <span className="hover-underline link-title">{question.title}</span>
                <StageAndDifficultySummaryIcons iconClassName="me-4 pe-2" audienceViews={audienceFields}/>
            </div>
        </Link>
    </li>;
};

const ConceptLink = (props: React.HTMLAttributes<HTMLLIElement> & {concept: IsaacConceptPageDTO}) => {
    const { concept, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);
    
    return <li key={concept.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, concept.tags ?? [])}>
        <Link to={`/concepts/${concept.id}`} className="py-2">
            <i className="icon icon-concept-thick"/>
            <span className="hover-underline link-title">{concept.title}</span>
        </Link>
    </li>;
};

type SidebarProps = ColProps

const NavigationSidebar = (props: SidebarProps) => {
    // A navigation sidebar is used for external links that are supplementary to the main content (e.g. related content);
    // the content in such a sidebar will collapse underneath the main content on smaller screens
    if (isAda) return <></>;

    const { className, ...rest } = props;
    return <Col tag="aside" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("sidebar no-print p-4 order-1 order-lg-0", className)} />;
};

interface ContentSidebarProps extends SidebarProps {
    buttonTitle?: string;
    hideButton?: boolean; // if true, the sidebar will not be collapsible on small screens
    optionBar?: React.JSX.Element;
}

const ContentSidebar = (props: ContentSidebarProps) => {
    // A content sidebar is used to interact with the main content, e.g. filters or search boxes, or for in-page nav (e.g. lessons and revision);
    // the content in such a sidebar will collapse into a button accessible from above the main content on smaller screens
    const deviceSize = useDeviceSize();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(m => !m);

    const pageTheme = useAppSelector(selectors.pageContext.subject);

    if (isAda) return <></>;

    const { className, buttonTitle, hideButton, optionBar, ...rest } = props;
    return <>
        {above['lg'](deviceSize) 
            ? <Col tag="aside" data-testId="sidebar" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("d-none d-lg-flex flex-column sidebar no-print p-4 order-0", className)} />
            : <>
                <div className="d-flex align-items-center no-print flex-wrap py-3 gap-3">
                    {!hideButton && <AffixButton data-testId="sidebar-toggle" color="keyline" size="lg" onClick={toggleMenu} affix={{
                        affix: "icon-sidebar", 
                        position: "prefix", 
                        type: "icon"
                    }}>
                        {buttonTitle ?? "Search and filter"}
                    </AffixButton>}
                    <div className="flex-grow-1">{optionBar}</div>
                </div>
                <Offcanvas id="content-sidebar-offcanvas" direction="start" isOpen={menuOpen} toggle={toggleMenu} container="#root" data-bs-theme={pageTheme ?? "neutral"}>
                    <OffcanvasHeader toggle={toggleMenu} close={
                        <div className="d-flex w-100 justify-content-end align-items-center flex-wrap p-3">
                            <AffixButton color="keyline" size="lg" onClick={toggleMenu} data-testid="close-sidebar-button" affix={{
                                affix: "icon-close", 
                                position: "prefix", 
                                type: "icon"
                            }}>
                                Close
                            </AffixButton>
                        </div>
                    }/>
                    <OffcanvasBody>
                        <ContentSidebarContext.Provider value={{toggle: toggleMenu, close: () => setMenuOpen(false)}}>
                            <Col {...rest} className={classNames("sidebar p-4 pt-0", className)} />
                        </ContentSidebarContext.Provider>
                    </OffcanvasBody>
                </Offcanvas>
            </> 
        }
    </>;
};

const KeyItem = (props: React.HTMLAttributes<HTMLSpanElement> & {icon: string, text: string}) => {
    const { icon, text, ...rest } = props;
    return <li {...rest} className={classNames(rest.className, "d-flex align-items-center pt-2")}><img className="pe-2" src={`/assets/phy/icons/redesign/${icon}.svg`} alt=""/> {text}</li>;
};

const CompletionKey = () => {
    return <div className="d-flex flex-column sidebar-key">
        Key
        <ul>
            <KeyItem icon="status-not-started" text="Question not started"/>
            <KeyItem icon="status-in-progress" text="Question in progress"/>
            <KeyItem icon="status-correct" text="Question completed correctly"/>
            <KeyItem icon="status-incorrect" text="Question completed incorrectly"/>
        </ul>
    </div>;
};

interface RelatedContentSidebarProps extends SidebarProps {
    relatedContent: ContentSummaryDTO[] | undefined;
    isConcept?: boolean;
}

const RelatedContentSidebar = (props: RelatedContentSidebarProps) => {
    const relatedConcepts = props.relatedContent?.filter(c => c.type === "isaacConceptPage") as IsaacConceptPageDTO[] | undefined;
    const relatedQuestions = props.relatedContent?.filter(c => c.type === "isaacQuestionPage") as QuestionDTO[] | undefined;

    const pageType = props.isConcept ? "concept" : "question";

    const pageContext = useAppSelector(selectors.pageContext.context);
    const pageContextStage = useAppSelector(selectors.pageContext.stage);

    const [relatedQuestionsForContextStage, relatedQuestionsForOtherStages] = partition(relatedQuestions, q => q.audience && determineAudienceViews(q.audience).some(v => v.stage === pageContextStage));

    const sidebarRef = useRef<HTMLDivElement>(null);

    return <NavigationSidebar ref={sidebarRef}>
        <div className="section-divider"/>
        <h5>Related concepts</h5>
        {relatedConcepts && relatedConcepts.length > 0
            ? <ul className="link-list">
                {relatedConcepts.map((concept, i) => <ConceptLink key={i} concept={concept} />)}
            </ul>
            : <>
                There are no related concepts for this {pageType}.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "concepts")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    See all concepts for {getHumanContext(pageContext)}
                </AffixButton>}
            </>
        }
        <div className="section-divider"/>
        <h5>Related questions</h5>
        {relatedQuestions && relatedQuestions.length > 0
            ? <>
                {!pageContextStage || pageContextStage.length > 1 || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                    ? <>
                        <ul className="link-list">
                            {relatedQuestions.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                    </>
                    : <>
                        <div className="section-divider"/>
                        <h5>Related {HUMAN_STAGES[pageContextStage[0]]} questions</h5>
                        <ul className="link-list">
                            {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                        <div className="section-divider"/>
                        <h5>Related questions for other learning stages</h5>
                        <ul className="link-list">
                            {relatedQuestionsForOtherStages.map((question, i) => <QuestionLink key={i} question={question} />)}
                        </ul>
                    </>
                }
                <div className="section-divider"/>
                <CompletionKey/>

            </>
            : <>
                There are no related questions for this {pageType}.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "questions")} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
                    See all questions for {getHumanContext(pageContext)}
                </AffixButton>}
            </>
        }
    </NavigationSidebar>;
};

export const QuestionSidebar = (props: RelatedContentSidebarProps) => {
    return <RelatedContentSidebar {...props} />;
};

export const ConceptSidebar = (props: RelatedContentSidebarProps) => {
    return <RelatedContentSidebar {...props} isConcept />;
};

interface GameboardQuestionSidebarProps extends SidebarProps {
    id: string;
    title: string;
    questions: GameboardItem[];
    currentQuestionId: string;
}

export const GameboardQuestionSidebar = (props: GameboardQuestionSidebarProps) => {
    // For questions in the context of a gameboard
    const {id, title, questions, currentQuestionId} = props;
    return <NavigationSidebar>
        <div className="section-divider"/>
        <Link to={`${PATHS.GAMEBOARD}#${id}`} style={{textDecoration: "none"}}>
            <h5 className="mb-3">Question deck: {title}</h5>
        </Link>
        <ul>
            {questions?.map(q => <li key={q.id}><QuestionLink question={q} gameboardId={id} className={q.id === currentQuestionId ? "selected-question" : ""}/></li>)}
        </ul>
        <div className="section-divider"/>
        <CompletionKey/>
    </NavigationSidebar>;
};

interface GameboardSidebarProps extends SidebarProps {
    gameboard: GameboardDTO;
    assignments: AssignmentDTO[] | false;
};

export const GameboardSidebar = (props: GameboardSidebarProps) => {
    const {gameboard, assignments} = props;
    const multipleAssignments = assignments && assignments.length > 1;

    const GameboardDetails = () => {
        const subjects = determineGameboardSubjects(gameboard);
        const topics = tags.getTopicTags(Array.from((gameboard?.contents || []).reduce((a, c) => {
            if (isDefined(c.tags) && c.tags.length > 0) {
                return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
            }
            return a;
        }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();

        return <>
            <div className="mb-2">
                Subject{subjects.length > 1 && "s"}:
                <ul className="d-inline ms-1">{subjects.map(s => <li className="d-inline" key={s}><Pill title={HUMAN_SUBJECTS[s]} theme={s}/></li>)}</ul>
            </div>
            <div className="mb-2">
                Topic{subjects.length > 1 && "s"}:
                <ul className="d-inline ms-1">{topics.map(t => <li key={t} className="d-inline"><Pill title={t}/></li>)}</ul>
            </div>
        </>;
    };

    const AssignmentDetails = (assignment: AssignmentDTO) => {
        const {assignerSummary, creationDate, dueDate, groupName, scheduledStartDate} = assignment;
        const assigner = extractTeacherName(assignerSummary);
        const startDate = scheduledStartDate ?? creationDate;
        return <>
            {multipleAssignments && <div className="section-divider"/>}
            <div>Assigned to <b>{groupName}</b> by <b>{assigner}</b></div>
            {startDate && <div>Set: <b>{getFriendlyDaysUntil(startDate)}</b></div>}
            {dueDate && <div>Due: <b>{getFriendlyDaysUntil(dueDate)}</b></div>}
        </>;
    };
    
    return <ContentSidebar buttonTitle="Details">
        <div className="section-divider"/>
        <h5>Question deck</h5>
        <GameboardDetails />
        {assignments && assignments.length > 0 && <>
            <div className={multipleAssignments ? "section-divider-bold" : "section-divider"}/>
            <h5>Assignment{multipleAssignments && "s"}</h5>
            {multipleAssignments && <div>You have multiple assignments for this question deck.</div>}
            <ul>{assignments.map(a => <li key={a.id}><AssignmentDetails {...a} /></li>)}</ul>
        </>}
        <div className="section-divider"/>
        <CompletionKey/>
    </ContentSidebar>;
};
interface FilterCheckboxProps extends React.HTMLAttributes<HTMLElement> {
    tag: Tag;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    tagCounts?: Record<string, number>;
    incompatibleTags?: Tag[]; // tags that are removed when this tag is added
    dependentTags?: Tag[]; // tags that are removed when this tag is removed
    baseTag?: Tag; // tag to add when all tags are removed
    partial?: boolean; // if true, the checkbox can be partially selected
    partiallySelected?: boolean;
    checkboxStyle?: "tab" | "button";
    bsSize?: "sm" | "lg";
}

const FilterCheckbox = (props : FilterCheckboxProps) => {
    const {tag, conceptFilters, setConceptFilters, tagCounts, checkboxStyle, incompatibleTags, dependentTags, baseTag, partial, partiallySelected, ...rest} = props;
    const [checked, setChecked] = useState(conceptFilters.includes(tag));

    useEffect(() => {
        setChecked(conceptFilters.includes(tag));
    }, [conceptFilters, tag]);

    const handleCheckboxChange = (checked: boolean) => {
        // Reselect parent if all children are deselected
        const siblingTags = tag.type === TAG_LEVEL.field && tag.parent ? tags.getDirectDescendents(tag.parent).filter(t => t !== tag) : [];
        const reselectParent = tag.parent && siblingTags.every(t => !conceptFilters.includes(t));

        const newConceptFilters = checked 
            ? [...conceptFilters.filter(c => !incompatibleTags?.includes(c)), ...(!partiallySelected ? [tag] : [])] 
            : [...conceptFilters.filter(c => ![tag, ...(dependentTags ?? [])].includes(c)), ...(reselectParent ? [tags.getById(tag.parent!)] : [])];
        setConceptFilters(newConceptFilters.length > 0 ? newConceptFilters : (baseTag ? [baseTag] : []));
    };

    return checkboxStyle === "button" 
        ? <StyledCheckbox {...rest} id={tag.id} checked={checked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange(e.target.checked)}
            label={<span>{tag.title} {tagCounts && isDefined(tagCounts[tag.id]) && <span className="text-muted">({tagCounts[tag.id]})</span>}</span>}
            partial={partial}
        />
        : <StyledTabPicker {...rest} id={tag.id} checked={checked} 
            onInputChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange(e.target.checked)}
            checkboxTitle={tag.title} count={tagCounts && isDefined(tagCounts[tag.id]) ? tagCounts[tag.id] : undefined}
        />;
};

const AllFiltersCheckbox = (props: Omit<FilterCheckboxProps, "tag"> & {forceEnabled?: boolean}) => {
    const { conceptFilters, setConceptFilters, tagCounts, baseTag, forceEnabled, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<Tag[]>(baseTag ? [baseTag] : []);
    return <StyledTabPicker {...rest} 
        id="all" checked={forceEnabled || baseTag ? conceptFilters.length === 1 && conceptFilters[0] === baseTag : !conceptFilters.length} 
        checkboxTitle="All" count={tagCounts && (baseTag ? tagCounts[baseTag.id] : Object.values(tagCounts).reduce((a, b) => a + b, 0))}
        onInputChange={(e) => {
            if (forceEnabled) {
                setConceptFilters(baseTag ? [baseTag] : []);
                return;
            }
            if (e.target.checked) {
                setPreviousFilters(conceptFilters);
                setConceptFilters(baseTag ? [baseTag] : []);
            } else {
                setConceptFilters(previousFilters);
            }
        }}
    />;
};

interface ConceptListSidebarProps extends SidebarProps {
    searchText: string | null;
    setSearchText: React.Dispatch<React.SetStateAction<string | null>>;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    applicableTags: Tag[];
    tagCounts?: Record<string, number>;
}

export const SubjectSpecificConceptListSidebar = (props: ConceptListSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    const subjectTag = tags.getById(pageContext?.subject as TAG_ID);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search concepts</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder="e.g. Forces"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />

            <div className="section-divider"/>

            <div className="d-flex flex-column">
                <h5>Filter by topic</h5>
                <AllFiltersCheckbox 
                    conceptFilters={conceptFilters} setConceptFilters={setConceptFilters} tagCounts={tagCounts} baseTag={subjectTag} 
                    forceEnabled={applicableTags.filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0).length === 0}
                />
                <div className="section-divider-small"/>
                <ul>
                    {applicableTags
                        .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0)
                        .map(tag => <li key={tag.id}>
                            <FilterCheckbox 
                                key={tag.id} 
                                tag={tag} 
                                conceptFilters={conceptFilters} 
                                setConceptFilters={setConceptFilters} 
                                tagCounts={tagCounts} 
                                incompatibleTags={[subjectTag]} 
                                baseTag={subjectTag}
                            /></li>
                        )
                    }
                </ul>
            </div>
        </search>
    </ContentSidebar>;
};

interface GenericConceptsSidebarProps extends ConceptListSidebarProps {
    searchStages: Stage[];
    setSearchStages: React.Dispatch<React.SetStateAction<Stage[]>>;
    stageCounts: Record<string, number>;
}

export const GenericConceptsSidebar = (props: GenericConceptsSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, tagCounts, searchStages, setSearchStages, stageCounts, ...rest } = props;

    const updateSearchStages = (stage: Stage) => {
        if (searchStages.includes(stage)) {
            setSearchStages(searchStages.filter(s => s !== stage));
        } else {
            setSearchStages([...(searchStages ?? []), stage]);
        }
    };
    
    // If exactly one subject is selected, infer a colour for the stage checkboxes
    const singleSubjectColour = useMemo(() => {
        return conceptFilters.length === 1 && conceptFilters[0].type === TAG_LEVEL.subject ? conceptFilters[0].id
            : conceptFilters.length && conceptFilters.every(tag => tag.parent === conceptFilters[0].parent) ? conceptFilters[0].parent
                : undefined;
    }, [conceptFilters]);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search concepts</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder="e.g. Forces"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />

            <div className="section-divider"/>
            
            <div className="d-flex flex-column">
                <h5>Filter by subject and topic</h5>
                <ul>
                    {Object.keys(PHY_NAV_SUBJECTS).map((subject, i) => {
                        const subjectTag = tags.getById(subject as TAG_ID);
                        const descendentTags = tags.getDirectDescendents(subjectTag.id);
                        const isSelected = conceptFilters.includes(subjectTag) || descendentTags.some(tag => conceptFilters.includes(tag));
                        const isPartial = descendentTags.some(tag => conceptFilters.includes(tag)) && descendentTags.some(tag => !conceptFilters.includes(tag));
                        return <li key={i} className={classNames("ps-2", {"checkbox-active": isSelected})}>
                            <FilterCheckbox 
                                checkboxStyle="button" color="theme" data-bs-theme={subject} tag={subjectTag} conceptFilters={conceptFilters} 
                                setConceptFilters={setConceptFilters} tagCounts={tagCounts} dependentTags={descendentTags} incompatibleTags={descendentTags}
                                partial partiallySelected={descendentTags.some(tag => conceptFilters.includes(tag))} // not quite isPartial; this is also true if all descendents selected
                                className={classNames("icon", {"icon-checkbox-off": !isSelected, "icon-checkbox-partial-alt": isSelected && isPartial, "icon-checkbox-selected": isSelected && !isPartial})}
                            />
                            {isSelected && <ul className="ms-3 ps-2">
                                {descendentTags
                                    .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0 || conceptFilters.includes(tag))
                                    // .sort((a, b) => tagCounts ? tagCounts[b.id] - tagCounts[a.id] : 0)
                                    .map((tag, j) => <li key={j}>
                                        <FilterCheckbox checkboxStyle="button" color="theme" bsSize="sm" data-bs-theme={subject} tag={tag} conceptFilters={conceptFilters} 
                                            setConceptFilters={setConceptFilters} tagCounts={tagCounts} incompatibleTags={[subjectTag]}/>
                                    </li>)
                                }
                            </ul>}
                        </li>;
                    })}
                </ul>
                <div className="section-divider"/>
                <h5>Filter by stage</h5>
                <ul className="ps-2">
                    {getFilteredStageOptions().filter(s => stageCounts[s.value] > 0 || searchStages.includes(s.value)).map((stage) =>
                        <li key={stage.value}>
                            <StyledCheckbox checked={searchStages.includes(stage.value)}
                                label={<>{stage.label} <span className="text-muted">({stageCounts[stage.value]})</span></>}
                                data-bs-theme={singleSubjectColour}
                                color="theme" onChange={() => {updateSearchStages(stage.value);}}/>
                        </li>)}
                </ul>
            </div>
        </search>

    </ContentSidebar>;
};

interface QuestionFinderSidebarProps extends SidebarProps {
    searchText: string;
    setSearchText: (searchText: string) => void;
    tagCounts?: Record<string, number>;
    questionFinderFilterPanelProps: QuestionFinderFilterPanelProps
}

export const QuestionFinderSidebar = (props: QuestionFinderSidebarProps) => {
    const { searchText, setSearchText, tagCounts, questionFinderFilterPanelProps, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    // setSearchText is a debounced method that would not update on each keystroke, so we use this internal state to visually update the search text immediately
    const [internalSearchText, setInternalSearchText] = useState(searchText);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search questions</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={internalSearchText || ""}
                placeholder={`e.g. ${getQuestionPlaceholder(pageContext)}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setInternalSearchText(e.target.value);
                    setSearchText(e.target.value);
                }}
            />

            <QuestionFinderFilterPanel {...questionFinderFilterPanelProps} />
        </search>
    </ContentSidebar>;
};

interface PracticeQuizzesSidebarProps extends SidebarProps {
    filterText: string;
    setFilterText: Dispatch<SetStateAction<string>>;
    filterTags?: Tag[];
    setFilterTags: Dispatch<SetStateAction<Tag[]>>;
    tagCounts: Record<string, number>;
    filterStages?: Stage[];
    setFilterStages: Dispatch<SetStateAction<Stage[] | undefined>>;
    stageCounts: Record<string, number>;
}

export const PracticeQuizzesSidebar = (props: PracticeQuizzesSidebarProps) => {
    const { filterText, setFilterText, filterTags, setFilterTags, tagCounts, filterStages, setFilterStages, stageCounts, ...rest } = props;
    const pageContext = useAppSelector(selectors.pageContext.context);
    const fields = pageContext?.subject ? tags.getDirectDescendents(pageContext.subject as TAG_ID) : [];

    const updateFilterTags = (tag: Tag) => {
        if (filterTags?.includes(tag)) {
            setFilterTags(filterTags.filter(t => t !== tag));
        }
        else {
            setFilterTags([...(filterTags ?? []), tag]);
        }
    };

    const updateFilterStages = (stage: Stage) => {
        if (filterStages?.includes(stage)) {
            setFilterStages(filterStages.filter(s => s !== stage));
        } else {
            setFilterStages([...(filterStages ?? []), stage]);
        }
    };

    // Clear stage filters on subject change, since previous stages may not be visible to deselect
    useEffect(() => {
        setFilterStages(undefined);
    }, [filterTags]);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search practice tests</h5>
            <Input type="search" placeholder="e.g. Challenge" value={filterText} className="search--filter-input my-3"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)} />

            {!pageContext?.subject && Object.keys(PHY_NAV_SUBJECTS).filter(s => tagCounts[s] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by subject and topic</h5>
                <ul>
                    {Object.keys(PHY_NAV_SUBJECTS).filter(s => tagCounts[s] > 0).map((subject, i) => {
                        const subjectTag = tags.getById(subject as TAG_ID);
                        const descendentTags = tags.getDirectDescendents(subjectTag.id);
                        const isSelected = filterTags?.includes(subjectTag) || descendentTags.some(tag => filterTags?.includes(tag));
                        const isPartial = descendentTags.some(tag => filterTags?.includes(tag)) && descendentTags.some(tag => !filterTags?.includes(tag));
                        return <li key={i} className={classNames("ps-2", {"checkbox-active": isSelected})}>
                            <FilterCheckbox 
                                checkboxStyle="button" color="theme" data-bs-theme={subject} tag={subjectTag} conceptFilters={filterTags as Tag[]} 
                                setConceptFilters={setFilterTags} tagCounts={tagCounts} dependentTags={descendentTags} incompatibleTags={descendentTags}
                                partiallySelected={descendentTags.some(tag => filterTags?.includes(tag))}
                                className={classNames({"icon-checkbox-off": !isSelected, "icon icon-checkbox-partial-alt": isSelected && isPartial, "icon-checkbox-selected": isSelected && !isPartial})}
                            />
                            {isSelected && <ul className="ms-3 ps-2">
                                {descendentTags.filter(tag => tagCounts[tag.id] > 0)
                                    .map((tag, j) => <li key={j}>
                                        <FilterCheckbox
                                            checkboxStyle="button" color="theme" bsSize="sm" data-bs-theme={subject} tag={tag} conceptFilters={filterTags as Tag[]} 
                                            setConceptFilters={setFilterTags} tagCounts={tagCounts} incompatibleTags={[subjectTag]}
                                        />
                                    </li>)}
                            </ul>}
                        </li>;
                    })}
                </ul>
            </>}

            {pageContext?.subject && fields.filter(tag => tagCounts[tag.id] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by topic</h5>
                <ul className="ps-2">
                    {fields.filter(tag => tagCounts[tag.id] > 0)
                        .map((tag, j) => <li key={j} >
                            <StyledTabPicker checkboxTitle={tag.title} checked={filterTags?.includes(tag)}
                                count={tagCounts[tag.id]} onInputChange={() => updateFilterTags(tag)}/>
                        </li>)}
                </ul>
            </>}

            {!isSingleStageContext(pageContext) && getFilteredStageOptions().filter(s => stageCounts[s.label] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by stage</h5>
                <ul className="ps-2">
                    {getFilteredStageOptions().filter(s => stageCounts[s.label] > 0).map((stage, i) =>
                        <li key={i}>
                            <StyledCheckbox checked={filterStages?.includes(stage.value)}
                                label={<>{stage.label} {tagCounts && <span className="text-muted">({stageCounts[stage.label]})</span>}</>}
                                color="theme" data-bs-theme={filterTags?.length === 1 ? filterTags[0].id : undefined}
                                onChange={() => {updateFilterStages(stage.value);}}/>
                        </li>)}
                </ul>
            </>}
        </search>

        <div className="section-divider"/>
        <div className="sidebar-help">
            <p>You can see all of the tests that you have in progress or have completed in your My Isaac:</p>
            <AffixButton size="md" color="keyline" tag={Link} to="/tests" affix={{
                affix: "icon-arrow-right",
                position: "suffix",
                type: "icon"
            }}>
                My tests
            </AffixButton>
        </div>
    </ContentSidebar>;
};

export const LessonsAndRevisionSidebar = (props: SidebarProps) => {
    // TODO
    return <ContentSidebar {...props}/>;
};

export const FAQSidebar = (props: SidebarProps) => {
    return <ContentSidebar buttonTitle="Select a topic" {...props}>
        <div className="section-divider mb-3"/>
        <h5 className="mb-3">Select a topic</h5>
        {props.children}
    </ContentSidebar>;
};

interface AssignmentStatusCheckboxProps extends React.HTMLAttributes<HTMLLabelElement> {
    status: AssignmentState;
    statusFilter: AssignmentState[];
    setStatusFilter: React.Dispatch<React.SetStateAction<AssignmentState[]>>;
    count?: number;
}

const AssignmentStatusCheckbox = (props: AssignmentStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker 
        id={status ?? ""} checkboxTitle={status}
        onInputChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== AssignmentState.ALL), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count} {...rest}
    />;
};

const AssignmentStatusAllCheckbox = (props: Omit<AssignmentStatusCheckboxProps, "status">) => {
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<AssignmentState[]>([]);
    return <StyledTabPicker 
        id="all" checkboxTitle="All"
        onInputChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([AssignmentState.ALL]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(AssignmentState.ALL)}
        count={count} {...rest}
    />;
};

interface MyAssignmentsSidebarProps extends SidebarProps {
    statusFilter: AssignmentState[];
    setStatusFilter: React.Dispatch<React.SetStateAction<AssignmentState[]>>;
    titleFilter: string;
    setTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    groupFilter: string;
    setGroupFilter: React.Dispatch<React.SetStateAction<string>>;
    setByFilter: string;
    setSetByFilter: React.Dispatch<React.SetStateAction<string>>;
    sortOrder: MyAssignmentsOrder;
    setSortOrder: React.Dispatch<React.SetStateAction<MyAssignmentsOrder>>;
    assignmentQuery: any;
}

export const MyAssignmentsSidebar = (props: MyAssignmentsSidebarProps) => {
    const { statusFilter, setStatusFilter, titleFilter, setTitleFilter, groupFilter, setGroupFilter, setByFilter, setSetByFilter, sortOrder, setSortOrder, assignmentQuery, ...rest } = props;

    const ORDER_NAMES: {[key in MyAssignmentsOrder]: string} = {
        "startDate": "Start date (oldest first)",
        "-startDate": "Start date (recent first)",
        "dueDate": "Due date (soonest first)",
        "-dueDate": "Due date (latest first)",
        "attempted": "Attempted (lowest first)",
        "-attempted": "Attempted (highest first)",
        "correct": "Correctness (lowest first)",
        "-correct": "Correctness (highest first)",
    };

    useEffect(() => {
        if (statusFilter.length === 0) {
            setStatusFilter([AssignmentState.ALL]);
        }    
    }, [statusFilter, setStatusFilter]);

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        <ShowLoadingQuery query={assignmentQuery} defaultErrorTitle="" thenRender={(assignments: AssignmentDTO[]) => {
            const myAssignments = filterAssignmentsByStatus(assignments);
            const assignmentCountByStatus = myAssignments && Object.fromEntries(Object.entries(myAssignments).map(([key, value]) => [key, value.length]));
            return <>
                <div className="section-divider"/>
                <search>
                    <h5>Search assignments</h5>
                    <Input
                        className='search--filter-input my-3'
                        type="search" value={titleFilter || ""}
                        placeholder="e.g. Forces"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleFilter(e.target.value)}
                    />
                    <div className="section-divider"/>
                    <h5>Sort</h5>
                    <Input type="select" className="ps-3 my-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as MyAssignmentsOrder)}>
                        {Object.values(MyAssignmentsOrder).map(order => <option key={order} value={order}>{ORDER_NAMES[order]}</option>)}
                    </Input>
                    <div className="section-divider"/>
                    <h5 className="mb-4">Filter by status</h5>
                    <ul>
                        <li><AssignmentStatusAllCheckbox statusFilter={statusFilter} setStatusFilter={setStatusFilter} count={assignmentCountByStatus?.[AssignmentState.ALL]}/></li>
                        <div className="section-divider-small"/>
                        {Object.values(AssignmentState).filter(s => s !== AssignmentState.ALL).map(state => <li key={state}>
                            <AssignmentStatusCheckbox status={state} count={assignmentCountByStatus?.[state]} statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
                        </li>)}
                    </ul>
                    <h5 className="mt-4 mb-3">Filter by group</h5>
                    <Input type="select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentGroups(assignments)].map(group => <option key={group} value={group}>{group}</option>)}
                    </Input>
                    <h5 className="mt-4 mb-3">Filter by assigner</h5>
                    <Input type="select" value={setByFilter} onChange={e => setSetByFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                    </Input>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};

interface MyGameboardsSidebarProps extends SidebarProps {
    displayMode: BoardViews;
    setDisplayMode: React.Dispatch<React.SetStateAction<BoardViews>>;
    displayLimit: BoardLimit;
    setDisplayLimit: React.Dispatch<React.SetStateAction<BoardLimit>>;
    boardTitleFilter: string,
    setBoardTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    boardCreatorFilter: BoardCreators;
    setBoardCreatorFilter: React.Dispatch<React.SetStateAction<BoardCreators>>;
    boardCompletionFilter: BoardCompletions;
    setBoardCompletionFilter: React.Dispatch<React.SetStateAction<BoardCompletions>>;
}

export const MyGameboardsSidebar = (props: MyGameboardsSidebarProps) => {
    const { displayMode, setDisplayMode, displayLimit, setDisplayLimit, boardTitleFilter, setBoardTitleFilter, boardCreatorFilter, setBoardCreatorFilter, boardCompletionFilter, setBoardCompletionFilter, ...rest } = props;

    const deviceSize = useDeviceSize();

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search question decks</h5>
            <Input
                className='search--filter-input my-3'
                type="search" value={boardTitleFilter || ""}
                placeholder="e.g. Forces"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardTitleFilter(e.target.value)}
            />
            <div className="section-divider"/>
            <h5 className="mb-3">Filter by creator</h5>
            <Input type="select" value={boardCreatorFilter} onChange={e => setBoardCreatorFilter(e.target.value as BoardCreators)}>
                {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
            </Input>
            <h5 className="mt-4 mb-3">Filter by completion</h5>
            <Input type="select" value={boardCompletionFilter} onChange={e => setBoardCompletionFilter(e.target.value as BoardCompletions)}>
                {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
            </Input>
            <div className="section-divider"/>
            <h5 className="mb-4">Display</h5>
            <div className="d-flex flex-xl-column flex-xxl-row">
                <Input className="w-auto" type="select" aria-label="Set display mode" data-testid="display-select" value={displayMode} onChange={e => setDisplayMode(e.target.value as BoardViews)}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                {deviceSize === "xl" ? <div className="mt-2"/> : <Spacer/>}
                <div className="select-pretext me-2">Limit:</div>
                <Input className="w-auto" type="select" aria-label="Set display limit" value={displayLimit} onChange={e => setDisplayLimit(e.target.value as BoardLimit)}>
                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                </Input>
            </div>
        </search>
    </ContentSidebar>;
};
interface SetAssignmentsSidebarProps extends SidebarProps {
    displayMode: BoardViews;
    setDisplayMode: React.Dispatch<React.SetStateAction<BoardViews>>;
    displayLimit: BoardLimit;
    setDisplayLimit: React.Dispatch<React.SetStateAction<BoardLimit>>;
    boardTitleFilter: string;
    setBoardTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    sortOrder: AssignmentBoardOrder;
    setSortOrder: React.Dispatch<React.SetStateAction<AssignmentBoardOrder>>;
    boardSubject: BoardSubjects;
    setBoardSubject: React.Dispatch<React.SetStateAction<BoardSubjects>>;
    boardCreator: BoardCreators;
    setBoardCreator: React.Dispatch<React.SetStateAction<BoardCreators>>;
    sortDisabled?: boolean;
}

export const SetAssignmentsSidebar = (props: SetAssignmentsSidebarProps) => {
    const { displayMode, setDisplayMode, displayLimit, setDisplayLimit, boardTitleFilter, setBoardTitleFilter, sortOrder, setSortOrder, sortDisabled, boardSubject, setBoardSubject, boardCreator, setBoardCreator, ...rest } = props;
    const deviceSize = useDeviceSize();

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search question decks</h5>
            <Input
                className='search--filter-input my-3'
                type="search" value={boardTitleFilter || ""}
                placeholder="e.g. Forces"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardTitleFilter(e.target.value)}
            />
            <div className="section-divider"/>
            <h5 className="mb-3">Filter by subject</h5>
            <Input type="select" value={boardSubject} onChange={e => setBoardSubject(e.target.value as BoardSubjects)}>
                {Object.values(BoardSubjects).map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </Input>
            <h5 className="my-3">Filter by creator</h5>
            <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
            </Input>
            <div className="section-divider"/>
            <h5 className="mb-3">Display</h5>
            <div className="d-flex">
                <Input className="w-auto" type="select" aria-label="Set display mode" value={displayMode} onChange={e => setDisplayMode(e.target.value as BoardViews)}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                <Spacer/>
                <div className="select-pretext me-2">Limit:</div>
                <Input className="w-auto" type="select" aria-label="Set display limit" value={displayLimit} onChange={e => setDisplayLimit(e.target.value as BoardLimit)}>
                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                </Input>
            </div>
            <h5 className="my-3">Sort by</h5>
            <Input type="select" className="mb-3" aria-label="Set sort order" value={sortOrder} onChange={e => setSortOrder(e.target.value as AssignmentBoardOrder)} disabled={sortDisabled}>
                {Object.values(AssignmentBoardOrder).filter(
                    order => !['attempted', '-attempted', 'correct', '-correct'].includes(order)
                ).map(order => <option key={order} value={order}>{BOARD_ORDER_NAMES[order]}</option>)}
            </Input>
            {sortDisabled && <div className="small text-muted mt-2">
                Sorting is disabled if some question decks are hidden. Increase the display limit to show all question decks.
            </div>}
        </search>
    </ContentSidebar>;
};

interface QuizSidebarProps extends SidebarProps {
    viewingAsSomeoneElse: boolean;
    totalSections: number;
    currentSection?: number;
    sectionStates: SectionProgress[];
    sectionTitles: string[];
}

export interface QuizSidebarAttemptProps extends QuizSidebarProps {
    attempt: QuizAttemptDTO;
    view?: undefined;
}

export interface QuizSidebarViewProps extends QuizSidebarProps {
    attempt?: undefined;
    view: QuizView;
}

export const Pill = ({ title, theme }: {title: string, theme?: string}) =>
    <span className="badge rounded-pill bg-theme me-1" data-bs-theme={theme}> 
        {title}
    </span>;

export const QuizSidebar = (props: QuizSidebarAttemptProps | QuizSidebarViewProps) => {
    const { attempt, view, viewingAsSomeoneElse, totalSections, currentSection, sectionStates, sectionTitles} = props;
    const deviceSize = useDeviceSize();
    const history = useHistory();
    const location = history.location.pathname;
    const rubricPath = 
        viewingAsSomeoneElse ? location.split("/").slice(0, 6).join("/") :
            attempt && attempt.feedbackMode ? location.split("/").slice(0, 5).join("/") :
                location.split("/page")[0];
    const hasSections = totalSections > 0;
    const tags = attempt ? attempt.quiz?.tags : view.quiz?.tags;
    const subjects = tagsService.getSubjectTags(tags as TAG_ID[]);
    const topics = tagsService.getTopicTags(tags as TAG_ID[]);
    const fields = tagsService.getFieldTags(tags as TAG_ID[]);
    const topicsAndFields = (topics.length + fields.length) > 0 ? [...topics, ...fields] : [{id: 'na', title: "N/A"}];
    
    const progressIcon = (section: number) => {
        return sectionStates[section] === SectionProgress.COMPLETED ? "icon-correct"
            : sectionStates[section] === SectionProgress.STARTED ? "icon-in-progress"
                : "";
    };

    const switchToPage = (page: string) => {
        if (viewingAsSomeoneElse || attempt && attempt.feedbackMode) {
            history.push(rubricPath.concat("/", page));
        }
        else {
            history.push(rubricPath.concat("/page/", page));
        }
    };

    const SidebarContents = () => {
        return <ContentSidebar buttonTitle={hasSections ? "Sections" : "Details"}>
            <div className="section-divider"/>
            <h5 className="mb-3">Test</h5>
            <div className="mb-2">
                Subject{subjects?.length > 1 && "s"}:
                <ul className="d-inline ms-1">{subjects.map(s => <li className="d-inline" key={s.id}><Pill title={s.title} theme={s.id}/></li>)}</ul>
            </div>
            <div className="mb-2">
                Topic{topicsAndFields?.length > 1 && "s"}:
                <ul className="d-inline ms-1">{topicsAndFields.map(e => <li className="d-inline" key={e.id}><Pill title={e.title} theme="neutral"/></li>)}</ul>
            </div>

            {hasSections && <>
                <div className="section-divider"/>
                <h5 className="mb-3">Sections</h5>
                <ul>
                    <li>
                        <StyledTabPicker checkboxTitle={"Overview"} checked={!isDefined(currentSection)} onClick={() => history.push(rubricPath)}/>
                    </li>
                    {Array.from({length: totalSections}, (_, i) => i).map(section => 
                        <li key={section}>
                            <StyledTabPicker key={section} checkboxTitle={sectionTitles[section]} checked={currentSection === section+1} onClick={() => switchToPage(String(section+1))}
                                suffix={{icon: progressIcon(section), info: sectionStates[section]}}/>
                        </li>)}
                </ul>

                <div className="section-divider"/>

                <div className="d-flex flex-column sidebar-key">
                Key
                    <ul>
                        <KeyItem icon="status-not-started" text="Section not started"/>
                        <KeyItem icon="status-in-progress" text="Section in progress"/>
                        <KeyItem icon="status-correct" text="Section completed"/>
                    </ul>
                </div>
            </>}

        </ContentSidebar>;
    };

    return <>
        {below["md"](deviceSize) && attempt && isPhy && currentSection ?
            <Row className="d-flex align-items-center">
                <Col>
                    <SidebarContents/>
                </Col>
                <Col className="d-flex justify-content-end">
                    <QuizRubricButton attempt={attempt}/>
                </Col>
            </Row> :
            <SidebarContents/>
        }
    </>;
};

interface MyAccountSidebarProps extends SidebarProps {
    editingOtherUser: boolean;
    activeTab: ACCOUNT_TAB;
    setActiveTab: React.Dispatch<React.SetStateAction<ACCOUNT_TAB>>;
}

export const MyAccountSidebar = (props: MyAccountSidebarProps) => {
    const { editingOtherUser, activeTab, setActiveTab } = props;
    return <ContentSidebar buttonTitle="Account settings" {...props}>
        <div className="section-divider mt-0"/>
        <h5>Account settings</h5>
        <ul>
            {ACCOUNT_TABS.filter(tab => !tab.hidden && !(editingOtherUser && tab.hiddenIfEditingOtherUser)).map(({tab, title}) => 
                <li key={tab}>
                    <ContentSidebarContext.Consumer>
                        {(context) => 
                            <StyledTabPicker id={title} tabIndex={0} checkboxTitle={title} checked={activeTab === tab}
                                onClick={() => { setActiveTab(tab); context?.close(); }} onKeyDown={ifKeyIsEnter(() => { setActiveTab(tab); context?.close(); })}/>                           
                        }
                    </ContentSidebarContext.Consumer>
                </li>
            )}
        </ul>
    </ContentSidebar>;
};

interface GroupsSidebarProps extends SidebarProps {
    user: RegisteredUserDTO;
    groups: AppGroup[] | undefined;
    allGroups: AppGroup[];
    selectedGroup: AppGroup | undefined;
    setSelectedGroupId: React.Dispatch<React.SetStateAction<number | undefined>>;
    showArchived: boolean;
    setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
    groupNameInputRef: RefObject<HTMLInputElement>;
    createNewGroup: (newGroupName: string) => Promise<boolean>;
}

export const GroupsSidebar = (props: GroupsSidebarProps) => {
    const { user, groups, allGroups, selectedGroup, setSelectedGroupId, showArchived, setShowArchived, groupNameInputRef, createNewGroup, ...rest } = props;
    return <ContentSidebar buttonTitle="Select or create a group" {...rest}>
        <div className="section-divider"/>
        <h5>Select a group</h5>
        <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId} showArchived={showArchived}
            setShowArchived={setShowArchived} groupNameInputRef={groupNameInputRef} createNewGroup={createNewGroup} showCreateGroup={true} sidebarStyle={true}/>
    </ContentSidebar>;
};

export const SignupSidebar = ({activeTab} : {activeTab: number}) => {
    const history = useHistory();

    const goBack = (path: string) => {
        confirmThen(
            "Are you sure you want go back? Any information you have entered will be lost.",
            () => history.push(path));
    };

    return <ContentSidebar buttonTitle="Create an account">
        <div className="section-divider mt-4"/>
        <h5 className="mt-1">Create an account</h5>
        {/* Tabs are clickable iff their page could be reached with a Back button */}
        <StyledTabPicker checkboxTitle={"Sign-up method"} checked={activeTab === 0} disabled={activeTab > 2} onClick={() => (activeTab === 1 || activeTab === 2) && goBack("/register")}/>
        <StyledTabPicker checkboxTitle={"Age verification"} checked={activeTab === 1} disabled={activeTab < 1 || activeTab > 2} onClick={() => activeTab === 2 && goBack("age")}/>
        <StyledTabPicker checkboxTitle={"Account details"} checked={activeTab === 2} disabled={activeTab !== 2}/>
        <StyledTabPicker checkboxTitle={"Preferences"} checked={activeTab === 3} disabled={activeTab !== 3}/>
    </ContentSidebar>;
};

interface SetQuizzesSidebarProps extends SidebarProps {
    titleFilter?: string;
    setTitleFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const SetQuizzesSidebar = (props: SetQuizzesSidebarProps) => {
    const { titleFilter, setTitleFilter } = props;
    const deviceSize = useDeviceSize();

    return <ContentSidebar buttonTitle="Search tests">
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search tests</h5>
            <Input
                id="available-quizzes-title-filter" type="search"
                className="search--filter-input my-3"
                value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                placeholder="e.g. Forces"
            />
        </search>
    </ContentSidebar>;
};

interface ManageQuizzesSidebarProps extends SidebarProps {
    manageQuizzesTitleFilter: string;
    setManageQuizzesTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    quizStartDate: Date | undefined;
    setQuizStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    quizSetDateFilterType: string;
    setQuizSetDateFilterType: React.Dispatch<React.SetStateAction<string>>;
    quizDueDate: Date | undefined;
    setQuizDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    quizDueDateFilterType: string;
    setQuizDueDateFilterType: React.Dispatch<React.SetStateAction<string>>;
    manageQuizzesGroupNameFilter: string;
    setManageQuizzesGroupNameFilter: React.Dispatch<React.SetStateAction<string>>;
};

export const ManageQuizzesSidebar = (props: ManageQuizzesSidebarProps) => {
    const { manageQuizzesTitleFilter, setManageQuizzesTitleFilter, quizStartDate, setQuizStartDate,
        quizSetDateFilterType, setQuizSetDateFilterType, quizDueDate, setQuizDueDate, quizDueDateFilterType,
        setQuizDueDateFilterType, manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter} = props;

    const deviceSize = useDeviceSize();
    
    const dateFilterTypeSelector = (dateFilterType: string, setDateFilterType: React.Dispatch<React.SetStateAction<string>>) => <UncontrolledDropdown>
        <DropdownToggle className="bg-transparent border-0 px-2" color="dropdown" caret>{dateFilterType}</DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={() => setDateFilterType('after')}>
                after
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('before')}>
                before
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('on')}>
                on
            </DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;

    return <ContentSidebar buttonTitle="Search & Filter">
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search tests</h5>
            <Input
                id="manage-quizzes-title-filter" type="search"
                value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
                className="search--filter-input mt-3 mb-4"
                placeholder="e.g. Forces" aria-label="Search by title"
            /> 
            <h5>Search by group</h5>
            <Input
                id="manage-quizzes-group-name-filter" type="search"
                value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
                className="search--filter-input my-3"
                placeholder="Group name"  aria-label="Search by group"
            />
            <div className="section-divider"/>
            <h5>Filter by date</h5>
            <div className="d-flex align-items-center">
                <span className="quiz-filter-date-span">Starting</span>
                {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-set-date-filter" type="date" className="quiz-filter-date-input"
                value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
                placeholder="Filter by set date" aria-label="Filter by set date"
            />
            <div className="d-flex align-items-center mt-2">
                <span className="quiz-filter-date-span">Due</span>
                {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-due-date-filter" type="date" className="quiz-filter-date-input"
                value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
                placeholder="Filter by due date" aria-label="Filter by due date"
            />
        </search>
    </ContentSidebar>;
};

export const EventsSidebar = (props: SidebarProps) => {
    const deviceSize = useDeviceSize();
    const history = useHistory();
    const query: EventsPageQueryParams = queryString.parse(history.location.search);
    const user = useAppSelector(selectors.user.orNull);

    return <ContentSidebar buttonTitle="Filter events" {...props}>
        <Form tag={"search"}>
            {above["lg"](deviceSize) && <div className="section-divider mt-5"/>}
            <h5 className="mb-3">Event type</h5>
            <ul>               
                {Object.entries(EventStatusFilter)
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn && isTeacherOrAbove(user)) || statusValue !== EventStatusFilter["My event reservations"])
                    .map(([statusLabel, statusValue]) =>
                        <li key={statusValue}>
                            <StyledTabPicker                                   
                                id={statusValue}
                                checkboxTitle={statusLabel}
                                checked={
                                    (!isDefined(query.event_status) && !query.show_booked_only && !query.show_reservations_only && statusValue === EventStatusFilter["Upcoming events"]) ||
                                    (query.show_booked_only && statusValue === EventStatusFilter["My booked events"]) ||
                                    (query.show_reservations_only && statusValue === EventStatusFilter["My event reservations"]) ||
                                    (query.event_status === "all" && statusValue === EventStatusFilter["All events"])
                                }
                                onChange={() => {
                                    query.show_booked_only = statusValue === EventStatusFilter["My booked events"] ? true : undefined;
                                    query.show_reservations_only = statusValue === EventStatusFilter["My event reservations"] ? true : undefined;
                                    query.event_status = statusValue === EventStatusFilter["All events"] ? "all" : undefined;
                                    history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                                }}
                            />
                        </li>
                    )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Groups</h5>
            <ul>
                {Object.entries(EventTypeFilter).map(([typeLabel, typeValue]) =>
                    <li key={typeValue}>
                        <StyledTabPicker                                   
                            id={typeValue}
                            checkboxTitle={typeLabel}
                            checked={query.types ? query.types === typeValue : typeValue === EventTypeFilter["All groups"]}
                            onChange={() => {
                                query.types = typeValue !== EventTypeFilter["All groups"] ? typeValue : undefined;
                                history.push({pathname: location.pathname, search: queryString.stringify(query as any)});}}
                        />
                    </li>
                )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Stages</h5>
            <ul>               
                {Object.entries(EventStageMap).map(([label, value]) =>
                    <li key={value}>
                        <StyledTabPicker                                                           
                            id={value}
                            checkboxTitle={label}
                            checked={query.show_stage_only ? query.show_stage_only === value : value === STAGE.ALL}
                            onChange={() => {
                                query.show_stage_only = value !== STAGE.ALL ? value : undefined;
                                history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                            }}
                        />
                    </li>
                )
                }
            </ul>
        </Form>
    </ContentSidebar>;
};

interface QuizStatusCheckboxProps extends React.HTMLAttributes<HTMLLabelElement> {
    status: QuizStatus;
    statusFilter: QuizStatus[];
    setStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    count?: number;
}

const QuizStatusCheckbox = (props: QuizStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker 
        id={status ?? ""} checkboxTitle={status}
        onInputChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== QuizStatus.All), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count} {...rest}
    />;
};

const QuizStatusAllCheckbox = (props: Omit<QuizStatusCheckboxProps, "status">) => {
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<QuizStatus[]>([]);
    return <StyledTabPicker 
        id="all" checkboxTitle="All"
        onInputChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([QuizStatus.All]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(QuizStatus.All)}
        count={count} {...rest}
    />;
};

interface MyQuizzesSidebarProps extends SidebarProps {
    setQuizTitleFilter: (title: string) => void;
    setQuizCreatorFilter: (creator: string) => void;
    quizStatusFilter: QuizStatus[];
    setQuizStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    activeTab: number;
    displayMode: "table" | "cards";
    setDisplayMode: React.Dispatch<React.SetStateAction<"table" | "cards">>;
};

export const MyQuizzesSidebar = (props: MyQuizzesSidebarProps) => {
    const { setQuizTitleFilter,setQuizCreatorFilter, quizStatusFilter, setQuizStatusFilter, activeTab, displayMode, setDisplayMode } = props;
    const deviceSize = useDeviceSize();
    const quizQuery = useGetQuizAssignmentsAssignedToMeQuery();

    const statusOptions = activeTab === 1 ? Object.values(QuizStatus).filter(s => s !== QuizStatus.All)
        : [QuizStatus.Started, QuizStatus.Complete];

    return <ContentSidebar buttonTitle="Search & Filter">
        <ShowLoadingQuery query={quizQuery} defaultErrorTitle="" thenRender={(quizzes: QuizAssignmentDTO[]) => {
            return <>
                {above["lg"](deviceSize) && <div className="section-divider"/>}
                <search>
                    <h5>Search tests</h5>
                    <Input type="search" className="search--filter-input my-3" onChange={(e) => setQuizTitleFilter(e.target.value)} 
                        placeholder="e.g. Forces" aria-label="Search by title"/>
                    <div className="section-divider"/>
                    <h5 className="mb-3">Filter by status</h5>
                    <ul>
                        <li><QuizStatusAllCheckbox statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter} count={undefined}/></li>
                        <div className="section-divider-small"/>
                        {statusOptions.map(state => <li key={state}>
                            <QuizStatusCheckbox status={state} count={undefined} statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter}/>
                        </li>)}
                    </ul>
                    {activeTab === 1 && <>
                        <h5 className="my-3">Filter by assigner</h5>
                        <Input type="select" onChange={e => setQuizCreatorFilter(e.target.value)}>
                            {["All", ...getDistinctAssignmentSetters(quizzes)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                        </Input>
                    </>}
                    <div className="section-divider mt-4"/>
                    <h5 className="mb-3">Display</h5>
                    <StyledDropdown value={displayMode} onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}>
                        <option value="table">Table View</option>
                        <option value="cards">Card View</option>
                    </StyledDropdown>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};

interface QuestionDecksSidebarProps extends SidebarProps {
    validStageSubjectPairs: {[subject in keyof typeof PHY_NAV_SUBJECTS]: ArrayElement<typeof PHY_NAV_SUBJECTS[subject]>[]};
    context: NonNullable<Required<PageContextState>>;
};

export const QuestionDecksSidebar = (props: QuestionDecksSidebarProps) => {
    const { validStageSubjectPairs, context } = props;

    const history = useHistory();

    return <ContentSidebar buttonTitle="Switch stage/subject" {...props}>
        <div className="section-divider"/>
        <search>
            <h5>Decks by stage</h5>
            <ul>
                {validStageSubjectPairs[context.subject].map((stage, index) => 
                    <li key={index}>
                        <StyledTabPicker 
                            checkboxTitle={HUMAN_STAGES[stage]} 
                            checked={context.stage.includes(stage)}
                            onClick={() => history.push(`/${context.subject}/${stage}/question_decks`)}
                        />
                    </li>
                )}
            </ul>
            <div className="section-divider"/>
            <h5>Decks by subject</h5>
            <ul>
                {Object.entries(validStageSubjectPairs)
                    .filter(([_subject, stages]) => (stages as LearningStage[]).includes(context.stage[0]))
                    .map(([subject, _stages], index) => 
                        <li key={index}>
                            <StyledTabPicker 
                                checkboxTitle={HUMAN_SUBJECTS[subject]} 
                                checked={context.subject === subject}
                                onClick={() => history.push(`/${subject}/${context.stage}/question_decks`)}
                            />
                        </li>
                    )
                }
            </ul>
        </search>
    </ContentSidebar>;
};


interface GlossarySidebarProps extends ContentSidebarProps {
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    filterSubject: Tag | undefined;
    setFilterSubject: React.Dispatch<React.SetStateAction<Tag | undefined>>;
    filterStage: Stage | undefined;
    setFilterStage: React.Dispatch<React.SetStateAction<Stage | undefined>>;
    subjects: Tag[];
    stages: Stage[];
}

export const GlossarySidebar = (props: GlossarySidebarProps) => {
    const { searchText, setSearchText, filterSubject, setFilterSubject, filterStage, setFilterStage, subjects, stages, optionBar, ...rest } = props;
    
    const history = useHistory();
    const pageContext = useAppSelector(selectors.pageContext.context);

    return <ContentSidebar buttonTitle="Search glossary" optionBar={optionBar} {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search glossary</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder="e.g. Forces"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
            <div className="section-divider"/>

            {!pageContext?.subject && <>
                <h5>Select subject</h5>
                <Label for='subject-select' className='visually-hidden'>Subject</Label>
                <StyledSelect inputId="subject-select"
                    options={subjects.map(s => ({ value: s.id, label: s.title}))}
                    value={filterSubject ? ({value: filterSubject.id, label: filterSubject.title}) : undefined}
                    name="subject-select"
                    placeholder="Select a subject"
                    onChange={e => setFilterSubject(subjects.find(v => v.id === (e as Item<TAG_ID> | undefined)?.value)) }
                    isClearable
                />
            </>}

            {!pageContext?.stage?.length && <>
                <h5 className="mt-4">Select stage</h5>
                <Label for='stage-select' className='visually-hidden'>Stage</Label>
                <StyledSelect inputId="stage-select"
                    options={ stages.map(s => ({ value: s, label: stageLabelMap[s]})) }
                    value={filterStage ? ({value: filterStage, label: stageLabelMap[filterStage]}) : undefined}
                    name="stage-select"
                    placeholder="Select a stage"
                    onChange={e => setFilterStage(stages.find(s => s === e?.value))}
                    isClearable
                />
            </>}

            {isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) && <>
                <h5>Switch learning stage</h5>
                <ul>
                    {PHY_NAV_SUBJECTS[pageContext.subject].map((stage, index) => 
                        <li key={index}>
                            <StyledTabPicker
                                checkboxTitle={HUMAN_STAGES[stage]} checked={pageContext.stage[0] === stage} 
                                onClick={() => history.replace(`/${pageContext.subject}/${stage}/glossary`)}
                            />
                        </li>
                    )}
                </ul>
            </>}
        </search>
    </ContentSidebar>;
};

export interface BookSidebarProps extends SidebarProps {
    book: IsaacBookIndexPageDTO;
    urlBookId: string;
    pageId: string | undefined;
};

export const BookSidebar = ({ book, urlBookId, pageId }: BookSidebarProps) => {

    const [expandedTab, setExpandedTab] = useState<number | undefined>(undefined);
    useEffect(() => {
        const activeChapter = book.chapters?.map(chapter => chapter.sections?.some(section => section.bookPageId === pageId)).indexOf(true);
        setExpandedTab(activeChapter === -1 ? undefined : activeChapter);
    }, [book.chapters, pageId]);

    const history = useHistory();

    return <ContentSidebar buttonTitle="Contents">
        <ul className="m-0 p-0">
            <button className="w-100 d-flex align-items-center p-3 text-start bg-transparent" onClick={() => history.push(`/books/${urlBookId}`)}>
                <h5 className={classNames("m-0", {"text-theme": pageId === undefined})}>Overview</h5>
                <Spacer/>
            </button>
            {book.chapters?.map((chapter, index) => {
                const chapterActive = chapter.sections?.some(section => section.bookPageId === pageId);

                return <CollapsibleList
                    title={<div className="d-flex flex-column gap-2 chapter-title">
                        <span className="text-theme">Chapter {chapter.label}</span>
                        <h6 className={classNames("m-0", {"text-theme fw-semibold": chapterActive})}>{chapter.title}</h6>
                    </div>}
                    key={index}
                    expanded={expandedTab === index}
                    toggle={() => setExpandedTab(expandedTab === index ? undefined : index)}
                    additionalOffset={"4px"}
                >
                    {chapter.sections?.map((section, sectionIndex) =>
                        <li key={sectionIndex}>
                            <StyledTabPicker
                                checkboxTitle={<div className="d-flex">
                                    <span className="text-theme me-2">{section.label}</span>
                                    <span className="flex-grow-1"><Markup encoding="latex">{section.title}</Markup></span>
                                </div>}
                                checked={pageId === section.bookPageId}
                                onClick={() => history.push(`/books/${urlBookId}/${section.bookPageId?.slice((book.id?.length ?? 0) + 1)}`)}
                            />
                        </li>
                    )}
                </CollapsibleList>;
            })}
        </ul>
    </ContentSidebar>;
};

export const GenericPageSidebar = (props: ContentSidebarProps) => {
    // Default sidebar for general pages that don't have a custom sidebar
    return <ContentSidebar buttonTitle="Options" hideButton optionBar={props.optionBar}>
        <div className="section-divider"/>
        <AffixButton color="keyline" tag={Link} to={"/"} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
            Go to homepage
        </AffixButton>
    </ContentSidebar>;
};

export const PolicyPageSidebar = (props: ContentSidebarProps) => {
    const history = useHistory();
    const path = useLocation().pathname;

    return <ContentSidebar buttonTitle="Select a page" optionBar={props.optionBar}>
        <div className="section-divider"/>
        <h5>Select a page</h5>
        <ul>
            <li><StyledTabPicker checkboxTitle="Accessibility Statement" checked={path === "/accessibility" || path === "/pages/accessibility_statement"} onClick={() => history.push("/accessibility")}/></li>
            <li><StyledTabPicker checkboxTitle="Privacy Policy" checked={path === "/privacy"  || path === "/pages/privacy_policy"} onClick={() => history.push("/privacy")}/></li>
            <li><StyledTabPicker checkboxTitle="Cookie Policy" checked={path === "/cookies" || path === "/pages/cookie_policy"} onClick={() => history.push("/cookies")}/></li>
            <li><StyledTabPicker checkboxTitle="Terms of Use" checked={path === "/terms" || path === "/pages/terms_of_use"} onClick={() => history.push("/terms")}/></li>
        </ul>
    </ContentSidebar>;
};

export const BooksOverviewSidebar = (props: ContentSidebarProps) => {
    const history = useHistory();
    return <ContentSidebar buttonTitle="View all books" {...props}>
        <div className="section-divider"/>
        <h5>Our books</h5>
        <ul>
            {ISAAC_BOOKS.filter(book => book.hidden !== BookHiddenState.HIDDEN).map((book, index) => <li key={index}>
                <StyledTabPicker checkboxTitle={book.title} checked={false} onClick={() => history.push(book.path)}/>
            </li>)}
        </ul>
    </ContentSidebar>;
};
