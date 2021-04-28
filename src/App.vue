<template>
  <div id="app"></div>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import { SyncHook } from "./lib";
export default {
  name: "App",
  components: {
    HelloWorld
  },
  created() {
    this.test();
  },
  methods: {
    test() {
      const h1 = new SyncHook(["xxx"]);

      h1.tap("A", function(args) {
        console.log("A", args);
        return "b";
      });

      // h1.tap("B", function() {
      //   console.log("b");
      // });

      // h1.tap("C", function() {
      //   console.log("c");
      // });
      h1.tap(
        {
          name: "F",
          before: "D"
        },
        function() {}
      );
      // h1.tap(
      //   {
      //     name: "E",
      //     before: "C"
      //   },
      //   function() {}
      // );
      // h1.tap("D", function() {
      //   console.log("d");
      // });

      h1.intercept({
        register: tap => {
          console.log(tap, "222222");
          return tap;
        }
      });
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
