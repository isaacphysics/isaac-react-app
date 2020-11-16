export function svgMoveTo(x: number, y: number) {
    return 'M' + x + ' ' + y;
}

export function svgLine(x: number, y: number) {
    return 'L' + x + ' ' + y;
}

export function addHexagonKeyPoints<T extends {halfWidth: number; quarterHeight: number}>(hexagon: T) {
    return {
        ...hexagon,
        x: {
            left: (Math.sqrt(3) * hexagon.quarterHeight) / 2,
            center: hexagon.halfWidth,
            right: (hexagon.halfWidth * 2) - (Math.sqrt(3) * hexagon.quarterHeight) / 2,
        },
        y: {
            top: hexagon.quarterHeight / 2,
            center: 2 * hexagon.quarterHeight,
            bottom: 7 * hexagon.quarterHeight / 2,
        },
    };
}
