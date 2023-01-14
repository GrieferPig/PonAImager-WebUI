import { Store } from '@/plugins/vuex'
import { RenderStatus } from '@/types';

declare module '@vue/runtime-core' {
    interface State {
        isDarkMode: boolean,
        renderStatus: RenderStatus,
        renderUUID: string,
        isCookieAgreed: boolean,
    }

    interface ComponentCustomProperties {
        $store: Store<State>
    }
}