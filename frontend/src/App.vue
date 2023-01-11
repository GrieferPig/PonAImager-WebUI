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
    let req = {
      type: "txt2img",
      prompt: "pony",
      negPrompt: "3d sfm",
      scale: 7,
      steps: 35,
      height: 384,
      width: 384,
      sampler: "Euler",
      seed: 127,
      srcImg: "",
    }
    axios.post("/req", req, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res) => {
      console.log(res.data)
      requestInfo(res)
    })
  }
}

function requestInfo(res) {
  setTimeout(() => {
    let req: QueryReq = {
      uuid: (res.data as ReqRespond).detail as string,
    }
    axios.post("/query", req, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((res1) => {
      console.log(res1.data)
      requestInfo(res)
    })
  }, 1000);
}

interface RenderReq {
  type: "img2img" | "txt2img",
  prompt: string,
  negPrompt: string,
  scale: number,
  steps: number,
  height: number,
  width: number,
  sampler: "DDIM" | "Euler",
  seed: number,
  srcImg: string, // no impl yet
}

interface RenderStat {
  status: "Finished" | "Pending" | "Error" | "Rendering",
  detail: string,
  currentIter: number,
  iterSpeed: string, // no impl yet
  estiTime: number, // no impl yet
  uuid: string,
  filePath: string,
  expireTime: number,
  reqTime: number,
  finishTime: number,
  origReq: RenderReq,
}

interface ReqRespond {
  status: "yay" | "neigh", // TRADITION
  detail: string,
}

interface QueryReq {
  uuid: string,
}

interface QueryRes {
  status: "yay" | "neigh" | "wot",
  renderStat: RenderStat | undefined,
}
</script>
