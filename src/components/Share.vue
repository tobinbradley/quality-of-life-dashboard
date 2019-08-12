<template>

  <div>
    <v-btn text icon small @click="shareTwitter" aria-label="Share on Twitter" title="Share on Twitter">
      <v-icon>{{ mdiTwitter }}</v-icon>
    </v-btn>
    <v-btn text icon small @click="shareFacebook" aria-label="Share of Facebook" title="Share on Facebook">
      <v-icon>{{ mdiFacebook }}</v-icon>
    </v-btn>
    <v-btn text icon small @click="shareLinkedin" aria-label="Share on Linkedin" title="Share on Linkedin">
      <v-icon>{{ mdiLinkedin }}</v-icon>
    </v-btn>
    <v-btn text icon small @click="shareGithub" aria-label="Source code on Github" title="Source code on Github">
      <v-icon>{{ mdiGithubFace }}</v-icon>
    </v-btn>
  </div>


</template>

<script>
  import { mdiFacebook, mdiTwitter, mdiLinkedin, mdiGithubFace } from '@mdi/js'

  export default {
    name: 'share',
    data() {
      return {
        dialog: false,
        mdiFacebook: mdiFacebook,
        mdiTwitter: mdiTwitter,
        mdiLinkedin: mdiLinkedin,
        mdiGithubFace: mdiGithubFace
      }
    },
    computed: {
      url() {
        return window.location.href
      },
      site() {
        return this.$store.state.siteConfig
      }
    },
    methods: {
      shareTwitter() {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(this.url)}&text=${encodeURIComponent(`Check this out on the ${this.site.title}!`)}&hashtags=${encodeURIComponent('opendata')}`)
      },
      shareFacebook() {
        window.open(`https://www.facebook.com/sharer.php?u=${this.url}`)
      },
      shareLinkedin() {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${this.url}&title=${encodeURIComponent(this.site.title)}&summary=${encodeURIComponent(`Check this out on the ${this.site.title}!`)}`)
      },
      shareGithub() {
        window.open('https://github.com/tobinbradley/quality-of-life-dashboard')
      }
    }
  }
</script>

<style scoped>
button {
  margin: 5px;
}
</style>