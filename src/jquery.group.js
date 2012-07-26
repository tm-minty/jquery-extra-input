/*
	jQuery.caret plugin from this package required
*/

(function($){
	$.fn.group = function( options ){
		var defaults = {};

		var methods = {
			"focus": function(element){
					if (/iPad|iPhone/.test(navigator.platform)) {
				        element.click();
				    }else{
				    	element.focus();
				    }
				    return element;
			},
			"keyup": function(e){
				var key = e.keyCode,
					length = $(this).val().length,
					maxlength = $(this).attr('maxlength') - 0,
					next = $(this).data('group').next,
					previous = $(this).data('group').previous,
					position = $(this).caret('pos');

				if( key == 37 && position == 0 && previous ){ // Left arrow -> Focus to previous input
					previous.caret('pos', previous.val().length);
				}else if( key == 39 && position == length && next ){ // Right arrow -> Focus to next input
					next.caret('pos', 0);
				}else if( position == maxlength && next ){
					next.caret('pos', 0);
				}else if( key == 8 && position == 0 && previous ){
					previous.caret('pos', previous.val().length);
				};
				return true;
			}
		};

		var inputs = this;
		for( var i = 0, l = inputs.length; i < l; i++ ){
			var input = $(inputs[i]);
			input.data('group', {
				name: input.attr('data-group'), 
				next: ( i+1 == l ? null : $(inputs[i+1])),
				previous: ( i-1 >= 0 ? $(inputs[i-1]) : null)
			});
		};

		this
			.bind('keyup keypress', methods.keyup)
			.bind('group-afterpaste', function(e){
				var tmp = $('#group-clipboard-data');
				var clipboardData = tmp.val();
				console.log(clipboardData);
				tmp.remove();
				methods.focus(this);
			})
			.bind('paste', function(e){
				var tmp = $('<input type="text" id="group-clipboard-data"/>').css({ position: 'absolute', left: '-9999999px' }),
					self = $(this);
				$(document.body).append(tmp);
				methods.focus(tmp[0]);
				setTimeout(function(){ self.trigger('group-afterpaste'); }, 0)
			});	

		return this;
	}
})(jQuery);