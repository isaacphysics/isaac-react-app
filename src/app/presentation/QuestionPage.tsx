import React from "react";

const QuestionPage = ({name}: {name: string}) =>
    <div>
        <h2>Content Body</h2>
        <p>Question for {name}</p>
    </div>;

export default QuestionPage;
