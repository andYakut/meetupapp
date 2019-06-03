import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import * as firebase from 'firebase'
import { store } from './store'
import DateFilter from './filters/date'
import AlertCmp from './components/Shared/Alert.vue'

Vue.config.productionTip = false

Vue.filter('date', DateFilter);
Vue.component('app-alert', AlertCmp);

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    firebase.initializeApp({
      apiKey: "AIzaSyCF1VmwjBI4tavjd_BqCm1I87Lwb2_ZRZ8",
      authDomain: "devmeetups-d2004.firebaseapp.com",
      databaseURL: "https://devmeetups-d2004.firebaseio.com",
      projectId: "devmeetups-d2004",
      storageBucket: "gs://devmeetups-d2004.appspot.com",
      messagingSenderId: "465016757959",
      appId: "1:465016757959:web:82c79f882d1989cd"
    });
    
    firebase.auth().onAuthStateChanged(user => {
      if(user) {
        this.$store.dispatch('autoSignIn', user);
      }
    });

    this.$store.dispatch('loadMeetups')
  }
}).$mount('#app')
