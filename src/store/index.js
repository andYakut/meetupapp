import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loadedMeetups: [
      {
        imageUrl:
          "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fmediafiles.urlaubsguru.de%2Fwp-content%2Fuploads%2F2016%2F01%2Furlaubsguru.de_brooklyn-bridge-new-york.jpg&f=1",
        id: "sdjflkj32f23",
        title: "Meetup in New York",
        date: new Date(),
        location: "New York",
        description: "New York, New York!"
      },
      {
        imageUrl:
          "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.numerama.com%2Fcontent%2Fuploads%2F2016%2F12%2Fparis.jpg&f=1",
        id: "asdsadawdwk23",
        title: "Meetup in Paris",
        date: new Date(),
        location: "Paris",
        description: "It's Paris!"
      }
    ],
    user: null,
    loading: false, 
    error: null
  },
  mutations: {
    setLoadedMeetups(state, payload) {
      state.loadedMeetups = payload;
    },
    createMeetup(state, payload) {
      state.loadedMeetups.push(payload);
    },
    setUser(state, payload) {
      state.user = payload;
    },
    setLoading(state, payload) {
      state.loading = payload
    },
    setError(state, payload) {
      state.error = payload
    },
    clearError(state) {
      state.error = null
    }
  },
  actions: {
    loadMeetups({commit}) {
      commit('setLoading', true);
      firebase.database().ref('meetups').once('value')
        .then(data => {
          const meetups = [];
          const obj = data.val();
          for(let key in obj) {
            meetups.push({
              id: key,
              title: obj[key].title,
              description: obj[key].description,
              imageUrl: obj[key].imageUrl,
              date: obj[key].date,
              creatorId: obj[key].creatorId
            });
          }
          commit('setLoadedMeetups', meetups);
          commit('setLoading', false);
        })
        .catch(error => {
          console.error(error);
          commit('setLoading', true);
        })
    },
    createMeetup({commit, getters}, payload) {
      const meetup ={
        title: payload.title,
        location: payload.location,
        description: payload.description,
        date: payload.date.toISOString(),
        creatorId: getters.user.id
      };
      let imageUrl;
      let key;
      let ext;
      firebase.database().ref('meetups').push(meetup)
        .then(data => {
          key = data.key;
          return key;
        })
        .then(key => {
          const filename = payload.image.name;
          ext = filename.slice(filename.lastIndexOf('.'));
          return firebase.storage().ref('meetups/' + key + ext).put(payload.image);
        })
        .then(() => {
          return firebase.storage().ref('meetups/').child(key + ext).getDownloadURL();
        })
        .then((url) => {
          return firebase.database().ref('meetups').child(key).update({imageUrl: url});
        })
        .then(() => {
          commit("createMeetup", { ...meetup, imageUrl: imageUrl, id: key });
        })
        .catch(error => {
          console.error(error);
        })
    },
    signUserUp({commit}, payload) {
      commit('setLoading', true);
      commit('clearError');
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false);
            const newUser = {
              id: user.user.uid,
              registeredMeetups: [],
            }
            commit('setUser', newUser);
          }
        )
        .catch(
          error => {
            commit('setLoading', false);
            commit('setError', error);
          }
        )
    },
    signUserIn({commit}, payload) {
      commit('setLoading', true);
      commit('clearError');
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false);
            const newUser = {
              id: user.user.uid,
              registeredMeetups: []
            };
            commit('setUser', newUser);
          }
        )
        .catch(
          error => {
            commit('setLoading', false);
            commit('setError', error);
          }
        )
    },
    autoSignIn({ commit }, payload) {
      commit('setUser', { id: payload.uid, registeredMeetups: [] })
    },
    logout({commit}) {
      firebase.auth().signOut();
      commit('setUser', null);
    },
    clearError({commit}) {
      commit('clearError');
    }
  },
  getters: {
    loadedMeetups(state) {
      return state.loadedMeetups.sort((meetupA, meetupB) => {
        return meetupA.date > meetupB.date;
      });
    },
    featuredMeetups(state, getters) {
      return getters.loadedMeetups.slice(0, 5);
    },
    loadedMeetup(state) {
      return (meetupId) => {
        return state.loadedMeetups.find((meetup) => {
          return meetup.id === meetupId;
        });
      };
    },
    user(state) {
      return state.user;
    },
    loading(state) {
      return state.loading;
    },
    error(state) {
      return state.error;
    }
  }
})