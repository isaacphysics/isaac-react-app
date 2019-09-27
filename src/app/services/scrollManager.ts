export function scrollVerticallyIntoView(element: Element) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset;
    window.scrollTo(0, yPosition);
}
