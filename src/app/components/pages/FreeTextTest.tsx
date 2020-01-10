import React, {useState} from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";
import * as RS from "reactstrap";
import {FreeTextRuleDTO, TestCaseDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {CardBody} from "reactstrap";

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

function displayBoolean(boolean?: boolean) {
    return boolean ? "✔️" : "❌"
}

const defaultChoice = {
    "type": "freeTextRule", "encoding": "markdown", "value": "", "correct": true,
    "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
    "explanation": {
        "type": "content", "children": [{"type": "content", "value": "", "encoding": "markdown"}], "encoding": "markdown"
    }
};
const defaultTestCase = {choice: {type: "stringChoice", value: ""}, expected: true};

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
        <TitleAndBreadcrumb currentPageTitle="Free-text question builder" />
        <RS.Card className="my-5">
            <RS.CardBody>
                <RS.Form onSubmit={async (event: React.FormEvent) => {
                    if (event) {event.preventDefault();}
                    const p = await api.tests.freeTextRules(choices, testCaseInputs);
                    setTestCaseOutputs(p.data);
                }}>
                    <h2 className="h4">Matching rules</h2>
                    <RS.Table>
                        <thead>
                            <tr><th className="border-right">Rule</th><th colSpan={2}>Response</th></tr>
                        </thead>
                        <tbody>
                            {choices.map(choice => <tr key={JSON.stringify(choice)}>
                                <td className="border-right">
                                    <RS.Label className="w-100 mb-3">
                                        Value
                                        <RS.Input type="text" value={choice.value} />
                                    </RS.Label>
                                    <RS.Row>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Label>Ignore case {displayBoolean(choice.caseInsensitive)}</RS.Label>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Label>Any order {displayBoolean(choice.allowsAnyOrder)}</RS.Label>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Label>Extra words {displayBoolean(choice.allowsExtraWords)}</RS.Label>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Label>Misspelling {displayBoolean(choice.allowsMisspelling)}</RS.Label>
                                        </RS.Col>
                                    </RS.Row>
                                </td>
                                <td className="align-middle">
                                    <div className="h4 px-4">{displayBoolean(choice.correct)}</div>
                                </td>
                                <td>
                                    <RS.Label>
                                        Feedback:
                                        <RS.Input type="textarea" value={choice.explanation.children[0].value} />
                                    </RS.Label>
                                    <button
                                        className="close" aria-label="Delete matching rule"
                                        onClick={() => setChoices(choices.filter(c => c))}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>)}
                            <tr className="border-bottom">
                                <td colSpan={3} className="text-center">
                                    <div className="img-center">
                                        <input
                                            type="image" src="/assets/add_circle_outline.svg" className="centre img-fluid"
                                            alt="Add matching rule" title="Add question rule"
                                            onClick={() => setChoices([...choices, defaultChoice])}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </RS.Table>

                    <h2 className="h4">Test answers ({numberOfMatches}/{testCaseInputs.length})</h2>
                    <RS.Table>
                        <thead>
                            <tr>
                                <th>Value</th>
                                <th className="w-10 text-center">Expected</th>
                                <th className="bg-light w-10 text-center">Actual</th>
                                <th className="bg-light w-20">Feedback</th>
                                <th className="bg-light w-10 text-center">Match</th>
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
                                        {testCaseInput.expected !== undefined && displayBoolean(testCaseInput.expected)}
                                    </td>

                                    <td className="bg-light w-10 text-center">
                                        {testCaseOutput && testCaseOutput.actual !== undefined && displayBoolean(testCaseOutput.actual)}
                                    </td>
                                    <td className="bg-light">
                                        {testCaseOutput && testCaseOutput.explanation && <IsaacContent doc={testCaseOutput.explanation} />}
                                    </td>
                                    <td className="bg-light w-10 text-center">
                                        {testCaseOutput && testCaseOutput.actual !== undefined && displayBoolean(testCaseOutput.expected == testCaseOutput.actual)}
                                        <button
                                            className="close" aria-label="Delete matching rule"
                                            onClick={() => setTestCaseInputs(testCaseInputs.filter(t => t))}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>;
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-bottom">
                                <td colSpan={5} className="text-center">
                                    <div className="img-center">
                                        <input
                                            type="image" src="/assets/add_circle_outline.svg" className="centre img-fluid"
                                            alt="Add test answer" title="Add test answer"
                                            onClick={() => setTestCaseInputs([...testCaseInputs, defaultTestCase])}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </RS.Table>
                    <RS.Input type="submit" />
                </RS.Form>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
};
