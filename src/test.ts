const player = {
  level: 1,
};
Object.defineProperty(player, "health", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function () {
    return 10 + player.level * 15;
  },
});
console.log(player.health());
