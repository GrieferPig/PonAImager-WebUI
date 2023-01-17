import { serverInfo } from "./request";

export async function getDefaults() {
    const render = await serverInfo();
    // maxs and mins
    const MAX_STEPS = render.maximum.steps;
    const MIN_STEPS = render.minimum.steps;
    const steps = render.defaults.steps;
    const MAX_HEIGHT = render.maximum.height;
    const MIN_HEIGHT = render.minimum.height;
    const height = render.defaults.height;
    const MAX_WIDTH = render.maximum.width;
    const MIN_WIDTH = render.minimum.width;
    const width = render.defaults.width;
    const MAX_SCALE = render.maximum.scale;
    const MIN_SCALE = render.minimum.scale;
    const scale = render.defaults.scale;
    const MAX_TOKEN_LENGTH = render.maximum['token-length'];


    const steplabels: string[] = [];
    steplabels.length = MAX_STEPS - MIN_STEPS;
    steplabels[0] = MIN_STEPS + "";
    steplabels[steplabels.length - 1] = MAX_STEPS + ""

    const scalelabels: string[] = [];
    scalelabels.length = (MAX_SCALE - MIN_SCALE) * 2;
    scalelabels[0] = MIN_SCALE + "";
    scalelabels[scalelabels.length - 1] = MAX_SCALE + ""

    return {
        MAX_STEPS: MAX_STEPS,
        MIN_STEPS: MIN_STEPS,
        DEF_STEPS: steps,
        MAX_HEIGHT: MAX_HEIGHT,
        MIN_HEIGHT: MIN_HEIGHT,
        DEF_HEIGHT: height,
        MAX_WIDTH: MAX_WIDTH,
        MIN_WIDTH: MIN_WIDTH,
        DEF_WIDTH: width,
        MAX_SCALE: MAX_SCALE,
        MIN_SCALE: MIN_SCALE,
        DEF_SCALE: scale,
        MAX_TOKEN_LENGTH: MAX_TOKEN_LENGTH,
        DEF_WATERMARK: render.watermark.use,
        watermarkForce: render.watermark.force,
        stepsTickLabel: steplabels,
        scaleTickLabel: scalelabels,
    }
}