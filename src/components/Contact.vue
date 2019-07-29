<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on }">
      <v-btn text v-on="on">
        Contact
      </v-btn>
    </template>

    <v-card>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card-text>
          <v-text-field label="Email Address" name="email" v-model="email" :rules="emailRules" required></v-text-field>
          <v-textarea
            name="message"
            label="Message"
            hint="Give us your feedback or let us know how we can help."
            v-model="message"
            :rules="messageRules"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="pink" dark @click="submit"><v-icon left>{{ mdiAt }}</v-icon> Send</v-btn>
          <v-btn color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

  </v-dialog>
</template>

<script>
  import { mdiAt } from '@mdi/js'

  export default {
    name: 'contact',
    data () {
      return {
        valid: true,
        dialog: false,
        mdiAt: mdiAt,
        message: '',
        messageRules: [
          v => !!v || 'Name is required'
        ],
        email: '',
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ]
      }
    },
    computed: {
      contactForm() {
        return this.$store.state.siteConfig.contactForm
      }
    },
    methods: {
      submit() {
        if (this.$refs.form.validate()) {
          this.snackbar = true

          const formData = new FormData()
          formData.append('email', this.email)
          formData.append('message', this.message)
          formData.append('submit', true)

          fetch(this.contactForm, {
            body: formData,
            method: "post"
          }).catch(e => {})

          this.dialog = false
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>