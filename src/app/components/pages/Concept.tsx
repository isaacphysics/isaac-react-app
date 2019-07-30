import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentBase, ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EDITOR_URL} from "../../services/constants";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {NavigationLinks} from "../elements/NavigationLinks";
import {AnonUserExamBoardPicker} from "../elements/AnonUserExamBoardPicker";
import {EditContentButton} from "../elements/EditContentButton";

const stateToProps = (state: AppState, {match: {params: {conceptId}}}: any) => {
    return {
        urlConceptId: conceptId,
        doc: state && state.doc || null,
        segueEnvironment: state && state.constants && state.constants.segueEnvironment || "unknown",
    };
};
const dispatchToProps = {fetchDoc};

interface ConceptPageProps {
    urlConceptId: string;
    doc: ContentDTO | NOT_FOUND_TYPE | null;
    fetchDoc: (documentType: DOCUMENT_TYPE, conceptId: string) => void;
    segueEnvironment: string;
}

const ConceptPageComponent = ({urlConceptId, doc, fetchDoc, segueEnvironment}: ConceptPageProps) => {
    useEffect(() => {
        fetchDoc(DOCUMENT_TYPE.CONCEPT, urlConceptId)
    }, [urlConceptId, fetchDoc]);

    const navigation = useNavigation(urlConceptId);

    return <ShowLoading until={doc} render={(doc: ContentDTO) =>
        <div>
            <Container>
                <TitleAndBreadcrumb
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    currentPageTitle={doc.title as string}
                    collectionType={navigation.collectionType}
                />
                {segueEnvironment != "PROD" && (doc as ContentBase).canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as ContentBase)['canonicalSourceFile']} />
                }

                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <AnonUserExamBoardPicker className="text-right" />
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>

                        <NavigationLinks navigation={navigation} />

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>
    }/>;
};

export const Concept = withRouter(connect(stateToProps, dispatchToProps)(ConceptPageComponent));
