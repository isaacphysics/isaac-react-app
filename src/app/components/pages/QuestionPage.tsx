import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Container} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ContentBase, ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EDITOR_URL} from "../../services/constants";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {EditContentButton} from "../elements/EditContentButton";
import {Question} from "../elements/Question";

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

    return <ShowLoading until={doc} thenRender={doc =>
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
                <Question doc={doc} urlQuestionId={urlQuestionId}/>
            </Container>
        </div>
    }/>;
};

export const QuestionPage = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
