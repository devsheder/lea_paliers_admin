var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	count = 0;


function _createResponse(httpCode, contentType, content) {
	return {
		httpCode : httpCode,
		contentType : contentType,
		content : content
	};
}

http.createServer(function(req, res) {
	var httpRequest = req.method + " " + url.parse(req.url).pathname;
	
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
			// TODO
			response = _createResponse(201, "text/html", "OK");
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
	
	res.writeHead(response.httpCode, {'Content-Type': response.contentType});
	res.end(response.content);
	
}).listen(9090);