var express = require('express');


//Recuperation de la variable de config
var config = require('./config/config');

var app = express();
var swig=require('swig');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ldap = require('./modules/ldap');


var coherenceView = require('./modules/Client/View/coherenceView');

// Monkey patch pour controler les format et params des requetes
require('./response');

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
app.use(multer().single('multiInputFileName')); // for parsing multipart/form-data

// Permet d'acceder depuis la page aux ressources du repertoire public
app.use(express.static(__dirname + '/public'));

// Allow parsing cookies from request headers
app.use(cookieParser());
// Session management
app.sessionStore=new session.MemoryStore({ reapInterval: 60000 * 10 });
app.use(session({
	// Private crypting key 
	"secret": config.session.secret,
	// Internal session data storage engine, this is the default engine embedded with connect.
	"store": this.sessionStore,
	resave: true,
    saveUninitialized: true,
    cookie:{maxAge:3600000} // 1000 = 1 secondes => 3600000 = 1heure
}));

// view engine setup
// utilisation du moteur de swig pour les .html
app.engine('html', swig.renderFile); 
// utiliser le moteur de template pour les .html
app.set('view engine', 'html'); 
// dossier des vues
app.set('views', path.join(__dirname, 'views'));


var server = require('http').Server(app);

var io = require('socket.io')(server);
server.listen(config.port);


/*********************************************************************/
/*************************** LAUNCHER ********************************/
/*********************************************************************/

// Lancement de la récuperation périodique des sources
require('./modules/SourcesLauncher/launcher');
// Lancement de la récuperation périodique des cohérences
require('./modules/ConsistenciesLauncher/launcher');

/*********************************************************************/
/**************************** ROUTER *********************************/
/*********************************************************************/

var defaultOnglet='coherence';

var renderOnglet=function(req,res,onglet){
	// On verifie si le user c'est déjà connecté
	if (req.session.username || config.debug) {
		res.render("onglet/"+onglet,{server:config.web.url,username:req.session.username,siteName:config.siteName}, function(err, html) {
			if(!err)
				res.send(html);
			else
				res.render("onglet/"+defaultOnglet,{server:config.web.url,username:req.session.username,siteName:config.siteName});
		});
	} else {
		res.redirect("login");
	}
}

app.get('/', function (req, res, next) {
	res.redirect("/onglet/"+defaultOnglet);
});


app.param("onglet",function(req, res, next, onglet){
	renderOnglet(req, res, onglet);
});

app.get('/onglet/:onglet', function (req, res, next) {});
app.get('/onglet', function (req, res, next) {
	res.redirect("/onglet/"+defaultOnglet);
});



// Affichage de la page de login
app.get("/login", function (req, res) {
	// Show form, default value = current username
	res.render("login", { "login": req.session.username, "error": null, "version" : config.version });
});

// Verification du login et pass
app.post("/login", function (req, res) {
	var options = { "login": req.body.login, "error": null };
	if (!req.body.login) {
		options.error = "Login OPS manquant!";
		res.render("login", options);
	} else if (!req.body.pass) {
		options.error = "Mot de passe manquant!";
		res.render("login", options);
	} else if (req.body.login == req.session.username) {
		// User has not changed username, accept it as-is
	    res.redirect("/");
	} else {
		ldap.connect(req.body.login,req.body.pass,function(goodConnect){
			if(goodConnect){
				req.session.username = req.body.login;
		    	res.redirect("/");
			}else{
				options.error = "Mauvais login/mot de passe!";
				res.render("login", options);
		    }
		});
	}
});

io.sockets.on('connection', function(client) {
	console.log('connecter');
	
	
	client.on("loadOngletListener",function(onglet){
		switch(onglet){
			case "coherence" : coherenceView.initialize(client,io.sockets); break;
		}
	});
});
