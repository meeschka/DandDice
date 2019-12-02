"use strict";

function dice_initialize(container) {
    $t.remove($t.id('loading_text'));

    var canvas = $t.id('canvas'); //canvas is whole screen
    // canvas.style.width = window.innerWidth - 1 + 'px';
    // canvas.style.height = window.innerHeight - 1 + 'px';
    var label = $t.id('label'); //shows the result of the roll
    var set = $t.id('set'); //text input for dice numbers
    var selector_div = $t.id('selector_div'); //contains set, clear, throw, and help
    var info_div = $t.id('info_div'); //div that displays during/after dice roll
    //on_set_change(); //updates the set input field to increase length with input - not required

    $t.dice.use_true_random = false;
    //don't need true randoms using atmospheric noise, okay with the default randoms

    //function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    //$t.bind(set, 'keyup', on_set_change);

    //dont have manual entering, can get rid of these set bindings
    // $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
    // $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
    // $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
    // $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    //won't have clear button, can get rid of this
    // $t.bind($t.id('clear'), ['mouseup', 'touchend'], function(ev) {
    //     ev.stopPropagation();
    //     set.value = '0';
    //     on_set_change();
    // });

        //initializing params
    // var params = $t.get_url_params();
    var params = {};
    
    if (params.chromakey) {
        $t.dice.desk_color = 0xFABEAA;
        info_div.style.display = 'none';
        $t.id('control_panel').style.display = 'none';
    }
    // if (params.shadows == 0) {
    //     $t.dice.use_shadows = false;
    // }
    // if (params.color == 'white') {
    //     $t.dice.dice_color = '#808080';
    //     $t.dice.label_color = '#202020';
    // }

        //make new canvas element, assign dice and dice box classes
    var box = new $t.dice.dice_box(canvas, { w: 500, h: 500 });
    box.animate_selector = false;

    //update canvas size every time window is resized
    $t.bind(window, 'resize', function() {  
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });
    //shows text box for entering dice inputs, not required for my project
    function show_selector() {
        info_div.style.display = 'none';
        selector_div.style.display = 'inline-block';
        box.draw_selector();
    }

    function before_roll(vectors, notation, callback) {
        // info_div.style.display = 'none';
        // selector_div.style.display = 'none';

        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(set.value);
    }

    function after_roll(notation, result) {
        if (params.chromakey || params.noresult) return;
        var res = result.join(' ');
        if (notation.constant) {
            if (notation.constant > 0) res += ' +' + notation.constant;
            else res += ' -' + Math.abs(notation.constant);
        }
        if (result.length > 1) res += ' = ' + 
                (result.reduce(function(s, a) { return s + a; }) + notation.constant);
        label.innerHTML = res;
        info_div.style.display = 'inline-block';

        //use dice result here
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    $t.bind(container, ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        if (selector_div.style.display == 'none') {
            if (!box.rolling) show_selector();
            box.rolling = false;
            return;
        }
        var name = box.search_dice_by_mouse(ev);
        if (name != undefined) {
            var notation = $t.dice.parse_notation(set.value);
            notation.set.push(name);
            set.value = $t.dice.stringify_notation(notation);
            on_set_change();
        }
    });

    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        show_selector();
    }
}
