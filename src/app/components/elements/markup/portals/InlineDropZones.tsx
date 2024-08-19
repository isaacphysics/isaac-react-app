import {ClozeDropRegionContext} from "../../../../../IsaacAppTypes";
import ReactDOM from "react-dom";
import React, {useContext, useEffect, useState} from "react";
import {ContentDTO, ItemDTO} from "../../../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "../../../content/IsaacContentValueOrChildren";
import {Badge, Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import {Immutable} from "immer";
import {useDroppable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";
import {CLOZE_DROP_ZONE_ID_PREFIX, NULL_CLOZE_ITEM, isAda, isDefined, siteSpecific, useDeviceSize} from "../../../../services";
import { Markup } from "..";

export function Item({item, id, type, overrideOver, isCorrect}: {item: Immutable<ItemDTO>, id: string, type: "drop-zone" | "item-section", overrideOver?: boolean, isCorrect?: boolean}) {
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
    const dropRegionContext = useContext(ClozeDropRegionContext);
    useEffect(() => {
        if (dropRegionContext?.shouldGetFocus && dropRegionContext?.shouldGetFocus(id)) {
            const el = document.getElementById(id);
            el?.focus();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropRegionContext?.shouldGetFocus]);

    return <Badge id={id} className={classNames(type === "item-section" && "m-2", "p-2 cloze-item feedback-zone", isDefined(isCorrect) && "feedback-showing")} style={style} innerRef={setNodeRef} {...listeners} {...attributes}>
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

// Inline droppables rendered for each registered drop region
function InlineDropRegion({id, index, emptyWidth, emptyHeight, rootElement}: {id: string; index: number; emptyWidth?: string; emptyHeight?: string; rootElement?: HTMLElement}) {
    const dropRegionContext = useContext(ClozeDropRegionContext);
    const deviceSize = useDeviceSize();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const droppableId = CLOZE_DROP_ZONE_ID_PREFIX + `${index + 1}`;
    const dropdownItems = dropRegionContext?.allItems ?? [];
    const nonSelectedItemIds = (dropRegionContext?.nonSelectedItems ?? []).map(item => item.id);

    useEffect(() => {
        // Register with the current cloze question on first render
        dropRegionContext?.register(droppableId, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const item = dropRegionContext ? dropRegionContext.inlineDropValueMap[droppableId] : undefined;

    // Only show if this drop zone is correct or not if it contains an item, and the validation entry in the map
    // applies to this particular item
    const isCorrect = item && dropRegionContext && dropRegionContext.dropZoneValidationMap[droppableId]?.itemId === item.id
        ? dropRegionContext.dropZoneValidationMap[droppableId]?.correct
        : undefined;

    const droppableTarget = rootElement?.querySelector(`#${id}`);

    const {isOver, setNodeRef} = useDroppable({
        id: droppableId,
        data: { type: "drop-zone", itemId: item?.replacementId }
    });

    const height = (item || !emptyHeight) ? "auto" : (emptyHeight + "px");
    // Ada buttons have a fixed width that needs to be overriden
    const width = (item || !emptyWidth) ? "auto" : (emptyWidth + "px");

    const draggableDropZone = <span
        style={{minHeight: height, minWidth: width}}
        className={classNames("d-inline-block cloze-drop-zone", !item && `rounded bg-grey border ${isOver ? "border-dark" : "border-light"}`)}
        ref={setNodeRef}
    >
        {item
            ? <Item item={item} id={item.replacementId as string} isCorrect={isCorrect} type={"drop-zone"} overrideOver={isOver}/>
            : <>&nbsp;<span className={"visually-hidden"}>drop zone</span></>
        }
    </span>;

    const dropdownZone = <Dropdown
        isOpen={isOpen}
        toggle={() => {setIsOpen(!isOpen);}}
    >
        <DropdownToggle className={classNames(`cloze-dropdown ${siteSpecific("p-1", "p-0")}`, {"empty": !item})} style={{minHeight: height, width: width}}>
            <div className={classNames("d-flex cloze-item feedback-zone", {"feedback-showing": isDefined(isCorrect), "p-2": isAda && !!item})}>
                <span className={"visually-hidden"}>{item?.altText ?? item?.value ?? "cloze item without a description"}</span>
                <span aria-hidden={true}>
                    <Markup trusted-markup-encoding={"html"}>
                        {item?.value ?? ""}
                    </Markup>
                </span>
                {isDefined(isCorrect) && <div className={"feedback-box"}>
                    <span className={classNames("feedback", isCorrect ? "correct" : "incorrect")}>{isCorrect ? "✔" : "✘"}</span>
                </div>}
                {!item && <img className={classNames("dropzone-dropdown", {"active": isOpen})} src="/assets/common/icons/chevron_down.svg" alt="expand dropdown"></img>}
            </div>
        </DropdownToggle>
        <DropdownMenu end>
            {/* Dummy option added to clear selection */}
            <DropdownItem
                data-unit={'None'}
                onClick={() => {dropRegionContext?.onSelect(NULL_CLOZE_ITEM, droppableId, true);}}
            >
                <span className="fst-italic">Clear</span>
            </DropdownItem>
            {dropdownItems.map((item, i) => {
                return <DropdownItem key={i}
                className={!nonSelectedItemIds.includes(item.id) ? "invalid" : ""}
                data-unit={item || 'None'}
                onClick={nonSelectedItemIds.includes(item.id) ? (() => {dropRegionContext?.onSelect(item, droppableId, false);}) : undefined}
                >
                    <Markup trusted-markup-encoding={"html"}>
                        {item.value ?? ""}
                    </Markup>
                </DropdownItem>;
            })}
        </DropdownMenu>
    </Dropdown>;

    if (dropRegionContext && droppableTarget) {
        return ReactDOM.createPortal(
            deviceSize === "xs" ? dropdownZone : draggableDropZone,
            droppableTarget
        );
    }
    return null;
}
export default InlineDropRegion;
