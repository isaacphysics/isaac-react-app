import React, {useCallback, useEffect, useRef, useState} from "react";
import {Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {useSelector} from "react-redux";
import {withRouter} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {IsaacGlossaryTerm} from '../../components/content/IsaacGlossaryTerm';
import { GlossaryTermDTO } from "../../../IsaacApiTypes";
import {TempExamBoardPicker} from '../elements/inputs/TempExamBoardPicker';
import _startCase from 'lodash/startCase';
import {scrollVerticallyIntoView} from "../../services/scrollManager";

export const Glossary = withRouter(() => {
    const [glossaryTerms, setGlossaryTerms] = useState<{ [key: string]: GlossaryTermDTO[] }>();
    const [searchText, setSearchText] = useState("");
    const [topics, setTopics] = useState<string[]>([]);
    const [filterTopic, setFilterTopic] = useState("");
    const [topicsDropdownOpen, setTopicsDropdownOpen] = useState(false);
    const alphabetScroller = useRef<HTMLDivElement>(null);
    const [alphabetScrollerTop, setAlphabetScrollerTop] = useState(0);

    const rawGlossaryTerms = useSelector((state: AppState) => state && state.glossaryTerms);
    useEffect(() => {
        const sortedTerms = rawGlossaryTerms?.sort((a, b) => a?.value && b?.value && a.value.localeCompare(b.value) || 0);
        let groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
        let _topics: string[] = [];
        if (sortedTerms) {
            for (const term of sortedTerms) {
                if (filterTopic !== "" && !term.tags?.includes(filterTopic)) continue;
                const k = term?.value?.[0] || '#';
                groupedTerms[k] = [...(groupedTerms[k] || []), term];
                _topics = [..._topics, ...(term.tags || [])];
            }
        }
        setGlossaryTerms(groupedTerms);
        setTopics([...new Set(
            _topics.sort((a, b) => a.localeCompare(b))
        )]);
    }, [rawGlossaryTerms, filterTopic]);

    useEffect(() => {
        if (searchText === "") {
            const sortedTerms = rawGlossaryTerms?.sort((a, b) => a?.value && b?.value && a.value.localeCompare(b.value) || 0);
            let groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
            if (sortedTerms) {
                for (const term of sortedTerms) {
                    const k = term?.value?.[0] || '#';
                    groupedTerms[k] = [...(groupedTerms[k] || []), term];
                }
            }
            setGlossaryTerms(groupedTerms);
        } else {
            const regex = new RegExp(searchText.split(' ').join('|'), 'gi');
            const sortedTerms = rawGlossaryTerms?.filter(e => e.value?.match(regex)).sort((a, b) => a?.value && b?.value && a.value.localeCompare(b.value) || 0);
            let groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
            if (sortedTerms) {
                for (const term of sortedTerms) {
                    const k = term?.value?.[0] || '#';
                    groupedTerms[k] = [...(groupedTerms[k] || []), term];
                }
            }
            setGlossaryTerms(groupedTerms);
        }
    }, [searchText]);

    const scrollToKey = (k: string) => {
        const element = document.getElementById(k);
        if (element) {
            scrollVerticallyIntoView(element);
        }
    }

    return <ShowLoading until={glossaryTerms} thenRender={supertypedDoc => {
        return <div className="glossary-page">
            <Container>
                <TitleAndBreadcrumb currentPageTitle="Glossary" />
                <div className="no-print d-flex align-items-center">
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/glossary`}/>
                    </div>
                    <div className="question-actions mt-3 not_mobile">
                        <PrintButton/>
                    </div>
                </div>

                <Row>
                    <Col md={{size: 9}} className="py-4">
                        <Row>
                            <FormGroup className='glossary-term-filter text-left'>
                                <Col>
                                    <Label for='header-search' className='sr-only'>Search</Label>
                                    <Input
                                        id="header-search" type="search" name="query" placeholder="Search" aria-label="Search"
                                        value={searchText} onChange={e => setSearchText(e.target.value)}
                                    />
                                </Col>
                                <Col>
                                    <Label for='topic-select' className='sr-only'>Topic</Label>
                                    {topics?.length > 0 && <Dropdown isOpen={topicsDropdownOpen} toggle={() => setTopicsDropdownOpen(prevState => !prevState)}>
                                        <DropdownToggle caret>
                                            { filterTopic === "" ? "Topics" : _startCase(filterTopic) }
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={() => setFilterTopic("")}>&nbsp;</DropdownItem>
                                            {topics.map(e => <DropdownItem key={e} onClick={() => setFilterTopic(e)}>{_startCase(e.replace(/[^a-zA-Z0-9]/, ' '))}</DropdownItem>)}
                                        </DropdownMenu>
                                    </Dropdown>}
                                </Col>
                            </FormGroup>
                        </Row>
                    </Col>
                    <Col md={{size: 1}} className="py-4">
                        <TempExamBoardPicker className="text-right" />
                    </Col>
                </Row>
                {(!glossaryTerms || Object.entries(glossaryTerms).length === 0) && <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        {searchText === "" && <p>There are no glossary terms in the glossary yet! Please try again later.</p>}
                        {searchText !== "" && <p>We could not find glossary terms to match your search criteria.</p>}
                    </Col>
                </Row>}
                {glossaryTerms && Object.keys(glossaryTerms).length > 0 && <Col className="pt-2 pb-4">
                    <div className="alphabetlist pb-4" ref={alphabetScroller}>
                        {Object.keys(glossaryTerms).map(k =>
                            <div className="key" key={k} role="button" tabIndex={0} onKeyUp={() => scrollToKey(`key-${k}`)} onClick={() => scrollToKey(`key-${k}`)}>
                                {k}
                            </div>
                        )}
                    </div>
                    {glossaryTerms && Object.entries(glossaryTerms).map(([key, terms]) => <Row key={key} className="pb-5">
                        <Col md={{size: 1, offset: 1}} id={`key-${key}`}><h2>{key}</h2></Col>
                        <Col>
                            {terms.map(term => <Row key={term.id}>
                                <Col md={{size: 10}}>
                                    <IsaacGlossaryTerm doc={term} />
                                </Col>
                            </Row>)}
                        </Col>
                    </Row>)}
                </Col>}
            </Container>
        </div>
    }}/>;
});
