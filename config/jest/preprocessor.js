const babel = require("babel-core");

module.exports = {
  process: function(src) {
    const transformCfg = {
      presets: [
        require("babel-preset-env"),
        require("babel-preset-react"),
        require("babel-preset-stage-0"),
        require("babel-preset-jest")
      ],
      retainLines: true
    };
    return babel.transform(src, transformCfg).code;
  }
};
