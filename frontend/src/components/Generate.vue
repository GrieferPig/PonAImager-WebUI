<template>
    <v-container>
        <v-row>
            <v-spacer></v-spacer>
            <v-col cols="12" md="8" xl="6">
                <v-sheet min-height="700" rounded="lg" elevation="8">
                    <v-container>
                        <v-row>
                            <v-col>
                                <p class="text-h3 text-md-h2 text-lg-h1 text-center">PonAImager</p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field clearable label="Enter Your Prompt Here"
                                    placeholder="e.g. pinkie pie anthro portrait wedding dress veil intricate highly detailed ..."
                                    :rules="promptRules" v-model="prompt" append-inner-icon="fas fa-dice"
                                    @click:append-inner="fillPrompt()"
                                    hint="Space between keywords, 77 words maximum"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-expansion-panels>
                                    <v-expansion-panel title="Advanced">
                                        <v-expansion-panel-text>
                                            <v-btn block>ih</v-btn>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-btn block color="primary">Generate</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-card variant="flat" id="renderImage">
                                    <v-img aspect-ratio="1" :src="imageSrc"></v-img>
                                    <v-overlay v-model="imageOverlay" contained class="align-center justify-center">
                                        <div>
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
                        <v-row>
                            <v-col cols="4">
                                <p class="text-center text-subtitle-1 h-100 w-100 pt-3">Rate the quality of this image
                                </p>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-center ml-n4">
                                    <v-rating v-model="imageRating" hover color="secondary"></v-rating>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <v-btn class="h-75 w-100" color="primary">Download</v-btn>
                                <p class="text-truncate text-no-wrap text-caption text-medium-emphasis text-center">
                                    Image will
                                    expire in {{ imageExpireTime }}</p>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-sheet>
            </v-col>

            <v-col cols="12" md="4" xl="3">
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
import { RenderReq, QueryRes, RenderStatus } from '@/types'
import { requestInfo, requestRender, howManyRequestsAreThere } from '@/scripts/request'
import { AxiosError } from 'axios'

export default {
    data() {
        let req: RenderReq = {
            type: "img2img",
            prompt: "",
            negPrompt: "",
            scale: 7.5,
            steps: 35,
            height: 512,
            width: 512,
            sampler: "DDIM",
            seed: -1,
            srcImg: "",
            watermark: true,
        }
        return {
            dialog: false,
            dialogContent: "dialogContent",

            imageSrc: "",
            imageOverlay: true,
            imageRating: 0,
            imageExpireTime: "30:00",

            req: req,
            prompt: "",
            negPrompt: "",
        }
    },
    computed: {
        promptRules() {
            return [
                v => !!v || 'This field is required'
            ];
        },
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

    },
    methods: {
        setReqArg(argName: string, argValue: any) {
            this.req[argName] = argValue;
        },
        async sendRequest() {
            let _req;
            try {
                _req = await requestRender(this.req);
            } catch (err) {
                this.errorPopup((err as AxiosError).message)
                return;
            }
            switch (_req.status) {
                case "yay":
                    this.$store.commit("setRendering", true);
                    this.$store.commit("setRenderUUID", _req.detail)
                    break;
                case "neigh":
                    this.errorPopup(_req.detail);
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
    }
}
</script>

<style scoped>
@import '@/styles/font-adventure.css';

.text-lg-h1 {
    font-family: "Adventure" !important;
    width: 100%;
    user-select: none;
    background: linear-gradient(135deg, #C5CAE9 0%, #303F9F 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.text-md-h2 {
    font-family: "Adventure" !important;
    width: 100%;
    user-select: none;
    background: linear-gradient(135deg, #C5CAE9 0%, #303F9F 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.text-h3 {
    font-family: "Adventure" !important;
    width: 100%;
    user-select: none;
    background: linear-gradient(135deg, #C5CAE9 0%, #303F9F 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>