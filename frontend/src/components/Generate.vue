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
                                                    <v-col>
                                                        <v-card title="Dimension" variant="flat"
                                                            subtitle="Larger size = longer rendering time">
                                                            <v-card-text>
                                                                <v-row>
                                                                    <v-col>
                                                                        <v-text-field variant="outlined"
                                                                            :rules="dimenRulesHeight" label="Height"
                                                                            v-model="height"></v-text-field>
                                                                    </v-col>
                                                                    <v-col>
                                                                        <v-text-field variant="outlined"
                                                                            :rules="dimenRulesWidth" label="Width"
                                                                            v-model="width"></v-text-field>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Steps" variant="flat" subtitle="TODO: new sub">
                                                            <v-card-text>
                                                                <v-slider v-model="steps" :ticks="stepsTickLabel"
                                                                    :min="MIN_STEPS" :max="MAX_STEPS" :step="1"
                                                                    show-ticks thumb-label color="secondary"></v-slider>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="6">
                                                        <v-card title="Scale" variant="flat" subtitle="TODO: new sub">
                                                            <v-card-text>
                                                                <v-slider v-model="scale" :ticks="scaleTickLabel"
                                                                    :min="MIN_SCALE" :max="MAX_SCALE" :step="0.5"
                                                                    show-ticks thumb-label color="secondary"></v-slider>
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
                                                                    :disabled="watermarkForce"
                                                                    color="secondary"></v-checkbox>
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
                                    :disabled="isGenerateDisabled">Generate</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-card variant="flat" id="renderImage">
                                    <v-img aspect-ratio="1" :src="imageSrc"></v-img>
                                    <div v-show="renderStatus !== 'done'">
                                        <v-overlay v-model="imageOverlay" contained class="align-center justify-center">
                                            <v-fade-transition>
                                                <div v-show="renderStatus === 'idle'">
                                                    <p class="text-h2 text-center">&#128558;</p>
                                                    <p class="text-h6 text-center pa-2">You don't have any render
                                                        requests
                                                        now.
                                                    </p>
                                                    <p class="text-body-1 text-center text-medium-emphasis pa-2">
                                                        Start by entering your prompt above and click Generate.</p>
                                                </div>
                                            </v-fade-transition>
                                            <v-fade-transition>
                                                <!-- TODO: text does not display -->
                                                <v-progress-circular v-show="isGenerateDisabled"
                                                    :indeterminate="renderStatus !== 'rendering'" :size="64"
                                                    color="secondary" :model-value="renderProgress"
                                                    class="text-center"></v-progress-circular>
                                                <div v-show="isGenerateDisabled">
                                                    <p class="text-h6 text-center pa-2 text-medium-emphasis"
                                                        v-show="renderStatus === 'reqsent'">Request sent, awaiting
                                                        respond
                                                    </p>
                                                    <p class="text-h6 text-center pa-2 text-medium-emphasis"
                                                        v-show="renderStatus === 'pending'">Queued, 114514 requests
                                                        ahead
                                                    </p>
                                                    <p class="text-h6 text-center pa-2 text-medium-emphasis"
                                                        v-show="renderStatus === 'rendering'">Rendering
                                                    </p>
                                                </div>
                                            </v-fade-transition>
                                            <v-fade-transition>
                                                <div v-show="renderStatus === 'error'">
                                                    TODO: impl
                                                    error
                                                </div>
                                            </v-fade-transition>
                                            <!-- TODO: add a image loading screen -->
                                        </v-overlay>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row v-if="showRateAndDownload">
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
                                <v-btn class="h-75 w-100" color="primary" :href="imageSrc">Download</v-btn>
                                <p class="text-truncate text-no-wrap text-caption text-medium-emphasis text-center">
                                    Image will
                                    expire in {{ imageExpireIn }}</p>
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
import { requestInfo, requestRender, serverStatus } from '@/scripts/request'
import { AxiosError } from 'axios'
import { VForm } from '../../node_modules/vuetify/lib/components'
import { getDefaults } from '@/scripts/getDefaults'

