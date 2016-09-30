var path = require('path');
//handy link for language codes http://www.lingoes.net/en/translator/langcode.htm

//------------------------------------------------------------
// load all lanuages into memory
//------------------------------------------------------------
var languages = {
					'de-de': 	require(path.join(__dirname, './de-de.json')),	//German (Germany)
					'en-us': 	require(path.join(__dirname, './en-us.json')),	//English (United States)
					'es-es': 	require(path.join(__dirname, './es-es.json')),	//Spanish (Spain)
					'fr-fr': 	require(path.join(__dirname, './fr-fr.json')),	//French (France)
					'it-it': 	require(path.join(__dirname, './it-it.json')),	//Italian (Italy)
					'ja-jp': 	require(path.join(__dirname, './ja-jp.json')),	//Japanese (Japan)
					'ko-kr': 	require(path.join(__dirname, './ko-kr.json')),	//Korean (Korea)
					'pt-br': 	require(path.join(__dirname, './pt-br.json')),	//Portuguese (Brazil)
					'zh-cn': 	require(path.join(__dirname, './zh-cn.json')),	//Chinese (Simplified)
					'zh-tw': 	require(path.join(__dirname, './zh-tw.json')),	//Chinese (Traditional)
				};

// --- Create fallback for the two character languages codes --- //
for(var i in languages){
	var short = i.substring(0, 2);
	if(i.indexOf('-') >= 0 && !languages[short]) {	//if the original code is a 5 character code and it doesn't already exist
		var temp = JSON.stringify(languages[i]);	//deep copy
		languages[short] = JSON.parse(temp);		//copy the 5 character code's json
		languages[short]._LANG = short;				//replace the shorthand field
	}
}

//for(var i in languages) console.log(languages[i]._LANG, languages[i]._PREFIX);

//------------------------------------------------------------
// return desired language JSON file form headers
//------------------------------------------------------------
module.exports.get_from_headers = function(req) {
	var temp = req.headers['accept-language'].toLowerCase().split(';');	//strip off the quality shit
	var desired_languages = temp[0].split(',');							//split up language choices
	//console.log('languages are:', desired_languages);

	for(var i in desired_languages){									//loop and return first language we support
		//console.log('testing lang', desired_languages[i]);
		if(languages[desired_languages[i]]) {
			//console.log('- match: ', languages[desired_languages[i]]._LANG, languages[desired_languages[i]]._PREFIX);
			return languages[desired_languages[i]];
		}
		//else console.log('- no match');
	}

	console.log('warning - language in header not supported, using default');
	return languages['en-us'];											//return default language
};

//------------------------------------------------------------
// return desired language JSON file from URL
//------------------------------------------------------------
module.exports.get_from_url = function(req) {
	var desired_language = req.params.lang;
	var ret = languages['en-us'];

	if(!desired_language) {												//if it doesn't exist... grab from header
		console.log('warning - lang parameter doens\'t exist in url, detecting from header');
		var temp = module.exports.get_from_headers(req);
		desired_language = temp._LANG;
	}
	desired_language = desired_language.toLowerCase();

	if(desired_language && languages[desired_language])  ret = languages[desired_language];
	return ret;
};

//------------------------------------------------------------
// check if language headers match language in url
//------------------------------------------------------------
module.exports.check_mismatch = function(req) {
	var temp = module.exports.get_from_headers(req);
	var headers_say = temp._LANG.toLowerCase();
	var url_say = req.params.lang.toLowerCase();

	if(headers_say !== url_say){
		console.log('warning - language in header and url do not match. headers:', headers_say, ', url:', url_say);
		return headers_say;
	}
	else return null;
};
