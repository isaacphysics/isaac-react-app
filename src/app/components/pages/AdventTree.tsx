import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {Container, UncontrolledTooltip} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ACCESSIBILITY_TAGS, ACCESSIBILITY_WARNINGS, useAccessibilitySettings} from "../../services/accessibility";
import {v4 as uuid_v4} from "uuid";
import "../../../scss/common/advent.scss";
import { PageContainer } from "../elements/layout/PageContainer";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";

type AdventStyle = CSSProperties & {[key: `--${string}`]: string};
interface DoorLabel {
    title: string;
    classes: string[];
}

export const AdventTree = () => {
    const [selectedDoor, setSelectedDoor] = useState<DoorLabel | null>(null);
    const doorsRef = useRef<HTMLDivElement>(null);
    const accessibilitySettings = useAccessibilitySettings();

    useEffect(() => {
        const container = doorsRef.current;
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
            <div className="tree">
                <div className="doors" ref={doorsRef}>
                    <div className="tree-shapes" aria-hidden="true">
                        <span className="branch branch-1" />
                        <span className="lights branch-1" />
                        <span className="branch branch-2" />
                        <span className="lights branch-2" />
                        <span className="branch branch-3" />
                        <span className="lights branch-3" />
                        <span className="branch branch-4" />
                        <span className="lights branch-4" />
                        <span className="branch branch-5" />
                        <span className="lights branch-5" />
                        <span className="branch branch-6" />
                        <span className="lights branch-6" />
                    </div>
                    {/* Day 1 */}
                    <Link to="/questions/resistor_shopping" className="day active access-visual"
                        data-row="3" style={{"--day-color": "#944cbe", "--grid-row": "4", "--grid-column": "3"} as AdventStyle}
                        data-hover="Resistor Shopping (GCSE Physics)" aria-label="Day 1: Resistor Shopping (GCSE Physics)">
                        <span className="inside" aria-hidden="true">1</span><span className="door" aria-hidden="true">1</span>
                    </Link>
                    {/* Day 2 */}
                    <Link to="/questions/bitter_chemicals" className="day active"
                        data-row="5" style={{"--day-color": "#b7236d", "--grid-row": "6", "--grid-column": "2"} as AdventStyle}
                        data-hover="Bitter Chemicals (GCSE Chemistry)" aria-label="Day 2: Bitter Chemicals (GCSE Chemistry)">
                        <span className="inside" aria-hidden="true">2</span><span className="door" aria-hidden="true">2</span>
                    </Link>
                    {/* Day 3 */}
                    <Link to="/questions/woodland_survey" className="day active"
                        data-row="2" style={{"--day-color": "#00759c", "--grid-row": "3", "--grid-column": "3"} as AdventStyle}
                        data-hover="Woodland Survey (Maths)" aria-label="Day 3: Woodland Survey (Maths)">
                        <span className="inside" aria-hidden="true">3</span><span className="door" aria-hidden="true">3</span>
                    </Link>
                    {/* Day 4 */}
                    <Link to="/questions/merry_moments" className="day active"
                        data-row="6" style={{"--day-color": "#944cbe", "--grid-row": "7", "--grid-column": "4"} as AdventStyle}
                        data-hover="Merry Moments (GCSE Physics)" aria-label="Day 4: Merry Moments (GCSE Physics)">
                        <span className="inside" aria-hidden="true">4</span><span className="door" aria-hidden="true">4</span>
                    </Link>
                    {/* Day 5 */}
                    <Link to="/questions/bitter_brussels_sprouts" className="day active"
                        data-row="4" style={{"--day-color": "#127025", "--grid-row": "5", "--grid-column": "2"} as AdventStyle}
                        data-hover="Bitter Brussels Sprouts (Biology)" aria-label="Day 5: Bitter Brussels Sprouts (Biology)">
                        <span className="inside" aria-hidden="true">5</span><span className="door" aria-hidden="true">5</span>
                    </Link>
                    {/* Day 6 */}
                    <Link to="/questions/number_of_snowflakes" className="day active"
                        data-row="5" style={{"--day-color": "#00759c", "--grid-row": "6", "--grid-column": "5"} as AdventStyle}
                        data-hover="How Many Snowflakes (GCSE Maths)" aria-label="Day 6: How Many Snowflakes (GCSE Maths)">
                        <span className="inside" aria-hidden="true">6</span><span className="door" aria-hidden="true">6</span>
                    </Link>
                    {/* Day 7 */}
                    <Link to="/questions/christmas_crackers" className="day active"
                        data-row="4" style={{"--day-color": "#b7236d", "--grid-row": "5", "--grid-column": "5"} as AdventStyle}
                        data-hover="Christmas Crackers (Chemistry)" aria-label="Day 7: Christmas Crackers (Chemistry)">
                        <span className="inside" aria-hidden="true">7</span><span className="door" aria-hidden="true">7</span>
                    </Link>
                    {/* Day 8 */}
                    <Link to="/questions/christmas_classification" className="day active"
                        data-row="3" style={{"--day-color": "#127025", "--grid-row": "4", "--grid-column": "2"} as AdventStyle}
                        data-hover="Christmas Classification (GCSE Biology)" aria-label="Day 8: Christmas Classification (GCSE Biology)">
                        <span className="inside" aria-hidden="true">8</span><span className="door" aria-hidden="true">8</span>
                    </Link>
                    {/* Day 9 */}
                    <Link to="/questions/santas_delivery" className="day active"
                        data-row="base" style={{"--day-color": "#944cbe", "--grid-row": "8", "--grid-column": "3"} as AdventStyle}
                        data-hover="Santa's Delivery (Physics)" aria-label="Day 9: Santa's Delivery (Physics)">
                        <span className="inside" aria-hidden="true">9</span><span className="door" aria-hidden="true">9</span>
                    </Link>
                    {/* Day 10 */}
                    <Link to="/questions/let_it_snow" className="day active"
                        data-row="6" style={{"--day-color": "#b7236d", "--grid-row": "7", "--grid-column": "1"} as AdventStyle}
                        data-hover="Let It Snow (GCSE Chemistry)" aria-label="Day 10: Let It Snow (GCSE Chemistry)">
                        <span className="inside" aria-hidden="true">10</span><span className="door" aria-hidden="true">10</span>
                    </Link>
                    {/* Day 11 */}
                    <Link to="/questions/arranging_cards" className="day active"
                        data-row="4" style={{"--day-color": "#00759c", "--grid-row": "5", "--grid-column": "4"} as AdventStyle}
                        data-hover="Arranging Cards (Maths)" aria-label="Day 11: Arranging Cards (Maths)">
                        <span className="inside" aria-hidden="true">11</span><span className="door" aria-hidden="true">11</span>
                    </Link>
                    {/* Day 12 */}
                    <Link to="/questions/watt_if" className="day active"
                        data-row="6" style={{"--day-color": "#944cbe", "--grid-row": "7", "--grid-column": "6"} as AdventStyle}
                        data-hover="Watt if? (GCSE Physics)" aria-label="Day 12: Watt if? (GCSE Physics)">
                        <span className="inside" aria-hidden="true">12</span><span className="door" aria-hidden="true">12</span>
                    </Link>
                    {/* Day 13 */}
                    <Link to="/questions/yuletide_peptide" className="day active"
                        data-row="5" style={{"--day-color": "#127025", "--grid-row": "6", "--grid-column": "3"} as AdventStyle}
                        data-hover="Yuletide Peptide (Biology)" aria-label="Day 13: Yuletide Peptide (Biology)">
                        <span className="inside" aria-hidden="true">13</span><span className="door" aria-hidden="true">13</span>
                    </Link>
                    {/* Day 14 */}
                    <Link to="/questions/prob_marzipan_mints" className="day active"
                        data-row="1" style={{"--day-color": "#00759c", "--grid-row": "2", "--grid-column": "3 / 5"} as AdventStyle}
                        data-hover="Marzipan and Mint (GCSE Maths)" aria-label="Day 14: Marzipan and Mint (GCSE Maths)">
                        <span className="inside" aria-hidden="true">14</span><span className="door" aria-hidden="true">14</span>
                    </Link>
                    {/* Day 15 */}
                    <Link to="/questions/ginger_transformation" className="day active"
                        data-row="6" style={{"--day-color": "#b7236d", "--grid-row": "7", "--grid-column": "2"} as AdventStyle}
                        data-hover="Oven Heat Turns Ginger Sweet (Chemistry)" aria-label="Day 15: Oven Heat Turns Ginger Sweet (Chemistry)">
                        <span className="inside" aria-hidden="true">15</span><span className="door" aria-hidden="true">15</span>
                    </Link>
                    {/* Day 16 */}
                    <Link to="/questions/flying_reindeer_genetics" className="day active"
                        data-row="6" style={{"--day-color": "#127025", "--grid-row": "7", "--grid-column": "5"} as AdventStyle}
                        data-hover="Flying Reindeer Genetics (GCSE Biology)" aria-label="Day 16: Flying Reindeer Genetics (GCSE Biology)">
                        <span className="inside" aria-hidden="true">16</span><span className="door" aria-hidden="true">16</span>
                    </Link>
                    {/* Day 17 */}
                    <Link to="/questions/star_prism" className="day active"
                        data-row="base" style={{"--day-color": "#944cbe", "--grid-row": "8", "--grid-column": "4"} as AdventStyle}
                        data-hover="Star Prism (Physics)" aria-label="Day 17: Star Prism (Physics)">
                        <span className="inside" aria-hidden="true">17</span><span className="door" aria-hidden="true">17</span>
                    </Link>
                    {/* Day 18 */}
                    <Link to="/questions/hand_warmers" className="day active"
                        data-row="5" style={{"--day-color": "#b7236d", "--grid-row": "6", "--grid-column": "1"} as AdventStyle}
                        data-hover="Hand Warmers (GCSE Chemistry)" aria-label="Day 18: Hand Warmers (GCSE Chemistry)">
                        <span className="inside" aria-hidden="true">18</span><span className="door" aria-hidden="true">18</span>
                    </Link>
                    {/* Day 19 */}
                    <Link to="/questions/santa_flying_stunt" className="day active"
                        data-row="3" style={{"--day-color": "#00759c", "--grid-row": "4", "--grid-column": "4"} as AdventStyle}
                        data-hover="Santa Flying Stunt (Maths)" aria-label="Day 19: Santa Flying Stunt (Maths)">
                        <span className="inside" aria-hidden="true">19</span><span className="door" aria-hidden="true">19</span>
                    </Link>
                    {/* Day 20 */}
                    <Link to="/questions/hot_chocolate" className="day active"
                        data-row="5" style={{"--day-color": "#944cbe", "--grid-row": "6", "--grid-column": "4"} as AdventStyle}
                        data-hover="Hot Chocolate (GCSE Physics)" aria-label="Day 20: Hot Chocolate (GCSE Physics)">
                        <span className="inside" aria-hidden="true">20</span><span className="door" aria-hidden="true">20</span>
                    </Link>
                    {/* Day 21 */}
                    <Link to="/questions/hibernating_santa" className="day active"
                        data-row="base" style={{"--day-color": "#127025", "--grid-row": "8", "--grid-column": "2"} as AdventStyle}
                        data-hover="Hibernating Santa (Biology)" aria-label="Day 21: Hibernating Santa (Biology)">
                        <span className="inside" aria-hidden="true">21</span><span className="door" aria-hidden="true">21</span>
                    </Link>
                    {/* Day 22 */}
                    <Link to="/questions/frequency_winter_market" className="day active"
                        data-row="2" style={{"--day-color": "#00759c", "--grid-row": "3", "--grid-column": "4"} as AdventStyle}
                        data-hover="Sales at a Winter Market (GCSE Maths)" aria-label="Day 22: Sales at a Winter Market (GCSE Maths)">
                        <span className="inside" aria-hidden="true">22</span><span className="door" aria-hidden="true">22</span>
                    </Link>
                    {/* Day 23 */}
                    <Link to="/questions/watts_in_a_flame" className="day active"
                        data-row="6" style={{"--day-color": "#b7236d", "--grid-row": "7", "--grid-column": "3"} as AdventStyle}
                        data-hover="Watts in a Flame (Chemistry)" aria-label="Day 23: Watts in a Flame (Chemistry)">
                        <span className="inside" aria-hidden="true">23</span><span className="door" aria-hidden="true">23</span>
                    </Link>
                    {/* Day 24 */}
                    <Link to="/questions/marvellous_mistletoe" className="day"
                        data-row="4" style={{"--day-color": "#127025", "--grid-row": "5", "--grid-column": "3"} as AdventStyle}
                        data-hover="Marvellous Mistletoe (GCSE Biology)" aria-label="Day 24: Marvellous Mistletoe (GCSE Biology)">
                        <span className="inside" aria-hidden="true">24</span><span className="door" aria-hidden="true">24</span>
                    </Link>
                    {/* Day 25 */}
                    <Link to="/questions/present_delivery" className="day star"
                        data-row="star" style={{"--grid-row": "1", "--grid-column": "3"} as AdventStyle}
                        data-hover="Christmas Day: Present Delivery!" aria-label="Day 25: Present Delivery">
                        <span className="glow" aria-hidden="true" />
                        <span className="shape" aria-hidden="true" />
                        <span className="num" aria-hidden="true">25</span>
                    </Link>
                </div>
                <label htmlFor="advent-snow" className="trunk">
                    <span className="visually-hidden">Toggle snow</span>
                </label>
                <label htmlFor="advent-lights" className="bauble">
                    <span className="visually-hidden">Toggle fairy lights</span>
                </label>
            </div>
            <div className="tag">
                {selectedDoor?.title || "Pick a door"}
                {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && ACCESSIBILITY_TAGS.filter(tag => selectedDoor?.classes.includes(tag.replace(":", "-"))).map(tag => {
                    const id = `access-warn-${uuid_v4()}`;
                    return <React.Fragment key={tag}>
                        {" "}
                        <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[tag].icon} icon-color-black mb-n2`} id={id}/>
                        <span className="visually-hidden">{ACCESSIBILITY_WARNINGS[tag].description}</span>
                        <UncontrolledTooltip target={id} placement="top">
                            {ACCESSIBILITY_WARNINGS[tag].description}
                        </UncontrolledTooltip>
                    </React.Fragment>;
                })}
            </div>
            <div className="snowfall" aria-hidden="true">
                <div className="flake" style={{"--x": "1.5%", "--s": "7px", "--o": "0.65", "--d": "6.3s", "--delay": "4.9s"} as AdventStyle} />
                <div className="flake" style={{"--x": "5.0%", "--s": "5px", "--o": "0.9", "--d": "7.3s", "--delay": "0.5s"} as AdventStyle} />
                <div className="flake" style={{"--x": "11.0%", "--s": "8px", "--o": "0.5", "--d": "8.5s", "--delay": "5.0s"} as AdventStyle} />
                <div className="flake" style={{"--x": "14.2%", "--s": "8px", "--o": "0.77", "--d": "9.5s", "--delay": "0.4s"} as AdventStyle} />
                <div className="flake" style={{"--x": "20.8%", "--s": "5px", "--o": "0.94", "--d": "6.3s", "--delay": "5.2s"} as AdventStyle} />
                <div className="flake" style={{"--x": "24.0%", "--s": "7px", "--o": "0.72", "--d": "9.4s", "--delay": "3.4s"} as AdventStyle} />
                <div className="flake" style={{"--x": "30.4%", "--s": "6px", "--o": "0.74", "--d": "9.8s", "--delay": "2.2s"} as AdventStyle} />
                <div className="flake" style={{"--x": "34.3%", "--s": "6px", "--o": "0.73", "--d": "9.7s", "--delay": "3.0s"} as AdventStyle} />
                <div className="flake" style={{"--x": "38.8%", "--s": "10px", "--o": "0.68", "--d": "11.5s", "--delay": "2.2s"} as AdventStyle} />
                <div className="flake" style={{"--x": "42.0%", "--s": "7px", "--o": "0.8", "--d": "7.5s", "--delay": "3.4s"} as AdventStyle} />
                <div className="flake" style={{"--x": "47.8%", "--s": "10px", "--o": "0.81", "--d": "7.7s", "--delay": "5.9s"} as AdventStyle} />
                <div className="flake" style={{"--x": "50.5%", "--s": "12px", "--o": "0.53", "--d": "8.1s", "--delay": "5.6s"} as AdventStyle} />
                <div className="flake" style={{"--x": "56.5%", "--s": "6px", "--o": "0.83", "--d": "9.4s", "--delay": "5.3s"} as AdventStyle} />
                <div className="flake" style={{"--x": "60.5%", "--s": "10px", "--o": "0.75", "--d": "9.5s", "--delay": "2.7s"} as AdventStyle} />
                <div className="flake" style={{"--x": "67.5%", "--s": "9px", "--o": "0.69", "--d": "10.0s", "--delay": "0.4s"} as AdventStyle} />
                <div className="flake" style={{"--x": "71.4%", "--s": "14px", "--o": "0.59", "--d": "8.3s", "--delay": "4.0s"} as AdventStyle} />
                <div className="flake" style={{"--x": "72.8%", "--s": "14px", "--o": "0.63", "--d": "9.7s", "--delay": "3.0s"} as AdventStyle} />
                <div className="flake" style={{"--x": "78.3%", "--s": "9px", "--o": "0.51", "--d": "7.5s", "--delay": "2.3s"} as AdventStyle} />
                <div className="flake" style={{"--x": "85.8%", "--s": "6px", "--o": "0.53", "--d": "8.4s", "--delay": "1.7s"} as AdventStyle} />
                <div className="flake" style={{"--x": "87.0%", "--s": "12px", "--o": "0.88", "--d": "7.7s", "--delay": "2.5s"} as AdventStyle} />
                <div className="flake" style={{"--x": "92.5%", "--s": "12px", "--o": "0.93", "--d": "6.9s", "--delay": "1.1s"} as AdventStyle} />
                <div className="flake" style={{"--x": "96.5%", "--s": "8px", "--o": "0.46", "--d": "11.0s", "--delay": "1.1s"} as AdventStyle} />
            </div>
        </div>
    </PageContainer>;
};
