chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.data == "showPA") {
        chrome.pageAction.show(sender.tab.id);
        chrome.pageAction.setIcon( {
            tabId : sender.tab.id, path : "icon-19.png"
        }
        );
        chrome.pageAction.setTitle( {
            tabId : sender.tab.id, title : "Click to disable hotkeys."
        }
        );
        sendResponse( {
        }
        );
        // snub them.
    }
    else if (request.data == "hidePA") {
        chrome.pageAction.setIcon( {
            tabId : sender.tab.id, path : "icon-19-disabled.png"
        }
        );
        chrome.pageAction.setTitle( {
            tabId : sender.tab.id, title : "Click to enable hotkeys."
        }
        );
        sendResponse( {
        }
        );
    }
}
);
chrome.pageAction.onClicked.addListener(function (tab) {
    var port = chrome.tabs.connect(tab.id);
    port.postMessage( {
        action : "togglePA", data : hotkeys
    }
    );
}
);
var closed_tabs = [];
var now_tab = false;
chrome.tabs.getSelected(null, function (tab) {
    now_tab = tab;
}
);
chrome.tabs.onSelectionChanged.addListener(function (tabId) {
    chrome.tabs.get(tabId, function (tab) {
        now_tab = tab;
    }
    );
}
);
chrome.tabs.onUpdated.addListener(function (tabId) {
    chrome.tabs.get(tabId, function (tab) {
        if (now_tab && now_tab.id == tab.id) {
            now_tab = tab;
        }
    }
    );
}
);
chrome.tabs.onRemoved.addListener(function (tabId) {
    if (now_tab) {
        closed_tabs.push(now_tab);
    };
}
);
function reloadTab(tabid, o, n) {
    var port = chrome.tabs.connect(tabid);
    port.postMessage( {
        action : "reload", olddata : o,  newdata : n
    }
    );
}
chrome.extension.onConnect.addListener(function (port, name) {
    port.onMessage.addListener(function (msg) {
        var tab = port.sender.tab;
        switch (msg.action) {
            case "reloadSettings":
                //warning: before we add new hotkeys, have to remove original hotkeys first.
                //msg.olddata, msg.newdata >> all content scripts in current window (for now)
                var olddata = hotkeys;
                //this function might run in another "thread"?
                chrome.windows.getAll( {
                    populate : true
                }
                , function (windowList) {
                    for (var w in windowList) {
                        for (var t in windowList[w].tabs) {
                            reloadTab(windowList[w].tabs[t].id, olddata, msg.data);
                        }
                    }
                }
                );
                //replace hotkeys data with new one
                hotkeys = msg.data;
                //and we're done
                break;
            case "closeTab":
                chrome.tabs.remove(tab.id);
                break;
            case "undoCloseTab":
                if (closed_tabs.length > 0) {
                    var last_closed_tab = closed_tabs[closed_tabs.length - 1];
					closed_tabs.pop();
                    chrome.tabs.create( {
                        url : last_closed_tab.url,  index : last_closed_tab.index
                    }
                    );
                }
                break;
            case "previousTab":
                chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
                    var previous_tab = tabs[tab.index - 1] || tabs[tabs.length - 1];
                    if (previous_tab) {
                        chrome.tabs.update(previous_tab.id, {
                            selected : true
                        }
                        );
                    }
                }
                );
                break;
            case "nextTab":
                chrome.tabs.getAllInWindow(tab.windowId, function (tabs) {
                    var next_tab = tabs[tab.index + 1] || tabs[0];
                    if (next_tab) {
                        chrome.tabs.update(next_tab.id, {
                            selected : true
                        }
                        );
                    }
                }
                );
                break;
            case "newTab":
                chrome.tabs.create( {
                }
                );
                break;
        };
    }
    );
}
);
