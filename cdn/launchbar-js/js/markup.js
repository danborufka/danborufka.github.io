// create launchbar markup:
if(!$('#launchbar').length)
{
	$('<div id="launchbar"><input type="text" name="tabtab" id="lb_tabtab" list="lb_suggestions"><datalist id="lb_suggestions"></datalist></div>').prependTo( document.body );
	// prepend launchbar style:
	$("<style>").prependTo(document.head).html( "#launchbar{display:none;box-sizing:border-box!important;width:200px;height:36px;margin:0 0 0 -100px!important;padding:6px 13px 9px 6px!important;background:#333;border:2px solid #DDD;border-radius:7px;box-shadow:1px 1px 15px rgba(0,0,0,.2);font-family:Consolas,Arial,sans-serif!important;font-size:11px!important;line-height:11px!important;position:absolute;left:50%;top:40px;z-index:9999999999}#launchbar input{display:inline-block!important;box-sizing:content-box!important;width:100%!important;height:100%!important;padding:0 0 3px 6px!important;margin:0!important;border-radius:1px!important;background:#999;color:#EEE;border:none!important;outline:0!important}#launchbar input::-moz-selection{background:#f7931e;color:#000}#launchbar input::selection{background:#f7931e;color:#000}.lb-highlighted{background:rgba(242, 112, 1, .2);outline:2px solid #f27001;opacity:1!important;}.lb-dimmed{opacity:.3!important;}" );

	window.LAUNCHBAR.dom.core = '#launchbar';
	window.LAUNCHBAR.dom.input = '#lb_tabtab';

	last_cmd = $(LAUNCHBAR.dom.input).val();
}