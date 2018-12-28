import {roundToDec, diff, scale} from "drawpoint/src";

function addNum(num) {
    num = roundToDec(num,1);
    if (num >= 0) {
        return `+ ${num}`;
    } else {
        return `- ${-num}`;
    }
}

export function generateText(shapes, s) {
    if (typeof shapes === 'undefined' || shapes.length === 0) {
        return "drawpoint library code will be printed here. Config options include:\n" +
            "- fixed points: drawpoints you already have\n" +
            "- scale: how much to scale the difference and distance between points\n" +
            "intermediate points named p1, p2, ...";
    }
    const text = [];
    text.push("import * as dp from 'drawpoint';\n");

    // TODO generate preamble text for setting stroke and fill
    let lastFixedPt = null;
    let lastFixedName = null;
    for (let shape of shapes) {
        const names = [];
        // in order of drawpoints, we define them relative to the previous fixed point
        // assume the first point should always be a fixed point
        if (lastFixedPt === null) {
            shape.fixedPts[0] = shape.fixedPts[0] || "p1";
        }

        text.push("{");
        for (let i = 0; i < shape.drawpoints.length; ++i) {
            if (shape.fixedPts[i]) {
                lastFixedPt = shape.drawpoints[i];
                lastFixedName = shape.fixedPts[i];
                text.push(`// ${shape.fixedPts[i]} is a given fixed point`);
                names.push(shape.fixedPts[i]);
            } else {
                // define both the end point and the control points relative to the last fixed point
                let d = scale(diff(shape.drawpoints[i], lastFixedPt), s);
                // name these points starting at p1
                let name = `p${i + 1}`;
                text.push(`const ${name} = dp.point(${lastFixedName}.x ${addNum(d.x)}, ${lastFixedName}.y ${addNum(d.y)});`);
                names.push(name);
                if (shape.drawpoints[i].cp1) {
                    d = scale(diff(shape.drawpoints[i].cp1, lastFixedPt), s);
                    text.push(`${name}.cp1 = dp.point(${lastFixedName}.x ${addNum(d.x)}, ${lastFixedName}.y ${addNum(d.y)});`);
                }
                if (shape.drawpoints[i].cp2) {
                    d = scale(diff(shape.drawpoints[i].cp2, lastFixedPt), s);
                    text.push(`${name}.cp2 = dp.point(${lastFixedName}.x ${addNum(d.x)}, ${lastFixedName}.y ${addNum(d.y)});`);
                }
            }
        }

        text.push("\nctx.beginPath();");
        text.push(`dp.drawPoints(ctx, ${names.join(', ')});`);
        text.push("ctx.stroke();");
        text.push("ctx.fill();");
        text.push("}\n");
    }

    return text.join('\n');
}