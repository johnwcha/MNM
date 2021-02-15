<template>
  <v-layout row justify-center align-center>
    <v-flex>
      <v-row>
        <v-col cols="7" class="ml-5">
          <div class="iframe_div">
            <youtube ref="youtube" :video-id="videoId" :player-vars="playerVars" 
                :resize="true"  :fitParent="true" >
            </youtube> 
            <div align="center" justify="center">
              <v-slider :label="$vuetify.breakpoint.smAndUp ? 'Playback rate' : ''"
                style="max-width: 400px"  @end="setPlayerSpeed" v-model="slider" thumb-label max="1" min="0.1" step="0.05"></v-slider>
            </div>
            <div style="font-size:24px; font-family: SimSun" align="center" justify="center">
                <p> [T] {{ playSubTrad }} </p>
                <p> [S] {{ playSubSimp }} </p>
            </div>
          </div>
        </v-col>

        <v-col class="mr-5">
            <v-card outlined>
              <v-card-actions>
                <v-icon class="mr-2" color="primary">mdi-text-search</v-icon> Search 
                <v-text-field class="mx-2" append-outer-icon="mdi-send" @click:append-outer="patternSearch()"
                    v-model="pattern" color="success" prepend-icon="mdi-chevron-right"
                    :loading="searchBusy">
                </v-text-field>
              </v-card-actions>
            </v-card>
                        <!--       v-text-field append-outer-icon="mdi-send" @click:append-outer="patternSearch()"
                        v-model="pattern" color="success" prepend-icon="mdi-chevron-right"
                        placeholder="Example: 沒 x 過，除 x 還（除了 ... 以外，... 還）">
                        </v-text-field         -->

                    <v-simple-table>
                        <template v-slot:default>
                        <!-- <thead>
                            <tr>
                            <th class="text-left"> @ </th>
                            <th class="text-left"> Video </th>
                            <th class="text-left" style="width: 90px;"> Level </th>
                            <th  style="width: 100px;"> Genre </th>
                            <th class="text-right"> <v-icon>mdi-closed-caption</v-icon> </th>
                            </tr> 
                        </thead> -->
                        <tbody>
                            <tr v-for="(item, i) in patternList" :key="i">
                            <td style="font-size: 18px" v-html="item.htmlsub"> {{ item.sub }} </td>
                            <td style="font-size: 16px"> {{ item.title }} ( 
                                <span v-if="item.level=='advanced'"><v-icon color="pink" > mdi-alpha-a </v-icon> 高 </span>
                                <span v-if="item.level=='intermediate'"><v-icon color="orange" > mdi-alpha-i </v-icon> 中 </span>
                                <span v-if="item.level=='novice'"><v-icon color="green" > mdi-alpha-n </v-icon> 初 </span> )
                                <v-checkbox ></v-checkbox>
                            </td>
                            <!-- <td style="font-size: 18px">
                                <span v-if="item.level=='advanced'"><v-icon color="pink" > mdi-alpha-a </v-icon> 高 </span>
                                <span v-if="item.level=='intermediate'"><v-icon color="orange" > mdi-alpha-i </v-icon> 中 </span>
                                <span v-if="item.level=='novice'"><v-icon color="green" > mdi-alpha-n </v-icon> 初 </span>
                            </td>
                            <td style="font-size: 18px;" class="text-right"> {{ item.genre }} </td> -->
                            <td class="text-right"> 
                                <v-icon color="primary" @click="rewind5()">mdi-rewind-5</v-icon>
                                <v-icon color="orange" @click="playSegment(item)"> mdi-play-circle </v-icon>
                                
                            </td>
                            </tr>
                        </tbody>
                        </template>
                    </v-simple-table>

        </v-col>
      </v-row>
    </v-flex>
  </v-layout>
</template>

<script>
import OpenCC from 'opencc-js'
import Vue from 'vue'
import VueYoutube from 'vue-youtube'
Vue.use(VueYoutube)

