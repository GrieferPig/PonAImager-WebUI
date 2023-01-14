import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { RenderStatus } from '@/types';

const vuexLocal = new VuexPersistence({
    storage: window.localStorage
})

export function loadVuex() {
    const store = createStore({
        state() {
            return {
                isDarkMode: false,
                renderStatus: "idle" as RenderStatus,
                renderUUID: "",
                isCookieAgreed: false,
            }
        },
        mutations: {
            toggleDarkMode(state) {
                state.isDarkMode = !state.isDarkMode;
            },
            setRendering(state, status: RenderStatus) {
                state.renderStatus = status;
                if (status === "idle") {
                    state.renderUUID = "";
                }
            },
            setRenderUUID(state, uuid: string) {
                state.renderUUID = uuid;
            },
            agreeCookie(state) {
                state.isCookieAgreed = true;
            },
            disagreeCookie(state) {
                state.isCookieAgreed = false;
            }
        },
        plugins: [vuexLocal.plugin]
    });
    return store;
}
