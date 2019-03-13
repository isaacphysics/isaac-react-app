import React from "react";

const QuestionPage = ({match, question, setQuestion}: {
        match: {params: {questionId: string}},
        question: {id?: string},
        setQuestion: (question: object) => void
    }) => {

    if (question.id === undefined) {
        setQuestion({
            id: "abc123",
            content: "This is some question content to display"
        });
    }

    return (<div>
        <h2>Content Body</h2>
        <p>Question with ID: {match.params.questionId}</p>
        <p>{JSON.stringify(question)}</p>
    </div>);
}

export default QuestionPage;
