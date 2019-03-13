import {fetchQuestion} from "../../actions/actions";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import QuestionPage from "../presentational/QuestionPage";

const mapStateToProps = (state: {question: object}, {match: {params}}: {match: {params: {questionId: string}}}) => {
    return {
        question: state.question,
        urlQuestionId: params.questionId
    }
};
const mapDispatchToProps = {getQuestion: fetchQuestion};

export const QuestionContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(QuestionPage));
