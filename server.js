var http = require('https'),
	fs = require('fs'),
	url = require('url'),
	count = 0,
	path = "/dev/iot/leo/leaspeaking";

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

function _createResponse(httpCode, contentType, content) {
	return {
		httpCode : httpCode,
		contentType : contentType,
		content : content
	};
}

function _endResponse(res, response) {
	res.writeHead(response.httpCode, {'Content-Type': response.contentType});
	res.end(response.content);
}

http.createServer(options, function(req, res) {
	var httpRequest = req.method + " " + url.parse(req.url).pathname;
	var sendResponse = true;
	
	switch (httpRequest) {
		case "GET /":
			response = _createResponse(200, "text/html", fs.readFileSync('index.html'));
			break;
		case "GET /index.html":
			response = _createResponse(200, "text/html", fs.readFileSync('index.html'));
			break;
		case "GET /gamification":
			try {
				var gamification = fs.readFileSync('gamification.json');
				var gamificationJson = JSON.parse(gamification);
				response = _createResponse(200, "application/json", JSON.stringify(gamificationJson));
			} catch (error) {
				response = _createResponse(404, "text/html", "Resource not found");
			}
			break;
		case "POST /gamification":
			sendResponse = false;
			try {
				var requestContent = req.content;
				// Vérification des headers
				if (req.headers["content-type"] !== "application/json") {
					_createResponse(400, "text/html", "Le contenu de la requête devrait être du Json");
					_endResponse(res, response);
				} else {
					var body = [];
					req.on('data', function(chunk) {
						body.push(chunk);
					}).on('end', function() {
						try {
							body = Buffer.concat(body).toString();
							// Vérification du contenu
							JSON.parse(body);
							fs.writeFileSync('gamification.json', body);
							response = _createResponse(201, "text/html", "OK");
							_endResponse(res, response);
						} catch (error) {
							console.log(error);
							response = _createResponse(500, "text/html", "Erreur lors de l'écriture : " + error);
							_endResponse(res, response);
						}
					}).on('error', function(error) {
						console.log(error);
						response = _createResponse(500, "text/html", "Erreur lors de l'écriture : " + error);
						_endResponse(res, response);
					});
				}
			} catch (error) {
				console.log(error);
				response = _createResponse(500, "text/html", "Erreur lors de l'écriture : " + error);
				_endResponse(res, response);
			}
			break;
		case "GET /gamification/motions_sounds":
			try {
				var motionsAndSounds = fs.readFileSync('motions_sounds.json');
				var motionsAndSoundsJson = JSON.parse(motionsAndSounds);
				response = _createResponse(200, "application/json", "{}", JSON.stringify(motionsAndSoundsJson));
			} catch (error) {
				response = _createResponse(404, "text/html", "Resource not found")
			}
			break;
		case "GET /tweets/count":
			try {
				var tweets = fs.readFileSync('tweets.json');
				count = JSON.parse(tweets).length;
			} catch (error) {
				response = _createResponse(200, "application/json", "{\"count\":"+count+"}");
			} finally {
				response = _createResponse(200, "application/json", "{\"count\":"+count+"}");
			}
			break;
		default:
			response = _createResponse(404, "text/html", "Resource not found")
			break;
	}
	
	if (sendResponse) {
		_endResponse(res, response);
	}
	
}).listen(9090);