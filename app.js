let express = require('express')
var app = express()
var bodyParser = require('body-parser')
var fs = require('fs')
var http = require('http')
var url = require('url')
const { exec } = require('child_process')
var base64 = require('base-64')
var mkdirp = require('mkdirp')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const fse = require('fs-extra')
var execp = require('child-process-promise').exec;
var axios = require("axios");

//Moteur de template
app.set('view engine','ejs')


//Middleware
// var urlParser = express.urlencoded({limit: '500mb', extended: true, type: "application/x-www-form-urlencoded"})
// var jsonParser = express.json({limit: '500mb', strict: false, type: "application/json"})
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Routes

//peut-être renvoyer la liste des outils?
app.get('/', (request, response) =>{
  response.end("Ici le service d'extraction")
});

//renvoie les paramètres de l'outil (juste un exemple test pour le moment)
app.get('/outilparam', (request, response) =>{
  var data = fs.readFileSync('../parameters.xsd','utf8', (err, data)=>{
    if (err) {
   return console.log(err);
 }
});
  response.end(data);
});

/*Le premier réel envoi du Back-end avec id, ext, checksum/url*/
app.put('/creation/:_id', (request, response) =>{
  if(!request.body) {
    return response.end("Erreur, pas de données")
  }
  console.log(request.body);
  var reqjson = request.body;
  var id = request.params._id;
  var isFile = reqjson.isFile;
  if (reqjson.url!=null){
    getUrlVideo(id,reqjson.url,isFile,response);
  }
  /*else if(reqjson.checksum!=null){
    getVideo(id);
  }*/
  else response.end("Erreur : pas d'url ou de checksum");
  //response.end("Bien reçu !")
});

/*Reçoit les paramètres*/
app.put('/param/:_id', (request, response) =>{
  if(!request.body) return response.end("Erreur dans le paramétrage")
  //on reçoit les paramètres en format JSON, il faut maintenant pouvoir l'exploiter pour le script
  var p = request.body;
  var addr = request.ip;
  var param = p.param.param;
  var idExtractor = p.idExtractor;
  var id = request.params._id;
  var data;
  //definis les parametres.
  /*à travers setparam, on appelle lanceur, qui appelle xmltostring, qui appelle sendvideo, avec des promesses*/
  //setparam(id, param,data,addr);

  execp('bash ../set_parameters.sh '+id+' "'+param+'"')
  .then(function(result){
    execp('bash ../lanceur.sh '+id)
    .then(function(result){
      xmltostring(id,data,addr,idExtractor);
      cleaner();
      response.end(getVersion());
    })
    .catch(function(result){
      response.status(500);
      response.end("error");
    });;
  })
  .catch(function(err){
    console.error(err);
  })



  //rend le projet 'deletable'
  makedel(id);
  // response.end("Paramètres bien reçus\n")
});


//fonction qui permet de récupérer la vidéo avec l'url
function getUrlVideo(id,url,isFile,response){
  if(!isFile){
    //Si c'est un url
    execp('bash ../down_url.sh '+id+' '+url)
    .then(function(result){
      response.end("ok!");
    })
    .catch(function(result){
      response.end("error");
    });
  }
  else{
    //Si c'est un fichier local
    execp('bash ../down_file.sh '+id+' '+url)
    .then(function(result){
      response.end("ok!");
    })
    .catch(function(result){
      response.end("error");
    });
  }
}
//met les paramètres avec une promesse pour lanceur
function setparam(id, param, data, addr){
  execp('bash ../set_parameters.sh '+id+' '+param)
  .then(function (result) {
    var stdout = result.stdout;
    var stderr = result.stderr;
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    lanceur(id,data,addr)
    })
    .catch(function(err){
      console.error('ERROR: ', err);
    })
}
//lance l'extraction avec une promesse pour xmltostring
function lanceur(id,data,addr){
  execp('bash ../lanceur.sh '+id)
  .then(function (result) {
    var stdout = result.stdout;
    var stderr = result.stderr;
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    xmltostring(id,data,addr);
    })
    .catch(function(err){
      console.error('ERROR: ', err);
    })
}

//Lance le concierge pour vider le contenu du serveur (vidéo et fichiers xml)
function cleaner(){
  exec('bash ../concierge.sh', (error, stdout, stderr) =>{
    if (error) {
      console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    });
}

//passe le xml en string, avec une promesse pour sendvideo
function xmltostring(id,data,addr,idExtractor){
  console.log("debut xml to string");
  fse.readFile('projects/'+id+'/video.xml',"utf8",function(err,data){
    if(err){
      console.log(err);
    }
    sendvideo(id, data, addr,idExtractor);
  });
  //.then(() => sendvideo(id, data, addr))
  //.catch(err => console.error(err))
}

//envoie la video extraite et traitée au back-end ainsi que le descripteur du XML
function sendvideo(id, data, addr,idExtractor){
  console.log("start send video");
  console.log("addrvid",addr);
  axios.put("http://"+addr+':80/api/project/'+id,{"data" :data, "idExtractor":idExtractor, "version":getVersion()})
  .then(function(response){
    console.log("start send descriptor");
    var descriptor;
    fse.readFile('../descriptor.xsd',"utf8",function(err,descriptor){
      if(err){
        console.log(err);
      }
      else{
        axios.put("http://"+addr+':80/api/descriptor/'+getVersion(),{"data" :descriptor, "idExtractor":idExtractor})
        .then(function(response){
          console.log(response.statusCode);
        }).catch(function(error){
          console.log(error);
        });
      }
    });
  }).catch(function(error){
    console.log(error);
  });

}

//Retourne la version actuelle de l'extracteur, à modifier lorsque l'extracteur est amélioré
function getVersion(){
  return "1.0";
}

function makedel(id){
  exec('bash ../make_deletable.sh '+id, (error, stdout, stderr) =>{
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    });
  }

module.exports = app;
