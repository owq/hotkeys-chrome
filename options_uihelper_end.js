var node_list = document.getElementsByTagName('input');
for (var i = 0; i < node_list.length; i++) {
    var node = node_list[i];
    if (node.getAttribute('type') == 'text') {
        // show keypress in textbox
        node.onkeydown = function (e) {
            e = e || window.eventvar;
            k = KeyCode;
            this.value = k.hot_key(k.translate_event(e));
            KeyCode.key_down(e);
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        };
    }
}
//User interface
$(function () {
    $('#tabs').tabs();
    $("button, input:checkbox").button();
    $(".actions button:first").button( {
        icons : {
            primary : 'ui-icon-check'
        }
    }
    ).next().button( {
        icons : {
            primary : 'ui-icon-closethick'
        }
    }
    ).next().button( {
        icons : {
            primary : 'ui-icon-gear'
        }
    }
    );
    $(".actions").buttonset();
    $(".actions2 button:first").button( {
        icons : {
            primary : 'ui-icon-check'
        }
    }
    ).next().button( {
        icons : {
            primary : 'ui-icon-closethick'
        }
    }
    ).next().button( {
        icons : {
            primary : 'ui-icon-gear'
        }
    }
    );
    $(".actions2").buttonset();
}
);

//Add listeners (JQuery)
$(".saveButton").on('click', save_options);
$(".defaultsButton").on('click', function(){restore_options(true)});