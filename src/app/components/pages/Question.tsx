import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import queryString from "query-string";
import {fetchQuestion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState, {match: {params: {questionId}}, location: {search}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
        queryParams: queryString.parse(search)
    };
};
const dispatchToProps = {fetchQuestion};

interface QuestionPageProps {
    doc: ContentDTO | null,
    urlQuestionId: string,
    queryParams: {board?: string},
    history: any,
    fetchQuestion: (questionId: string) => void
}
const QuestionPageComponent = (props: QuestionPageProps) => {
    const {doc, urlQuestionId, queryParams, history, fetchQuestion} = props;

    useEffect(
        () => {fetchQuestion(urlQuestionId);},
        [urlQuestionId]
    );

    const goBackToBoard = () => {
        history.push(`/gameboards#${queryParams.board}`);
    };

    return (
        <ShowLoading until={doc}>
            {doc &&
                // FastTrack progress bar
                // Print options
                // Filter breadcrumb trail
                // High contrast option
                <article>
                    <IsaacContent doc={doc}/>
                    <p>{doc.attribution}</p>
                    {/*Superseded notice*/}
                    {queryParams && queryParams.board &&
                        <button onClick={goBackToBoard}>Back to board</button>
                    }
                </article>
                // FooterPods related-content="questionPage.relatedContent"
            }
        </ShowLoading>
    );
};

export const Question = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
