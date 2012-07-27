/*
	jQuery.caret plugin from this package required
*/

(function($){
	$.fn.group = function( options ){
		if (/iPad|iPhone/.test(navigator.platform)) {
			return this;
		};

		var defaults = {};

		var methods = {
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
					next.caret('pos', next.val().length);
				}else if( key == 8 && position == 0 && previous ){
					previous.caret('pos', previous.val().length);
				};
				return true;
			},
			"getValue": function(){
				var value = [], length = [];
				for( var i = 0, l = inputs.length; i < l; i++ ){
					var input = $(inputs[i]);
					value.push(input.val());
					length.push(input.attr('maxlength') - 0);
				};
				return {value: value, len: length};
			},
			"setValue": function(value){
				for( var i = 0, l = inputs.length; i < l; i++ ){
					var input = $(inputs[i]);
					input.val( value[i] );
				}
				return true;
			},
			"paste": function( clipboardData, index, pos ){
				var data = clipboardData.split(''),
					value = methods.getValue(),
					caret = [0, 0];

				for( var i = index, l = value.value.length; i < l; i++ ){
					var val = value.value[i],
						s = ( i == index ? pos : 0),
						ending = val.substr(s);
					caret = [i, 0];
					data = data.concat( ending.split('') );
					value.value[i] = value.value[i].replace( ending, '' );
					for( var j = value.len[i] - s; j--; ){
						value.value[i] += data.splice(0, 1).join('');
						if( data.length > 0)
							caret[1]++;
					}
				}

				methods.setValue(value.value);

				$(inputs[caret[0]]).caret('pos', caret[1] - 1);

				return true;
			}
		};

		var inputs = this;
		for( var i = 0, l = inputs.length; i < l; i++ ){
			var input = $(inputs[i]);
			input.data('group', {
				index: i,
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
				tmp.remove();
				methods.paste( clipboardData, $(this).data('group').index, $(this).caret('pos') );
				this.focus();
			})
			.bind('paste', function(e){
				var tmp = $('<input type="text" id="group-clipboard-data"/>').css({ position: 'absolute', left: '-9999999px' }),
					self = $(this);
				$(document.body).append(tmp);
				tmp[0].focus();
				setTimeout(function(){ self.trigger('group-afterpaste'); }, 0)
			});	

		return this;
	}
})(jQuery);