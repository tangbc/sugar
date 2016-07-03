var sugar = require('src/main/index').default;
var ajax = sugar.ajax;

// via the jasmine.Ajax global
require('jasmine-ajax');

describe('sugar ajax api >', function() {
	var doneFn;

	beforeEach(function() {
		jasmine.Ajax.install();
		doneFn = jasmine.createSpy('success');
	});

	afterEach(function() {
		jasmine.Ajax.uninstall();
	});

	it('ajax get without param', function() {

		// initiate a request
		ajax.get('/api/to/get', function(err, data) {
			doneFn();
			expect(err).toBeNull();
			expect(data.success).toBeTruthy();
			expect(data.result).toBe('This is what you need query');
		});

		var request = jasmine.Ajax.requests.mostRecent();

		expect(request.method).toBe('GET');
		expect(request.url).toBe('/api/to/get');
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 200,
			'contentType': 'text/plain',
			'responseText': 'This is what you need query'
		});

		expect(doneFn).toHaveBeenCalled();
	});


	it('ajax get with query param', function() {
		var query = {
			'id': 1314,
			'status': 1
		};

		// initiate a request
		ajax.get('/api/to/get', query, function(err, data) {
			doneFn();
			expect(err).toBeNull();
			expect(data.success).toBeTruthy();
			expect(data.result).toBe('This is what you need query');
		});

		var request = jasmine.Ajax.requests.mostRecent();

		expect(request.method).toBe('GET');
		expect(request.url).toBe('/api/to/get?id=1314&status=1');
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 200,
			'contentType': 'text/plain',
			'responseText': 'This is what you need query'
		});

		expect(doneFn).toHaveBeenCalled();
	});


	it('ajax get with error', function() {
		// initiate a request
		ajax.get('/api/to/get', function(err, data) {
			doneFn();
			expect(err.result).toBeNull();
			expect(err.success).toBeFalsy();
			expect(err.status).toBe(404);
		});

		var request = jasmine.Ajax.requests.mostRecent();
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 404
		});

		expect(doneFn).toHaveBeenCalled();
	});


	it('ajax post', function() {
		var postData = {
			'id': 1314,
			'status': 0,
			'name': 'xxdk'
		}

		// initiate a request
		ajax.post('/api/to/post', postData, function(err, data) {
			doneFn();
			expect(err).toBeNull();
			expect(data.success).toBeTruthy();
			expect(data.result).toEqual({
				'id': 1314,
				'status': 1,
				'name': "xxdk",
				'update': 1467453891023
			});
		});

		var request = jasmine.Ajax.requests.mostRecent();

		expect(request.method).toBe('POST');
		expect(request.url).toBe('/api/to/post');
		// sugar ajax will use JSON.stringify format post-data
		expect(request.params).toBe('{"id":1314,"status":0,"name":"xxdk"}');
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 200,
			'contentType': 'text/plain',
			'responseText': '{"id":1314,"status":1,"name":"xxdk","update":1467453891023}'
		});

		expect(doneFn).toHaveBeenCalled();
	});


	it('ajax post with error', function() {
		var postData = {
			'id': 1314,
			'status': 0,
			'name': 'xxdk'
		}

		// initiate a request
		ajax.post('/api/to/post', postData, function(err, data) {
			doneFn();
			expect(data).toBeNull();
			expect(err.success).toBeFalsy();
			expect(err.result).toBeNull();
			expect(err.status).toBe(403);
		});

		var request = jasmine.Ajax.requests.mostRecent();

		expect(request.method).toBe('POST');
		expect(request.url).toBe('/api/to/post');
		// sugar ajax will use JSON.stringify format post-data
		expect(request.params).toBe('{"id":1314,"status":0,"name":"xxdk"}');
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 403
		});

		expect(doneFn).toHaveBeenCalled();
	});


	it('load plain text', function() {
		var query = {
			'timeStamp': 1467453891023
		}

		// initiate a request
		ajax.load('/api/to/load', query, function(err, data) {
			doneFn();
			expect(err).toBeNull();
			expect(data.success).toBeTruthy();
			expect(data.result).toBe('{"id":1314,"status":1,"name":"xxdk","update":1467453891023}');
		});

		var request = jasmine.Ajax.requests.mostRecent();

		expect(request.method).toBe('GET');
		expect(request.url).toBe('/api/to/load?timeStamp=1467453891023');
		expect(doneFn).not.toHaveBeenCalled();

		// setup response
		request.respondWith({
			'status': 200,
			'contentType': 'text/plain',
			// although return a json string, but ajax.load will not parse it
			'responseText': '{"id":1314,"status":1,"name":"xxdk","update":1467453891023}'
		});

		expect(doneFn).toHaveBeenCalled();
	});
});