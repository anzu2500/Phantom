<template>
  <div id="newPin" @click="newPinPopup">
    <div class="newPinData">
      <h1>Saved to {{ boardName }}</h1>
      <div class="imgWrapper">
        <img :src="getImage(pin.imageId)" />
      </div>
      <div class="buttonDiv">
        <div @click="closePopup">
          <router-link :to="{ path: '/PostPage/' + pin._id }" tag="button">
            See it now
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { default as getImage } from "../../mixins/getImage";
import { mapState } from "vuex";
export default {
  name: "newPinPopup",
  data: function() {
    return {};
  },
  mixins: [getImage],
  methods: {
    newPinPopup(event) {
      if (event.target.id == "newPin") {
        this.$store.commit("popUpsState/toggleNewPin");
        this.$router.push("/");
      }
    },
    closePopup() {
      this.$store.commit("popUpsState/toggleNewPin");
    }
  },
  computed: {
    ...mapState({
      pin: state => state.pins.pin,
      boardName: state => state.boards.chosenBoardName
    })
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/Colors";

#newPin {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  z-index: 12;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.newPinData {
  margin: 90px auto;
  background-color: white;
  width: 450px;
  padding: 20px;
  border-radius: 32px;
  max-width: 90vw;
  max-height: (100vh- 200px);
  overflow-y: auto;
}
@media screen and (max-width: 500px) {
  .newPinData {
    margin: 50px auto;
    width: 97%;
  }
}
h1 {
  width: 100%;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
}
.imgWrapper {
  margin: auto;
  width: 200px;
  margin-bottom: 30px;
  img {
    width: 100%;
    border-radius: 32px;
  }
}
.buttonDiv::after {
  content: "";
  clear: both;
  display: table;
}
button {
  float: right;
  position: relative;
  background-color: $darkBlue;
  color: $lightPink;
  height: 43px;
  border: none;
  padding: 10px 20px;
  border-radius: 32px;
  font-weight: 700;
}
button:nth-child(2) {
  margin-right: 10px;
  background-color: $lightPink;
  color: $darkBlue;
  i {
    margin-right: 5px;
  }
}
</style>
