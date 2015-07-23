require.config({
  shim: {},
  paths: {
    templates: "generated/templates",
    "dustjs-linkedin": "lib/bower/dustjs-linkedin/dist/dust-full.min",
    hogan: "lib/bower/hogan/lib/hogan",
    jquery: "lib/bower/jquery/dist/jquery",
    kineticjs: "lib/bower/kineticjs/kinetic",
    requirejs: "lib/bower/requirejs/require",
    async: "lib/bower/requirejs-plugins/src/async",
    depend: "lib/bower/requirejs-plugins/src/depend",
    font: "lib/bower/requirejs-plugins/src/font",
    goog: "lib/bower/requirejs-plugins/src/goog",
    image: "lib/bower/requirejs-plugins/src/image",
    json: "lib/bower/requirejs-plugins/src/json",
    mdown: "lib/bower/requirejs-plugins/src/mdown",
    noext: "lib/bower/requirejs-plugins/src/noext",
    propertyParser: "lib/bower/requirejs-plugins/src/propertyParser",
    "Markdown.Converter": "lib/bower/requirejs-plugins/lib/Markdown.Converter",
    text: "lib/bower/requirejs-plugins/lib/text"
  },
  packages: []
});

//Necessary for Dust to work as an AMD module
define.amd.dust = true;