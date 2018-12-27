/**
 * Extract a drawpoint from a command
 * @param cmd
 */
export function extractDrawpoints(cmd) {
    const dp = {};
    // TODO other commands result in multiple drawpoints such as arc or rect
    switch(cmd.name) {
        case "moveTo": // dropdown
        case "lineTo":
            dp.x = cmd.args[0];
            dp.y = cmd.args[1];
            break;
        case "quadraticCurveTo":
            dp.x = cmd.args[2];
            dp.y = cmd.args[3];
            dp.cp1 = {x:cmd.args[0], y:cmd.args[1]};
            break;
        case "bezierCurveTo":
            dp.x = cmd.args[4];
            dp.y = cmd.args[5];
            dp.cp1 = {x:cmd.args[0], y:cmd.args[1]};
            dp.cp2 = {x:cmd.args[2], y:cmd.args[3]};
            break;
        default:
            alert(`Unhandled drawpoint type from ${cmd.name} type command`);
    }
    return [dp];
}