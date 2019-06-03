<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <h1 class="secondary--text">Create new Meetup</h1>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs12>
        <form @submit.prevent="onCreateMeetup">
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field v-model="title" name="title" label="Title *" id="title"></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-text-field v-model="location" name="location" label="Location *" id="location"></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-btn raised class="primary" @click="onPickFile">Upload Image</v-btn>
              <input 
                type="file" 
                style="display: none" 
                ref="fileInput" 
                accept="image/*"
                @change="onFilePicked"
                >
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-img :src="imageUrl" hight="150px"></v-img>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-textarea
                v-model="description"
                name="description"
                label="Description *"
                id="description"
              ></v-textarea>
            </v-flex>
          </v-layout>
          <v-layout row>
              <v-flex xs12 sm6 offset-sm3>
                  <h3>Choose a Date & Time</h3>
              </v-flex>
          </v-layout>
          <v-layout row>
              <v-flex xs12 sm6 offset-sm3>
                  <v-date-picker v-model="date"></v-date-picker>
              </v-flex>
          </v-layout>
          <v-layout row>
              <v-flex xs12 sm6 offset-sm3>
                  <v-time-picker v-model="time" format="24hr"></v-time-picker>
              </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
              <v-btn 
                class="primary" 
                :disabled="!formIsValid"
                type="submit"
                >Create Meetup</v-btn>
                {{ this.date }} - {{ this.time}}
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      title: "",
      location: "",
      imageUrl: "",
      description: "",
      date: new Date().toISOString().substr(0, 10),
      time: null,
      image: null
    };
  },
  computed: {
    formIsValid() {
      return (
        this.title !== "" &&
        this.location !== "" &&
        this.imageUrl !== "" &&
        this.description !== ""
      );
    },
    submittableDateTime() {
        const date = new Date(this.date);
        date.setHours(parseInt(this.time.match(/^(\d+)/)[1]));
        date.setMinutes(parseInt(this.time.match(/:(\d+)/)[1]));
        return date;
    }
  },
  methods: {
      onCreateMeetup() {
          if(!this.formIsValid) return;
          if(!this.image) return;

          const meetupData = {
              title: this.title,
              location: this.location,
              image: this.image,
              description: this.description,
              date: this.submittableDateTime
          };
          this.$store.dispatch('createMeetup', meetupData);
          this.$router.push('/meetups');
      },
      onPickFile() {
        this.$refs.fileInput.click();
      },
      onFilePicked(event) {
        const files = event.target.files;
        let filename = files[0].name;
        if(filename.lastIndexOf('.') <= 0) {
          return alert("Please add a valid file!");
        }

        const fileReader = new FileReader();
        fileReader.addEventListener('load', () => {
          this.imageUrl = fileReader.result
        })
        fileReader.readAsDataURL(files[0]);
        this.image = files[0];
      }
  }
};
</script>