export default {
    async mounted() {
        this.steps = this.DEF_STEPS;
        this.height = this.DEF_HEIGHT + "";
        this.width = this.DEF_WIDTH + "";
        this.scale = this.DEF_SCALE;
        this.watermark = this.DEF_WATERMARK;
        this.promptRules = [
            (v: string) => {
                // eslint-disable-next-line no-extra-boolean-cast
                if (v === null || v.length === 0) {
                    return 'Required'
                }
                if (v.split(" ").length > this.MAX_TOKEN_LENGTH) {
                    return 'Too many prompts'
                }
                return true;
            }
        ];
        this.negPromptRules = [
            (v: string) => {
                if (v.split(" ").length > this.MAX_TOKEN_LENGTH) {
                    return 'Too many prompts'
                }
                return true;
            }
        ];
        this.dimenRulesHeight = [
            (v) => {
                if (!v.length) {
                    return 'Required'
                }
                if (!(/^\d+$/.test(v))) {
                    return "Not a number"
                }
                const value = +v as number
                if (value < this.MIN_HEIGHT || value > this.MAX_HEIGHT) {
                    return "Out of range"
                }
                if (value % 32 !== 0) {
                    return "Not multiplies of 32"
                }
                return true;
            }
        ];
        this.dimenRulesWidth = [
            (v) => {
                if (!v.length) {
                    return 'Required'
                }
                if (!(/^\d+$/.test(v))) {
                    return "Not a number"
                }
                const value = +v as number
                if (value < this.MIN_WIDTH || value > this.MAX_WIDTH) {
                    return "Out of range"
                }
                if (value % 32 !== 0) {
                    return "Not multiplies of 32"
                }
                return true;
            }
        ];
        this.seedRules = [
            (v) => {
                if (!v.length) {
                    return 'Required'
                }
                if (!(/^(-?)\d+$/.test(v))) {
                    return "Not a number"
                }
                return true;
            }
        ];
        try {
            console.log(await serverStatus());
            this.$store.commit("purgeHistory");
            console.log(this.$store.state.history);
            if (this.renderStatus !== "idle") {
                if (this.renderStatus === "reqsent") {
                    // this might be very rare but im going to write this for precaution
                    // TODO: make the dialog more comedic
                    this.errorPopup("Congratulations, seems like you tried to send a render request last time, but for some reasons the server did not confirm your request. The image you requested may still be rendered, but oops, there's no way you may find that image again. Sorry about that. (Achievement unlocked: A Tragic Moment)");
                    this.$store.commit("setRendering", "idle");
                } else {
                    let _res = await requestInfo(this.$store.state.renderUUID);
                    if (_res.status === "yay") {
                        // still active, resume process
                        await this.poll(this.$store.state.renderUUID);
                    } else {
                        // dead (expired maybe)
                        this.$store.commit("setRenderUUID", "")
                        this.$store.commit("setRendering", "idle");
                    }
                }
            }
            this.$emit('update:pageLoading', false);
        } catch (e) {
            this.errorPopup("Network error while connecting to the server. Please try again.")
        }
    },
    async setup() {
        try {
            return {
                ... await getDefaults(),
            }
        } catch (e) {
            alert("Network error while connecting to the server. Please try again.")
            location.reload();
            // not gonna reach here, but wrote for type inference
            return {
                MAX_STEPS: 0,
                MIN_STEPS: 0,
                DEF_STEPS: 0,
                MAX_HEIGHT: 0,
                MIN_HEIGHT: 0,
                DEF_HEIGHT: 0,
                MAX_WIDTH: 0,
                MIN_WIDTH: 0,
                DEF_WIDTH: 0,
                MAX_SCALE: 0,
                MIN_SCALE: 0,
                DEF_SCALE: 0,
                MAX_TOKEN_LENGTH: 0,
                DEF_WATERMARK: false,
                watermarkForce: false,
                stepsTickLabel: [],
                scaleTickLabel: [],
            }
        }
    },
    data() {
        return {
            steps: 0,
            height: "",
            width: "",
            scale: 0,
            watermark: false,

            valid: true,
            dialog: false,
            dialogContent: "dialogContent",

            renderProgress: 0,

            imageSrc: "",
            imageOverlay: true,
            imageRating: 0,
            imageExpireIn: "30:00",
            imageExpireTimestamp: 0,

            prompt: "",
            negPrompt: "",
            seed: "-1",

            showRateAndDownload: false,

            promptRules: [(v) => { }] as [(v: string) => boolean | string],
            negPromptRules: [(v) => { }] as [(v: string) => boolean | string],
            dimenRulesHeight: [(v) => { }] as [(v: string) => boolean | string],
            dimenRulesWidth: [(v) => { }] as [(v: string) => boolean | string],
            seedRules: [(v) => { }] as [(v: string) => boolean | string],
        }
    },
    computed: {
        renderStatus(): RenderStatus {
            return this.$store.state.renderStatus as RenderStatus;
        },
        renderUUID() {
            return this.$store.state.renderUUID;
        },
        isGenerateDisabled() {
            return (this.renderStatus === 'rendering') || (this.renderStatus === 'reqsent') || (this.renderStatus === 'pending')
        }
    },
    watch: {
        imageOverlay(_newV) {
            if (this.renderStatus !== "done") {
                this.imageOverlay = true;
            }
        },
        negPrompt(_newV) {
            if (_newV === null) {
                // for some reason empty input = null
                this.negPrompt = "";
            }
        }
    },
    methods: {
        async sendRequest() {
            const { valid } = await (this.$refs.form as VForm).validate()
            if (!valid) {
                return;
            }
            this.$store.commit("setRendering", "reqsent");
            this.showRateAndDownload = false;
            this.imageSrc = "";
            let _res: ReqRespond;
            let _req: RenderReq = {
                type: "txt2img",
                prompt: this.prompt,
                negPrompt: this.negPrompt,
                scale: this.scale,
                steps: this.steps,
                height: parseInt(this.height),
                width: parseInt(this.width),
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
                    this.$store.commit("setRendering", "pending");
                    this.$store.commit("setRenderUUID", _res.detail)
                    await this.poll(_res.detail);
                    break;
                case "neigh":
                    this.errorPopup(_res.detail);
                    break;
            }
        },
        async poll(uuid: string) {
            const _poll = async () => {
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
                                this.$store.commit("setRenderUUID", "")
                                this.$store.commit("addToHistory", _res.renderStat)
                                console.log("finished " + _res.renderStat.filePath);
                                this.imageSrc = _res.renderStat.filePath
                                this.showRateAndDownload = true;
                                this.imageExpireTimestamp = _res.renderStat.expireTime;
                                this.imageExpireCounter();
                                this.renderProgress = 0;
                                return;
                            case "Rendering":
                                this.$store.commit("setRendering", "rendering");
                                console.log("currentIter " + _res.renderStat.currentIter);
                                this.renderProgress = (_res.renderStat.currentIter / _res.renderStat.origReq.steps) * 100
                                break;
                            case "Error":
                                this.$store.commit("setRendering", "error");
                                this.$store.commit("setRenderUUID", "")
                                console.log("error");
                                this.renderProgress = 0;
                                return;
                        }
                        setTimeout(async () => {
                            await _poll();
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
            };
            setTimeout(async () => {
                await _poll();
            }, 1000)
        },
        purgeHistory() {
            // purge history every 10 sec
            this.$store.commit("purgeHistory");
            setTimeout(() => {
                this.purgeHistory();
            }, 10000)
        },
        imageExpireCounter() {
            let _date = new Date().getTime();
            let _expireIn = this.imageExpireTimestamp - _date;
            if (_expireIn < 0) {
                //expired
                this.$store.commit("purgeHistory");
                this.$store.commit("setRendering", "idle");
                this.$store.commit("setRenderUUID", "")
                this.imageSrc = ""
                this.showRateAndDownload = false;
                // TODO: inform user with a snackbar
                return;
            } else if (_expireIn > 3600000) {
                this.imageExpireIn = new Date(_expireIn).toISOString().slice(11, 19);
            } else {
                this.imageExpireIn = new Date(_expireIn).toISOString().slice(14, 19);
            }
            // poll every second
            setTimeout(() => {
                this.imageExpireCounter()
            }, 1000);
        },
        errorPopup(info: string) {
            this.dialogContent = info;
            this.dialog = true;
        },
        fillPrompt() {
            this.prompt = "TODO: impl prompt example filling";
        },
        resetAdvanced() {
            // leave neg prompt alone
            this.height = this.DEF_HEIGHT + "";
            this.width = this.DEF_WIDTH + "";
            this.scale = this.DEF_SCALE;
            this.steps = this.DEF_STEPS;
            this.seed = "-1";
            this.watermark = this.DEF_WATERMARK;
        },
    },
    props: ['pageLoading'],
    emits: ['update:pageLoading'],
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