import axios from "axios";

const state = {
  currentChat: []
};

const mutations = {
  setChat(state, chat) {
    state.currentChat = chat;
  },
  addMsg(state, msg) {
    state.currentChat.push(msg);
  }
};

const actions = {
  async getChat({ commit }, payload) {
    let token = localStorage.getItem("userToken");
    axios.defaults.headers.common["Authorization"] = token;
    let chat = [];
    try {
      chat = await axios.get(
        "/getMessagesSent/" + payload.senderId + "/" + payload.recieverId
      );
      chat = chat.data;
      chat.forEach((msg) => {
        if(msg.senderId == payload.senderId)
          msg.owner = true;
        else
          msg.owner = false;
      });
    } catch (err) {
      console.log(err);
    }
    commit("setChat", chat);
  },
  sendMsg({ commit }, msg) {
    if (msg.note == "") console.log(commit);
    axios.post("/sentMessage", msg).catch(error => {
      console.log(error);
    });
  }
};

const getters = {
  currentChat: state => state.currentChat
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
