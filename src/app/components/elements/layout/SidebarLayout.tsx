import React, { ChangeEvent, useEffect, useState } from "react";
import { Col, ColProps, RowProps, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from "reactstrap";
import classNames from "classnames";
import { above, isAda, isDefined, siteSpecific, tags, useDeviceSize, TAG_LEVEL, SUBJECT_SPECIFIC_CHILDREN_MAP, AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews, filterAudienceViewsByProperties, getThemeFromContextAndTags} from "../../../services";
import { mainContentIdSlice, selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../../../state";
import { Tag, ContentSidebarContext } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { SidebarButton } from "../SidebarButton";
import { Link } from "react-router-dom";
import { ContentSummaryDTO, GameboardItem, CompletionState } from "../../../../IsaacApiTypes";
import { Markup } from "../markup";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";

export const SidebarLayout = (props: RowProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Row {...rest} className={classNames("sidebar-layout", className)}/>, props.children);
};

export const MainContent = (props: ColProps) => {
    const { className, ...rest } = props;

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(mainContentIdSlice.actions.set({id: "page-content", priority: 2}));
    }, [dispatch]);

    return siteSpecific(<Col id="page-content" xs={12} lg={8} xl={9} {...rest} tabIndex={-1} className={classNames(className, "order-0 order-lg-1")} />, props.children);
};

export type SidebarProps = ColProps

export const NavigationSidebar = (props: SidebarProps) => {
    // A navigation sidebar is used for external links that are supplementary to the main content (e.g. related content);
    // the content in such a sidebar will collapse underneath the main content on smaller screens
    if (isAda) return <></>;

    const { className, ...rest } = props;
    return <Col tag="aside" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("sidebar no-print p-4 order-1 order-lg-0", className)} />;
};

export interface ContentSidebarProps extends SidebarProps {
    buttonTitle?: string;
    hideButton?: boolean; // if true, the sidebar will not be collapsible on small screens
    optionBar?: React.JSX.Element;
}

export const ContentSidebar = (props: ContentSidebarProps) => {
    // A content sidebar is used to interact with the main content, e.g. filters or search boxes, or for in-page nav (e.g. lessons and revision);
    // the content in such a sidebar will collapse into a button accessible from above the main content on smaller screens
    const deviceSize = useDeviceSize();
    const dispatch = useAppDispatch();
    const sidebarOpen = useAppSelector(selectors.sidebar.open);
    const toggleMenu = () => dispatch(sidebarSlice.actions.toggle());
    const closeMenu = () => dispatch(sidebarSlice.actions.setOpen(false));

    const pageTheme = useAppSelector(selectors.pageContext.subject);

    if (isAda) return <></>;

    const { className, buttonTitle, hideButton, optionBar, ...rest } = props;
    return <>
        {above['lg'](deviceSize)
            ? <Col tag="aside" data-testid="sidebar" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("d-none d-lg-flex flex-column sidebar no-print p-4 order-0", className)} />
            : <>
                {optionBar && <div className="d-flex align-items-center no-print flex-wrap py-3 gap-3">
                    <div className="flex-grow-1 d-inline-grid align-items-end">{optionBar}</div>
                </div>}
                {!hideButton && <SidebarButton buttonTitle={buttonTitle} className="my-3"/>}
                <Offcanvas id="content-sidebar-offcanvas" direction="start" isOpen={sidebarOpen} toggle={toggleMenu} container="#root" data-bs-theme={pageTheme ?? "neutral"}>
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
                        <ContentSidebarContext.Provider value={{toggle: toggleMenu, close: closeMenu}}>
                            <Col {...rest} className={classNames("sidebar p-4 pt-0", className)} />
                        </ContentSidebarContext.Provider>
                    </OffcanvasBody>
                </Offcanvas>
            </>
        }
    </>;
};

export const KeyItem = (props: React.HTMLAttributes<HTMLSpanElement> & {icon: string, text: string}) => {
    const { icon, text, ...rest } = props;
    return <li {...rest} className={classNames(rest.className, "d-flex align-items-center pt-2")}>
        <i className={`icon icon-raw icon-${icon} me-2`} />
        {text}
    </li>;
};

