<template>
  <v-app>
    <v-main>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import axios from 'axios'

  export default {
    mounted(){
      axios.post("/api", "hi").then((res) => {
        console.log(res)
      })
      console.log("post")
    }
  }
</script>
