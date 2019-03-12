import React from "react";

const QuestionPage = ({match}: {match: {params: {questionId: string}}}) =>
    <div>
        <h2>Content Body</h2>
        <p>Question with ID: {match.params.questionId}</p>
    </div>;

export default QuestionPage;
