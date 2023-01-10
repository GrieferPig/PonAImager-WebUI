<template>
  <v-app>
    <v-main>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import axios from 'axios'

export default {
  mounted() {
    axios.post("/api", {
      firstName: 'Fred',
      lastName: 'Flintstone'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => {
      console.log(res)
    })
  }
}
</script>
