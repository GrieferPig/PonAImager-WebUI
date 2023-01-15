/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'

// Composables
import { createVuetify, ThemeDefinition } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi-svg'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'

// Themes
const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#ebebeb',
    surface: '#ffffff',
    primary: '#3F51B5',
    'primary-darken-1': '#303F9F',
    secondary: '#03A9F4',
    'secondary-darken-1': '#0288D1',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    'border-color': '#000000'
  }
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#212121',
    primary: '#3F51B5',
    'primary-darken-1': '#303F9F',
    secondary: '#03A9F4',
    'secondary-darken-1': '#0288D1',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      mdi,
      fa
    }
  },
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme,
    }
  }
})