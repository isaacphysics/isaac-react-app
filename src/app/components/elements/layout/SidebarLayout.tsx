import React, { ChangeEvent, RefObject, useEffect, useRef, useState } from "react";
import { Col, ColProps, RowProps, Input, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import partition from "lodash/partition";
import classNames from "classnames";
import { AssignmentDTO, ContentSummaryDTO, IsaacConceptPageDTO, QuestionDTO, RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { above, ACCOUNT_TAB, ACCOUNT_TABS, AUDIENCE_DISPLAY_FIELDS, BOARD_ORDER_NAMES, BoardCompletions, BoardCreators, BoardLimit, BoardSubjects, BoardViews, confirmThen, determineAudienceViews, filterAssignmentsByStatus, filterAudienceViewsByProperties, getDistinctAssignmentGroups, getDistinctAssignmentSetters, getThemeFromContextAndTags, HUMAN_STAGES, ifKeyIsEnter, isAda, isDefined, siteSpecific, useDeviceSize } from "../../../services";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { selectors, useAppSelector } from "../../../state";
import { Link, useHistory } from "react-router-dom";
import { AppGroup, AssignmentBoardOrder, Tag } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";
import { getHumanContext } from "../../../services/pageContext";
import { AssignmentState } from "../../pages/MyAssignments";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { Spacer } from "../Spacer";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { GroupSelector } from "../../pages/Groups";
import { formatISODateOnly } from "../DateString";

export const SidebarLayout = (props: RowProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Row {...rest} className={classNames("sidebar-layout", className)}/>, props.children);
};

export const MainContent = (props: ColProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Col xs={12} lg={8} xl={9} {...rest} className={classNames(className, "order-0 order-lg-1")} />, props.children);
};

const QuestionLink = (props: React.HTMLAttributes<HTMLLIElement> & {question: QuestionDTO, sidebarRef: RefObject<HTMLDivElement>}) => {
    const { question, sidebarRef, ...rest } = props;
    const audienceFields = filterAudienceViewsByProperties(determineAudienceViews(question.audience), AUDIENCE_DISPLAY_FIELDS);
                        
    return <li key={question.id} {...rest} data-bs-theme={getThemeFromContextAndTags(sidebarRef, question.tags ?? [])}>
        <Link to={`/questions/${question.id}`} className="py-2">
            <i className="icon icon-question"/>
            <div className="d-flex flex-column w-100">
                <span className="hover-underline link-title">{question.title}</span>
                <StageAndDifficultySummaryIcons iconClassName="me-4 pe-2" audienceViews={audienceFields}/>
            </div>
        </Link>
    </li>;
};

