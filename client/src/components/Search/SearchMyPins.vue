<template>
  <div>
    <div class="flexWrap" v-if="pins.length">
      <masonry
        :cols="{ default: 5, 1500: 4, 1200: 3, 800: 2, 580: 1 }"
        :gutter="{ default: '30px', 700: '20px', 500: '10px' }"
      >
        <HomeCard
          v-for="pin in pins"
          :key="pin._id"
          :cardImage="pin.imageId"
          :postPageId="pin._id"
        />
      </masonry>
    </div>
    <div v-if="!loading && !pins.length" class="not-found">
      <h5>You don't have pins with this search try to add some</h5>
    </div>
    <div>
      <Loading :loading="loading" />
    </div>
  </div>
</template>

<script>
import HomeCard from "../Home/HomeCard";
import Loading from "../GeneralComponents/Loading";

export default {
  components: {
    HomeCard,
    Loading
  },
  computed: {
    pins() {
      return this.$store.state.search.myPins;
    },
    loading() {
      return this.$store.state.search.mypinsLoading;
    }
  },
  mounted: function() {
    this.$store.commit("search/resetOffset");
    this.$store.dispatch("search/searchMyPins", {
      name: this.$route.params.name
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/MasonryGrid";
.not-found {
  margin-top: 35vh;
  text-align: center;
}
</style>
