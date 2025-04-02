import React, { ChangeEvent, RefObject, useEffect, useRef, useState } from "react";
import { Col, ColProps, RowProps, Input, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Form, Label } from "reactstrap";
import partition from "lodash/partition";
import classNames from "classnames";
import { AssignmentDTO, ContentSummaryDTO, IsaacBookIndexPageDTO, IsaacConceptPageDTO, QuestionDTO, QuizAssignmentDTO, QuizAttemptDTO, RegisteredUserDTO, Stage } from "../../../../IsaacApiTypes";
import { above, ACCOUNT_TAB, ACCOUNT_TABS, AUDIENCE_DISPLAY_FIELDS, below, BOARD_ORDER_NAMES, BoardCompletions, BoardCreators, BoardLimit, BoardSubjects, BoardViews, confirmThen, determineAudienceViews, EventStageMap, EventStatusFilter, EventTypeFilter, filterAssignmentsByStatus, filterAudienceViewsByProperties, getDistinctAssignmentGroups, getDistinctAssignmentSetters, getHumanContext, getThemeFromContextAndTags, HUMAN_STAGES, ifKeyIsEnter, isAda, isDefined, PHY_NAV_SUBJECTS, isTeacherOrAbove, QuizStatus, siteSpecific, TAG_ID, tags, STAGE, useDeviceSize, LearningStage, HUMAN_SUBJECTS, ArrayElement, isFullyDefinedContext, isSingleStageContext, Item, stageLabelMap } from "../../../services";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { selectors, useAppSelector, useGetQuizAssignmentsAssignedToMeQuery } from "../../../state";
import { Link, useHistory, useLocation } from "react-router-dom";
import { AppGroup, AssignmentBoardOrder, PageContextState, Tag } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";
import { QuestionFinderFilterPanel, QuestionFinderFilterPanelProps } from "../panels/QuestionFinderFilterPanel";
import { AssignmentState } from "../../pages/MyAssignments";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { Spacer } from "../Spacer";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { GroupSelector } from "../../pages/Groups";
import { QuizRubricButton, SectionProgress } from "../quiz/QuizAttemptComponent";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { formatISODateOnly } from "../DateString";
import queryString from "query-string";
import { EventsPageQueryParams } from "../../pages/Events";
import { StyledDropdown } from "../inputs/DropdownInput";
import { StyledSelect } from "../inputs/StyledSelect";
import { CollapsibleList } from "../CollapsibleList";
import { extendUrl } from "../../pages/subjectLandingPageComponents";

export const SidebarLayout = (props: RowProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Row {...rest} className={classNames("sidebar-layout", className)}/>, props.children);
};

export const MainContent = (props: ColProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Col xs={12} lg={8} xl={9} {...rest} className={classNames(className, "order-0 order-lg-1")} />, props.children);
};

const QuestionLink = (props: React.HTMLAttributes<HTMLLIElement> & {question: QuestionDTO}) => {
    const { question, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);
    const audienceFields = filterAudienceViewsByProperties(determineAudienceViews(question.audience), AUDIENCE_DISPLAY_FIELDS);
                        
    return <li key={question.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, question.tags ?? [])}>
        <Link to={`/questions/${question.id}`} className="py-2">
            <i className="icon icon-question"/>
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
            <i className="icon icon-lightbulb"/>
            <span className="hover-underline link-title">{concept.title}</span>
        </Link>
    </li>;
};

interface SidebarProps extends ColProps {

}

const NavigationSidebar = (props: SidebarProps) => {
    // A navigation sidebar is used for external links that are supplementary to the main content (e.g. related content);
    // the content in such a sidebar will collapse underneath the main content on smaller screens
    if (isAda) return <></>;

    const { className, ...rest } = props;
    return <Col lg={4} xl={3} {...rest} className={classNames("sidebar no-print p-4 order-1 order-lg-0", className)} />;
};

interface ContentSidebarProps extends SidebarProps {
    buttonTitle?: string;
}

