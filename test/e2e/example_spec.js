/*global browser, by */
/*jslint node: true */
/*archiebnz linted 1/1*/
'use strict';

describe('E2E: Example', function () {

    beforeEach(function () {
        browser.get('/');
        browser.waitForAngular();
    });

    it('should route correctly', function () {
        expect(browser.getLocationAbsUrl()).toMatch('/');
    });
});