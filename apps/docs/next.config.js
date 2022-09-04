const withTM = require("next-transpile-modules")(["selector"]);

module.exports = withTM({
  reactStrictMode: true,
});