const ContentSidebar = (props: ContentSidebarProps) => {
    // A content sidebar is used to interact with the main content, e.g. filters or search boxes, or for in-page nav (e.g. lessons and revision);
    // the content in such a sidebar will collapse into a button accessible from above the main content on smaller screens
    const deviceSize = useDeviceSize();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(m => !m);

    const pageTheme = useAppSelector(selectors.pageContext.subject);

    if (isAda) return <></>;

    const { className, buttonTitle, ...rest } = props;
    return <>
        {above['lg'](deviceSize) 
            ? <Col lg={4} xl={3} {...rest} className={classNames("d-none d-lg-flex flex-column sidebar no-print p-4 order-0", className)} />
            : <>
                <div className="d-flex align-items-center no-print flex-wrap py-3 gap-3">
                    <AffixButton color="keyline" size="lg" onClick={toggleMenu} affix={{
                        affix: "icon-sidebar", 
                        position: "prefix", 
                        type: "icon"
                    }}>
                        {buttonTitle ?? "Search and filter"}
                    </AffixButton>
                </div>
                <Offcanvas id="content-sidebar-offcanvas" direction="start" isOpen={menuOpen} toggle={toggleMenu} container="#root" data-bs-theme={pageTheme ?? "neutral"}>
                    <OffcanvasHeader toggle={toggleMenu} close={
                        <div className="d-flex w-100 justify-content-end align-items-center flex-wrap p-3">
                            <AffixButton color="keyline" size="lg" onClick={toggleMenu} affix={{
                                affix: "icon-close", 
                                position: "prefix", 
                                type: "icon"
                            }}>
                                Close
                            </AffixButton>
                        </div>
                    }/>
                    <OffcanvasBody>
                        <Col {...rest} className={classNames("sidebar p-4 pt-0", className)} />
                    </OffcanvasBody>
                </Offcanvas>
            </>
        }
    </>;
};

export const KeyItem = (props: React.HTMLAttributes<HTMLSpanElement> & {icon: string, text: string}) => {
    const { icon, text, ...rest } = props;
    return <span {...rest} className={classNames(rest.className, "d-flex align-items-center pt-2")}><img className="pe-2" src={`/assets/phy/icons/redesign/${icon}.svg`} alt=""/> {text}</span>;
};

interface QuestionSidebarProps extends SidebarProps {
    relatedContent: ContentSummaryDTO[] | undefined;
}

export const QuestionSidebar = (props: QuestionSidebarProps) => {
    // TODO: this implementation is only for standalone questions; if in the context of a gameboard, the sidebar should show gameboard navigation
    const relatedConcepts = props.relatedContent?.filter(c => c.type === "isaacConceptPage") as IsaacConceptPageDTO[] | undefined;
    const relatedQuestions = props.relatedContent?.filter(c => c.type === "isaacQuestionPage") as QuestionDTO[] | undefined;

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
                There are no related concepts for this question.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "concepts")} affix={{affix: "icon-right", position: "suffix", type: "icon"}}>
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
                <div className="d-flex flex-column sidebar-key">
                    Key
                    <KeyItem icon="status-in-progress" text="Question in progress"/>
                    <KeyItem icon="status-correct" text="Question completed correctly"/>
                    <KeyItem icon="status-incorrect" text="Question completed incorrectly"/>
                </div>

            </>
            : <>
                There are no related questions for this question.
                {isFullyDefinedContext(pageContext) && <AffixButton color="keyline" className="mt-3 w-100" tag={Link} to={extendUrl(pageContext, "questions")} affix={{affix: "icon-right", position: "suffix", type: "icon"}}>
                    See all questions for {getHumanContext(pageContext)}
                </AffixButton>}
            </>
        }
    </NavigationSidebar>;
};

export const ConceptSidebar = (props: QuestionSidebarProps) => {
    return <QuestionSidebar {...props} />;
};



interface FilterCheckboxProps extends React.HTMLAttributes<HTMLElement> {
    tag: Tag;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    tagCounts?: Record<string, number>;
    incompatibleTags?: Tag[]; // tags that are removed when this tag is added
    dependentTags?: Tag[]; // tags that are removed when this tag is removed
    baseTag?: Tag; // tag to add when all tags are removed
    partiallySelected?: boolean;
    checkboxStyle?: "tab" | "button";
    bsSize?: "sm" | "lg";
}

