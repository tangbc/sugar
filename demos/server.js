var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');

// 监听端口
var PORT = 3456;
// 根目录
var base = path.resolve(__dirname, '../');

var MIME = {
	css : 'text/css',
	gif : 'image/gif',
	html: 'text/html',
	ico : 'image/x-icon',
	jpeg: 'image/jpeg',
	jpg : 'image/jpeg',
	js  : 'text/javascript',
	json: 'application/json',
	pdf : 'application/pdf',
	png : 'image/png',
	svg : 'image/svg+xml',
	swf : 'application/x-shockwave-flash',
	tiff: 'image/tiff',
	txt : 'text/plain',
	wav : 'audio/x-wav',
	wma : 'audio/x-ms-wma',
	wmv : 'video/x-ms-wmv',
	xml : 'text/xml'
};

var server = http.createServer(function (req, res) {

	if (req.url.indexOf('/log/') === 0) {
		// 输出 end 掉的 url
		console.log('CLIENT LOG:', req.url);
		res.setHeader('content-type', 'image/gif');
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader("Pragma", "no-cache");
		res.setHeader('Expires', 0);
		res.end('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
		return;
	}

	// 输出请求的 url
	console.log('\033[33m request uri:\033[0m', req.url);

	// 读取静态文件
	var url = req.url.split('?', 1).shift();
	if (url.slice(-1) == '/') {
		url += 'index.html';
	}

	var path = base + url;
	if (fs.existsSync(path)) {
		if (!fs.statSync(path).isFile()) {
			res.writeHead(302, {'Location': url + '/'});
			res.end();
		} else {
			// 输出存在的目录文件
			var ext = path.split('.');
			ext = ext.length > 1 ? ext.pop().toLowerCase() : '';
			if (ext && MIME[ext]) {
				res.setHeader('content-type', MIME[ext]);
			}
			var stream = fs.createReadStream(path);
			stream.pipe(res);
		}
	} else {
		// 404
		res.writeHead(404, 'FILE NOT FOUND');
		res.end('FILE NOT FOUND: ' + path);
	}
});

server.listen(PORT);
console.log("\033[32m Server runing at localhost:" + PORT + "\033[0m");
console.log(" Open link such as localhost:3456/demos/todoMVC/");
