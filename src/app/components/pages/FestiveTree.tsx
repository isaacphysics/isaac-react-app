import React, {useEffect, useRef, useState} from "react";
import StyledToggle from "../elements/inputs/StyledToggle";
import {Link} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { PageContainer } from "../elements/layout/PageContainer";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";
import { PageFragment } from "../elements/PageFragment";
import { PageMetadata } from "../elements/PageMetadata";
import { AccessibilityTags } from "../elements/ContentPropertyTags";
import classNames from "classnames";

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
    const [snowflakes] = useState<{[key: `--${string}`]: string}[]>(() => Array.from({length: 22}, (_, i) => ({
        "--x": `${(i + Math.random()) * 100 / 22}%`, "--s": `${5 + Math.random() * 9}px`,
        "--o": String(0.45 + Math.random() * 0.5), "--d": `${6 + Math.random() * 6}s`,
        "--delay": `${Math.random() * 6}s`,
    })));
    const [selectedDoor, setSelectedDoor] = useState<DoorLabel | null>(null);
    const treeRef = useRef<HTMLDivElement>(null);

    useEffect(function updateDoorLabel() {
        const container = treeRef.current;
        if (!container) {
            return;
        }

        let previouslySelectedDoor: HTMLAnchorElement | null = null;
        const findDoorAndUpdateLabel = (target: EventTarget | null) => {
            const door = target instanceof Element ? target.closest<HTMLAnchorElement>("a.day") : null;

            if (door && container.contains(door) && door !== previouslySelectedDoor) {
                previouslySelectedDoor = door;
                setSelectedDoor({title: door.dataset.title || "", classes: Array.from(door.classList)});
            }
        };

        const onHover = (event: PointerEvent) => {
            findDoorAndUpdateLabel(event.target);
        };
        const onFocus = (event: FocusEvent) => {
            findDoorAndUpdateLabel(event.target);
        };

        container.addEventListener("pointerover", onHover);
        container.addEventListener("focusin", onFocus);
        return () => {
            container.removeEventListener("pointerover", onHover);
            container.removeEventListener("focusin", onFocus);
        };
    }, []);

    useEffect(function updateActiveDays() {
        const container = treeRef.current;
        if (!container) {
            return;
        }

        const setPassedDaysActive = () => {
            const today = new Date(); // "2026-11-25");
            // November for testing purposes. Will update to December later
            const todaysDay = today.getMonth() < 10 ? 0 : today.getMonth() > 10 ? 25 : today.getDate();

            const questions: TextDoor[] = [];
            container.querySelectorAll<HTMLAnchorElement>("a.day").forEach(door => {
                const dayClass = Array.from(door.classList).find(name => /^day-([1-9]|1[0-9]|2[0-5])$/.test(name));
                if (!dayClass) {
                    return;
                }

                const active = Number(dayClass.slice(4)) <= todaysDay;
                door.classList.toggle("active", active);
                door.tabIndex = active ? 0 : -1;
                questions.push({
                    day: Number(dayClass.slice(4)),
                    title: door.dataset.title || "",
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
        const observer = new MutationObserver(setPassedDaysActive);
        observer.observe(container, {childList: true, subtree: true});
        setPassedDaysActive();

        return () => {
            observer.disconnect();
        };
    }, []);

    const scrollStyledCheckboxIntoView = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.currentTarget.matches(":focus-visible")) {
            event.currentTarget.labels?.item(0)?.scrollIntoView({behavior: "smooth"});
        }
    };

    return <PageContainer className="festive-page"
        pageTitle={<TitleAndBreadcrumb
            currentPageTitle="Tree" 
            icon={{type: "icon", icon: "icon-generic"}}
        />}
        sidebar={<GenericPageSidebar/>}
    >
        <div className="d-flex justify-content-end my-3">
            <StyledToggle 
                falseLabel="Tree" trueLabel="Text only" aria-label="Text-only mode"
                checked={textOnly} onChange={event => setTextOnly(event.currentTarget.checked)} 
            />
        </div>
        <ol className={classNames("festive-text-list", {"d-none": !textOnly})}>
            {textDoors.map(door => <li key={door.day} className={door.active ? undefined : "text-muted"}>
                <span>Day {door.day}: </span>
                {door.active
                    ? <Link to={door.href}>{door.title}</Link>
                    : <span aria-disabled="true">{door.title}</span>}
                <AccessibilityTags tags={door.classes} tagClassName="ms-1 mb-n1" />
            </li>)}
        </ol>
        <div className={classNames("festive-tree-controls", {"d-none": textOnly})}>
            <input type="checkbox" id="festive-snow" className="snow-toggle" onFocus={scrollStyledCheckboxIntoView} />
            <input type="checkbox" id="festive-lights" className="lights-toggle" onFocus={scrollStyledCheckboxIntoView} />
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
