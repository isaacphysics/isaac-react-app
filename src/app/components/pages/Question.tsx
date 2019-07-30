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
import {RelatedContent} from "../elements/RelatedContent";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {NavigationLinks} from "../elements/NavigationLinks";
import {AnonUserExamBoardPicker} from "../elements/AnonUserExamBoardPicker";
import {EditContentButton} from "../elements/EditContentButton";

const stateToProps = (state: AppState, {match: {params: {questionId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
        segueEnvironment: state && state.constants && state.constants.segueEnvironment || "unknown",
    };
};
const dispatchToProps = {fetchDoc};

interface QuestionPageProps {
    doc: ContentDTO | NOT_FOUND_TYPE | null;
    urlQuestionId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, questionId: string) => void;
    segueEnvironment: string;
}

const QuestionPageComponent = ({doc, urlQuestionId, fetchDoc, segueEnvironment}: QuestionPageProps) => {
    useEffect(() => {
        fetchDoc(DOCUMENT_TYPE.QUESTION, urlQuestionId)
    }, [urlQuestionId, fetchDoc]);

    const navigation = useNavigation(urlQuestionId);

    return <ShowLoading until={doc} render={ (doc: ContentDTO) =>
        <div className="pattern-01">
            <Container>
                {/*FastTrack progress bar*/}
                {/*Print options*/}
                {/*High contrast option*/}
                <TitleAndBreadcrumb
                    currentPageTitle={doc.title as string}
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    collectionType={navigation.collectionType}
                />
                {segueEnvironment != "PROD" && (doc as ContentBase).canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as ContentBase)['canonicalSourceFile']} />
                }

                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <AnonUserExamBoardPicker className="text-right" />
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>

                        {/* Superseded notice */}

                        <p className="text-muted">{doc.attribution}</p>

                        <NavigationLinks navigation={navigation} />

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>
    }/>;
};

export const Question = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
