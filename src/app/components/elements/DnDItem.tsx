
import {Badge} from "reactstrap";
import {Immutable} from "immer";
import {CSS} from "@dnd-kit/utilities";
import {useSortable} from "@dnd-kit/sortable";
import { ContentDTO, ItemDTO } from "../../../IsaacApiTypes";
import { useContext, useEffect } from "react";
import { DragAndDropRegionContext } from "../../../IsaacAppTypes";
import classNames from "classnames";
import React from "react";
import { isDefined } from "../../services";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";

function DropZoneItem({item, id, type, overrideOver, isCorrect}: {item: Immutable<ItemDTO>, id: string, type: "drop-zone" | "item-section", overrideOver?: boolean, isCorrect?: boolean}) {
    const {attributes, listeners, setNodeRef, isDragging, isOver, transform, transition} = useSortable({
        id,
        attributes: {
            role: "button",
            roleDescription: "draggable item",
        },
        data: { type, text: item.altText ?? item.value }
    });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: (overrideOver || isOver) || isDragging ? "0.2" : "1",
        touchAction: "none"
    };

    // This is to manage focus properly for accessibility reasons
    const dropRegionContext = useContext(DragAndDropRegionContext);
    useEffect(() => {
        if (dropRegionContext?.shouldGetFocus && dropRegionContext?.shouldGetFocus(id)) {
            const el = document.getElementById(id);
            el?.focus();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropRegionContext?.shouldGetFocus]);

    return <Badge id={id} className={classNames("p-1 cloze-item feedback-zone", {"cloze-bg": !!item, "m-2": type === "item-section", "feedback-showing": isDefined(isCorrect)})} color="theme" style={style} innerRef={setNodeRef} {...listeners} {...attributes}>
        <span className={"visually-hidden"}>{item.altText ?? item.value ?? "cloze item without a description"}</span>
        <span aria-hidden={true}>
            <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
                {item.children as ContentDTO[]}
            </IsaacContentValueOrChildren>
        </span>
        {isDefined(isCorrect) && <div className={"feedback-box"}>
            <span className={classNames("feedback", isCorrect ? "correct" : "incorrect")}>{isCorrect ? "✔" : "✘"}</span>
        </div>}
    </Badge>;
}

export default DropZoneItem;
