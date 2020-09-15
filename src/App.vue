<template>
  <div id="app">
    <OrgChart />
  </div>
</template>

<script>
import OrgChart from "./components/OrgChart.vue";

export default {
  name: "App",
  components: {
    OrgChart,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
