<template>
    <v-app>
        <v-app-bar class="px-3" flat density="compact">
            <v-spacer></v-spacer>
            <v-tabs centered fixed-tabs v-model="currentTab">
                <v-tab v-for="tab in tabs" :key="tab" :value="tab">
                    {{ tab }}
                </v-tab>
            </v-tabs>
            <v-spacer></v-spacer>

            <template v-slot:append>
                <v-btn @click="toggleDarkMode" :icon="darkModeIcon" alt="Toggle Dark Mode"></v-btn>
            </template>

            <template v-slot:prepend>
                <!-- i want to center the app bar and put a button in the end of the bar but then the bar wont center -->
                <!-- so yes this is a dirty hax but it works anyway -->
                <div style="height: 48px; width:48px"></div>
            </template>
        </v-app-bar>

        <v-main>
            <!-- agree kookie -->
            <v-slide-y-transition>
                <v-container v-show="!isCookieAgreed">
                    <v-row>
                        <v-spacer></v-spacer>
                        <v-col cols="12" xl="9">
                            <v-card class="overflow-auto mx-auto" elevation="3">
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
                        <v-spacer></v-spacer>
                    </v-row>
                </v-container>
            </v-slide-y-transition>

            <v-window v-model="currentTab">
                <v-window-item value="Generate">
                    <Generate />
                </v-window-item>
                <v-window-item value="Help">
                    <Help />
                </v-window-item>
            </v-window>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { useTheme } from 'vuetify'
import { useStore } from "vuex"

import Generate from '@/components/Generate.vue'
import Help from '@/components/Help.vue'

export default {
    components: {
        Generate,
        Help,
    },
    setup() {
        const theme = useTheme();
        theme.global.name.value = useStore().state.isDarkMode ? 'darkTheme' : 'lightTheme';
        return {
            theme,
        }
    },
    data() {
        let darkModeIcon;
        if (this.$store.state.isDarkMode) {
            darkModeIcon = "fas fa-moon"
        } else {
            darkModeIcon = "fas fa-sun"
        }
        return {
            tabs: [
                'Generate',
                'Help',
            ],
            currentTab: 1,
            darkModeIcon: darkModeIcon
        }
    },
    computed: {
        isDarkMode() {
            return this.$store.state.isDarkMode;
        },
        isCookieAgreed() {
            return this.$store.state.isCookieAgreed;
        }
    },
    methods: {
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
        }
    },
    watch: {
        isDarkMode(newValue) {
            this.theme.global.name.value = newValue ? 'darkTheme' : 'lightTheme';
        }
    },
    mounted() {
        if (this.$store.state.renderStatus === "error" || this.$store.state.renderStatus === "done") {
            this.$store.commit("setRendering", "idle")
        }
    }
}
</script>

<style>
@import '..\node_modules\roboto-fontface\css\roboto\roboto-fontface.css';

v-main {
    background-color: rgb(var(--v-theme-background));
}
</style>