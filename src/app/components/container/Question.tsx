import React, {useEffect} from "react";
import {fetchQuestion} from "../../actions/actions";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import QuestionPage from "../presentational/QuestionPage";

const mapStateToProps = (state: {question: object}, {match: {params}}: {match: {params: {questionId: string}}}) => ({
    question: state.question,
    urlQuestionId: params.questionId
});
const mapDispatchToProps = {fetchQuestion};

const QuestionPageContainer = (props: {question: object, urlQuestionId: string, fetchQuestion: (id: string) => void}) => {
    let {urlQuestionId, fetchQuestion} = props;
    useEffect(() => {
        fetchQuestion(urlQuestionId);
    }, [urlQuestionId]);
    return <QuestionPage {...props} />;
};

export const Question = withRouter(connect(mapStateToProps, mapDispatchToProps)(QuestionPageContainer));
