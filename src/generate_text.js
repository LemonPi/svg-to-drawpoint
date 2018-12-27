import {roundToDec, diff, scale} from "drawpoint/src";

function addNum(num) {
    num = roundToDec(num,1);
    if (num >= 0) {
        return `+ ${num}`;
    } else {
        return `- ${-num}`;
    }
}

export function generateText(drawPts, fixedPts, s) {
    if (typeof fixedPts === 'undefined' || fixedPts.length === 0) {
        return "drawpoint library code will be printed here. Config options include:\n" +
            "- fixed points: drawpoints you already have\n" +
            "- scale: how much to scale the difference and distance between points\n" +
            "intermediate points named p1, p2, ...";
    }
    const text = [];
    // in order of drawpoints, we define them relative to the previous fixed point
    // assume the first point should always be a fixed point
    fixedPts[0] = fixedPts[0] || "p1";

    text.push("import * as dp from 'drawpoint';\n");

    const names = [];
    // TODO generate preamble text for setting stroke and fill
    let lastFixed = 0;
    for (let i = 0; i < drawPts.length; ++i) {
        if (fixedPts[i]) {
            lastFixed = i;
            text.push(`// ${fixedPts[i]} is a given fixed point`);
            names.push(fixedPts[i]);
        } else {
            // define both the end point and the control points relative to the last fixed point
            let d = scale(diff(drawPts[i], drawPts[lastFixed]), s);
            // name these points starting at p1
            let name = `p${i + 1}`;
            text.push(`const ${name} = dp.point(${fixedPts[lastFixed]}.x ${addNum(d.x)}, ${fixedPts[lastFixed]}.y ${addNum(d.y)});`);
            names.push(name);
            if (drawPts[i].cp1) {
                d = scale(diff(drawPts[i].cp1, drawPts[lastFixed]), s);
                text.push(`${name}.cp1 = dp.point(${fixedPts[lastFixed]}.x ${addNum(d.x)}, ${fixedPts[lastFixed]}.y ${addNum(d.y)});`);
            }
            if (drawPts[i].cp2) {
                d = scale(diff(drawPts[i].cp1, drawPts[lastFixed]), s);
                text.push(`${name}.cp2 = dp.point(${fixedPts[lastFixed]}.x ${addNum(d.x)}, ${fixedPts[lastFixed]}.y ${addNum(d.y)});`);
            }
        }
    }

    text.push("\nctx.beginPath();");
    text.push(`dp.drawPoints(ctx, ${names.join(', ')});`);
    text.push("ctx.stroke();");
    text.push("ctx.fill();");

    return text.join('\n');
}