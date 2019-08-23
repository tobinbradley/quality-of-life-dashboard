<template>
  <v-dialog scrollable v-model="show" width="650">
      <v-card>

        <v-card-text v-html="metadata" class="metadata">
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="pink" dark @click="download">
            <v-icon left>{{ mdiFileDownloadOutline }}</v-icon>
            Download
          </v-btn>
          <v-btn color="primary" @click="show = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
</template>

<script>
  import download from '../js/download'
  import { mdiFileDownloadOutline } from '@mdi/js'

  export default {
    name: 'metadata',
    data: () => ({
      metadata: '',
      mdiFileDownloadOutline: mdiFileDownloadOutline
    }),
    props: {
      dataConfig: {
        type: Object
      },
      value: Boolean
    },
    computed: {
      show: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    },
    mounted () {
      fetch(`data/meta/m${this.dataConfig.metric}.html`)
        .then((response) => {
          response.text().then(text => {
            this.metadata = text
          })
        })
    },
    methods: {
      download() {
        download(this.metadata, 'data:text/html;charset=utf-8;', `${this.dataConfig.title}.html`)
      }
    }
  }
</script>

<style lang="scss">
.metadata {
  padding-top: 15px;
  margin-bottom: 15px;
  font-size: 0.9em;

  p {
    padding: 15px 0 0;
  }

  img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
  }
}
</style>