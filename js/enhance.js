/*
 * enhance.js - Test-Driven Progressive Enhancement
 * Authored by Scott Jehl, Filament Group (filamentgroup.com)
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 * Version 1.0
*/

var enhance = function(settings){
	var that = this;
	that.settings = {
		testName: 'enhanced',
		loadScripts: [],
		loadStyles: [],
		queueLoading: true,
		appendToggleLink: true,
		forcePassText: 'View High-bandwidth version',
		forceFailText: 'View Low-bandwidth version',
		tests: {
			getById: function(){
				return document.getElementById ? true : false;
			},
			getByTagName: function(){
				return document.getElementsByTagName ? true : false;
			},
			createEl: function(){
				return document.createElement ? true : false;
			},
			boxmodel: function(){
				var newDiv = document.createElement('div');
				document.body.appendChild(newDiv);
				newDiv.style.width = '1px';
				newDiv.style.padding = '1px';
				var divWidth = newDiv.offsetWidth;
				document.body.removeChild(newDiv);
				return divWidth == 3;
			},
			position: function(){
				var newDiv = document.createElement('div');
				document.body.appendChild(newDiv);
				newDiv.style.position = 'absolute';
				newDiv.style.left = '10px';
				var divLeft = newDiv.offsetLeft;
				document.body.removeChild(newDiv);
				return divLeft == 10;
			},
			float: function(){
				var newDiv = document.createElement('div');
				document.body.appendChild(newDiv);
				newDiv.innerHTML = '<div style="width: 5px; float: left;"></div><div style="width: 5px; float: left;"></div>';
				var divTopA = newDiv.childNodes[0].offsetTop;
				var divTopB = newDiv.childNodes[1].offsetTop;
				document.body.removeChild(newDiv);
				return divTopA == divTopB;
			},
			clear: function(){
				var newDiv = document.createElement('div');
				document.body.appendChild(newDiv);
				newDiv.style.visibility = 'hidden';
				newDiv.innerHTML = '<ul><li style="width: 1px; float: left;">test</li><li style="width: 1px; float: left;clear: left;">test</li></ul>';
				var liTopA = newDiv.getElementsByTagName('li')[0].offsetTop;
				var liTopB = newDiv.getElementsByTagName('li')[1].offsetTop;
				document.body.removeChild(newDiv);
				return liTopA != liTopB;
			},
			overflow: function(){
				var newDiv = document.createElement('div');
				document.body.appendChild(newDiv);
				newDiv.innerHTML = '<div style="height: 10px; overflow: hidden;"></div>';
				var divHeight = newDiv.offsetHeight;
				document.body.removeChild(newDiv);
				return divHeight == 10;
			},
			ajax: function(){
				//factory test borrowed from quirksmode.org
				var XMLHttpFactories = [
					function () {return new XMLHttpRequest()},
					function () {return new ActiveXObject("Msxml2.XMLHTTP")},
					function () {return new ActiveXObject("Msxml3.XMLHTTP")},
					function () {return new ActiveXObject("Microsoft.XMLHTTP")}
				];
				var xmlhttp = false;
				for (var k=0;k<XMLHttpFactories.length;k++) {
					try {xmlhttp = XMLHttpFactories[k]();}
					catch (e) {continue;}
					break;
				}
				return xmlhttp ? true : false;
			},
			resize: function(){
				return (window.onresize == false) ? false : true
			},
			print: function(){
				return window.print ? true : false
			}
		},
		log: false
	};
	
	//extend configuration with args
	if(typeof(settings) == 'object'){
		for(var value in settings){ that.settings[value] = settings[value]; }
	};
	
	//public methods - can be used for custom pass/fail toggles
	that.forceFail = function(){
		that._eraseCookie(that.settings.testName);
		that._createCookie(that.settings.testName, 'fail');
		window.location.reload();
		return false;
	};
	that.forcePass = function(){
		that._eraseCookie(that.settings.testName);
		that._createCookie(that.settings.testName, 'pass');
		window.location.reload();
		return false;
	};
	that.reTest = function(){
		that._eraseCookie(that.settings.testName);
		window.location.reload();
		return false;
	};
	
	//private - check cookies or run tests
	that._runtests = function(){
		var settings = that.settings;
		var cookieGrade = that._readCookie(settings.testName);
		var testResult = 'pass'; //innocent until proven...
		//check for cookies from a previous test
		if(cookieGrade){
			testResult = cookieGrade;
			if(cookieGrade == 'pass'){ that._enhancePage(); }	
			that._bodyOnReady(function(){ that._appendToggleLinks(testResult); });
		}
		//no cookies - run tests
		else {
			that._bodyOnReady(function(){
				for(var value in settings.tests){
					if(testResult == 'pass'){
						if(!settings.tests[value]()){
							testResult = 'fail';
							if(settings.log){ alert(value +' = '+ settings.tests[value]()); }
						}
					}
				}
				//set cookie for future page loads
				that._createCookie(settings.testName, testResult);
				//append toglle links
				that._appendToggleLinks(testResult);
				//enhance the page based on test results
				if(testResult == 'pass'){ that._enhancePage(); }
				//test is done, return capabilities object
			});
		}
	};
	
	that._bodyOnReady = function(callback){
		function bodyReady(){
			if(document.body){
				that._bodyReady = true;
				clearInterval(checkBody); //body is ready, stop asking
				callback();
			}
		}
		var checkBody = setInterval(bodyReady, 1);
	};
	
	//append forceFail/forcePass links
	that._appendToggleLinks = function(testResult){
		var settings = that.settings;
		var checkCookie = that._readCookie(settings.testName);
		if(checkCookie == "pass" || checkCookie == "fail"){
			if(settings.appendToggleLink){
				var a = document.createElement('a');
				a.href = "#";
				a.setAttribute('tabindex', 0);
				a.className = settings.testName + '_toggleResult';
				if(testResult == 'pass'){
					a.innerHTML = settings.forceFailText;
					a.onclick = that.forceFail;
				}
				else{
					a.innerHTML = settings.forcePassText;
					a.onclick = that.forcePass;
				}
				document.getElementsByTagName('body')[0].appendChild(a);
			}
		}
	};
	
	
	//private - test passed, make enhancements
	that._enhancePage = function(){
		var settings = that.settings;
		//add documentElement class				
		if (document.documentElement.className.indexOf(settings.testName) <= -1){
			document.documentElement.className += ' '+ settings.testName;
		}
		//append styles
		var h = document.getElementsByTagName('head')[0];
		//first styles
		if(settings.loadStyles.length>0){
			for(var name in settings.loadStyles){
				var s = document.createElement('link');
				if(typeof(settings.loadStyles[name]) == 'object'){
					s.setAttribute('href', settings.loadStyles[name]['url']);
					s.setAttribute('media', settings.loadStyles[name]['media']);
				}
				else {
					s.setAttribute('href', settings.loadStyles[name]);
				}				
				s.setAttribute('type', 'text/css');
				s.setAttribute('rel', 'stylesheet');
				h.appendChild(s); 
			}	
		}
		//append scripts
		if(settings.loadScripts.length>0){
			var jsQueue = (settings.queueLoading) ? [] : null;
			for(var name in settings.loadScripts){
				var s = document.createElement('script');
				s.setAttribute('src', settings.loadScripts[name]);
				s.setAttribute('type', 'text/javascript');
				if(jsQueue == null){ h.appendChild(s); }
				else{ jsQueue[name] = s; }				
			}
			//if queue 
			var i = 0;
			//script and style queue
			function loadFromQueue(){
				if(jsQueue[i]){
					h.appendChild(jsQueue[i]);
					//var event = (jsQueue.onreadystatechange) ? 'onreadystatechange' : 'onload';
					jsQueue[i].onreadystatechange = jsQueue[i].onload = function(){ loadFromQueue(i); }	
					i++;
				}	
			}
			if(jsQueue!=null){ loadFromQueue(); }
		}
	};	
		
	/*cookie functions from quirksmode.org*/
	that._createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	};
	that._readCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};
	that._eraseCookie = function(name) {
		that._createCookie(name,"",-1);
	};
		
	that._runtests();
	return that;
};