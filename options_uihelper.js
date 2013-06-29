var blockListSeparator = ",";

// Saves options to localStorage.
function save_options() {
    //hotkeys data structure
    function hotkey() {
        this.value = "";
        this.enabled = false;
    }
    var hotkeys =  new Object();
    //fill data structure
    var node_list = document.getElementsByTagName('input');
    for (var i = 0; i < node_list.length; i++) {
        var node = node_list[i];
        //check for duplicates
        for (var j = i + 1; j < node_list.length; j++) {
            var className = node.getAttribute('class');
            var className2 = node_list[j].getAttribute('class');
            if (node.value == node_list[j].value && node.getAttribute('type') == 'text' && (document.getElementById(className + "Enabled").checked && document.getElementById(className2 + "Enabled").checked)) {
                setStatus("Duplicates: <strong>" + node.getAttribute('class') + "<\/strong> and <strong>" + node_list[j].getAttribute('class') + "<\/strong>! Try again!", 10000);
                return;
            }
        }
        if (node.getAttribute('type') == 'text') {
            var className = node.getAttribute('class');
            hotkeys[className] =  new hotkey();
            hotkeys[className].value = node.value;
            hotkeys[className].enabled = document.getElementById(className + "Enabled").checked;
        }
    }
	
    //save data
	var blockListArray = document.getElementById("blocklist").value.split(blockListSeparator);
	
	chrome.storage.sync.set({'hotkeys': hotkeys, 'blocklist': blockListArray}, function() {
		//send new data over to background.html
		var port = chrome.extension.connect();
		port.postMessage( {
			action : "reloadSettings", data : hotkeys
		}
		);
		// Update status to let user know options were saved.
		setStatus("Options Saved.", 1500);
	});

}
function setStatus(text, timeout) {
    var statuses = $(".status");
	var anim = 200;
	statuses.html(text);
	statuses.fadeIn(anim).delay(timeout).fadeOut(anim);
}
// Restores data
function restore_options(useDefaults) {
	chrome.storage.sync.get(['hotkeys', 'blocklist'], function(result) {
		useDefaults = useDefaults || !result["hotkeys"];
		if (!useDefaults) {
			var hotkeys = result["hotkeys"];
		}
		
		if (result["blocklist"]) {
			document.getElementById("blocklist").value = result["blocklist"].join(blockListSeparator);
		}
		
		var node_list = document.getElementsByTagName('input');
		for (var i = 0; i < node_list.length; i++) {
			var node = node_list[i];
			if (node.getAttribute('type') == 'text') {
				var className = node.getAttribute('class');
				if(useDefaults) {
					node.value = defaultHotkeys[className];
					document.getElementById(className + "Enabled").checked = true;
				} else {
					node.value = hotkeys[className].value;
					document.getElementById(className + "Enabled").checked = hotkeys[className].enabled;
				}
			}
		}
		//refreshes all checkboxes
		$(function () {
			$("input:checkbox").button("refresh");
		}
		);
	});
}

//add event listener
window.addEventListener('load', function(){restore_options(false);})