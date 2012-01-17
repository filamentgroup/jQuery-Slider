// Run the script on DOM ready:
$(function(){

	//create input sliders
	$('input#price').peSlider({range: 'min'});
	$('input#bedrooms,input#baths').peSlider({range: 'min'});
	
	//create select sliders
	$('select')
		.attr('aria-hidden','true')
		.after('<div class="slider-status" aria-hidden="true"></div>')
		.peSlider({
			slide:function(e,ui){
				$(this).next().next().text(  $(this).find('a:eq(0)').attr('aria-valuetext') );
			}
		})
		.each(function(){
			$(this).next().text(  $(this).prev().find('a:eq(0)').attr('aria-valuetext') );
		});
	
	//add select labels
		$('<div class="sliders-labels" aria-hidden="true"><span class="label-first">'+ $('#subway option:first').text() +'</span><span class="label-last">'+ $('#subway option:last').text() +'</span></div>')
			.insertAfter('#amenities legend');		

});



