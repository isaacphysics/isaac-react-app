import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
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

export const Glossary = withRouter(() => {
    const [glossaryTerms, setGlossaryTerms] = useState<{ [key: string]: GlossaryTermDTO[] }>();
    const rawGlossaryTerms = useSelector((state: AppState) => state && state.glossaryTerms);
    useEffect(() => {
        const sortedTerms = rawGlossaryTerms?.sort((a, b) => a?.value && b?.value && a.value.localeCompare(b.value) || 0);
        let groupedTerms: { [key: string]: GlossaryTermDTO[] } = {};
        if (sortedTerms) {
            for (const term of sortedTerms) {
                const k = term?.value?.[0] || '#';
                groupedTerms[k] = [...(groupedTerms[k] || []), term];
            }
        }
        setGlossaryTerms(groupedTerms);
    }, [rawGlossaryTerms]);

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

                {(!glossaryTerms || Object.entries(glossaryTerms).length === 0) && <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <p>There are no glossary terms in the glossary yet! Please try again later.</p>
                    </Col>
                </Row>}
                {glossaryTerms && Object.keys(glossaryTerms).length && <Col className="py-4">
                    <Row>
                        <Col md={{size: 8, offset: 2}} className="py-4">
                            <TempExamBoardPicker className="text-right" />
                        </Col>
                    </Row>
                    {glossaryTerms && Object.entries(glossaryTerms).map(([key, terms]) => <Row key={key} className="pb-5">
                        <Col md={{size: 1, offset: 1}}><h2>{key}</h2></Col>
                        <Col>
                            {terms.map(term => <Row key={term.id}>
                                <Col md={{size: 10}}><IsaacGlossaryTerm doc={term} /></Col>
                            </Row>)}
                        </Col>
                    </Row>)}
                </Col>}
            </Container>
        </div>
    }}/>;
});
