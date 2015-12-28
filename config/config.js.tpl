var env="skeleton";

var config=require('./'+env);

// Rendre accesible, a tous les modules, la variable de config
global.config = config;
// Retourne la varaible de config
module.exports = config;