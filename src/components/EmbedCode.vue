<template>
  <v-dialog v-model="show" width="500">
      <v-card>
        <v-divider></v-divider>


        <v-card-text class="text--primary">
          <p>
            Drop this code into your own web page to embed this metric!
          </p>
          <v-switch
            v-model="large"
            label="Large Embed"
            color="primary"
          ></v-switch>

          <v-textarea
          label="Embed Code"
          v-model="embedCode"
          readonly="readonly"
          ref="embedCode"
          onclick="this.select()"
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="show = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
</template>

<script>

  export default {
    name: 'metadata',
    data() {
      return {
        large: false
      }
    },
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
      },
      selected() {
        return this.$store.state.selected
      },
      size() {
        return this.large ? [800, 800] : [380, 400]
      },
      embedCode() {
        let location = window.location

        let baseUrl = `${location.protocol}//${location.host}/embed.html#${this.dataConfig.metric}`

        const keys = Object.keys(this.selected)
        keys.forEach(key => {
          if (this.selected[key].length > 0) {
            baseUrl += `/${key}:${this.selected[key].join(',')}`
          }
        })

        return `<iframe scrolling="no" style="width: ${this.size[0]}px; height: ${this.size[1]}px; border: none;" src="${baseUrl}"></iframe>`
      }
    },
    methods: {
      download() {
        download(this.metadata, 'data:text/html;charset=utf-8;', `${this.dataConfig.title}.html`)
      }
    }
  }
</script>

<style lang="scss" scoped>
.metadata {
  padding: 20px 6px 6px;
  font-size: 0.9em;
}
</style>