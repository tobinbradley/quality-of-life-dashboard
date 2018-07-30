<template>
  <div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-color--white intro">
      <h3>{{ siteConfig.jurisdiction }}</h3>
      <h1>{{ siteConfig.title }}</h1>
      <div id="dQw4w9WgXcQ" data-params="controls=0&showinfo=0&rel=0" data-background="img/youtube-bg.svg" class="not-youtube"
          style="background-image: url('img/youtube-bg.svg');"></div>
      <p>
          Exploring neighborhood character, economics, education, engagement, environment, health, housing, safety and transportation.
      </p>
      <p>
          <button class="mdl-button mdl-button--raised mdl-button--accent intro-hide" @click="hideCard">OK, I Got It</button>
          <button class="mdl-button mdl-button--raised mdl-button--accent feedback" @click="contact">Contact Us</button>
      </p>
      <p style="display: inline-block">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-1">
              <input type="checkbox" id="switch-1" class="mdl-switch__input" v-model="hide">
              <span class="mdl-switch__label">Don't show this again</span>
          </label>
      </p>

  </div>
</template>

<script>
export default {
  name: "sc-intro",
  watch: {
    hide: "writeLocalStorage"
  },
  methods: {
    writeLocalStorage: function() {
      if (this.hide) {
        localStorage.setItem("hideIntro", true);
      } else {
        localStorage.removeItem("hideIntro");
      }
    },
    hideCard: function() {
      if (document.querySelector(".youtube iframe")) {
        document.querySelector(".youtube iframe").src = "";
      }
      document.querySelector(".intro").style.display = "none";
      window.scrollTo(0, 0);
    },
    contact: function() {
      document
        .querySelector(".comment-container")
        .scrollIntoView({ behavior: "smooth" });
      document.querySelector("#contact-email").focus();
    }
  }
};
</script>