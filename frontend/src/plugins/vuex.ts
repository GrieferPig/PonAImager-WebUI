import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
    storage: window.localStorage
})

export function loadVuex() {
    const store = createStore({
        state() {
            return {
                isDarkMode: false,
                isRendering: false,
                renderUUID: "",
                isCookieAgreed: false,
            }
        },
        mutations: {
            toggleDarkMode(state) {
                state.isDarkMode = !state.isDarkMode;
            },
            setRendering(state, status: boolean) {
                state.isRendering = status;
                if (!status) {
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
