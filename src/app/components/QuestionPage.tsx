import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import queryString from "query-string";
import {fetchQuestion} from "../state/actions";
import {ShowLoading} from "./ShowLoading";
import {IsaacContent} from "./IsaacContent";

const stateToProps = (state: any, {match: {params}, location: {search}}: any) => {
    return {
        doc: state.doc,
        urlQuestionId: params.questionId,
        queryParams: queryString.parse(search)
    };
};
const dispatchToProps = {fetchQuestion};

const QuestionPageComponent = ({doc, urlQuestionId, queryParams, history, fetchQuestion}: any) => {
    useEffect(() => {fetchQuestion(urlQuestionId);}, [urlQuestionId]);

    const goBackToBoard = () => {
        history.push(`/gameboards#${queryParams.board}`);
    };

    return (
        <ShowLoading until={doc}>
            {/*FastTrack progress bar*/}
            {/*Print options*/}
            {/*Filter breadcrumb trail*/}
            {/*High contrast option*/}
            <article>
                <IsaacContent doc={doc}/>
                {doc && <p>{doc.attribution}</p>}
                {/*Superseded notice*/}
                {queryParams && queryParams.board &&
                    <button onClick={goBackToBoard}>Back to board</button>
                }
            </article>
            {/*FooterPods related-content="questionPage.relatedContent"*/}
        </ShowLoading>
    );
};

export const QuestionPage = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
