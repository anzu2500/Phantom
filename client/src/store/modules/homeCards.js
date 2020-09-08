import axios from "axios";
let num;
const state = {
  homeCards: [],
  postImage: "",
  userImage: "",
  postTitle: "",
  postDescribtion: "",
  userFirstName: "",
  userLastName: "",
  numberofFollowers: 0,
  pinCreatorId: "",
  cardsGenerated: false,
  offsetnum: 0,
  totalCards: 0,
  finishCalling: false
};

const mutations = {
  sethomeCards(state, cards) {
    for (let index = 0; index < cards.length; index++)
      state.homeCards.push(cards[index]);
  },
  homeGenerated(state, check) {
    state.cardsGenerated = check;
  },
  setpostImage(state, postImage) {
    state.postImage = postImage;
  },
  setpostTitle(state, postTitle) {
    state.postTitle = postTitle;
  },
  setpostDescribtion(state, postDescribtion) {
    state.postDescribtion = postDescribtion;
  },
  setuserImage(state, userImage) {
    state.userImage = userImage;
  },
  setuserFirstName(state, userFirstName) {
    state.userFirstName = userFirstName;
  },
  setuserLastName(state, userLastName) {
    state.userLastName = userLastName;
  },
  setnumberofFollowers(state, numberofFollowers) {
    state.numberofFollowers = numberofFollowers;
  },
  setpinCreatorId(state, pinCreatorId) {
    state.pinCreatorId = pinCreatorId;
  },
  totalNumCards(state, totalNum) {
    state.totalCards = totalNum;
  },
  finishCalling(state, value) {
    state.finishCalling = value;
  }
};

const actions = {
  userHome({ commit }) {
    let token = localStorage.getItem("userToken");
    axios.defaults.headers.common["Authorization"] = token;
    num = state.offsetnum;
    state.totalCards = 0;
    axios
      .put("home/me")
      .then(response => {
        commit("homeGenerated", true);
        commit("totalNumCards", response.data.total);
      })
      .catch(error => {
        console.log(error);
      });
  },

  userGenerateCards({ commit }) {
    let token = localStorage.getItem("userToken");
    axios.defaults.headers.common["Authorization"] = token;
    console.log("Nana", num);
    axios
      .get("me/home?limit=12&offset=" + num)
      .then(response => {
        console.log(num);
        console.log("data length", response.data.length);
        num += 12;
        commit("sethomeCards", response.data);
      })
      .catch(error => {
        console.log("assa1");
        if (num == state.totalCards) state.finishCalling = true;
        console.log("assa2");
        setTimeout(() => {
          console.log("assa3");
          this.userGenerateCards;
        }, 1000);
        console.log(error);
      });
  },

  async Postpage({ commit }, postPageID) {
    let token = localStorage.getItem("userToken");
    axios.defaults.headers.common["Authorization"] = token;
    await axios
      .get("/pins/" + postPageID)
      .then(response => {
        let res = response.data;
        commit("setpostImage", res.pin.imageId);
        commit("setpinCreatorId", res.pin.creator.id);
        commit("setpostTitle", res.pin.title);
        commit("setpostDescribtion", res.pin.note);
        commit("setuserFirstName", res.pin.creator.firstName);
        commit("setuserLastName", res.pin.creator.lastName);
        commit("setuserImage", res.creatorInfo.creatorImage);
        commit("setnumberofFollowers", res.creatorInfo.followers);
      })
      .catch(error => {
        console.log(error);
      });
  }
};

const getters = {
  userHomePage: state => state.homeCards,
  postImage: state => state.postImage,
  userImageId: state => state.userImage,
  postTitle: state => state.postTitle,
  postDescribtion: state => state.postDescribtion,
  userFirstName: state => state.userFirstName,
  userLastName: state => state.userLastName,
  numberofFollowers: state => state.numberofFollowers,
  pinCreatorId: state => state.pinCreatorId,
  finishCalling: state => state.finishCalling
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
