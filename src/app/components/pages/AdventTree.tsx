import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {UncontrolledTooltip} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ACCESSIBILITY_TAGS, ACCESSIBILITY_WARNINGS, useAccessibilitySettings} from "../../services/accessibility";
import {v4 as uuid_v4} from "uuid";
import "../../../scss/common/advent.scss";
import { PageContainer } from "../elements/layout/PageContainer";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";
import { PageFragment } from "../elements/PageFragment";

type AdventStyle = CSSProperties & {[key: `--${string}`]: string};
interface DoorLabel {
    title: string;
    classes: string[];
}

export const AdventTree = () => {
    const [snowflakes] = useState<AdventStyle[]>(() => Array.from({length: 22}, (_, i) => ({
        "--x": `${(i + Math.random()) * 100 / 22}%`,
        "--s": `${5 + Math.random() * 9}px`,
        "--o": String(0.45 + Math.random() * 0.5),
        "--d": `${6 + Math.random() * 6}s`,
        "--delay": `${Math.random() * 6}s`,
    })));
    const [selectedDoor, setSelectedDoor] = useState<DoorLabel | null>(null);
    const treeRef = useRef<HTMLDivElement>(null);
    const accessibilitySettings = useAccessibilitySettings();

    useEffect(() => {
        const container = treeRef.current;
        if (!container) {
            return;
        }

        let hoveredDoor: HTMLAnchorElement | null = null;
        let focusedDoor: HTMLAnchorElement | null = null;
        let selectedDoor: HTMLAnchorElement | null = null;

        const findDoor = (target: EventTarget | null) => {
            const door = target instanceof Element ? target.closest<HTMLAnchorElement>("a.day") : null;
            return door && container.contains(door) ? door : null;
        };

        const updateDoorLabel = () => {
            const door = focusedDoor || hoveredDoor;
            // Retain the last title for copying, without rerendering between children of a door.
            if (door && door !== selectedDoor) {
                selectedDoor = door;
                setSelectedDoor({title: door.dataset.hover || "", classes: Array.from(door.classList)});
            }
        };

        const onPointerOver = (event: PointerEvent) => {
            hoveredDoor = findDoor(event.target);
            updateDoorLabel();
        };
        const onPointerOut = (event: PointerEvent) => {
            hoveredDoor = findDoor(event.relatedTarget);
            updateDoorLabel();
        };
        const onFocusIn = (event: FocusEvent) => {
            focusedDoor = findDoor(event.target);
            updateDoorLabel();
        };
        const onFocusOut = (event: FocusEvent) => {
            focusedDoor = findDoor(event.relatedTarget);
            updateDoorLabel();
        };

        // Delegate to the container so imported door markup needs no event props.
        container.addEventListener("pointerover", onPointerOver);
        container.addEventListener("pointerout", onPointerOut);
        container.addEventListener("focusin", onFocusIn);
        container.addEventListener("focusout", onFocusOut);
        return () => {
            container.removeEventListener("pointerover", onPointerOver);
            container.removeEventListener("pointerout", onPointerOut);
            container.removeEventListener("focusin", onFocusIn);
            container.removeEventListener("focusout", onFocusOut);
        };
    }, []);

    return <PageContainer className="advent-page"
        pageTitle={<TitleAndBreadcrumb
            currentPageTitle="Advent calendar" 
            icon={{type: "icon", icon: "icon-generic"}}
        />}
        sidebar={<GenericPageSidebar/>}
    >
        <div className="advent mt-2">
            <input type="checkbox" id="advent-snow" className="snow-toggle" />
            <input type="checkbox" id="advent-lights" className="lights-toggle" />
            <div className="tree" ref={treeRef}>
                <div className="tree-shapes">
                    <span className="branch branch-1" aria-hidden="true" />
                    <span className="lights branch-1" aria-hidden="true" />
                    <span className="branch branch-2" aria-hidden="true" />
                    <span className="lights branch-2" aria-hidden="true" />
                    <span className="branch branch-3" aria-hidden="true" />
                    <span className="lights branch-3" aria-hidden="true" />
                    <span className="branch branch-4" aria-hidden="true" />
                    <span className="lights branch-4" aria-hidden="true" />
                    <span className="branch branch-5" aria-hidden="true" />
                    <span className="lights branch-5" aria-hidden="true" />
                    <span className="branch branch-6" aria-hidden="true" />
                    <span className="lights branch-6" aria-hidden="true" />
                    <label htmlFor="advent-snow" className="trunk">
                        <span className="visually-hidden">Toggle snow</span>
                    </label>
                    <span className="pot" aria-hidden="true" />
                </div>
                <PageFragment fragmentId={"tree_days"}/>
                <label htmlFor="advent-lights" className="bauble">
                    <span className="visually-hidden">Toggle fairy lights</span>
                </label>
            </div>
            <div className="tag">
                {selectedDoor?.title || "Pick a door"}
                {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && ACCESSIBILITY_TAGS.filter(tag => selectedDoor?.classes.includes(tag)).map(tag => {
                    const id = `access-warn-${uuid_v4()}`;
                    return <React.Fragment key={tag}>
                        {" "}
                        <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[tag].icon} icon-color-black ms-1 mb-n2`} id={id}/>
                        <span className="visually-hidden">{ACCESSIBILITY_WARNINGS[tag].description}</span>
                        <UncontrolledTooltip target={id} placement="top">
                            {ACCESSIBILITY_WARNINGS[tag].description}
                        </UncontrolledTooltip>
                    </React.Fragment>;
                })}
            </div>
            <div className="snowfall" aria-hidden="true">
                {snowflakes.map((style, index) => <div key={index} className="flake" style={style} />)}
            </div>
        </div>
    </PageContainer>;
};
