(function () {

	/**********************
	script modified by owq
	 ***********************/

	var interval = 20,
	vertical_moment = 250,
	horizontal_moment = 100,
	next,
	flg,
	hotkeysEnabled = true,
	data = {};
	
	/*** SCROLLING STUFF ***/

	function scrollFunc(moment) {
		if (flg === 'vertical') {
			scrollBy(0, moment);
		} else if (flg === 'horizontal') {
			scrollBy(moment, 0);
		}
	}

	function scrollToTop() {
		scroll(0, -document.documentElement.scrollHeight);
		document.removeEventListener('keydown', vHandler, false);
		document.addEventListener('keydown', initKeyBind, false);
	}

	function scrollToBottom() {
		scroll(0, document.documentElement.scrollHeight);
	}

	function scrollToFirst() {
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		scroll(-document.documentElement.scrollWidth, scrollTop);
	}

	function scrollToLast() {
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		scroll(document.documentElement.scrollWidth, scrollTop);
	}

	function smoothScroll(moment) {
		if (moment > 0)
			moment = Math.floor(moment / 2);
		else
			moment = Math.ceil(moment / 2);

		scrollFunc(moment);

		if (Math.abs(moment) < 1) {
			setTimeout(function () {
				scrollFunc(moment)
			});
			return;
		}

		next = setTimeout(function () {
				smoothScroll(moment);
			}, interval);
	}

	function smoothScrollBy(moment) {
		clearTimeout(next);
		smoothScroll(moment);
	}

	function scrollDown() {
		flg = 'vertical';
		smoothScrollBy(vertical_moment);
	}

	function scrollUp() {
		flg = 'vertical';
		smoothScrollBy(-vertical_moment);
	}

	function scrollRight() {
		flg = 'horizontal';
		smoothScrollBy(horizontal_moment);
	}

	function scrollLeft() {
		flg = 'horizontal';
		smoothScrollBy(-horizontal_moment);
	}
	
	/*** MAIN STUFF ***/

	function reload() {
		location.reload();
	}

	function stopLoading() {
		stop();
	}

	function closeTab() {
		var port = chrome.extension.connect();
		port.postMessage({
			action : "closeTab"
		});
	}

	function undoCloseTab() {
		var port = chrome.extension.connect();
		port.postMessage({
			action : "undoCloseTab"
		});
	}

	function previousTab() {
		var port = chrome.extension.connect();
		port.postMessage({
			action : "previousTab"
		});
	}

	function nextTab() {
		var port = chrome.extension.connect();
		port.postMessage({
			action : "nextTab"
		});
	}

	function newTab() {
		var port = chrome.extension.connect();
		port.postMessage({
			action : "newTab"
		});
	}

	function historyBack() {
		history.back();
	}

	function historyForward() {
		history.forward();
	}
	
	function showPA() {
		chrome.extension.sendRequest({
			data : "showPA"
		}, function (response) {});
		hotkeysEnabled = true;
	}

	function hidePA() {
		chrome.extension.sendRequest({
			data : "hidePA"
		}, function (response) {});
		hotkeysEnabled = false;
	}
	
	function blockPA() {
		chrome.extension.sendRequest({
			data : "blockPA"
		}, function (response) {});
		hotkeysEnabled = false;
	}

	//keybinding
	//@hotkey: properties: value, enabled
	function addHotkey(hotkey, func) {
		if (hotkey.enabled)
			shortcut.add(hotkey.value, func);
	}

	function removeHotkey(hotkey, func) {
		//based on old data, if hotkey wasn't enabled it wouldn't be added in the first place.
		//so this should be safe.
		if (hotkey.enabled)
			shortcut.remove(hotkey.value);
	}
	
	function makeDefaultHotkeys() {
		//create new structure using defaults
		function Hotkey() {
			this.value = "";
			this.enabled = false;
		}
		var hotkeys = {};
		for (var i in defaultHotkeys) {
			hotkeys[i] = new Hotkey();
			hotkeys[i].value = defaultHotkeys[i];
			hotkeys[i].enabled = true;
		}
		return hotkeys;
	}

	function initHotkeys(hotkeys, blocklist) {
		if (blocklist) {
			for (var i = 0; i < blocklist.length; i++) {
				if (blocklist[i].length == 0) continue;
				if (location.href.indexOf(blocklist[i]) >= 0) {
					console.log("Hotkeys blocked.");
					blockPA();
					return;
				}
			}
		}

		addHotkey(hotkeys["scrollUp"], scrollUp);
		addHotkey(hotkeys["scrollDown"], scrollDown);
		addHotkey(hotkeys["previousTab"], previousTab);
		addHotkey(hotkeys["nextTab"], nextTab);
		addHotkey(hotkeys["scrollToTop"], scrollToTop);
		addHotkey(hotkeys["scrollToBottom"], scrollToBottom);
		addHotkey(hotkeys["historyBack"], historyBack);
		addHotkey(hotkeys["historyForward"], historyForward);
		addHotkey(hotkeys["reload"], reload);
		addHotkey(hotkeys["stopLoading"], stopLoading);
		addHotkey(hotkeys["newTab"], newTab);
		addHotkey(hotkeys["closeTab"], closeTab);
		addHotkey(hotkeys["undoCloseTab"], undoCloseTab);
		//console.log("Hotkeys Extension running on this page.");
		showPA();
	}

	function removeHotkeys(hotkeys) {
		for (var i in hotkeys) {
			removeHotkey(hotkeys[i]);
		}
		hidePA();
	}

	//start using local data
	//@pre assumes data is correct
	function initHotkeysLocal() {
		initHotkeys(data['hotkeys'], data['blocklist']);
	}

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		//console.log(changes);
		
		//Remove hotkeys
		if(data['hotkeys'])
			removeHotkeys(data['hotkeys']);

		//Set new values
		for (key in changes) {
			data[key] = changes[key].newValue;
		}
		
		//Let's go!
		initHotkeysLocal();
	});

	//TODO deal with new structure
	chrome.extension.onConnect.addListener(function (port) {
		//console.assert(port.name == "knockknock");
		port.onMessage.addListener(function (msg) {
			if (msg.action == "togglePA") {
				if(hotkeysEnabled)
					removeHotkeys(data['hotkeys']);
				else
					initHotkeysLocal();
			}
		});
	});

	chrome.storage.sync.get(['hotkeys', 'blocklist'], function (result) {
		if(!result['hotkeys']) {
			console.log("No data found. Create default hotkeys.");
			chrome.storage.sync.set({'hotkeys': makeDefaultHotkeys()}, function() {});
			return;
		}
		data = result;
		initHotkeys(result['hotkeys'], result['blocklist']);
	});

	//end
})();
