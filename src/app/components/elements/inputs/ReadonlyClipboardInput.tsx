import {Button, Input, InputGroup, InputProps, Tooltip} from "reactstrap";
import React, {useRef, useState} from "react";

export const ReadonlyClipboardInput = (props: InputProps) => {
    const [copied, setCopied] = useState<boolean>(false);
    const buttonRef = useRef<HTMLInputElement | null>(null);

    function copyToClipboard() {
        if (props.value) {
            navigator.clipboard.writeText(props.value as string)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => { setCopied(false); }, 5000);
                });
        }
    }

    return <InputGroup className={"flex-column flex-md-row gap-2 stackable-input-group align-items-center"}>
        <Input {...props} readOnly={true} innerRef={buttonRef}
            onClick={(e) => { e.currentTarget.select(); }}
            className={"w-100 w-md-auto"}
        />
        <Button
            outline
            color={"secondary"}
            aria-label={"Copy to clipboard"}
            onClick={copyToClipboard}
            className={"w-100 w-md-auto"}
        >
            Copy
        </Button>
        <Tooltip placement="top" isOpen={copied} target={buttonRef}>
            Copied to clipboard!
        </Tooltip>
    </InputGroup>;
};