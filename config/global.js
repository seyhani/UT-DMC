// export const host = "http://localhost:3042";
// export const baseURL = "";
//global.baseURL = "";
//global.host = "http://localhost:3042";
// global.host = "http://192.168.56.101:3042";
module.exports = {
  init: function () {
      global.baseURL = "";
      global.baseUrlLocal = "";
      global.host    = "http://localhost:3042";
      global.env     = "dv";
      global.problemFilesRootDirectory = "./Files/Problems";
      global.problemCacheRootDirectory = "./public/cache/problems";
      global.puzzleCacheRootDirectory = "./public/cache/puzzles";
  }
};
