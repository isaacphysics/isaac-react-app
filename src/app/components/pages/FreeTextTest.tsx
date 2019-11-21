import React, {useEffect} from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    const choices = [
        {
            "type": "freeTextRule",
            "encoding": "markdown",
            "value": "get to other side",
            "caseInsensitive": true,
            "allowsAnyOrder": false,
            "allowsExtraWords": true,
            "allowsMisspelling": false,
            "correct": true,
            "explanation": {
                "type": "content",
                "children": [{"type": "content", "value": "This is a correct answer!", "encoding": "markdown"}],
                "encoding": "markdown"
            }
        }
    ];
    const testCases = [
        {choice: {type: "stringChoice", value: "get to the other side"}, expected: true},
        {choice: {type: "stringChoice", value: "don't know"}, expected: false}
    ];

    useEffect(() => {
        api.tests.freeTextRules(choices, testCases);
    }, []);
    return <div>
        Hey.
    </div>
};