const ConceptLink = (props: React.HTMLAttributes<HTMLLIElement> & {concept: IsaacConceptPageDTO, sidebarRef: RefObject<HTMLDivElement>}) => {
    const { concept, sidebarRef, ...rest } = props;
    
    return <li key={concept.id} {...rest} data-bs-theme={getThemeFromContextAndTags(sidebarRef, concept.tags ?? [])}>
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
    return <Col lg={4} xl={3} {...rest} className={classNames("sidebar p-4 order-1 order-lg-0", className)} />;
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

    if (isAda) return <></>;

    const { className, buttonTitle, ...rest } = props;
    return <>
        {above['lg'](deviceSize) 
            ? <Col lg={4} xl={3} {...rest} className={classNames("d-none d-lg-flex flex-column sidebar p-4 order-0", className)} />
            : <>
                <div className="d-flex align-items-center flex-wrap py-3 gap-3">
                    <AffixButton color="keyline" size="lg" onClick={toggleMenu} affix={{
                        affix: "icon-sidebar", 
                        position: "prefix", 
                        type: "icon"
                    }}>
                        {buttonTitle ?? "Search and filter"}
                    </AffixButton>
                </div>
                <Offcanvas id="content-sidebar-offcanvas" direction="start" isOpen={menuOpen} toggle={toggleMenu} container="#root">
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

const KeyItem = (props: React.HTMLAttributes<HTMLSpanElement> & {icon: string, text: string}) => {
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

    const pageContextStage = useAppSelector(selectors.pageContext.stage);

    const [relatedQuestionsForContextStage, relatedQuestionsForOtherStages] = partition(relatedQuestions, q => q.audience && determineAudienceViews(q.audience).some(v => v.stage === pageContextStage));

    const sidebarRef = useRef<HTMLDivElement>(null);

    return <NavigationSidebar ref={sidebarRef}>
        {relatedConcepts && relatedConcepts.length > 0 && <>
            <div className="section-divider"/>
            <h5>Related concepts</h5>
            <ul className="link-list">
                {relatedConcepts.map((concept, i) => <ConceptLink key={i} concept={concept} sidebarRef={sidebarRef} />)}
            </ul>
        </>}
        {relatedQuestions && relatedQuestions.length > 0 && <>
            {!pageContextStage || pageContextStage.length > 1 || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                ? <>
                    <div className="section-divider"/>
                    <h5>Related questions</h5>
                    <ul className="link-list">
                        {relatedQuestions.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                </>
                : <>
                    <div className="section-divider"/>
                    <h5>Related {HUMAN_STAGES[pageContextStage[0]]} questions</h5>
                    <ul className="link-list">
                        {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                    <div className="section-divider"/>
                    <h5>Related questions for other learning stages</h5>
                    <ul className="link-list">
                        {relatedQuestionsForOtherStages.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
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

        </>}
    </NavigationSidebar>;
};

export const ConceptSidebar = (props: QuestionSidebarProps) => {
    return <QuestionSidebar {...props} />;
};



interface FilterCheckboxProps extends React.HTMLAttributes<HTMLLabelElement> {
    tag: Tag;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    tagCounts?: Record<string, number>;
}

const FilterCheckbox = (props : FilterCheckboxProps) => {
    const {tag, conceptFilters, setConceptFilters, tagCounts, ...rest} = props;
    const [checked, setChecked] = useState(conceptFilters.includes(tag));

    useEffect(() => {
        setChecked(conceptFilters.includes(tag));
    }, [conceptFilters, tag]);

    return <StyledTabPicker {...rest} id={tag.id} checked={checked} 
        onInputChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilters(f => e.target.checked ? [...f, tag] : f.filter(c => c !== tag))}
        checkboxTitle={tag.title} count={tagCounts && isDefined(tagCounts[tag.id]) ? tagCounts[tag.id] : undefined}
    />;
};

const AllFiltersCheckbox = (props: Omit<FilterCheckboxProps, "tag">) => {
    const { conceptFilters, setConceptFilters, tagCounts, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<Tag[]>([]);
    return <StyledTabPicker {...rest} 
        id="all" checked={!conceptFilters.length} checkboxTitle="All" count={tagCounts && Object.values(tagCounts).reduce((a, b) => a + b, 0)}
        onInputChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(conceptFilters);
                setConceptFilters([]);
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
            <AllFiltersCheckbox conceptFilters={conceptFilters} setConceptFilters={setConceptFilters} tagCounts={tagCounts} />
            <div className="section-divider-small"/>
            {applicableTags.map(tag => <FilterCheckbox key={tag.id} tag={tag} conceptFilters={conceptFilters} setConceptFilters={setConceptFilters} tagCounts={tagCounts}/>)}
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

export const GenericConceptsSidebar = (props: SidebarProps) => {
    // TODO
    return <ContentSidebar {...props}/>;
};

export const QuestionFinderSidebar = (props: SidebarProps) => {
    // TODO
    return <ContentSidebar {...props}/>;
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
        {/* Tabs are clickable iff their page could be reached with a Back buttons */}
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
        <span className="quiz-filter-date-span">Title</span>
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