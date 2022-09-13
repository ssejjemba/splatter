const withTM = require("next-transpile-modules")(["selector", "dragger"]);

module.exports = withTM({
  reactStrictMode: true,
});
