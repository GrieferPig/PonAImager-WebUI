<template>
    <v-container>
        <v-row>
            <v-spacer></v-spacer>
            <v-col cols="12" lg="8" xl="6">
                <v-sheet min-height="700" rounded="lg" elevation="8">
                    <v-container>
                        <v-row>
                            <v-col>
                                <p class="text-h3 text-sm-h1 text-md-h1 text-center">PonAImager<span
                                        class="text-body-1">&#945;</span></p>
                            </v-col>
                        </v-row>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col>
                                    <v-text-field clearable label="Enter Your Prompt Here"
                                        placeholder="e.g. pinkie pie anthro portrait wedding dress veil intricate highly detailed ..."
                                        :rules="promptRules" v-model="prompt" append-inner-icon="fas fa-dice"
                                        @click:append-inner="fillPrompt()"
                                        hint="Use space between keywords, 77 words maximum"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-expansion-panels>
                                        <v-expansion-panel title="Advanced options">
                                            <v-expansion-panel-text>
                                                <v-row>
                                                    <v-col>
                                                        <v-text-field class="mt-4" clearable label="Negative Prompt"
                                                            placeholder="e.g. 3d sfm" :rules="negPromptRules"
                                                            v-model="negPrompt"
                                                            hint="Things that you don't want in your image. Use space between keywords, 77 words maximum"></v-text-field>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Sampler" variant="flat"
                                                            subtitle="If generated image have glitches, use DDIM">
                                                            <v-card-text>
                                                                <v-btn-toggle v-model="sampler" rounded="0"
                                                                    color="secondary" group divided mandatory
                                                                    variant="outlined">
                                                                    <v-btn v-for="sam in availSamplers" :key="sam"
                                                                        :value="sam">
                                                                        {{ sam }}
                                                                    </v-btn>
                                                                </v-btn-toggle>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Dimension" variant="flat"
                                                            subtitle="Larger size = longer rendering time">
                                                            <v-card-text>
                                                                <v-row>
                                                                    <v-col>
                                                                        <v-text-field variant="outlined"
                                                                            :rules="dimenRules" label="Height"
                                                                            v-model="height"></v-text-field>
                                                                    </v-col>
                                                                    <v-col>
                                                                        <v-text-field variant="outlined"
                                                                            :rules="dimenRules" label="Width"
                                                                            v-model="width"></v-text-field>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Steps" variant="flat"
                                                            subtitle="Set to 40 for optimal results">
                                                            <v-card-text>
                                                                <v-slider v-model="steps" :ticks="stepsTickLabel"
                                                                    :min="15" :max="50" :step="1" show-ticks thumb-label
                                                                    color="secondary"></v-slider>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Scale" variant="flat"
                                                            subtitle="Don't touch this.">
                                                            <v-card-text>
                                                                <v-slider v-model="scale" :ticks="scaleTickLabel"
                                                                    :min="0" :max="15" :step="0.5" show-ticks
                                                                    thumb-label color="secondary"></v-slider>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Seed" variant="flat"
                                                            subtitle="The 'inspiration' of the AI.">
                                                            <v-card-text>
                                                                <v-text-field variant="outlined" :rules="seedRules"
                                                                    label="Seed" v-model="seed"
                                                                    hint="Use -1 for random seed"></v-text-field>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Watermark" variant="flat" subtitle="TODO: impl">
                                                            <v-card-text>
                                                                <v-checkbox label="Watermark" v-model="watermark"
                                                                    disabled color="secondary"></v-checkbox>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>
                                                <v-row><v-col>
                                                        <v-btn block color="secondary" @click="resetAdvanced">Reset
                                                            Advanced
                                                            Options</v-btn>
                                                    </v-col></v-row>
                                            </v-expansion-panel-text>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                        </v-form>
                        <v-row>
                            <v-col>
                                <v-btn block color="primary" @click="sendRequest()"
                                    :disabled="renderStatus === 'pending' || renderStatus === 'rendering'">Generate</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-card variant="flat" id="renderImage">
                                    <v-img aspect-ratio="1" :src="imageSrc"></v-img>
                                    <v-overlay v-model="imageOverlay" contained class="align-center justify-center">
                                        <div v-show="renderStatus === 'idle'">
                                            <p class="text-h2 text-center">&#128558;</p>
                                            <p class="text-h6 text-center pa-2">You don't have any render requests now.
                                            </p>
                                            <p class="text-body-1 text-center text-medium-emphasis pa-2">
                                                Start by entering your prompt above and click Generate.</p>
                                        </div>
                                    </v-overlay>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row v-show="showRateAndDownload">
                            <v-spacer></v-spacer>
                            <v-col cols="12" sm="4">
                                <p class="text-center text-subtitle-1 h-100 w-100 mb-n4">
                                    Rate the quality of this image (TODO: implement)
                                </p>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <div class="text-center">
                                    <v-rating v-model="imageRating" hover color="secondary"
                                        :item-labels="['neigh', '', '', '', 'yay']" item-label-position="top"
                                        density="comfortable" disabled></v-rating>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <v-btn class="h-75 w-100" color="primary">Download</v-btn>
                                <p class="text-truncate text-no-wrap text-caption text-medium-emphasis text-center">
                                    Image will
                                    expire in {{ imageExpireTime }}</p>
                            </v-col>
                            <v-spacer></v-spacer>
                        </v-row>
                    </v-container>
                </v-sheet>
            </v-col>

            <v-col cols="12" lg="4" xl="3">
                <v-sheet rounded="lg" min-height="512" elevation="8">
                    serverstat+history
                </v-sheet>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
    </v-container>

    <v-dialog v-model="dialog">
        <v-card>
            <v-card-text>
                {{ dialogContent }}
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click="dialog = false">Close Dialog</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { RenderReq, QueryRes, RenderStatus, ReqRespond } from '@/types'
import { requestInfo, requestRender, howManyRequestsAreThere } from '@/scripts/request'
import { AxiosError } from 'axios'
import { VForm } from '../../node_modules/vuetify/lib/components'