const FilterCheckbox = (props : FilterCheckboxProps) => {
    const {tag, conceptFilters, setConceptFilters, tagCounts, checkboxStyle, incompatibleTags, dependentTags, baseTag, partiallySelected, ...rest} = props;
    const [checked, setChecked] = useState(conceptFilters.includes(tag));

    useEffect(() => {
        setChecked(conceptFilters.includes(tag));
    }, [conceptFilters, tag]);

    const handleCheckboxChange = (checked: boolean) => {
        const newConceptFilters = checked 
            ? [...conceptFilters.filter(c => !incompatibleTags?.includes(c)), ...(!partiallySelected ? [tag] : [])] 
            : conceptFilters.filter(c => ![tag, ...(dependentTags ?? [])].includes(c));
        setConceptFilters(newConceptFilters.length > 0 ? newConceptFilters : (baseTag ? [baseTag] : []));
    };

    return checkboxStyle === "button" 
        ? <StyledCheckbox {...rest} id={tag.id} checked={checked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange(e.target.checked)}
            label={<span>{tag.title} {tagCounts && isDefined(tagCounts[tag.id]) && <span className="text-muted">({tagCounts[tag.id]})</span>}</span>}
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
            {applicableTags
                .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0)
                .map(tag => 
                    <FilterCheckbox 
                        key={tag.id} 
                        tag={tag} 
                        conceptFilters={conceptFilters} 
                        setConceptFilters={setConceptFilters} 
                        tagCounts={tagCounts} 
                        incompatibleTags={[subjectTag]} 
                        baseTag={subjectTag}
                    />
                )
            }
        </div>

        <div className="section-divider"/>

        <div className="sidebar-help">
            <p>The concepts shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.</p>
            <p>If you want to explore broader concepts across multiple subjects or learning stages, you can use the main concept browser:</p>
            <AffixButton size="md" color="keyline" tag={Link} to="/concepts" affix={{
                affix: "icon-right",
                position: "suffix",
                type: "icon"
            }}>
                Browse concepts
            </AffixButton>
        </div>
    </ContentSidebar>;
};

export const GenericConceptsSidebar = (props: ConceptListSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <h5>Search concepts</h5>
        <Input
            className='search--filter-input my-4'
            type="search" value={searchText || ""}
            placeholder="e.g. Forces"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
        />

        <div className="section-divider"/>
        
        <div className="d-flex flex-column">
            <h5>Filter by subject</h5>
            {Object.keys(PHY_NAV_SUBJECTS).map((subject, i) => {
                const subjectTag = tags.getById(subject as TAG_ID);
                const descendentTags = tags.getDirectDescendents(subjectTag.id);
                const isSelected = conceptFilters.includes(subjectTag) || descendentTags.some(tag => conceptFilters.includes(tag));
                const isPartial = descendentTags.some(tag => conceptFilters.includes(tag)) && descendentTags.some(tag => !conceptFilters.includes(tag));
                return <div key={i} className={classNames("ps-2", {"checkbox-region": isSelected})}>
                    <FilterCheckbox 
                        checkboxStyle="button" color="theme" data-bs-theme={subject} tag={subjectTag} conceptFilters={conceptFilters} 
                        setConceptFilters={setConceptFilters} tagCounts={tagCounts} dependentTags={descendentTags} incompatibleTags={descendentTags}
                        partiallySelected={descendentTags.some(tag => conceptFilters.includes(tag))} // not quite isPartial; this is also true if all descendents selected
                        className={classNames({"icon-checkbox-off": !isSelected, "icon icon-checkbox-partial-alt": isSelected && isPartial, "icon-checkbox-selected": isSelected && !isPartial})}
                    />
                    {isSelected && <div className="ms-3 ps-2">
                        {descendentTags
                            .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0)
                            // .sort((a, b) => tagCounts ? tagCounts[b.id] - tagCounts[a.id] : 0)
                            .map((tag, j) => <FilterCheckbox key={j} 
                                checkboxStyle="button" color="theme" bsSize="sm" data-bs-theme={subject} tag={tag} conceptFilters={conceptFilters} 
                                setConceptFilters={setConceptFilters} tagCounts={tagCounts} incompatibleTags={[subjectTag]}
                            />)
                        }
                    </div>}
                </div>;
            })}
        </div>

        <div className="section-divider"/>

        {pageContext?.subject && <>
            <div className="section-divider"/>

            <div className="sidebar-help">
                <p>The concepts shown on this page have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.</p>
                <p>If you want to explore broader concepts across multiple subjects or learning stages, you can use the main concept browser:</p>
                <AffixButton size="md" color="keyline" tag={Link} to="/concepts" affix={{
                    affix: "icon-right",
                    position: "suffix",
                    type: "icon"
                }}>
                    Browse concepts
                </AffixButton>
            </div>
        </>}
    </ContentSidebar>;
};

