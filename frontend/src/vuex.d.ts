import { Store } from '@/plugins/vuex'

declare module '@vue/runtime-core' {
    interface State {
        isDarkMode: boolean,
        isRendering: boolean,
        renderUUID: string,
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}