/* Test to make sure the config file is read properly and the ports are numbers */

//include chai and use constants
var expect = require("chai").expect;
var constants = require("../../app/js/constants.js");
 
describe("extract config file", function(){  
  it('should have numbers as ports', function () {
    var json = constants;
    var oauthport = parseInt(json.oauthProxyPort);
    expect(oauthport).to.be.ok; //not NaN which will be the value if the port isn't a number
    
    var gulpDevPort = parseInt(json.gulpDevExpressPort);
    expect(gulpDevPort).to.be.ok;
    
    var debugPort = parseInt(json.linkDebuggingServicePort);
    expect(debugPort).to.be.ok;
  });
  
  
});