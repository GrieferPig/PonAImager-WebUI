/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import { loadVuex } from './vuex'
// Types
import type { App } from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSun, faMoon, faDice, faExclamation, faTimesCircle, faChevronUp, faChevronDown, faStar, faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular, faSquare } from '@fortawesome/free-regular-svg-icons'

export function registerPlugins(app: App) {
  loadFonts()
  app.use(vuetify);
  app.use(loadVuex());

  library.add(faSun, faMoon, faDice, faExclamation, faTimesCircle, faChevronUp, faChevronDown, faStar, faStarRegular, faCheckSquare, faSquare);

  app.component('font-awesome-icon', FontAwesomeIcon);
}
