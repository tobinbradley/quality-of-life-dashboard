<template>
  <v-dialog v-model="show" width="500" v-if="site.helpUrl">

    <v-card>
      <iframe ref="youtube" width="560" height="315" style="max-width: 100%;" :src="startUrl" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <v-divider></v-divider>
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
    name: 'help',
    props: {
      value: Boolean
    },
    data () {
      return {
        dialog: false,
        startUrl: ''
      }
    },
    computed: {
      site() {
        return this.$store.state.siteConfig
      },
      show: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    },
    watch: {
      show(newValue, oldValue) {
        if (newValue) {
          this.startUrl = this.site.helpUrl
        }
        else {
          const ctx = this.$refs.youtube.contentWindow
          ctx.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
        }
      }
    }
  }
</script>
