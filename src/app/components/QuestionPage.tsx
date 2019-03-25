import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {fetchQuestion} from "../state/actions";
import {ShowLoading} from "./ShowLoading";
import {IsaacContent} from "./IsaacContent";

const stateToProps = (state: any, {match: {params}}: any) => {
    return {
        doc: state.doc,
        urlQuestionId: params.questionId
    };
};
const dispatchToProps = {fetchQuestion};

const QuestionPageComponent = (props: any) => {
    let {urlQuestionId, fetchQuestion, doc} = props;
    useEffect(() => {fetchQuestion(urlQuestionId);}, [urlQuestionId]);

    return (
        // FastTrack progress bar
        // Print options
        // Filter breadcrumb trail
        // High contrast option
        <article>
            <ShowLoading unless={doc} then={IsaacContent} doc={doc} />
            {doc && <p className="ru-attribution">{doc.attribution}</p>}
        </article>
        // Superseded notice
        // Back to board button
        // FooterPods related-content="questionPage.relatedContent"
    );
};

export const QuestionPage = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
