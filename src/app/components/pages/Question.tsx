import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";
import {RelatedContent} from "../elements/RelatedContent";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {NavigationLinks} from "../elements/NavigationLinks";

const stateToProps = (state: AppState, {match: {params: {questionId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
    };
};
const dispatchToProps = {fetchDoc};

interface QuestionPageProps {
    doc: ContentDTO | NOT_FOUND_TYPE | null;
    urlQuestionId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, questionId: string) => void;
}

const QuestionPageComponent = ({doc, urlQuestionId, fetchDoc}: QuestionPageProps) => {
    useEffect(() => {fetchDoc(DOCUMENT_TYPE.QUESTION, urlQuestionId)}, [urlQuestionId, fetchDoc]);
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
                />
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
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
