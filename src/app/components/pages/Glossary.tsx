import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {Col, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {AppState, logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {IsaacGlossaryTerm} from '../content/IsaacGlossaryTerm';
import {GlossaryTermDTO, Stage} from "../../../IsaacApiTypes";
import {
    isAda,
    isDefined,
    isPhy,
    Item,
    NOT_FOUND,
    scrollVerticallyIntoView,
    siteSpecific,
    stagesOrdered,
    TAG_ID,
    tags,
    useUrlHashValue,
    arrayFromPossibleCsv,
    useUrlPageTheme,
    isFullyDefinedContext,
    isSingleStageContext,
    getHumanContext,
    useQueryParams,
    ListParams,
    LEARNING_STAGE_TO_STAGES,
    getSearchPlaceholder,
} from "../../services";
import {NOT_FOUND_TYPE, PageContextState, Tag} from '../../../IsaacAppTypes';
import {MetaDescription} from "../elements/MetaDescription";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {useLocation, useNavigate} from "react-router";
import classNames from "classnames";
import debounce from "lodash/debounce";
import { PageMetadata } from "../elements/PageMetadata";
import { PageFragment } from "../elements/PageFragment";
import { GlossarySidebar } from "../elements/sidebar/GlossarySidebar";
import { PageContainer } from "../elements/layout/PageContainer";

type FilterParams = "subjects" | "stages" | "query";

/*
    This hook waits for `waitingFor` to be populated, returning:
     - `valueWhileWaiting` while waiting
     - `valueWhenFound` any time *after the first time* `waitingFor` becomes truthy
 */
export function useUntilFound<T, U>(
    waitingFor: T | NOT_FOUND_TYPE | null | undefined,
    valueWhenFound: U,
    valueWhileWaiting: any = undefined
) {
    const [waiting, setWaiting] = useState(true);
    useEffect( () => {
        if (waiting) {
            let timeout: number;
            if (waitingFor !== null && waitingFor !== NOT_FOUND && waitingFor !== undefined) {
                timeout = window.setTimeout(() => {
                    setWaiting(false);
                }, 200);
            }
            return () => {
                if (timeout) clearTimeout(timeout);
            };
        }
    }, [waitingFor, waiting]);

    return waiting ? valueWhileWaiting : valueWhenFound;
}

/* Gets rid of glossary page and exam board information from a glossary term id, just to keep the URL hash looking nice */
export function formatGlossaryTermId(rawTermId: string) {
    const idRegExp = new RegExp('([a-z0-9-_]+)\\|?(?:(aqa|ocr)\\|?)?([a-z0-9-_~]+)?');
    const simplifiedTermId = idRegExp.exec(
        rawTermId.split('|')
            .slice(1)
            .join('|')
    );
    return simplifiedTermId?.slice(1,3)
        .filter(i => typeof i === 'string')
        .join('|')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
}

function tagByValue(values: string[], tags: Tag[]): Tag | undefined {
    return tags.filter(option => values.includes(option.id)).at(0);
}
function stagesByValue(values: string[], tags: Stage[]): Stage[] | undefined {
    const stages = tags.filter(option => values.includes(option));
    return stages.length === 0 ? undefined : stages;
}

interface QueryStringResponse {
    queryStages: Stage[] | undefined;
    querySubjects: Tag | undefined;
}
function processQueryString(query: ListParams<FilterParams>, pageContext?: PageContextState): QueryStringResponse {
    if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
        return {
            queryStages: stagesByValue(pageContext.stage.flatMap(x => LEARNING_STAGE_TO_STAGES[x]), stagesOrdered.slice(0,-1)), 
            querySubjects: tags.getById(pageContext.subject as TAG_ID)};
    }

    const subjectItems = tagByValue(arrayFromPossibleCsv((query.subjects ?? []) as string[] | string), tags.allSubjectTags);
    const stageItems = stagesByValue(arrayFromPossibleCsv((query.stages ?? []) as string[] | string), stagesOrdered.slice(0,-1));

    return {
        queryStages: stageItems, 
        querySubjects: subjectItems
    };
}

/* An offset applied when scrolling to a glossary term, so the term isn't hidden under the alphabet header */
const ALPHABET_HEADER_OFFSET = -65;

interface GlossarySearchProps {
    searchText: string;
    setSearchText: (searchText: string) => void;
}

export const GlossarySearch = ({searchText, setSearchText}: GlossarySearchProps) => {
    // setSearchText is a debounced method that would not update on each keystroke, so we use this internal state to visually update the search text immediately
    const [internalSearchText, setInternalSearchText] = useState(searchText);

    const pageContext = useAppSelector(selectors.pageContext.context);

    return siteSpecific(<Input
        className='search--filter-input my-4'
        type="search" value={internalSearchText || ""}
        placeholder={`e.g. ${getSearchPlaceholder(pageContext?.subject)}`}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>  {
            setSearchText(e.target.value);
            setInternalSearchText(e.target.value);
        }}
    />,
    <Input
        id="terms-search" name="query"
        type="search" value={internalSearchText || ""}
        placeholder="Search by term" aria-label="Search by term"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>  {
            setSearchText(e.target.value);
            setInternalSearchText(e.target.value);
        }}
    />);
};