export const CompletionKey = () => {
    return <div className="d-flex flex-column sidebar-key">
        Question key
        <ul>
            <KeyItem icon="not-started" text="Not started"/>
            <KeyItem icon="in-progress" text="In progress"/>
            <KeyItem icon="attempted" text="All attempted (some errors)"/>
            <KeyItem icon="correct" text="All correct"/>
        </ul>
    </div>;
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

export const FilterCheckbox = (props : FilterCheckboxProps) => {
    const {tag, conceptFilters, setConceptFilters, tagCounts, checkboxStyle, incompatibleTags, dependentTags, baseTag, partial, partiallySelected, ...rest} = props;
    const [checked, setChecked] = useState(conceptFilters.includes(tag));
    const pageContext = useAppSelector(selectors.pageContext.context);

    useEffect(() => {
        setChecked(conceptFilters.includes(tag));
    }, [conceptFilters, tag]);

    const handleCheckboxChange = (checked: boolean) => {
        // Reselect base tag if all children are deselected
        const siblingTags = tag.type === TAG_LEVEL.field && tag.parent ? tags.getChildren(tag.parent).filter(t => t !== tag) : [];
        const reselectBaseTag = baseTag?.id === tag.parent && siblingTags.every(t => !conceptFilters.includes(t));

        const newConceptFilters = checked
            ? [...conceptFilters.filter(c => !incompatibleTags?.includes(c)), ...(!partiallySelected ? [tag] : [])]
            : [...conceptFilters.filter(c => ![tag, ...(dependentTags ?? [])].includes(c)), ...(reselectBaseTag && baseTag ? [baseTag] : [])];
        setConceptFilters(newConceptFilters.length > 0 ? [...new Set(newConceptFilters)] : (baseTag ? [baseTag] : []));
    };

    return <>
        {pageContext?.subject && pageContext?.stage?.length === 1 && SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext.subject][pageContext.stage[0]]?.includes(tag.id) && <div>
            <p className="text-muted small mb-0 mt-1">
                {tag.parent?.toUpperCase()}
            </p>
        </div>}
        {checkboxStyle === "button"
            ? <StyledCheckbox {...rest} id={tag.id} checked={checked}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange(e.target.checked)}
                label={<span>{tag.title} {tagCounts && isDefined(tagCounts[tag.id]) && <span className="text-muted">({tagCounts[tag.id]})</span>}</span>}
                partial={partial}
            />
            : <StyledTabPicker {...rest} id={tag.id} checked={checked}
                onInputChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange(e.target.checked)}
                checkboxTitle={tag.title} count={tagCounts && isDefined(tagCounts[tag.id]) ? tagCounts[tag.id] : undefined}
            />
        }
    </>;
};

export const AllFiltersCheckbox = (props: Omit<FilterCheckboxProps, "tag"> & {forceEnabled?: boolean}) => {
    const { conceptFilters, setConceptFilters, tagCounts, baseTag, forceEnabled, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<Tag[]>([]);
    const pageContext = useAppSelector(selectors.pageContext.context);

    return <StyledTabPicker {...rest}
        id="all" checked={forceEnabled || !conceptFilters.length}
        checkboxTitle="All"
        count={tagCounts &&
            (baseTag
                ? tagCounts[baseTag.id] + (pageContext?.subject && pageContext?.stage?.length === 1
                    ? SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext?.subject][pageContext?.stage[0]]?.reduce((partialSum, tag) => partialSum + tagCounts[tag], 0) ?? 0
                    : 0)
                : Object.values(tagCounts).reduce((a, b) => a + b, 0)
            )
        }
        onInputChange={(e) => {
            if (forceEnabled) {
                setConceptFilters([]);
                return;
            }
            if (e.target.checked) {
                setPreviousFilters(conceptFilters);
                setConceptFilters([]);
            } else {
                setConceptFilters(previousFilters);
            }
        }}
    />;
};

interface QuestionLinkProps {
    question: ContentSummaryDTO | GameboardItem;
    gameboardId?: string;
}

export const QuestionLink = (props: React.HTMLAttributes<HTMLLIElement> & QuestionLinkProps) => {
    const { question, gameboardId, ...rest } = props;
    const subject = useAppSelector(selectors.pageContext.subject);
    const audienceFields = filterAudienceViewsByProperties(determineAudienceViews(question.audience), AUDIENCE_DISPLAY_FIELDS);
    const link = isDefined(gameboardId) ? `/questions/${question.id}?board=${gameboardId}` : `/questions/${question.id}`;

    const progressIcon = question.state && (question.state === CompletionState.ALL_CORRECT
        ? "icon icon-raw icon-correct"
        : [CompletionState.ALL_INCORRECT, CompletionState.ALL_ATTEMPTED].includes(question.state)
            ? "icon icon-raw icon-attempted"
            : question.state === CompletionState.IN_PROGRESS
                ? "icon icon-raw icon-in-progress"
                : "icon icon-raw icon-not-started");

    return <li key={question.id} {...rest} data-bs-theme={getThemeFromContextAndTags(subject, question.tags ?? [])}>
        <Link to={link} className="py-2">
            {(isDefined(gameboardId) || question.state !== CompletionState.NOT_ATTEMPTED) 
                ? <i className={classNames(progressIcon, {"ms-2": isDefined(gameboardId)})} style={{minWidth: "16px"}}/> 
                : <i className="icon icon-question-thick"/>
            }
            <div className="d-flex flex-column w-100">
                <span className="hover-underline link-title"><Markup encoding="latex">{question.title}</Markup></span>
                <StageAndDifficultySummaryIcons iconClassName="me-4 pe-2" audienceViews={audienceFields}/>
            </div>
        </Link>
    </li>;
};

export const Pill = ({ title, theme }: {title: string, theme?: string}) =>
    <span className="badge rounded-pill bg-theme me-1" data-bs-theme={theme}>
        {title}
    </span>;
