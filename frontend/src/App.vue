<template>
  <v-app>

    <v-app-bar class="px-3" color="surface" flat density="compact">
      <v-spacer></v-spacer>
      <v-tabs centered fixed-tabs bg-color="surface">
        <v-tab v-for="link in links" :key="link">
          {{ link }}
        </v-tab>
      </v-tabs>
      <v-spacer></v-spacer>

      <template v-slot:append>
        <v-btn @click="toggleDarkMode" :icon="darkModeIcon"></v-btn>
      </template>

      <template v-slot:prepend>
        <!-- i want to center the app bar and put a button in the end of the bar but then the bar wont center -->
        <!-- so yes this is a dirty hax but it works anyway -->
        <v-btn icon disabled></v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card class="overflow-auto mx-auto" v-show="!isCookieAgreed">
              <v-banner lines="three" icon="$warning" color="warning">
                <v-banner-text>
                  We use cookies (not muffins) to ensure this website works properly.
                </v-banner-text>

                <template v-slot:actions>
                  <v-btn @click="agreeCookie">Got it</v-btn>
                </template>
              </v-banner>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="8">
            <v-sheet min-height="700" rounded="lg">
              welcome+generate
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet rounded="lg" min-height="512">
              serverstat+history
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
      <v-btn @click="$store.commit('disagreeCookie')">disagree</v-btn>
    </v-main>
  </v-app>
</template>

<script lang="ts">

import {
  RenderReq,
  QueryRes,

} from '@/types'
import { useDisplay, useTheme } from 'vuetify'
import { requestInfo, requestRender, howManyRequestsAreThere } from '@/scripts/request'
import { AxiosError } from 'axios'
import { useStore } from "vuex"

export default {
  setup() {
    const theme = useTheme();
    theme.global.name.value = useStore().state.isDarkMode ? 'darkTheme' : 'lightTheme';
    console.log(theme.global.name.value)
    return {
      theme,
    }
  },
  data() {
    const { mobile } = useDisplay();
    let darkModeIcon;
    if (this.$store.state.isDarkMode) {
      darkModeIcon = "fas fa-moon"
    } else {
      darkModeIcon = "fas fa-sun"
    }
    return {
      req: {
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
      } as RenderReq,
      links: [
        'Generate',
        'Help',
      ],
      isMobile: mobile,
      darkModeIcon: darkModeIcon
    }
  },
  computed: {
    isRendering() {
      return this.$store.state.isRendering;
    },
    renderUUID() {
      return this.$store.state.renderUUID;
    },
    isDarkMode() {
      return this.$store.state.isDarkMode;
    },
    isCookieAgreed() {
      return this.$store.state.isCookieAgreed;
    }
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
      alert(info)
    },
    toggleDarkMode() {
      this.$store.commit("toggleDarkMode");
      if (this.$store.state.isDarkMode) {
        this.darkModeIcon = "fas fa-moon"
      } else {
        this.darkModeIcon = "fas fa-sun"
      }
    },
    agreeCookie() {
      this.$store.commit('agreeCookie');
      console.log('cookieagree', this.$store.state.isCookieAgreed)
    }
  },
  watch: {
    isMobile(newValue) {
      console.log(newValue)
    },
    isDarkMode(newValue) {
      this.theme.global.name.value = newValue ? 'darkTheme' : 'lightTheme';
    }
  },
  mounted() {
    // this.setReqArg("type", "wdnmd");
    // this.sendRequest()
  }
}
</script>

<style>
v-main {
  background-color: rgb(var(--v-theme-background));
}
</style>