export const Glossary = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const pageContext = useUrlPageTheme();
    const params = useQueryParams<FilterParams, false>(false);
    
    const {queryStages, querySubjects} = processQueryString(params, pageContext);

    const [searchText, setSearchText] = useState<string>(params.query ? (params.query instanceof Array ? params.query[0] : params.query) : "");
    const topics = tags.allTopicTags.sort((a,b) => a.title.localeCompare(b.title));
    const subjects = tags.allSubjectTags.sort((a,b) => a.title.localeCompare(b.title));
    const stages: Stage[] = stagesOrdered.slice(0,-1);
    const [filterSubject, setFilterSubject] = useState<Tag | undefined>(querySubjects);
    const [filterStages, setFilterStages] = useState<Stage[] | undefined>(queryStages);
    const [filterTopic, setFilterTopic] = useState<Tag>();
    const rawGlossaryTerms = useAppSelector(
        (state: AppState) => state && state.glossaryTerms?.map(
            // TODO: convert the glossary JSON files rather than processing them here
            gt => {
                const value: string = gt.value ?? "";
                gt.value = value.charAt(0).toUpperCase() + value.slice(1);
                return gt;
            }
        ), (l, r) => !!(l && r && l.length === r.length)
    );

    const debouncedSearchHandler = useMemo(() =>
        debounce((searchTerm: string) => {
            setSearchText(searchTerm);
        }, 500),
    [setSearchText]);

    // Log on initial page load
    useEffect(() => {
        dispatch(logAction({type: "VIEW_GLOSSARY_PAGE"}));
    }, []);

    useEffect(() => {
        if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
            setFilterSubject(tags.getById(pageContext.subject as TAG_ID));
            const potentialStage = stagesByValue(pageContext.stage.flatMap(x => LEARNING_STAGE_TO_STAGES[x]), stagesOrdered.slice(0,-1));
            setFilterStages(potentialStage);
        }
    }, [pageContext]);

    // Update url
    useEffect(() => {
        const params: {[key: string]: string} = {};
        if (!pageContext?.subject || !pageContext?.stage?.length) {
            if (filterSubject) params.subjects = filterSubject?.id;
            if (filterStages) params.stages = filterStages.join(',');
        }
        if (searchText) params.query = searchText;
        void navigate({...location, search: queryString.stringify(params, {encode: false})}, {state: location.state, replace: true});
    }, [filterSubject, filterStages, searchText, pageContext]);

    const searchTextFilteredTerms = useMemo(() => {
        return searchText === '' ? rawGlossaryTerms : rawGlossaryTerms?.filter(e => searchText.split(' ').some(t => e.value?.toLowerCase().includes(t.toLowerCase())));
    }, [rawGlossaryTerms, searchText]);

    const glossaryTerms = useMemo(() => {
        function groupTerms(sortedTerms: GlossaryTermDTO[] | undefined): { [key: string]: GlossaryTermDTO[] } | undefined {
            if (sortedTerms) {
                const groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
                for (const term of sortedTerms) {
                    // Only show physics glossary terms when a subject has been selected
                    if (isPhy && !isDefined(filterSubject)) continue;
                    if (isAda && isDefined(filterTopic) && !term.tags?.includes(filterTopic.id)) continue;
                    if (isPhy && isDefined(filterSubject) && !term.tags?.includes(filterSubject.id)) continue;
                    if (isPhy && isDefined(filterStages) && !(filterStages.some(s => term.stages?.includes(s)))) continue;

                    const value = term?.value?.[0] ?? '#';
                    const k = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(value) ? value : '#';
                    groupedTerms[k] = [...(groupedTerms[k] || []), term];
                }
                return groupedTerms;
            }
            return undefined;
        }
        const sortedAndFilteredTerms = searchTextFilteredTerms?.sort((a, b) => (a?.value && b?.value && a.value.localeCompare(b.value)) || 0);
        return groupTerms(sortedAndFilteredTerms);
    }, [rawGlossaryTerms, filterTopic, filterSubject, filterStages, searchText]);

    const subjectCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        subjects.forEach(subject => {
            counts[subject.id] = searchTextFilteredTerms?.filter(term => term.tags?.includes(subject.id)).length ?? 0;
        });
        return counts;
    }, [rawGlossaryTerms, searchText]);

    const stageCounts = useMemo(() => {
        const counts: {[key: string]: number} = {};
        if (filterSubject) {
            const filteredTerms = searchTextFilteredTerms?.filter(term => term.tags?.includes(filterSubject.id));
            filteredTerms?.forEach(term => {
                term.stages?.forEach(stage => {
                    counts[stage] = (counts[stage] ?? 0) + 1;
                });
            });
            counts["all"] = filteredTerms?.length ?? 0;
        }
        return counts;
    }, [rawGlossaryTerms, filterSubject, searchText]);

    /* Stores a reference to each glossary term component (specifically their inner paragraph tags) */
    const glossaryTermRefs = useRef<Map<string, HTMLElement>>(new Map<string, HTMLElement>());

    /* `hash` is `undefined` until `glossaryTerms` is populated */
    const hash = useUntilFound(glossaryTerms, useUrlHashValue());

    /* Scrolls to the term given by the URL hash, when the hash becomes available (see line above) */
    useEffect(() => {
        const el = glossaryTermRefs.current?.get(hash);
        if (isDefined(el)) scrollVerticallyIntoView(el, ALPHABET_HEADER_OFFSET);
    }, [hash]);

    /* Stores a reference to each alphabet header (to the h2 element) - these are the headers alongside the glossary
     * terms, NOT the letters that exist in the clickable sticky header (or the other non-sticky one)
     */
    const alphabetHeaderRefs = useRef<Map<string, HTMLElement>>(new Map<string, HTMLElement>());

    const scrollToKey = ({currentTarget}: {currentTarget: EventTarget & Element}) => {
        // Find alphabet heading corresponding to the given letter from ref list, and scroll to that element
        const letter = currentTarget.getAttribute('data-key') ?? "A";
        const el = alphabetHeaderRefs.current.get(letter);
        if (isDefined(el)) scrollVerticallyIntoView(el, ALPHABET_HEADER_OFFSET);

        // Removes focus outline from the clicked letter on the alphabet scroller headers
        const links = document.getElementsByClassName(`alphascroller-key-${letter}`);
        for (const link of links) {
            (link as HTMLElement)?.blur();
        }
    };

    const onKeyUpScrollTo = ({currentTarget, key}: React.KeyboardEvent) => {
        if (key === "Enter") {
            const letter = currentTarget.getAttribute('data-key');
            if (letter) scrollToKey({currentTarget});
        }
    };

    /* "Horror lies ahead. Sorry."
     * This code deals with showing or hiding the sticky alphabet header UI depending
     * on how far down the page the user has scrolled. It uses a 'sentinel' div element near the top of the glossary
     * to do this .
     */
    const alphabetScrollerSentinel = useRef<HTMLDivElement>(null);
    const alphabetScrollerFlag = useRef(false);
    const alphabetScrollerObserver = useRef<IntersectionObserver>();
    const stickyAlphabetListContainer = useRef<HTMLDivElement>(null);

    const alphabetScrollerCallback = (entries: IntersectionObserverEntry[], _observer: IntersectionObserver) => {
        for (const entry of entries) {
            if (entry.target.id === 'sentinel') {
                if (entry.isIntersecting) {
                    stickyAlphabetListContainer.current?.classList.remove('active');
                } else {
                    if (entry.boundingClientRect.top <= 0) {
                        // Gone up
                        stickyAlphabetListContainer.current?.classList.add('active');
                    } else if (entry.boundingClientRect.top > 0) {
                        // Gone down
                        stickyAlphabetListContainer.current?.classList.remove('active');
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (alphabetScrollerSentinel.current && !alphabetScrollerObserver.current && !alphabetScrollerFlag.current) {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            };

            alphabetScrollerObserver.current = new IntersectionObserver(alphabetScrollerCallback, options);
            alphabetScrollerObserver.current.observe(alphabetScrollerSentinel.current);
            alphabetScrollerFlag.current = true;

            // Uncommenting this return, disconnects the observer. Not sure why.
            // return () => alphabetScrollerObserver?.current?.disconnect();
        }
    });
    /* Horror stops here. Or not, depending who you ask. */

    const alphabetList = glossaryTerms && '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(k => {
        if (glossaryTerms.hasOwnProperty(k)) {
            return <div className={`key alphascroller-key-${k}`} data-key={k} key={k} role="button" tabIndex={0} onKeyUp={onKeyUpScrollTo} onClick={scrollToKey}>
                {k}
            </div>;
        } else {
            return <div className="key unavailable" data-key={k} key={k}>
                {k}
            </div>;
        }
    });

    const metaDescription = siteSpecific(
        "A glossary of important words and phrases used in maths, physics, chemistry and biology.",
        "Confused about a computer science term? Look it up in our glossary. Get GCSE and A level support today!");

    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    if (!glossaryTerms) {
        return <ShowLoading until={glossaryTerms} />;
    }

    return <div className="glossary-page">
        <PageContainer data-bs-theme={pageContext?.subject}
            pageTitle={<>
                <TitleAndBreadcrumb 
                    currentPageTitle={isPhy && isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) ? `${getHumanContext(pageContext)} Glossary` : "Glossary"}
                    icon={{type: "icon", subject: pageContext?.subject, icon: "icon-tests"}}
                    intermediateCrumbs={crumb ? [crumb] : []}
                />
                <MetaDescription description={metaDescription} />
            </>}
            sidebar={siteSpecific(
                <GlossarySidebar 
                    searchText={searchText} setSearchText={debouncedSearchHandler} filterSubject={filterSubject} setFilterSubject={setFilterSubject}
                    filterStages={filterStages} setFilterStages={setFilterStages} subjects={subjects} stages={stages} stageCounts={stageCounts}
                    subjectCounts={subjectCounts} hideButton
                />,
                undefined
            )}
        >
            <PageMetadata noTitle showSidebarButton sidebarButtonText="Search glossary">
                <PageFragment fragmentId="help_toptext_glossary" />
            </PageMetadata>
            <Row>
                <Col md={{size: 9}} className="py-4">
                    <Row className="no-print">
                        {isAda && <>
                            <Col md={{size: 4}}>
                                <Label for='terms-search' className='visually-hidden'>Search by term</Label>
                                <GlossarySearch searchText={searchText} setSearchText={debouncedSearchHandler} />
                            </Col>
                            <Col className="mt-3 mt-md-0">
                                <Label for='topic-select' className='visually-hidden'>Topic</Label>
                                <StyledSelect inputId="topic-select"
                                    options={ topics.map(t => ({ value: t.id, label: t.title}))}
                                    name="topic-select"
                                    placeholder="All topics"
                                    onChange={e => setFilterTopic(topics.find(v => v.id === (e as Item<TAG_ID> | undefined)?.value)) }
                                    isClearable
                                />
                            </Col>
                        </>}
                    </Row>
                    <Row className="only-print">
                        <Col>
                            {searchText !== "" && <span className="pe-4">Search: <strong>{searchText}</strong></span>}
                            {isDefined(filterTopic) && <span className="pe-4">Topic: <strong>{filterTopic.title}</strong></span>}
                        </Col>
                    </Row>
                </Col>
            </Row>
            {(!glossaryTerms || Object.entries(glossaryTerms).length === 0) && <Row>
                <div className={siteSpecific("text-center", "col-md-8 offset-md-2 py-4")}>
                    {/* Let users know that they need to select a subject */}
                    {isPhy && !isDefined(filterSubject) && <p>Please select a subject.</p>}
                    {(isAda || isDefined(filterSubject)) && searchText === "" && <p>There are no glossary terms in the glossary yet! Please try again later.</p>}
                    {(isAda || isDefined(filterSubject)) && searchText !== "" &&  <p>We could not find glossary terms to match your search criteria.</p>}
                </div>
            </Row>}
            {glossaryTerms && Object.keys(glossaryTerms).length > 0 && <Col className={classNames("p-4", {"pt-0": isAda, "pe-2 pt-md-2 mb-4 border-radius-2 list-results-container": isPhy})}>
                <div className="no-print">
                    <div id="sentinel" ref={alphabetScrollerSentinel}>&nbsp;</div>
                    <div ref={stickyAlphabetListContainer} id="stickyalphabetlist" className="alphabetlist pb-4">
                        {alphabetList}
                    </div>
                    <div className="alphabetlist pb-4">
                        {alphabetList}
                    </div>
                </div>
                {Object.entries(glossaryTerms).map(([letter, terms]) => <div key={letter} className="row pb-7" ref={(el: HTMLDivElement) => alphabetHeaderRefs.current.set(letter, el)}>
                    <Col md={{size: 1, offset: 1}}>
                        <h2 style={{position: 'sticky', top: `calc(0px - ${ALPHABET_HEADER_OFFSET}px)`}}>
                            {letter}
                        </h2>
                    </Col>
                    <Col>
                        {terms.map(term => <IsaacGlossaryTerm
                            key={term.id}
                            ref={(el: HTMLParagraphElement) => {
                                glossaryTermRefs.current.set((term.id && formatGlossaryTermId(term.id)) ?? "", el);
                            }}
                            doc={term}
                            linkToGlossary={true}
                        />)}
                    </Col>
                </div>)}
            </Col>}
        </PageContainer>
    </div>;
};
