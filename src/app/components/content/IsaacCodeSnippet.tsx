import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import React, {useEffect, useRef} from "react";
import {Col, Row} from "reactstrap";

import hljs from 'highlight.js';

interface IsaacCodeProps {
    doc: CodeSnippetDTO;
}

export const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    const codeSnippetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeSnippetRef.current) {
            hljs.highlightBlock(codeSnippetRef.current);
        }
    }, [doc]);

    return <div>
        <Row>
            <Col>
                <pre>
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
