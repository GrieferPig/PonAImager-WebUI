import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { RenderStatus, RenderStat } from '@/types';

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
                history: [] as RenderStat[],
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
            },
            addToHistory(state, renderStat: RenderStat) {
                const _time = new Date().getTime();
                if (renderStat.expireTime > _time) {
                    // LIFO
                    state.history.unshift(renderStat);
                    // pop the last one (which will always be this req) after expired
                    setTimeout(() => {
                        state.history.pop();
                    }, renderStat.expireTime - _time)
                }
                // skip if renderstat is expired (bcs it will)
            },
            clearHistory(state) {
                state.history = []
            },
            // only remove expired items
            purgeHistory(state) {
                const _time = new Date().getTime();
                for (const his of state.history) {
                    if (his.expireTime < _time) {
                        // the oldest (first to expire) is always at the last
                        state.history.pop()
                    }
                }
            }
        },
        plugins: [vuexLocal.plugin]
    });
    return store;
}
