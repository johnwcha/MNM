<template>
  <v-layout row justify-center align-center>
    <v-flex>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <material-stats-card
            class="mt-5 mx-5"
            color="info"
            icon="mdi-translate"
            title="# of unique chars indexed"
            value="+2246"
            sub-icon="mdi-calendar"
            sub-text="Next milestone: 3000 chars"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <material-stats-card
            class="mt-5 mx-5"
            color="pink"
            icon="mdi-poll"
            title="total # of chars indexed"
            value="+115521"
            sub-icon="mdi-tag"
            sub-text="Fully indexed and searchable"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <material-stats-card
            class="mt-5 mx-5"
            color="success"
            icon="mdi-store"
            title="total # of minutes of video"
            value="+987"
            sub-icon="mdi-clock"
            sub-text="About 16.45 hours"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <material-stats-card
            class="mt-5 mx-5"
            color="orange"
            icon="mdi-sofa"
            title="# of videos indexed"
            value="+64"
            sub-icon="mdi-youtube"
            sub-text="Continues to grow ..."
          />
        </v-col>

        <!-- <v-col
          cols="12"
          md="6"
        >
          <material-card
            color="purple"
            class="px-5 py-3 my-6 mx-5"
          >
            <template #heading>
              <div class="display-1 font-weight-light">
                Employees Stats
              </div>

              <div class="subtitle-1 font-weight-light">
                New employees on 15th September, 2016
              </div>
            </template>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="items"
              />
            </v-card-text>
          </material-card>
        </v-col> -->

        <v-col cols="12">
          <material-card
            color="purple"
            class="px-5 py-3 my-6 mx-5"
          >
            <template #heading>
              <div class="display-1 font-weight-light">
                搜尋最佳例句：30 秒
              </div>

              <!-- <div class="subtitle-1 font-weight-light">
                New employees on 15th September, 2016
              </div> -->
            </template>

            <youtube v-if="videoId!=''" ref="youtube" :video-id="videoId" :player-vars="playerVars" 
              :resize="true"  :fitParent="true" >
            </youtube>  

          </material-card>
        </v-col>
      </v-row>

    </v-flex>
  </v-layout>
</template>

<script>
import MaterialCard from '~/components/MaterialCard'
import MaterialStatsCard from '~/components/MaterialStatsCard'
import Vue from 'vue'
import VueYoutube from 'vue-youtube'
Vue.use(VueYoutube)

export default {
  components: {
    MaterialCard,
    MaterialStatsCard
  },
  data() {
    return {
      userEmail: '',
      instEmail: '',
      allRoles: ['', 'Student', 'Instructor'],
      userRole: '',
      passcode: '',
      registered: false,
      remember: true,
      videoId: 'qKTAf5hSyzY',
      slider: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        start: 0,
        //end: 36,
        fs: 1,
        iv_load_policy: 3, // not working
        loop: 1, // not working
        modestbranding: 1, // no effect
        rel: 0,
        showinfo: 0,
        wmode: 'transparent',
        playsinline: 1
      },
    }
  },
  methods: {
    signIn() {
      console.log(this.userEmail, this.passcode)
      this.$fireStore.collection('-userAccount').doc(this.userEmail).get().then(doc => {
        if (doc.exists) {
          //console.log(doc.data())
          if (doc.data().code == this.passcode) {
            if (doc.data().role=='Instructor') {
              this.$store.commit('setUserRole', {email: this.userEmail, ...doc.data()})
              this.$router.push('inst/profile')
            } else {
              this.$store.commit('setUserRole', {email: this.userEmail, ...doc.data()})
              this.$router.push('user/profile')
            }
            //console.log('login success')
          } else {
            alert('The passcode is incorrect')
          }
        } else {
          alert('The account does not exist')
        }
      })
    },
    register() {
      if (this.passcode=='') {
        const code = new Date().getTime().toString()
        //console.log( code )
        if (this.userRole=='Student') {
          if (this.instEmail==''){
            alert('All fields are required')
          } else {
            this.passcode = code.substring( code.length-5 )
          }
        } else { // userRole = instructor
          this.passcode = code.substring( code.length-5 )
        }
      } else {
        localStorage.duoting_userEmail = this.userEmail
        if (this.remember) {
          localStorage.duoting_passcode = this.passcode
          localStorage.duoting_userRole  = this.userRole
          if (this.userRole=='Student') {
            localStorage.duoting_instEmail = this.instEmail
          }
        }
        this.$fireStore.collection('_userAccount').doc(this.userEmail).get().then(doc =>{
          //console.log(doc.exists)
          if (doc.exists) {
            alert('This email account already exists')
          } else {
            let obj = {}
            const now = new Date().toString()
            //console.log(now)
            //return
            if (this.userRole=='Instructor') {
              obj = {code: this.passcode, created: now, role: 'Instructor'}
            } else {
              obj = {code: this.passcode, created: now, role: 'Student', inst: this.instEmail}
            }
            this.$fireStore.collection('-userAccount').doc(this.userEmail).set(obj).then(() => {
              console.log('account created')
              this.registered = true
              if (this.userRole=='Instructor') {
                this.$store.commit('setUserRole', {email: this.userEmail, ...obj})
                this.$router.push('inst/profile')
              } else {
                this.$store.commit('setUserRole', {email: this.userEmail, ...obj})
                this.$router.push('user/profile')
              }
            }).catch(error => { console.log(error.message) })
          }
        }).catch(error => {
          console.log(error.message)
        })
      }
    },
    login() {
      console.log(this.$fireAuth.currentUser)
      this.$fireAuth.signInAnonymously().catch( (e) => {
        //console.log(e)
      })
      //this.signIn()
    }
  },
  mounted() {
    if (!this.$fireAuth.currentUser) {
      this.$fireAuth.onAuthStateChanged(user => {
      //console.log(user)
      })
      this.login()
    }
    //console.log( new Date().getTime() )
    /* ------------------------------
    localStorage.duoting_instEmail
    localStorage.duoting_passcode
    localStorage.duoting_userEmail
    localStorage.duoting_userRole 
    ------------------------------ */
    if (!localStorage.duoting_userEmail) {
      this.registered = false
    } else {
      this.registered = true
      this.userEmail = localStorage.duoting_userEmail
      if (localStorage.duoting_passcode) {
        this.passcode = localStorage.duoting_passcode
      }
    }
  }
}
</script>