export default {
  data() {
    return {
        searchBusy: false,
        vocabCollection: [],
        patternList: [],
        pattern: '',
        playSubTrad: '',
        playSubSimp: '',
      videoListOrig: [],
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
    setPlayerSpeed(){
        this.$refs.youtube.player.setPlaybackRate(this.slider);
    },
    rewind5() {
      this.$refs.youtube.player.getCurrentTime().then(time => {
        if (time>5) {
          this.$refs.youtube.player.seekTo(time-5, true);
          this.$refs.youtube.player.playVideo();
        } else {
          this.$refs.youtube.player.seekTo(0, true);
          this.$refs.youtube.player.playVideo();
        }
      })
    },
    playSegment(obj) {
      console.log(obj)
      this.playSubTrad = obj.sub;
      (async () => {
        const convert = await OpenCC.Converter('tw', 'cn')
        this.playSubSimp = convert(this.playSubTrad)
      })()
      //console.log( this.$refs )
      if (obj.id == this.videoId) { // same video
          this.$refs.youtube.player.seekTo(obj.start, true)
      } else {
        this.videoId = obj.id
        this.$refs.youtube.player.getPlayerState().then( state => {
          this.$refs.youtube.player.loadVideoById(this.videoId, obj.start)
          console.log('player state :', state )
        })
      }
    },
    patternSub(item) {
      console.log(item)
      if (item.id) { 
        this.videoId = item.id
      } else {
        this.videoId = item.vid
      }
      this.searchVideoCollection = []
      this.searchVideoCollection.push({ sub: item.sub, que: item.sub, start: item.start, time: item.time, cc: item.cc })
    },
    searchPhraseByFirstChar(item) {
      this.vocabCollection = []
      this.patternList = []
      const keyword = item.split('')[0]
        this.$fireStore.collection('-char_index').doc(keyword).get().then( doc => {
            //console.log( doc );
            if (doc.exists) {
                console.log( doc.data() )
                //this.vocabCollection = doc.data().vocab
                let found = false
                doc.data().vocab.forEach(phrase => {
                  if (phrase.indexOf(item) != -1) {
                    found = true
                    this.vocabCollection.push( {vocab: phrase, html: phrase.split(item).join('<span class="pink--text">'+item+'</span>')} )
                    this.$fireStore.collection(phrase).get().then(docs => {
                      docs.forEach(oneDoc => {
                        //console.log(oneDoc.id, oneDoc.data())
                        this.$fireStore.collection('-video_meta').doc(oneDoc.id).get().then(meta =>{
                          if (meta.data().active) { 
                            for (const prop in oneDoc.data()) {
                              const html = oneDoc.data()[prop].sub.split(item).join('<span class="pink--text">'+item+'</span>')
                              this.patternList.push({time: prop, htmlsub: html, id: oneDoc.id, start: oneDoc.data()[prop].start, sub: oneDoc.data()[prop].sub, ...meta.data()})
                            }
                          }
                        })
                      })
                    })
                  }
                })
                if (!found) {
                  this.snackbar = true
                  this.snackbar_text = 'Sorry. No data by the keyword：' + item
                  this.snackbar_color = 'warning'
                }
            } else {
                this.snackbar = true
                this.snackbar_text = 'Sorry. No data by the keyword：' + item
                this.snackbar_color = 'warning'
            }
            this.searchBusy = false
        }).catch(error => { console.log(error.message) })
    },
    browse() {
      this.vocabCollection = []
      this.searchBusy = true
      this.patternList = []
      this.videoListOrig = []
      // db == '-char_index'
      const tmp = this.keyword.trim()
      console.log(tmp)
      if (tmp =='') {
          this.searchBusy = false 
      } else if (tmp.length==1) {
          //this.vocabCollection = []
          this.$fireStore.collection('-char_index').doc(tmp).get().then( (doc => {
              //console.log( doc );
              if (doc.exists) {
                  console.log( doc.data() )
                  //this.vocabCollection = doc.data().vocab
                  doc.data().vocab.forEach(item => {
                    this.vocabCollection.push({vocab: item, html: item.split(tmp).join('<span style="color: red">'+tmp+'</span>')})
                    this.$fireStore.collection(item).get().then(vid => {
                      vid.forEach(sub => {
                        this.$fireStore.collection('-video_meta').doc(sub.id).get().then(meta =>{
                          if (meta.data().active) {
                            //console.log(sub.id)
                            let obj = {}
                            for (const prop in sub.data()) {
                              //console.log(sub.data()[prop])
                              const html = sub.data()[prop].sub.split(this.keyword.trim()).join('<span class="pink--text">' + this.keyword.trim() + '</span>')
                              obj = {time: prop, vid: sub.id, ...meta.data(), ...sub.data()[prop], htmlsub: html}
                              this.patternList.push(obj)
                            }
                            //this.videoListOrig.push(obj)
                          }
                        })
                      })
                    })
                  })
                  console.log( this.vocabCollection )
              } else {
                  this.snackbar = true
                  this.snackbar_text = 'No data by the keyword：' + tmp
                  this.snackbar_color = 'warning'
              }
              this.searchBusy = false
          })).catch(error => { console.log(error.message) })
      } else if (tmp.length>1) {
        this.searchPhraseByFirstChar(tmp)
      }
    },
    getPhrase(item){
      console.log(item)
      this.patternList = []
      this.videoListOrig = []
      this.searchBusy = true
      this.$fireStore.collection(item).get().then(snapshots => {
        //console.log(snapshots)
        this.searchBusy = false
          if (snapshots.empty) {
            // this.snackbar = true
            // this.snackbar_text = 'Searching ' + item + ' ... Please wait'
            // this.snackbar_color = 'info'
            this.searchPhraseByFirstChar(item)
            return
          }
          snapshots.forEach(doc => {
            console.log(doc.id, doc.data())
            this.contentList[doc.id] = doc.data()
            this.$fireStore.collection('-video_meta').doc(doc.id).get().then(vid => {
              if (vid.data().active) {
                for (const prop in doc.data()){
                  const html = doc.data()[prop].sub.split(this.keyword.trim()).join('<span class="pink--text">'+this.keyword.trim()+'</span>')
                  this.patternList.push({id: doc.id, ...vid.data(), start: doc.data()[prop].start, sub: doc.data()[prop].sub, htmlsub: html})
                  this.videoListOrig.push({id: doc.id, ...vid.data(), start: doc.data()[prop].start, sub: doc.data()[prop].sub, htmlsub: html})
                  console.log(doc.id, vid.data())
                }
              }
            }).catch(error => { console.log(error.message)})
          })
      }).catch(error => { console.log(error.message)})
    },
    patternSearch() {
      if (this.pattern.indexOf('x')==-1) {
        this.keyword = this.pattern
        this.vocabCollection = []
        this.browse()
        return
      }
      const strArray = this.pattern.split('x')
      let found = false
      this.patternList = []
      if (strArray.length!=2) {
        console.error('incorrect pattern format')
      } else {
        this.vocabCollection = []
        if (strArray[0].trim()=='') {
          console.log('x 在 ？')
          const firstChar = strArray[1].trim().split('')[0]
          this.$fireStore.collection('-char_index').doc(firstChar).get().then( (doc => {
              //console.log( doc );
              if (doc.exists) {
                  console.log( doc.data() )
                  doc.data().vocab.forEach(phrase => {
                    //console.log(phrase.split(strArray[0].trim()))
                    if ( phrase.indexOf(strArray[1].trim()) != -1) {
                      console.log(phrase)
                      if (phrase.split(strArray[1].trim())[0] != '') {
                        this.vocabCollection.push(phrase)
                        found = true
                      }
                    }
                  })
                  if (!found) {
                    console.log('not found 472')
                    this.snackbar = true
                    this.snackbar_text = 'No data by the pattern：' + this.pattern
                    this.snackbar_color = 'warning'
                  }
              } else {
                  this.snackbar = true
                  this.snackbar_text = 'No data by the  pattern：' + this.pattern
                  this.snackbar_color = 'warning'
              }
              this.searchBusy = false
          })).catch(error => { console.log(error.message) })
        } else {                                                                                  // pattern ('太 x 了')
          console.log('太 x 了')
          const firstChar = strArray[0].trim().split('')[0]
          this.$fireStore.collection('-char_index').doc(firstChar).get().then( (doc => {
            //console.log( doc );
            if (doc.exists) {
                //console.log( doc.data() )
                  doc.data().vocab.forEach(phrase => {
                    //console.log(phrase)
                    if (phrase.indexOf(strArray[0].trim()) == -1)
                      return
                    this.$fireStore.collection(phrase).get().then(docs => {
                      docs.forEach(doc => {
                        //console.log(doc.id, doc.data())
                        this.$fireStore.collection('-video_meta').doc(doc.id).get().then(meta => {
                          //console.log(meta.data())
                          if (!meta.data().active)
                            return
                          for (const prop in doc.data() ) {
                            //console.log( prop, doc.data()[prop]['sub'], doc.data()[prop]['sub'].indexOf(strArray[1].trim()) )
                            // 句子裡出現 過 
                            if (doc.data()[prop]['sub'].indexOf(strArray[1].trim()) != -1) {
                              // 句子裡的 沒 在 過 的前面 -- algorithm 不对
                              const phraseAfterKeyword = doc.data()[prop]['sub'].substring(doc.data()[prop]['sub'].indexOf(strArray[0].trim()), doc.data()[prop]['sub'].length)
                              if ( phraseAfterKeyword.indexOf(strArray[1].trim()) != -1 ) {
                                //console.log( prop, doc.data()[prop]['sub'], doc.data()[prop]['start'] )
                                //console.log( doc.data() )
                                let htmlsub = doc.data()[prop]['sub'].split(strArray[0].trim()).join('<span style="color: red">'+strArray[0].trim()+'</span>')
                                htmlsub = htmlsub.split(strArray[1].trim()).join('<span style="color: red">'+strArray[1].trim()+'</span>')
                                this.patternList.push({htmlsub: htmlsub, id: doc.id, sub: doc.data()[prop]['sub'], time:prop, start: doc.data()[prop]['start'], ...meta.data()})
                                //console.log( meta.data() )
                                found = true
                              }
                            }
                          }
                        }).catch(error => { console.log(error.message) })

                      })
                    }).catch(error => { console.log(error.message)})
                  })
            } else {
                this.snackbar = true
                this.snackbar_text = 'No data by the pattern：' + this.pattern
                this.snackbar_color = 'warning'
            }
            this.searchBusy = false
          })).catch(error => { console.log(error.message) })
        }
      }
    },
  }    
}
</script>