import React, {CSSProperties, useEffect, useRef, useState} from "react";
import StyledToggle from "../elements/inputs/StyledToggle";
import {Link} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { PageContainer } from "../elements/layout/PageContainer";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";
import { PageFragment } from "../elements/PageFragment";
import { PageMetadata } from "../elements/PageMetadata";
import { AccessibilityTags } from "../elements/ContentPropertyTags";

type FestiveStyle = CSSProperties & {[key: `--${string}`]: string};
interface DoorLabel {
    title: string;
    classes: string[];
}

interface TextDoor extends DoorLabel {
    day: number;
    href: string;
    active: boolean;
}

export const FestiveTree = () => {
    const [textOnly, setTextOnly] = useState(false);
    const [textDoors, setTextDoors] = useState<TextDoor[]>([]);
    const [snowflakes] = useState<FestiveStyle[]>(() => Array.from({length: 22}, (_, i) => ({
        "--x": `${(i + Math.random()) * 100 / 22}%`, "--s": `${5 + Math.random() * 9}px`,
        "--o": String(0.45 + Math.random() * 0.5), "--d": `${6 + Math.random() * 6}s`,
        "--delay": `${Math.random() * 6}s`,
    })));
    const [selectedDoor, setSelectedDoor] = useState<DoorLabel | null>(null);
    const treeRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const container = treeRef.current;
        if (!container) {
            return;
        }

        const updateActiveDays = () => {
            const today = new Date(); //"2026-12-25");
            // November for testing purposes. Will update to December later
            const unlockedDay = today.getMonth() < 10 ? 0 : today.getMonth() > 10 ? 25 : today.getDate();

            const questions: TextDoor[] = [];
            container.querySelectorAll<HTMLAnchorElement>("a.day").forEach(door => {
                const dayClass = Array.from(door.classList).find(name => /^day-([1-9]|1[0-9]|2[0-5])$/.test(name));
                if (!dayClass) {
                    return;
                }

                const active = Number(dayClass.slice(4)) <= unlockedDay;
                door.classList.toggle("active", active);
                door.tabIndex = active ? 0 : -1;
                questions.push({
                    day: Number(dayClass.slice(4)),
                    title: door.dataset.hover || door.getAttribute("aria-label") || "",
                    href: door.getAttribute("href") || "",
                    classes: Array.from(door.classList),
                    active,
                });
                if (active) {
                    door.removeAttribute("aria-disabled");
                } else {
                    door.setAttribute("aria-disabled", "true");
                }
            });
            questions.sort((a, b) => a.day - b.day);
            setTextDoors(previous => JSON.stringify(previous) === JSON.stringify(questions) ? previous : questions);
        };

        // The fragment arrives asynchronously, so also update newly inserted doors.
        const observer = new MutationObserver(updateActiveDays);
        observer.observe(container, {childList: true, subtree: true});
        updateActiveDays();

        return () => {
            observer.disconnect();
        };
    }, []);

    return <PageContainer className="festive-page"
        pageTitle={<TitleAndBreadcrumb
            currentPageTitle="Tree" 
            icon={{type: "icon", icon: "icon-generic"}}
        />}
        sidebar={<GenericPageSidebar/>}
    >
        <PageMetadata/>
        <div className="d-flex justify-content-end mb-3">
            <StyledToggle falseLabel="Tree" trueLabel="Text only" aria-label="Text-only mode"
                checked={textOnly} onChange={event => setTextOnly(event.currentTarget.checked)} />
        </div>
        {textOnly && <ol className="festive-text-list">
            {textDoors.map(door => <li key={door.day} className={door.active ? undefined : "text-muted"}>
                <span>Day {door.day}: </span>
                {door.active
                    ? <Link to={door.href}>{door.title}</Link>
                    : <span aria-disabled="true">{door.title}</span>}
                <AccessibilityTags tags={door.classes} tagClassName="ms-1 mb-n1" />
            </li>)}
        </ol>}
        <div className="festive mt-2" style={{display: textOnly ? "none" : undefined}}>
            <input type="checkbox" id="festive-snow" className="snow-toggle"
                onFocus={event => event.currentTarget.labels?.item(0)?.scrollIntoView({block: "center", inline: "nearest"})} />
            <input type="checkbox" id="festive-lights" className="lights-toggle"
                onFocus={event => event.currentTarget.labels?.item(0)?.scrollIntoView({block: "center", inline: "nearest"})} />
            <div className="tree" ref={treeRef}>
                <div className="tree-shapes">
                    {Array.from({length: 6}, (_, i) => <>
                        <span className={`branch branch-${i+1}`} aria-hidden="true" />
                        <span className={`lights branch-${i+1}`} aria-hidden="true" />
                    </>)}
                    <label htmlFor="festive-snow" className="trunk">
                        <span className="visually-hidden">Toggle snow</span>
                    </label>
                    <span className="pot" aria-hidden="true" />
                </div>
                <PageFragment fragmentId={"tree_days"}/>
                <label htmlFor="festive-lights" className="bauble">
                    <span className="visually-hidden">Toggle fairy lights</span>
                </label>
            </div>
            <div className="tag">
                {selectedDoor?.title || "Pick a door"}
                <AccessibilityTags tags={selectedDoor?.classes} tagClassName="ms-1 mb-n2" />
            </div>
            <div className="snowfall" aria-hidden="true">
                {snowflakes.map((style, index) => <div key={index} className="flake" style={style} />)}
            </div>
        </div>
    </PageContainer>;
};
