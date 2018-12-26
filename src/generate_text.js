export function generateText(drawPts, fixedPts, scale) {
    if (typeof fixedPts === 'undefined' || fixedPts.length === 0) {
        return "drawpoint library code will be printed here. Config options include:\n" +
            "- fixed points: drawpoints you already have\n" +
            "- scale: how much to scale the difference and distance between points";
    }
    const text = [];
    // TODO generate based on drawpoints and fixed points
    text.push(scale.toString());
    for (let pt of drawPts) {
        text.push(`${pt.x}, ${pt.y}`);
    }
    for (let pt of fixedPts) {
        text.push(pt.toString());
    }
    return text.join('\n');
}