export default {
    data() {
        let steplabels: string[] = [];
        steplabels.length = 35;
        steplabels[14] = "15";
        steplabels[34] = "50"

        let scalelabels: string[] = [];
        scalelabels.length = 30;
        scalelabels[0] = "0";
        scalelabels[29] = "15"

        return {
            valid: true,
            dialog: false,
            dialogContent: "dialogContent",

            imageSrc: "",
            imageOverlay: true,
            imageRating: 0,
            imageExpireTime: "30:00",

            prompt: "",
            negPrompt: "",
            sampler: "DDIM",
            height: "512",
            width: "512",
            steps: 40,
            scale: 7.5,
            seed: "-1",
            watermark: true,

            availSamplers: ["DDIM", "Euler"],

            showRateAndDownload: false,

            promptRules: [
                (v: string) => {
                    if (!v.length) {
                        return 'Required'
                    }
                    if (v.split(" ").length > 77) {
                        return 'Too many prompts'
                    }
                    return true;
                }
            ],
            negPromptRules: [
                (v: string) => {
                    if (v.split(" ").length > 77) {
                        return 'Too many prompts'
                    }
                    return true;
                }
            ],
            dimenRules: [
                (v) => {
                    if (!v.length) {
                        return 'Required'
                    }
                    if (!(/^\d+$/.test(v))) {
                        return "Not a number"
                    }
                    let value = +v as number
                    if (value < 32 || value > 512) {
                        return "Out of range"
                    }
                    if (value % 32 !== 0) {
                        return "Not multiplies of 32"
                    }
                    return true;
                }
            ],
            seedRules: [
                (v) => {
                    if (!v.length) {
                        return 'Required'
                    }
                    if (!(/^(-?)\d+$/.test(v))) {
                        return "Not a number"
                    }
                    return true;
                }
            ],

            stepsTickLabel: steplabels,
            scaleTickLabel: scalelabels,
        }
    },
    computed: {
        renderStatus(): RenderStatus {
            return this.$store.state.renderStatus;
        },
        renderUUID() {
            return this.$store.state.renderUUID;
        },
    },
    watch: {
        imageOverlay(_newV) {
            if (this.renderStatus !== "done") {
                this.imageOverlay = true;
            }
        },
        renderStatus(_newV) {
            if (this.renderStatus === "done") {
                this.showRateAndDownload = true;
            }
            this.showRateAndDownload = false;
        }
    },
    methods: {
        async sendRequest() {
            const { valid } = await (this.$refs.form as VForm).validate()
            if (!valid) {
                console.log("invalid")
                return;
            }
            let _res: ReqRespond;
            let _req: RenderReq = {
                type: "txt2img",
                prompt: this.prompt,
                negPrompt: this.negPrompt,
                scale: this.scale,
                steps: this.steps,
                height: parseInt(this.height),
                width: parseInt(this.width),
                sampler: this.sampler as ("DDIM" | "Euler"),
                seed: parseInt(this.seed),
                srcImg: "",
                watermark: this.watermark
            };
            try {
                _res = await requestRender(_req);
            } catch (err) {
                this.errorPopup((err as AxiosError).message)
                return;
            }
            console.log(_res)
            switch (_res.status) {
                case "yay":
                    this.errorPopup("Success, uuid=" + _res.detail);
                    this.$store.commit("setRendering", "Pending");
                    this.$store.commit("setRenderUUID", _res.detail)
                    this.poll(_res.detail);
                    break;
                case "neigh":
                    this.errorPopup(_res.detail);
                    break;
            }
        },
        poll(uuid: string) {
            setTimeout(async () => {
                await this._poll(uuid);
            }, 1000)
        },
        async _poll(uuid) {
            let _res: QueryRes;
            try {
                _res = await requestInfo(uuid);
            } catch (err) {
                this.errorPopup((err as AxiosError).message)
                return;
            }
            console.log(_res);
            switch (_res.status) {
                case "yay":
                    switch (_res.renderStat?.status) {
                        case "Pending":
                            this.$store.commit("setRendering", "pending");
                            console.log("pending");
                            break;
                        case "Finished":
                            this.$store.commit("setRendering", "done");
                            console.log("finished " + _res.renderStat.filePath);
                            this.imageSrc = _res.renderStat.filePath
                            this.errorPopup("finished " + _res.renderStat.finishTime)
                            return;
                        case "Rendering":
                            this.$store.commit("setRendering", "rendering");
                            console.log("currentIter " + _res.renderStat.currentIter);
                            break;
                        case "Error":
                            this.$store.commit("setRendering", "error");
                            console.log("rendering");
                            return;
                    }
                    setTimeout(async () => {
                        await this._poll(uuid);
                    }, 1000);
                    break;
                case "neigh":
                    this.errorPopup("UUID not found in task list");
                    this.$store.commit("setRendering", "error");
                    break;
                case "wot":
                    this.errorPopup("UUID not string");
                    break;
            }
        },
        errorPopup(info: string) {
            this.dialogContent = info;
            this.dialog = true;
        },
        fillPrompt() {
            this.prompt = "TODO: impl prompt example filling";
        },
        resetAdvanced() {
            this.sampler = "DDIM";
            this.height = "512";
            this.width = "512";
            this.scale = 7.5;
            this.steps = 40;
            this.seed = "-1";
            this.watermark = true;
        },
    }
}
</script>

<style scoped>
@import '@/styles/font-adventure.css';

.text-md-h1 {
    font-family: "Adventure" !important;
    width: 100%;
    user-select: none;
    background: linear-gradient(135deg, #C5CAE9 0%, #303F9F 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>