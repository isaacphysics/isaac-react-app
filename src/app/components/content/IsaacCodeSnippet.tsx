import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import React, {useEffect, useRef} from "react";
import {Col, Row} from "reactstrap";

import hljs from 'highlight.js/lib/core';
import {addLineNumbers} from "../../services/highlightJs";
import {ScrollPrompt} from "../elements/ScrollPrompt";

interface IsaacCodeProps {
    doc: CodeSnippetDTO;
}

export const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    const codeSnippetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeSnippetRef.current) {
            hljs.highlightElement(codeSnippetRef.current);
            addLineNumbers(codeSnippetRef.current);
        }
    }, [doc]);

    const scrollPromptRef = useRef<HTMLPreElement>(null);

    return <div className={"position-relative"}>
        <ScrollPrompt scrollRef={scrollPromptRef} />
        <Row>
            <Col className="code-snippet">
                <pre ref={scrollPromptRef} className="line-numbers">
                    <code ref={codeSnippetRef} className={doc.disableHighlighting ? 'plaintext' : doc.language}>
                        {doc.code}
                    </code>
                </pre>
            </Col>
        </Row>
        {doc.url && <Row>
            <Col className="text-center mb-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </Col>
        </Row>}
    </div>
};
