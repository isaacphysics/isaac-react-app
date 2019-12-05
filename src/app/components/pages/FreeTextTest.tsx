import React, {useState} from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";
import * as RS from "reactstrap";
import {ChoiceDTO, FreeTextRuleDTO, TestCaseDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";

interface AugmentedTestCase extends TestCaseDTO {
    match?: boolean;
}

// JS implementation of something similar to Java's toHash(). Good and quick enough for our use here.
function stringHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function testCaseHash(choices: FreeTextRuleDTO[], testCaseInput: TestCaseDTO) {
    const choiceHashes = new Set();
    for (let choice of choices) {
        choiceHashes.add(choice.value || "");
    }
    const testCaseHash = (testCaseInput.choice && testCaseInput.choice.value) || "" + testCaseInput.expected;
    return stringHash(choiceHashes.values() + testCaseHash);
}

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    const hardChoices = [
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
    const hardTestCases = [
        {choice: {type: "stringChoice", value: "get to the other side"}, expected: true},
        {choice: {type: "stringChoice", value: "don't know"}, expected: false}
    ];

    const [choices, setChoices] = useState(hardChoices);
    const [testCaseInputs, setTestCaseInputs] = useState<TestCaseDTO[]>(hardTestCases);
    const [testCaseOutputs, setTestCaseOutputs] = useState<TestCaseDTO[]>([]); // This will be deleted when it is in redux

    const augmentedTestCaseOutputMap: {[key: string]: AugmentedTestCase} = {};
    for (const testCaseOutput of testCaseOutputs) {
        const augmentedTestCaseOutput: AugmentedTestCase = testCaseOutput;
        if (augmentedTestCaseOutput.expected !== undefined) {
            augmentedTestCaseOutput.match = augmentedTestCaseOutput.expected == augmentedTestCaseOutput.actual;
        }
        const testCaseInput = {choice: augmentedTestCaseOutput.choice, expected: augmentedTestCaseOutput.expected};
        augmentedTestCaseOutputMap[testCaseHash(choices, testCaseInput)] = augmentedTestCaseOutput;
    }
    const numberOfMatches = Object.values(augmentedTestCaseOutputMap).filter(testCase => testCase.match).length;

    return <RS.Container>
        <RS.Card>
            <RS.CardBody>
                <RS.Form onSubmit={async (event: React.FormEvent) => {
                    if (event) {event.preventDefault();}
                    const p = await api.tests.freeTextRules(choices, testCaseInputs);
                    setTestCaseOutputs(p.data);
                }}>
                    <h2>Question choices</h2>
                    <RS.ListGroup>
                        {choices.map(choice => <RS.ListGroupItem key={JSON.stringify(choice)}>
                            <RS.Input type="text" value={choice.value} />
                            {JSON.stringify(choice)}
                        </RS.ListGroupItem>)}
                    </RS.ListGroup>

                    <h2>Test cases</h2>
                    <RS.Table>
                        <thead>
                            <tr>
                                <th>Value</th>
                                <th className="w-10 text-center">Expected</th>
                                <th className="w-10 text-center">Actual</th>
                                <th className="w-20">Feedback</th>
                                <th className="w-10 text-center">Match</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testCaseInputs.map(testCaseInput => {
                                const testCaseOutput = augmentedTestCaseOutputMap[testCaseHash(choices, testCaseInput)];
                                return <tr key={JSON.stringify(testCaseInput)}>
                                    <td>
                                        <RS.Input type="text" value={testCaseInput.choice && testCaseInput.choice.value}/>
                                    </td>
                                    <td className="w-10 text-center">
                                        {testCaseInput.expected !== undefined && (testCaseInput.expected ? "✔️" : "❌")}
                                    </td>
                                    <td className="w-10 text-center">
                                        {testCaseOutput && testCaseOutput.actual !== undefined && (testCaseOutput.actual ? "✔️" : "❌")}
                                    </td>
                                    <td>
                                        {testCaseOutput && testCaseOutput.explanation && <IsaacContent doc={testCaseOutput.explanation} />}
                                    </td>
                                    <td className="w-10 text-center">
                                        {testCaseOutput && testCaseOutput.actual !== undefined && (testCaseOutput.expected == testCaseOutput.actual ? "✔️" : "❌")}
                                    </td>
                                </tr>;
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td />
                                <td />
                                <td />
                                <td />
                                <td className="text-center">{numberOfMatches} / {testCaseInputs.length}</td>
                            </tr>
                        </tfoot>
                    </RS.Table>

                    <RS.Input type="submit" />

                </RS.Form>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
};
