import React from "react";

const QuestionPage = ({question}: {question: {id?: string}}) => {
    return (
        <div>
            <h2>Content Body</h2>
            <p>Question with ID: {question.id}</p>
            <p>{JSON.stringify(question)}</p>
        </div>
    );
};

export default QuestionPage;
