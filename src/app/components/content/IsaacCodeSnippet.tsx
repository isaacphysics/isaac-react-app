import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Row} from "reactstrap";
import Sk from "skulpt";
import {Terminal} from "xterm";
import {FitAddon} from "xterm-addon-fit";
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup";
import {python as codeMirrorPython} from "@codemirror/lang-python";
import {ifKeyIsEnter} from "../../services/navigation";

function builtinRead(x: string) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

interface IsaacCodeProps {doc: CodeSnippetDTO}
export const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    const editorContainerRef = useRef<HTMLPreElement>(null);

    // Editor management
    const [editor, setEditor] = useState<EditorView | null>(null);
    useEffect(() => {
        if (editorContainerRef.current) {
            setEditor(new EditorView({
                state: EditorState.create({extensions: [basicSetup, codeMirrorPython()]}),
                parent: editorContainerRef.current
            }));
        }
    }, []);
    useEffect(() => {
        if (editor && doc.code) {
            editor.dispatch({changes: [
                {from: 0, to: editor.state.doc.length},
                {from: 0, insert: doc.code}
            ]})
        }
    }, [editor, doc.code]);

    // Terminal management
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const terminal = useRef(new Terminal()).current;
    useEffect(() => {
        if (terminalContainerRef.current) {
            const fitAddon = new FitAddon();
            terminal.loadAddon(fitAddon);
            terminal.open(terminalContainerRef.current);
            fitAddon.fit();
            window.addEventListener("resize", () => fitAddon.fit());
        }}, [terminal]);

    // Skulpt management
    Sk.configure({output: (text: string) => terminal.write(text + "\r"), read: builtinRead});
    function run() {
        Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, editor?.state.doc.toString(), true);
        }).then(
            function(mod: any) {console.log('success');},
            function(err: any) {terminal.write(`\x1B[1;31m${err.toString()}\x1B[0m \r`);}
        );
    }

    return <div>
        <Row>
            <Col>
                <pre ref={editorContainerRef} onKeyPress={ifKeyIsEnter(e => {if (e.ctrlKey) run();})} className="p-0" />
                <div ref={terminalContainerRef} className="mb-3" style={{maxHeight: 80}} />
            </Col>
        </Row>
        {doc.url && <Row className="mb-2">
            <Col className="text-center">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </Col>
            <Col className="text-center">
                <Button color="primary" outline onClick={run}>▶</Button>
            </Col>
        </Row>}
    </div>
};