interface QuestionFinderSidebarProps extends SidebarProps {
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    questionFilters: Tag[];
    setQuestionFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    topLevelFilters: string[];
    tagCounts?: Record<string, number>;
    questionFinderFilterPanelProps: QuestionFinderFilterPanelProps
}

export const QuestionFinderSidebar = (props: QuestionFinderSidebarProps) => {
    const { searchText, setSearchText, questionFilters, setQuestionFilters, topLevelFilters, tagCounts, questionFinderFilterPanelProps, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <h5>Search Questions</h5>
        <Input
            className='search--filter-input my-4'
            type="search" value={searchText || ""}
            placeholder="e.g. Man vs. Horse"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
        />

        <QuestionFinderFilterPanel {...questionFinderFilterPanelProps} />

        {pageContext?.subject && pageContext?.stage && <>
            <div className="section-divider"/>

            <div className="sidebar-help">
                <p>The questions shown here have been filtered to only show those that are relevant to {getHumanContext(pageContext)}.</p>
                <p>If you want to explore our full range of questions across multiple subjects or learning stages, you can use the main question finder:</p>
                <AffixButton size="md" color="keyline" tag={Link} to="/questions" affix={{
                    affix: "icon-right",
                    position: "suffix",
                    type: "icon"
                }}>
                    Browse all questions
                </AffixButton>
            </div>
        </>}
    </ContentSidebar>;
};

export const PracticeQuizzesSidebar = (props: SidebarProps) => {
    // TODO
    return <ContentSidebar {...props}/>;
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
    assignmentQuery: any;
}

export const MyAssignmentsSidebar = (props: MyAssignmentsSidebarProps) => {
    const { statusFilter, setStatusFilter, titleFilter, setTitleFilter, groupFilter, setGroupFilter, setByFilter, setSetByFilter, assignmentQuery, ...rest } = props;

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
                <h5>Search assignments</h5>
                <Input
                    className='search--filter-input my-4'
                    type="search" value={titleFilter || ""}
                    placeholder="e.g. Forces"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleFilter(e.target.value)}
                />
                <div className="section-divider"/>
                <h5 className="mb-4">Filter by status</h5>
                <AssignmentStatusAllCheckbox statusFilter={statusFilter} setStatusFilter={setStatusFilter} count={assignmentCountByStatus?.[AssignmentState.ALL]}/>
                <div className="section-divider-small"/>
                {Object.values(AssignmentState).filter(s => s !== AssignmentState.ALL).map(state => <AssignmentStatusCheckbox 
                    key={state} status={state} count={assignmentCountByStatus?.[state]}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
                />)}
                <h5 className="mt-4 mb-3">Filter by group</h5>
                <Input type="select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                    {["All", ...getDistinctAssignmentGroups(assignments)].map(group => <option key={group} value={group}>{group}</option>)}
                </Input>
                <h5 className="mt-4 mb-3">Filter by assigner</h5>
                <Input type="select" value={setByFilter} onChange={e => setSetByFilter(e.target.value)}>
                    {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                </Input>
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
        <div className="section-divider"/>
        <h5>Search gameboards</h5>
        <Input
            className='search--filter-input my-4'
            type="search" value={boardTitleFilter || ""}
            placeholder="e.g. Forces"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardTitleFilter(e.target.value)}
        />
        <div className="section-divider"/>
        <h5 className="mb-4">Display</h5>
        <div className="d-flex flex-xl-column flex-xxl-row">
            <Input className="w-auto" type="select" value={displayMode} onChange={e => setDisplayMode(e.target.value as BoardViews)}>
                {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
            </Input>
            {deviceSize === "xl" ? <div className="mt-2"/> : <Spacer/>}
            <div className="select-pretext me-2">Limit:</div>
            <Input className="w-auto" type="select" value={displayLimit} onChange={e => setDisplayLimit(e.target.value as BoardLimit)}>
                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
            </Input>
        </div>
        <h5 className="mt-4 mb-3">Filter by creator</h5>
        <Input type="select" value={boardCreatorFilter} onChange={e => setBoardCreatorFilter(e.target.value as BoardCreators)}>
            {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
        </Input>
        <h5 className="mt-4 mb-3">Filter by completion</h5>
        <Input type="select" value={boardCompletionFilter} onChange={e => setBoardCompletionFilter(e.target.value as BoardCompletions)}>
            {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
        </Input>
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

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        <div className="section-divider"/>
        <h5>Search gameboards</h5>
        <Input
            className='search--filter-input my-4'
            type="search" value={boardTitleFilter || ""}
            placeholder="e.g. Forces"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardTitleFilter(e.target.value)}
        />
        <div className="section-divider"/>
        <h5 className="mb-4">Display</h5>
        <div className="d-flex">
            <Input className="w-auto" type="select" value={displayMode} onChange={e => setDisplayMode(e.target.value as BoardViews)}>
                {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
            </Input>
            <Spacer/>
            <div className="select-pretext">Limit:</div>
            <Input className="w-auto" type="select" value={displayLimit} onChange={e => setDisplayLimit(e.target.value as BoardLimit)}>
                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
            </Input>
        </div>
        <h5 className="mt-4 mb-3">Sort by</h5>
        <Input type="select" className="mb-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as AssignmentBoardOrder)} disabled={sortDisabled}>
            {Object.values(AssignmentBoardOrder).filter(
                order => !['attempted', '-attempted', 'correct', '-correct'].includes(order)
            ).map(order => <option key={order} value={order}>{BOARD_ORDER_NAMES[order]}</option>)}
        </Input>
        {sortDisabled && <div className="small text-muted mt-2">
            Sorting is disabled if some gameboards are hidden. Increase the display limit to show all gameboards.
        </div>}
        <div className="section-divider"/>
        <h5 className="mb-3">Filter by subject</h5>
        <Input type="select" value={boardSubject} onChange={e => setBoardSubject(e.target.value as BoardSubjects)}>
            {Object.values(BoardSubjects).map(subject => <option key={subject} value={subject}>{subject}</option>)}
        </Input>
        <h5 className="mt-4 mb-3">Filter by creator</h5>
        <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
            {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
        </Input>
    </ContentSidebar>;
};

interface QuizSidebarProps extends SidebarProps {
    attempt: QuizAttemptDTO;
    viewingAsSomeoneElse: boolean;
    totalSections: number;
    currentSection?: number;
    sectionStates: SectionProgress[];
    sectionTitles: string[];
}

export const QuizSidebar = (props: QuizSidebarProps) => {
    const { attempt, viewingAsSomeoneElse, totalSections, currentSection, sectionStates, sectionTitles } = props;
    const deviceSize = useDeviceSize();
    const history = useHistory();
    const location = history.location.pathname;
    const rubricPath = 
        viewingAsSomeoneElse ? location.split("/").slice(0, 6).join("/") :
            attempt.feedbackMode ? location.split("/").slice(0, 5).join("/") :
                location.split("/page")[0];

    const progressIcon = (section: number) => {
        return sectionStates[section] === SectionProgress.COMPLETED ? "icon-correct"
            : sectionStates[section] === SectionProgress.STARTED ? "icon-in-progress"
                : "";
    };

    const switchToPage = (page: string) => {
        if (viewingAsSomeoneElse || attempt.feedbackMode) {
            history.push(rubricPath.concat("/", page));
        }
        else {
            history.push(rubricPath.concat("/page/", page));
        }
    };

    const SidebarContents = () => {
        return <ContentSidebar buttonTitle="Sections">
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
                <KeyItem icon="status-in-progress" text="Section in progress"/>
                <KeyItem icon="status-correct" text="Section completed"/>
            </div>
        </ContentSidebar>;
    };

    return <>
        {below["md"](deviceSize) ?
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
        {ACCOUNT_TABS.filter(tab => !tab.hidden && !(editingOtherUser && tab.hiddenIfEditingOtherUser)).map(({tab, title}) => 
            <StyledTabPicker
                key={tab} id={title} tabIndex={0} checkboxTitle={title} checked={activeTab === tab}
                onClick={() => setActiveTab(tab)} onKeyDown={ifKeyIsEnter(() => setActiveTab(tab))}
            />
        )}
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
            setShowArchived={setShowArchived} groupNameInputRef={groupNameInputRef} createNewGroup={createNewGroup} showCreateGroup={true} sidebarStyle={true} useHashAnchor={false}/>
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

    return <ContentSidebar buttonTitle="Search & Filter">
        {above["lg"](deviceSize) && <div className="section-divider mt-5"/>}
        <h5>Search &amp; Filter</h5>
        <span className="quiz-filter-date-span mt-2">Title</span>
        <Input
            id="available-quizzes-title-filter" type="search"
            value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
            placeholder="Search by title" aria-label="Search by title"
        />
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
        <DropdownToggle className="bg-transparent border-0 px-2" caret>{dateFilterType}</DropdownToggle>
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

    const titleFilterInput = <div className="my-2">
        <span className="quiz-filter-date-span">Title</span>
        <Input
            id="manage-quizzes-title-filter" type="search"
            value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
            placeholder="Search by title" aria-label="Search by title"
        /> 
    </div>;

    const groupFilterInput = <div className="my-2">
        <span className="quiz-filter-date-span">Group</span>
        <Input
            id="manage-quizzes-group-name-filter" type="search"
            value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
            placeholder="Search by group" aria-label="Search by group"
        />
    </div>;

    const setDateFilterInput = <div className="my-2">
        <div className="d-flex align-items-center">
            <span className="quiz-filter-date-span">Starting</span>
            {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
        </div>
        <Input
            id="manage-quizzes-set-date-filter" type="date" className="quiz-filter-date-input"
            value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
            placeholder="Filter by set date" aria-label="Filter by set date"
        />
    </div>;

    const dueDateFilterInput = <div className="my-2">
        <div className="d-flex align-items-center">
            <span className="quiz-filter-date-span">Due</span>
            {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
        </div>
        <Input
            id="manage-quizzes-due-date-filter" type="date" className="quiz-filter-date-input"
            value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
            placeholder="Filter by due date" aria-label="Filter by due date"
        />
    </div>;

    return <ContentSidebar buttonTitle="Search & Filter">
        {above["lg"](deviceSize) && <div className="section-divider mt-5"/>}
        <h5>Search & Filter</h5>
        {titleFilterInput}
        {groupFilterInput}
        {setDateFilterInput}
        {dueDateFilterInput}
    </ContentSidebar>;
};

export const EventsSidebar = (props: SidebarProps) => {
    const history = useHistory();
    const query: EventsPageQueryParams = queryString.parse(history.location.search);
    const user = useAppSelector(selectors.user.orNull);

    return <ContentSidebar style={{marginTop: "65px"}} buttonTitle="Filter events" {...props}>
        <Form>
            <h5 className="mb-3">Event type</h5>
            <ul>               
                {Object.entries(EventStatusFilter)
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn) || statusValue !== EventStatusFilter["My booked events"])
                    .filter(([_statusLabel, statusValue]) => (user && user.loggedIn && isTeacherOrAbove(user)) || statusValue !== EventStatusFilter["My event reservations"])
                    .map(([statusLabel, statusValue]) =>
                        <li className="list-unstyled" key={statusValue}>
                            <Label className="py-1 label-radio d-flex">
                                <Input                                   
                                    id={statusValue}
                                    name="event-status"
                                    color="primary"
                                    type="radio"
                                    defaultChecked={
                                        (!isDefined(query.event_status) && statusValue === EventStatusFilter["Upcoming events"]) ||
                                        (query.show_booked_only && statusValue === EventStatusFilter["My booked events"]) ||
                                        (query.show_reservations_only && statusValue === EventStatusFilter["My event reservations"]) ||
                                        (query.event_status === "all" && statusValue === EventStatusFilter["All events"])
                                    }
                                    onChange={() => {
                                        const selectedFilter = statusValue;
                                        query.show_booked_only = selectedFilter === EventStatusFilter["My booked events"] ? true : undefined;
                                        query.show_reservations_only = selectedFilter === EventStatusFilter["My event reservations"] ? true : undefined;
                                        query.event_status = selectedFilter == EventStatusFilter["All events"] ? "all" : undefined;
                                        history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                                    }}
                                />
                                <div className="flex-fill overflow-x-auto">
                                    <span>{statusLabel}</span>
                                </div>
                            </Label>
                        </li>
                    )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Groups</h5>
            <ul>
                {Object.entries(EventTypeFilter).map(([typeLabel, typeValue]) =>
                    <li className="list-unstyled" key={typeValue}>
                        <Label className="py-1 label-radio d-flex">
                            <Input                                   
                                id={typeValue}
                                name="event-type"
                                color="primary"
                                type="radio"
                                defaultChecked={query.types ? query.types === typeValue : typeValue === EventTypeFilter["All groups"]}
                                onChange={() => {
                                    const selectedType = typeValue;
                                    query.types = selectedType !== EventTypeFilter["All groups"] ? selectedType : undefined;
                                    history.push({pathname: location.pathname, search: queryString.stringify(query as any)});}}
                            />
                            <div className="flex-fill overflow-x-auto">
                                <span>{typeLabel}</span>
                            </div>
                        </Label>
                    </li>
                )
                }
            </ul>

            <div className="section-divider"/>
            <h5 className="mb-3">Stages</h5>
            <ul>               
                {Object.entries(EventStageMap).map(([label, value]) =>
                    <li className="list-unstyled" key={value}>
                        <Label className="py-1 label-radio d-flex">
                            <Input                                   
                                id={value}
                                name="event-stage"
                                color="primary"
                                type="radio"
                                defaultChecked={query.show_stage_only ? query.show_stage_only === value : value === STAGE.ALL}
                                onChange={() => {
                                    query.show_stage_only = value !== STAGE.ALL ? value : undefined;
                                    history.push({pathname: location.pathname, search: queryString.stringify(query as any)});
                                }}
                            />
                            <div className="flex-fill overflow-x-auto">
                                <span>{label}</span>
                            </div>
                        </Label>
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
                <div className={classNames("section-divider", {"mt-5": above["lg"](deviceSize)})}/>
                <h5>Search tests</h5>
                <Input type="text" className="search--filter-input my-4" onChange={(e) => setQuizTitleFilter(e.target.value)} 
                    placeholder="Search by title" aria-label="Search by title"/>
                <div className="section-divider"/>
                <h5 className="mb-4">Filter by status</h5>
                <QuizStatusAllCheckbox statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter} count={undefined}/>
                <div className="section-divider-small"/>
                {statusOptions.map(state => <QuizStatusCheckbox 
                    key={state} status={state} count={undefined} statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter} 
                />)}
                <h5 className="mt-4 mb-3">Filter by assigner</h5>
                <Input type="select" onChange={e => setQuizCreatorFilter(e.target.value)}>
                    {["All", ...getDistinctAssignmentSetters(quizzes)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                </Input>
                <div className="section-divider mt-4"/>
                <h5 className="mb-3">Display mode</h5>
                <StyledDropdown value={displayMode} onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}>
                    <option value="table">Table View</option>
                    <option value="cards">Card View</option>
                </StyledDropdown>
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
    </ContentSidebar>;
};


interface GlossarySidebarProps extends SidebarProps {
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
    const { searchText, setSearchText, filterSubject, setFilterSubject, filterStage, setFilterStage, subjects, stages, ...rest } = props;
    
    const history = useHistory();
    const pageContext = useAppSelector(selectors.pageContext.context);

    return <ContentSidebar buttonTitle="Search glossary" {...rest}>
        <div className="section-divider"/>
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
                                    <span className="flex-grow-1">{section.title}</span>
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

export const GenericPageSidebar = () => {
    // Default sidebar for general pages that don't have a custom sidebar
    return <ContentSidebar buttonTitle="Options">
        <div className="section-divider"/>
        <AffixButton color="keyline" tag={Link} to={"/"} affix={{affix: "icon-right", position: "suffix", type: "icon"}}>
            Go to homepage
        </AffixButton>
    </ContentSidebar>;
};

export const PolicyPageSidebar = () => {
    const history = useHistory();
    const path = useLocation().pathname;

    return <ContentSidebar buttontitle="Select a page">
        <div className="section-divider"/>
        <h5>Select a page</h5>
        <ul>
            <li><StyledTabPicker checkboxTitle="Accessibility Statement" checked={path === "/accessibility"} onClick={() => history.push("/accessibility")}/></li>
            <li><StyledTabPicker checkboxTitle="Privacy Policy" checked={path === "/privacy"} onClick={() => history.push("/privacy")}/></li>
            <li><StyledTabPicker checkboxTitle="Cookie Policy" checked={path === "/cookies"} onClick={() => history.push("/cookies")}/></li>
            <li><StyledTabPicker checkboxTitle="Terms of Use" checked={path === "/terms"} onClick={() => history.push("/terms")}/></li>
        </ul>
    </ContentSidebar>;
};
