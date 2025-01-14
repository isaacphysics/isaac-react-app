import React, { ChangeEvent, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { Col, ColProps, Container, ContainerProps, Input, Label, Row } from "reactstrap";
import partition from "lodash/partition";
import classNames from "classnames";
import { ContentSummaryDTO, IsaacConceptPageDTO, QuestionDTO } from "../../../../IsaacApiTypes";
import { AUDIENCE_DISPLAY_FIELDS, determineAudienceViews, filterAudienceViewsByProperties, getThemeFromContextAndTags, isDefined, stageLabelMap } from "../../../services";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { selectors, useAppSelector } from "../../../state";
import { Link } from "react-router-dom";
import { Tag } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";

interface SidebarLayoutProps extends ContainerProps {

}

export const SidebarContainer = (props: SidebarLayoutProps) => {
    const { children, className, ...rest } = props;
    return <Container fluid {...rest} className={classNames("sidebar-layout", className)}>
        <Row>
            {children}
        </Row>
    </Container>;
};

export const MainContent = (props: ColProps) => {
    return <Col xs={12} lg={8} xl={9} {...props} />;
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
    </li>
};

interface SidebarProps extends ColProps {

}

const Sidebar = (props: SidebarProps) => {
    const { className, ...rest } = props;
    return <Col lg={4} xl={3} {...rest} className={classNames("sidebar p-4", className)} />;
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

    return <Sidebar ref={sidebarRef}>
        {relatedConcepts && relatedConcepts.length > 0 && <>
            <div className="section-divider"/>
            <h5>Related concepts</h5>
            <ul>
                {relatedConcepts.map((concept, i) => <ConceptLink key={i} concept={concept} sidebarRef={sidebarRef} />)}
            </ul>
        </>}
        {relatedQuestions && relatedQuestions.length > 0 && <>
            {pageContextStage === "all" || !pageContextStage || relatedQuestionsForContextStage.length === 0 || relatedQuestionsForOtherStages.length === 0
                ? <>
                    <div className="section-divider"/>
                    <h5>Related questions</h5>
                    <ul>
                        {relatedQuestions.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                </>
                : <>
                    <div className="section-divider"/>
                    <h5>Related {stageLabelMap[pageContextStage]} questions</h5>
                    <ul>
                        {relatedQuestionsForContextStage.map((question, i) => <QuestionLink key={i} sidebarRef={sidebarRef} question={question} />)}
                    </ul>
                    <div className="section-divider"/>
                    <h5>Related questions for other learning stages</h5>
                    <ul>
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
    </Sidebar>;
};

export const ConceptSidebar = (props: QuestionSidebarProps) => {
    return <QuestionSidebar {...props} />;
};

interface FilterCheckboxBaseProps extends React.HTMLAttributes<HTMLLabelElement> {
    id: string;
    checked?: boolean;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
    filterTitle: ReactNode;
    conceptFilters?: Tag[];
    count?: number;
}

const FilterCheckboxBase = (props: FilterCheckboxBaseProps) => {
    const { id, checked, onInputChange, filterTitle, count, ...rest } = props;
    return <Label {...rest} className="d-flex align-items-center filters-checkbox py-2 mb-1">
        <Input id={`problem-search-${id}`} type="checkbox" checked={checked ?? false} onChange={onInputChange} />
        <span className="ms-3">{filterTitle}</span>
        {isDefined(count) && <span className="badge rounded-pill ms-2">{count}</span>}
    </Label>;
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

    return <FilterCheckboxBase {...rest} id={tag.id} checked={checked} 
        onInputChange={(e: ChangeEvent<HTMLInputElement>) => setConceptFilters(f => e.target.checked ? [...f, tag] : f.filter(c => c !== tag))}
        filterTitle={tag.title} count={tagCounts && isDefined(tagCounts[tag.id]) ? tagCounts[tag.id] : undefined}
    />;
};

const AllFiltersCheckbox = (props: Omit<FilterCheckboxProps, "tag">) => {
    const { conceptFilters, setConceptFilters, tagCounts, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<Tag[]>([]);
    return <FilterCheckboxBase {...rest} 
        id="all" checked={!conceptFilters.length} filterTitle="All" count={tagCounts && Object.values(tagCounts).reduce((a, b) => a + b, 0)}
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

    return <Sidebar {...rest}>
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
            <p>The concepts shown on this page have been filtered to only show those that are relevant to GCSE Physics.</p>
            <p>If you want to explore broader concepts across multiple subjects or learning stages, you can use the main concept browser:</p>
            <AffixButton size="md" color="keyline" tag={Link} to="/concepts" affix={{
                affix: "icon-right",
                position: "suffix",
                type: "icon"
            }}>
                Browse concepts
            </AffixButton>
        </div>
    </Sidebar>;
};

export const GenericConceptsSidebar = (props: SidebarProps) => {
    // TODO
    return <Sidebar {...props}/>;
};

export const QuestionFinderSidebar = (props: SidebarProps) => {
    // TODO
    return <Sidebar {...props}/>;
};

export const PracticeQuizzesSidebar = (props: SidebarProps) => {
    // TODO
    return <Sidebar {...props}/>;
};
