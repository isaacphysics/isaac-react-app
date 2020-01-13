import React, {useState} from "react";
import {FreeTextRule, LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";
import * as RS from "reactstrap";
import {TestCaseDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {testQuestion} from "../../state/actions";
import {AppState} from "../../state/reducers";

interface AugmentedTestCase extends TestCaseDTO {
    match?: boolean;
}

// JS implementation of something similar to Java's toHash() - from StackOverflow. Good enough for our use here.
function stringHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function choiceHash(choice: FreeTextRule) {
    const {value, correct, explanation, caseInsensitive, allowsAnyOrder, allowsExtraWords, allowsMisspelling} = choice;
    const definingProperties =
        "" + value + correct + stringHash(JSON.stringify(explanation)) +
        caseInsensitive + allowsAnyOrder + allowsExtraWords + allowsMisspelling;
    return stringHash(definingProperties);
}

function testCaseHash(testCaseInput: TestCaseDTO) {
    return (testCaseInput.choice && testCaseInput.choice.value || "") + testCaseInput.expected;
}

function testResponseHash(choices: FreeTextRule[], testCase: TestCaseDTO) {
    const choiceHashes = new Set();
    for (let choice of choices) {
        choiceHashes.add(choiceHash(choice));
    }
    return stringHash(choiceHashes.values() + testCaseHash(testCase));
}

function displayBoolean(boolean?: boolean) {
    return boolean ? "✔️" : "❌"
}

let choiceNumber = 0;
let testCaseNumber = 0;

const defaultChoice = {
    "type": "freeTextRule", "encoding": "markdown", "value": "", "correct": true, "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
    "explanation": {"type": "content", "children": [{"type": "content", "value": "Match", "encoding": "markdown"}], "encoding": "markdown"}
};
const defaultTestCase = {choice: {type: "stringChoice", value: ""}, expected: true};

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    const dispatch = useDispatch();
    const testCaseResponses = useSelector((state: AppState) => state && state.testQuestions || []);

    const [choices, setChoices] = useState<(FreeTextRule & {choiceNumber: number})[]>([{...defaultChoice, choiceNumber: choiceNumber}]);
    const [testCaseInputs, setTestCaseInputs] = useState<(TestCaseDTO & {testNumber: number})[]>([{...defaultTestCase, testNumber: testCaseNumber}]);

    const augmentedTestCaseResponseMap: {[key: string]: AugmentedTestCase} = {};
    for (const testCaseOutput of testCaseResponses) {
        const augmentedTestCaseOutput: AugmentedTestCase = testCaseOutput;
        if (augmentedTestCaseOutput.expected !== undefined) {
            augmentedTestCaseOutput.match = augmentedTestCaseOutput.expected == augmentedTestCaseOutput.actual;
        }
        const testCaseInput = {choice: augmentedTestCaseOutput.choice, expected: augmentedTestCaseOutput.expected};
        augmentedTestCaseResponseMap[testResponseHash(choices, testCaseInput)] = augmentedTestCaseOutput;
    }
    const numberOfResponseMatches = Object.values(augmentedTestCaseResponseMap).filter(testCase => testCase.match).length;

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle="Free-text question builder" />
        <RS.Card className="my-5">
            <RS.CardBody>
                <RS.Form onSubmit={(event: React.FormEvent) => {
                    if (event) {event.preventDefault();}
                    const cleanedUpChoices = choices
                        .map(c => {delete c.choiceNumber; return c;})
                        .filter(c => choiceHash(c) != choiceHash(defaultChoice));
                    const cleanedUpTestCases = testCaseInputs
                        .map(tc => {delete tc.testNumber; return tc;})
                        .filter(tc => testCaseHash(tc) != testCaseHash(defaultTestCase));
                    dispatch(testQuestion(cleanedUpChoices, cleanedUpTestCases));
                }}>
                    <h2 className="h4">Matching rules</h2>
                    <RS.Table>
                        <thead>
                            <tr><th>Rule</th><th colSpan={3}>Response</th></tr>
                        </thead>
                        <tbody>
                            {choices.map(choice => <tr key={choice.choiceNumber}>
                                <td>
                                    <RS.Label className="mb-3 w-100">
                                        Value
                                        <RS.Input className="w-100" type="text" value={choice.value} onChange={e => {
                                            setChoices(choices.map(c => choice == c ? {...c, value: e.target.value} : c))
                                        }} />
                                    </RS.Label>
                                    <RS.Row>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, caseInsensitive: !c.caseInsensitive} : c))}>
                                                <RS.Label>Ignore case {displayBoolean(choice.caseInsensitive)}</RS.Label>
                                            </RS.Button>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsAnyOrder: !c.allowsAnyOrder} : c))}>
                                                <RS.Label>Any order {displayBoolean(choice.allowsAnyOrder)}</RS.Label>
                                            </RS.Button>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsExtraWords: !c.allowsExtraWords} : c))}>
                                                <RS.Label>Extra words {displayBoolean(choice.allowsExtraWords)}</RS.Label>
                                            </RS.Button>
                                        </RS.Col>
                                        <RS.Col xs={3} className="text-center">
                                            <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, allowsMisspelling: !c.allowsMisspelling} : c))}>
                                                <RS.Label>Misspelling {displayBoolean(choice.allowsMisspelling)}</RS.Label>
                                            </RS.Button>
                                        </RS.Col>
                                    </RS.Row>
                                </td>
                                <td className="align-middle">
                                    <RS.Button color="link" onClick={() => setChoices(choices.map(c => choice == c ? {...c, correct: !c.correct} : c))}>
                                        <div className="h4 px-4">{displayBoolean(choice.correct)}</div>
                                    </RS.Button>
                                </td>
                                <td>
                                    <RS.Label>
                                        Feedback:
                                        <RS.Input type="textarea" value={(choice as any).explanation.children[0].value} />
                                    </RS.Label>
                                </td>
                                <td>
                                    <button
                                        className="close" aria-label="Delete matching rule"
                                        onClick={() => setChoices(choices.filter(choiceInState => choice !== choiceInState))}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>)}
                            <tr className="border-bottom">
                                <td colSpan={4} className="text-center">
                                    <div className="img-center">
                                        <input
                                            type="image" src="/assets/add_circle_outline.svg" className="centre img-fluid" alt="Add matching rule" title="Add question rule"
                                            onClick={() => setChoices([...choices, {...defaultChoice, choiceNumber: ++choiceNumber}])}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </RS.Table>

                    <h2 className="h4">Test answers ({numberOfResponseMatches}/{testCaseInputs.length})</h2>
                    <RS.Table>
                        <thead>
                            <tr>
                                <th className="w-10 text-center">Expected</th>
                                <th>Value</th>
                                <th className="bg-light w-10 text-center">Actual</th>
                                <th className="bg-light w-20">Feedback</th>
                                <th className="bg-light w-10 text-center">Match</th>
                                <th className="bg-light" />
                            </tr>
                        </thead>
                        <tbody>
                            {testCaseInputs.map(testCase => {
                                const testCaseResponse = augmentedTestCaseResponseMap[testResponseHash(choices, testCase)];
                                return <tr key={testCase.testNumber}>
                                    <td className="w-10 text-center align-middle">
                                        <RS.Button color="link" onClick={() =>
                                            setTestCaseInputs(testCaseInputs.map(tc => testCase == tc ? {...tc, expected: !tc.expected} : tc))
                                        }>
                                            {testCase.expected !== undefined && displayBoolean(testCase.expected)}
                                        </RS.Button>
                                    </td>
                                    <td>
                                        <RS.Input
                                            type="text" value={testCase.choice && testCase.choice.value}
                                            onChange={event => setTestCaseInputs(testCaseInputs.map(testCaseInState =>
                                                testCaseInState === testCase ?
                                                    {...testCase, choice: {...testCase.choice, value: event.target.value}} :
                                                    testCaseInState
                                            ))}
                                        />
                                    </td>

                                    <td className="bg-light w-10 text-center align-middle">
                                        {testCaseResponse && testCaseResponse.actual !== undefined && displayBoolean(testCaseResponse.actual)}
                                    </td>
                                    <td className="bg-light">
                                        {testCaseResponse && testCaseResponse.explanation && <IsaacContent doc={testCaseResponse.explanation} />}
                                    </td>
                                    <td className="bg-light w-10 text-center align-middle">
                                        {testCaseResponse && testCaseResponse.actual !== undefined && displayBoolean(testCaseResponse.expected == testCaseResponse.actual)}
                                    </td>
                                    <td className="bg-light">
                                        <button className="close" aria-label="Delete matching rule"
                                            onClick={() => setTestCaseInputs(testCaseInputs.filter(testCaseInState => testCase !== testCaseInState))}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>;
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-bottom">
                                <td colSpan={6} className="text-center">
                                    <div className="img-center">
                                        <input
                                            type="image" src="/assets/add_circle_outline.svg" className="centre img-fluid" alt="Add test answer" title="Add test answer"
                                            onClick={() => setTestCaseInputs([...testCaseInputs, {...defaultTestCase, testNumber: ++testCaseNumber}])}
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
