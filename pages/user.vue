<template>
  <v-layout row justify-center align-center>
    <v-flex xs12 sm6>
      <v-row>
        <v-col >
          <v-card class="mx-2">
            <v-card-title class="headline">
              {{avatar.split('.png')[0]}}
            </v-card-title>
              <v-row align="center" justify="center">
                <img width="256" height="256" :src="require(`../static/assets/` + avatar)">
              </v-row>
            <v-card-text>
              <v-text-field disabled outlined label="Access code" v-if="passcode!=''" v-model="passcode" ></v-text-field>
              <v-select outlined class="mx-1" :items="chars" @change="charChange($event)" label="Character Form" :value="char"></v-select>
              <v-text-field outlined v-model="userEmail" color="primary" label="Email (optional)"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <span v-if="emailSaved"> Email saved <v-icon color="green"> mdi-check </v-icon> </span>
              <v-spacer />
              <v-btn :disabled="userEmail==''" @click="saveEmail" color="primary">
                Save email
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script>
import OpenCC from 'opencc-js' // ver 0.3.0 NOT working, revert back to 0.2.1
//import {randomIntFromInterval} from '../util/functions'

export default {
  data() {
    return {
      emailSaved: false,
      passcode: '',
      userEmail: '',
      chars: ['Simplified', 'Traditional'],
      char: 'Simplified',
    }
  },
  methods: {
    charChange(e){
      this.char = e
      localStorage.mnm_char = e
    },
    saveEmail() {
      localStorage.mnm_email = this.userEmail.trim()
      const id = localStorage.mnm_avatar.split('.png')[0] + '_' + localStorage.mnm_code
      this.$fireStore.collection('-userAccount').doc(id).set(
        {class: 'EALC 206', inst: 'johnwcha@usc.edu', user: this.userEmail.trim()}).then(res =>{
        this.emailSaved = true
      }).catch(error => { console.error(error) })
    },
    login() {
      //console.log(this.$fireAuth.currentUser)
      this.$fireAuth.signInAnonymously().catch( (e) => {
        //console.log(e)
      })
      this.init()
    },
    init() {
      if (localStorage.mnm_code) {
        this.passcode = localStorage.getItem('mnm_code')
        this.char = localStorage.getItem('mnm_char')
        this.userEmail = localStorage.mnm_email ? localStorage.mnm_email : ''
        //console.log(this.avatar)
      } else {
        console.error('no access code')
        this.$router.push('/')
      }
    }
  },
  computed:{
    avatar() {
      //console.log(localStorage.mnm_avatar)
      if (this.$store.state.user) {
        return localStorage.getItem('mnm_avatar')
      } else {
        this.$router.push('/')
        return 'logo.svg'
      }
    }
  },
  mounted(){
    if (!this.$fireAuth.currentUser) {
      this.$fireAuth.onAuthStateChanged(user => {
        //console.log( user )
      })
    }
    this.login()
  }
}
</script>