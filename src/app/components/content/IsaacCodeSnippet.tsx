import {CodeSnippetDTO, ContentDTO} from "../../../IsaacApiTypes";
import React, {useEffect, useRef} from "react";
import {Col, Row} from "reactstrap";
import hljs from 'highlight.js/lib/core';
import {highlightJsService, isAda} from "../../services";
import {ScrollShadows} from "../elements/ScrollShadows";
import classNames from "classnames";
import {useExpandContent} from "../elements/markup/portals/Tables";
import {useStatefulElementRef} from "../elements/markup/portals/utils";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";

interface IsaacCodeProps {
    doc: CodeSnippetDTO;
}

const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    const dispatch = useAppDispatch();
    const rootDoc = useAppSelector(selectors.doc.get);

    const codeSnippetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeSnippetRef.current) {
            hljs.highlightElement(codeSnippetRef.current);
            highlightJsService.addLineNumbers(codeSnippetRef.current);
        }
    }, [doc]);

    const logViewOnGitHub = () => {
        dispatch(logAction({type: "VIEW_GITHUB_CODE", pageId: (rootDoc as ContentDTO).id, githubUrl: doc.url}));
    };

    const [scrollPromptRef, updateScrollPromptRef] = useStatefulElementRef<HTMLDivElement>();
    const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLDivElement>();
    const {expandButton, innerClasses, outerClasses} = useExpandContent(doc.expandable ?? false, expandRef);

    return <>
        <div ref={updateExpandRef} className={classNames("position-relative code-snippet", outerClasses)}>
            {expandButton}
            <div className={innerClasses}>
                {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
                {isAda && window.ResizeObserver && <ScrollShadows element={scrollPromptRef} />}
                <Row>
                    <Col>
                    <pre ref={updateScrollPromptRef} className="line-numbers">
                        <code ref={codeSnippetRef} className={doc.disableHighlighting ? 'plaintext' : doc.language}>
                            {doc.code}
                        </code>
                    </pre>
                    </Col>
                </Row>
            </div>
        </div>
        {doc.url && <Row>
            <Col className="text-center mb-2">
                <a href={doc.url} onClick={logViewOnGitHub} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </Col>
        </Row>}
    </>
};
export default IsaacCodeSnippet;