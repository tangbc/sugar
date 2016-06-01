define([
	'../../../../src/main/ajax'
], function(ajax) {
	describe('ajax test', function() {
		it('should be object', function(){
            expect(typeof ajax).toBe('objects');
        });
	});
});