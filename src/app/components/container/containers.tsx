import {connect} from "react-redux";
import HomePage from "../presentational/HomePage";
import QuestionPage from "../presentational/QuestionPage";
import {loadQuestion} from "../../actions/actions";

export const Home = connect()(HomePage);

export const Question = connect(
    (state: {question: object}) => {
        return {
            question: state.question
        }
    },
    dispatch => ({
        setQuestion(question: object) {
            dispatch(loadQuestion(question));
        }
    })
)(QuestionPage);
