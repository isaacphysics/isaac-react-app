import React, {useEffect, useMemo, useRef, useState} from "react";
import {Col, Container, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {AppState, logAction, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
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
    above,
    useDeviceSize,
} from "../../services";
import {NOT_FOUND_TYPE, PageContextState, Tag} from '../../../IsaacAppTypes';
import {MetaDescription} from "../elements/MetaDescription";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {useHistory, useLocation} from "react-router";
import { GlossarySidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import classNames from "classnames";

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
function stageByValue(values: string[], tags: Stage[]): Stage | undefined {
    return tags.filter(option => values.includes(option)).at(0);
}

interface QueryStringResponse {
    queryStages: Stage | undefined;
    querySubjects: Tag | undefined;
}
function processQueryString(query: string, pageContext?: PageContextState): QueryStringResponse {
    if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
        return {
            queryStages: stageByValue([pageContext.stage.map(x => x === "11_14" ? "year_9" : x)[0]], stagesOrdered.slice(0,-1)), 
            querySubjects: tags.getById(pageContext.subject as TAG_ID)};
    }


    const {subjects, stages} = queryString.parse(query);

    const subjectItems = tagByValue(arrayFromPossibleCsv((subjects ?? []) as string[] | string), tags.allSubjectTags);
    const stageItems = stageByValue(arrayFromPossibleCsv((stages ?? []) as string[] | string), stagesOrdered.slice(0,-1));

    return {
        queryStages: stageItems, querySubjects: subjectItems
    };
}

/* An offset applied when scrolling to a glossary term, so the term isn't hidden under the alphabet header */
const ALPHABET_HEADER_OFFSET = -65;

export const Glossary = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const history = useHistory();
    const pageContext = useUrlPageTheme();
    const deviceSize = useDeviceSize();
    
    // query stages not used recently
    const {queryStages, querySubjects} = processQueryString(location.search, pageContext);

    const [searchText, setSearchText] = useState("");
    const topics = tags.allTopicTags.sort((a,b) => a.title.localeCompare(b.title));
    const subjects = tags.allSubjectTags.sort((a,b) => a.title.localeCompare(b.title));
    const stages: Stage[] = stagesOrdered.slice(0,-1);
    const [filterSubject, setFilterSubject] = useState<Tag | undefined>(querySubjects);
    const [filterStage, setFilterStage] = useState<Stage | undefined>(queryStages);
    const [filterTopic, setFilterTopic] = useState<Tag>();
    const rawGlossaryTerms = useAppSelector(
        (state: AppState) => state && state.glossaryTerms?.map(
            // TODO: convert the glossary JSON files rather than processing them here
            gt => {
                const value: string = gt.value ?? "";
                gt.value = value.charAt(0).toUpperCase() + value.slice(1);
                return gt;
            }
        )
    );

    // Log on initial page load
    useEffect(() => {
        dispatch(logAction({type: "VIEW_GLOSSARY_PAGE"}));
    }, []);

    useEffect(() => {
        if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
            setFilterSubject(tags.getById(pageContext.subject as TAG_ID));
            setFilterStage(stageByValue([pageContext.stage.map(x => x === "11_14" ? "year_9" : x)[0]], stagesOrdered.slice(0,-1)));
        }
    }, [pageContext]);

    // Update url
    useEffect(() => {
        if (pageContext?.subject && pageContext?.stage?.length) return;
        const params: {[key: string]: string} = {};
        if (filterSubject) params.subjects = filterSubject.id;
        if (filterStage) params.stages = filterStage;
        history.replace({search: queryString.stringify(params, {encode: false}), state: location.state, hash: location.hash});
    }, [filterSubject, filterStage, pageContext]);

    const glossaryTerms = useMemo(() => {
        function groupTerms(sortedTerms: GlossaryTermDTO[] | undefined): { [key: string]: GlossaryTermDTO[] } | undefined {
            if (sortedTerms) {
                const groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
                for (const term of sortedTerms) {
                    // Only show physics glossary terms when a subject has been selected
                    if (isPhy && !isDefined(filterSubject)) continue;

                    if (isAda && isDefined(filterTopic) && !term.tags?.includes(filterTopic.id)) continue;
                    if (isPhy && isDefined(filterSubject) && !term.tags?.includes(filterSubject.id)) continue;
                    if (isPhy && isDefined(filterStage) && !term.stages?.includes(filterStage)) continue;

                    const value = term?.value?.[0] ?? '#';
                    const k = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(value) ? value : '#';
                    groupedTerms[k] = [...(groupedTerms[k] || []), term];
                }
                return groupedTerms;
            }
            return undefined;
        }

        const searchTerms = searchText.split(' ').map(t => t.toLowerCase());
        const sortedAndFilteredTerms =
            (searchText === ''
                ? [...rawGlossaryTerms ?? []]
                : rawGlossaryTerms?.filter(e => searchTerms.some(t => e.value?.toLowerCase().includes(t)))
            )?.sort((a, b) => (a?.value && b?.value && a.value.localeCompare(b.value)) || 0);
        return groupTerms(sortedAndFilteredTerms);
    }, [rawGlossaryTerms, filterTopic, filterSubject, filterStage, searchText]);

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

    const optionBar = <div className={classNames("no-print d-flex align-items-center", {"gap-2": isPhy})}>
        <div className="question-actions question-actions-leftmost mt-2">
            <ShareLink linkUrl={`/glossary`} clickAwayClose/>
        </div>
        <div className="question-actions mt-2 not-mobile">
            <PrintButton/>
        </div>
    </div>;

    const thenRender = <div className="glossary-page">
        <Container data-bs-theme={pageContext?.subject}>
            <TitleAndBreadcrumb 
                currentPageTitle={isPhy && isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) ? `${getHumanContext(pageContext)} Glossary` : "Glossary"}
                icon={{type: "hex", subject: pageContext?.subject, icon: "icon-tests"}}
            />
            <MetaDescription description={metaDescription} />

            <SidebarLayout>
                <GlossarySidebar 
                    searchText={searchText} setSearchText={setSearchText} 
                    filterSubject={filterSubject} setFilterSubject={setFilterSubject}
                    filterStage={filterStage} setFilterStage={setFilterStage}
                    subjects={subjects} stages={stages} optionBar={optionBar}
                />
                <MainContent>
                    {above['lg'](deviceSize) && <> <div className="mt-1"/> {optionBar} </>}  
                    <Row>
                        <Col md={{size: 9}} className="py-4">
                            <Row className="no-print">
                                {isAda && <>
                                    <Col md={{size: 4}}>
                                        <Label for='terms-search' className='visually-hidden'>Search by term</Label>
                                        <Input
                                            id="terms-search" type="search" name="query" placeholder="Search by term" aria-label="Search by term"
                                            value={searchText} onChange={e => setSearchText(e.target.value)}
                                        />
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
                            {searchText !== "" && <p>We could not find glossary terms to match your search criteria.</p>}
                        </div>
                    </Row>}
                    {glossaryTerms && Object.keys(glossaryTerms).length > 0 && <Col className={classNames("p-2 pb-4", {"list-results-container border-radius-2 mb-4": isPhy})}>
                        <div className="no-print">
                            <div id="sentinel" ref={alphabetScrollerSentinel}>&nbsp;</div>
                            <div ref={stickyAlphabetListContainer} id="stickyalphabetlist" className="alphabetlist pb-4">
                                {alphabetList}
                            </div>
                            <div className="alphabetlist pb-4">
                                {alphabetList}
                            </div>
                        </div>
                        {Object.entries(glossaryTerms).map(([letter, terms]) => <div key={letter} className="row pb-5" ref={(el: HTMLDivElement) => alphabetHeaderRefs.current.set(letter, el)}>
                            <Col md={{size: 1, offset: 1}}>
                                <h2 style={{position: 'sticky', top: `calc(0px - ${ALPHABET_HEADER_OFFSET}px)`}}>
                                    {letter}
                                </h2>
                            </Col>
                            <Col>
                                {terms.map(term => <IsaacGlossaryTerm
                                    key={term.id}
                                    ref={(el: HTMLElement) => {
                                        glossaryTermRefs.current.set((term.id && formatGlossaryTermId(term.id)) ?? "", el);
                                    }}
                                    doc={term}
                                    linkToGlossary={true}
                                />)}
                            </Col>
                        </div>)}
                    </Col>}
                </MainContent>
            </SidebarLayout>
        </Container>
    </div>;

    return <ShowLoading until={glossaryTerms} thenRender={() => thenRender}/>;
};
