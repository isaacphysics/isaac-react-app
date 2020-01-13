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
const generateDefaultChoice = () => {
    choiceNumber++;
    return {
        "choiceNumber": choiceNumber,
        "type": "freeTextRule", "encoding": "markdown", "value": "", "correct": true, "caseInsensitive": true, "allowsAnyOrder": false, "allowsExtraWords": false, "allowsMisspelling": false,
        "explanation": {"type": "content", "children": [{"type": "content", "value": `Match ${choiceNumber}`, "encoding": "markdown"}], "encoding": "markdown"}
    }
};
const defaultChoiceExample = generateDefaultChoice();

let testCaseNumber = 0;
const generateDefaultTestCase = () => {
    testCaseNumber++;
    return {testCaseNumber: testCaseNumber, choice: {type: "stringChoice", value: ""}, expected: true}
};
const defaultTestCaseExample = generateDefaultTestCase();

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    const dispatch = useDispatch();
    const testCaseResponses = useSelector((state: AppState) => state && state.testQuestions || []);

    let [choices, setChoices] = useState<(FreeTextRule & {choiceNumber: number})[]>([{...JSON.parse(JSON.stringify(defaultChoiceExample))}]);
    const [testCaseInputs, setTestCaseInputs] = useState<(TestCaseDTO & {testCaseNumber: number})[]>([{...JSON.parse(JSON.stringify(defaultTestCaseExample))}]);

    const augmentedTestCaseResponseMap: {[key: string]: AugmentedTestCase} = {};
    for (const testCaseOutput of testCaseResponses) {
        const augmentedTestCaseOutput: AugmentedTestCase = JSON.parse(JSON.stringify(testCaseOutput));
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
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .map(choice => {const {choiceNumber, ...cleanChoice} = choice; return cleanChoice;})
                        .filter(choice => choiceHash(choice) != choiceHash(defaultChoiceExample));
                    const cleanedUpTestCases = testCaseInputs
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .map(testCase => {const {testCaseNumber, ...cleanTestCase} = testCase; return cleanTestCase;})
                        .filter(testCase => testCaseHash(testCase) != testCaseHash(defaultTestCaseExample));
                    if (cleanedUpChoices.length > 0 && cleanedUpTestCases.length > 0) {
                        dispatch(testQuestion(cleanedUpChoices, cleanedUpTestCases));
                    }
                }}>
                    <h2 className="h3">Matching rules</h2>
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
                                        <RS.Input
                                            type="textarea" value={(choice.explanation as any).children[0].value}
                                            onChange={event => {
                                                const newExplanation = JSON.parse(JSON.stringify(choice.explanation)) as any;
                                                newExplanation.children[0].value = event.target.value;
                                                setChoices(choices.map(c => choice == c ? {...c, explanation: newExplanation} : c));
                                            }}
                                        />
                                    </RS.Label>
                                </td>
                                <td>
                                    <button
                                        className="close" aria-label="Delete matching rule" type="button"
                                        onClick={() => setChoices(choices.filter(choiceInState => choice !== choiceInState))}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>)}
                            <tr className="border-bottom">
                                <td colSpan={4} className="text-center pb-3">
                                    <RS.Button color="link" onClick={() => setChoices([...choices, generateDefaultChoice()])}>
                                        <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                                    </RS.Button>
                                </td>
                            </tr>
                        </tbody>
                    </RS.Table>

                    <h2 className="h3 mt-5">Test answers ({numberOfResponseMatches}/{testCaseInputs.length})</h2>
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
                                return <tr key={testCase.testCaseNumber}>
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
                                    <td className="bg-light align-middle">
                                        {testCaseResponse && testCaseResponse.explanation && <IsaacContent doc={testCaseResponse.explanation} />}
                                    </td>
                                    <td className="bg-light w-10 text-center align-middle">
                                        {testCaseResponse && testCaseResponse.actual !== undefined && displayBoolean(testCaseResponse.expected == testCaseResponse.actual)}
                                    </td>
                                    <td className="bg-light">
                                        <button className="close" aria-label="Delete matching rule" type="button"
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
                                <td colSpan={6} className="text-center pb-3">
                                    <RS.Button color="link" onClick={() => setTestCaseInputs([...testCaseInputs, generateDefaultTestCase()])}>
                                        <img src="/assets/add_circle_outline.svg" alt="Add matching rule" />
                                    </RS.Button>
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
