import classNames from "classnames";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ContentSummaryDTO, GameboardItem, CompletionState } from "../../../../IsaacApiTypes";
import { TAG_LEVEL, tags, SUBJECT_SPECIFIC_CHILDREN_MAP, isDefined, filterAudienceViewsByProperties, determineAudienceViews, AUDIENCE_DISPLAY_FIELDS, getThemeFromContextAndTags } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { Markup } from "../markup";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { Tag } from "../../../../IsaacAppTypes";

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