import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {Carousel, CarouselControl, CarouselIndicators, CarouselItem} from 'reactstrap';
import {below, ifKeyIsEnter, useDeviceSize} from "../../services";
import { Spacer } from './Spacer';

interface ControlledCarouselInstanceProps {
    children: any;
}

const ControlledCarouselInstance = (props: ControlledCarouselInstanceProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const gotoIndex = (newIndex: number) => {
        if (!animating) setActiveIndex(newIndex);
    };

    const next = useCallback(() => {
        if (!animating) setActiveIndex(activeIndex + 1);
    }, [activeIndex, animating]);

    const previous = useCallback(() => {
        if (!animating) setActiveIndex(activeIndex - 1);
    }, [activeIndex, animating]);
    
    useEffect(() => {
        if (activeIndex >= props.children.length) setActiveIndex(0);
    }, [activeIndex, props.children.length, setActiveIndex]);
    
    useEffect(() => {
        if (activeIndex == -1) setActiveIndex(props.children.length - 1);
    }, [activeIndex, props.children.length, setActiveIndex]);

    const onExiting = () => setAnimating(true);
    const onExited = () => setAnimating(false);
    const onEntered = (element: HTMLElement) => {
        const focusTargets = element.getElementsByClassName('focus-target');
        if (focusTargets.length > 0) {
            // @ts-ignore we should only mark focusable elements with the focus-target class
            focusTargets[0].focus();
        }
    };

    // Manually set up event listeners until ReactStrap becomes more extensible
    const carouselContainer = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const ref = carouselContainer.current;
        const classToCallback = {
            "carousel-control-prev": ifKeyIsEnter(previous),
            "carousel-control-next": ifKeyIsEnter(next)
        };

        if (ref) {
            for (const [cssClass, callback] of Object.entries(classToCallback)) {
                const elements = carouselContainer.current.getElementsByClassName(cssClass);
                if (elements.length) {
                    elements[0].addEventListener("keypress", callback as any);
                }
            }
        }

        return function cleanUp() {
            if (ref) {
                for (const [cssClass, callback] of Object.entries(classToCallback)) {
                    const elements = ref.getElementsByClassName(cssClass);
                    if (elements.length) {
                        elements[0].removeEventListener("keypress", callback as any);
                    }
                }
            }
        };
    }, [next, previous]);

    return (
        <div ref={carouselContainer}>
            <Carousel
                activeIndex={activeIndex} className="pb-5" interval={false} keyboard={false}
                previous={previous} previousLabel="Previous" next={next} nextLabel="Next"
            >
                <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                {props.children.map((child: ReactNode, index: number) => (
                    <CarouselItem key={index} onEntered={onEntered as any} onExiting={onExiting} onExited={onExited}>
                        <div>
                            <Spacer />
                            {child}
                            <Spacer />
                        </div>
                    </CarouselItem>
                ))}
                <CarouselControl direction="next" directionText="Next" onClickHandler={next} onKeyPress={next} />
                <CarouselIndicators
                    items={props.children.map((_child: ReactNode, index: number) => ({key: index}))}
                    activeIndex={activeIndex}
                    onClickHandler={gotoIndex}
                />
            </Carousel>
        </div>
    );
};

export const ResponsiveCarousel = ({...props}: React.HTMLAttributes<HTMLElement>) => {
    const podGroups: Element[][] = [];
    const deviceSize = useDeviceSize();
    const groupingLimit = below['sm'](deviceSize) ? 1 : below['md'](deviceSize) ? 2 : 3;

    if (!props.children || !Array.isArray(props.children)) return null;

    props.children?.forEach((child: HTMLElement, index: number) => {
        if (index % groupingLimit === 0) {
            podGroups.push([]);
        }
        podGroups[Math.floor(index / groupingLimit)].push(child);
    });

    return (
        <ControlledCarouselInstance data-testid={"carousel-inner"} className={`d-block`} {...props}>
            {...podGroups}
        </ControlledCarouselInstance>
    );
};
export default ResponsiveCarousel;

