import React from "react";

const QuestionPage = ({urlQuestionId, question, getQuestion}: {
        urlQuestionId: string,
        question: {id?: string},
        getQuestion: (questionId: string) => void
    }) => {

    if (question.id === undefined) {
        getQuestion(urlQuestionId);
    }

    return (
        <div>
            <h2>Content Body</h2>
            <p>Question with ID: {urlQuestionId}</p>
            <p>{JSON.stringify(question)}</p>
        </div>
    );
};

export default QuestionPage;
