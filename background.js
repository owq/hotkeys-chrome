chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	if (request.data == "showPA") {
		chrome.pageAction.show(sender.tab.id);
		chrome.pageAction.setIcon({
			tabId : sender.tab.id,
			path : "icon-19.png"
		});
		chrome.pageAction.setTitle({
			tabId : sender.tab.id,
			title : "Click to disable hotkeys."
		});
	} else if (request.data == "hidePA") {
		chrome.pageAction.setIcon({
			tabId : sender.tab.id,
			path : "icon-19-disabled.png"
		});
		chrome.pageAction.setTitle({
			tabId : sender.tab.id,
			title : "Click to enable hotkeys."
		});
	} else if (request.data == "blockPA") {
		chrome.pageAction.show(sender.tab.id);
		chrome.pageAction.setIcon({
			tabId : sender.tab.id,
			path : "icon-19-disabled.png"
		});
		chrome.pageAction.setTitle({
			tabId : sender.tab.id,
			title : "This site is blocked due to blocklist."
		});
	}
});
chrome.pageAction.onClicked.addListener(function (tab) {
	var port = chrome.tabs.connect(tab.id);
	port.postMessage({
		action : "togglePA"
	});
});
var closed_tabs = [];
var now_tab = false;
chrome.tabs.getSelected(null, function (tab) {
	now_tab = tab;
});
chrome.tabs.onSelectionChanged.addListener(function (tabId) {
	chrome.tabs.get(tabId, function (tab) {
		now_tab = tab;
	});
});
chrome.tabs.onUpdated.addListener(function (tabId) {
	chrome.tabs.get(tabId, function (tab) {
		if (now_tab && now_tab.id == tab.id) {
			now_tab = tab;
		}
	});
});
chrome.tabs.onRemoved.addListener(function (tabId) {
	if (now_tab) {
		closed_tabs.push(now_tab);
	};
});
chrome.extension.onConnect.addListener(function (port, name) {
	port.onMessage.addListener(function (msg) {
		var tab = port.sender.tab;
		switch (msg.action) {
		case "closeTab":
			chrome.tabs.remove(tab.id);
			break;
		case "undoCloseTab":
			if (closed_tabs.length > 0) {
				var last_closed_tab = closed_tabs[closed_tabs.length - 1];
				closed_tabs.pop();
				chrome.tabs.create({
					url : last_closed_tab.url,
					index : last_closed_tab.index
				});
			}
			break;
		case "previousTab":
			chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
				var previous_tab = tabs[tab.index - 1] || tabs[tabs.length - 1];
				if (previous_tab) {
					chrome.tabs.update(previous_tab.id, {
						selected : true
					});
				}
			});
			break;
		case "nextTab":
			chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
				var next_tab = tabs[tab.index + 1] || tabs[0];
				if (next_tab) {
					chrome.tabs.update(next_tab.id, {
						selected : true
					});
				}
			});
			break;
		case "newTab":
			chrome.tabs.create({});
			break;
		};
	});
});
