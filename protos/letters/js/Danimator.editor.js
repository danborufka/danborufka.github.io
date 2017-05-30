/*! jQuery UI - v1.12.1 - 2017-04-18
* http://jqueryui.com
* Includes: widget.js, data.js, scroll-parent.js, widgets/draggable.js, widgets/mouse.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){t.ui=t.ui||{},t.ui.version="1.12.1";var e=0,i=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var s,n,o=i.call(arguments,1),a=0,r=o.length;r>a;a++)for(s in o[a])n=o[a][s],o[a].hasOwnProperty(s)&&void 0!==n&&(e[s]=t.isPlainObject(n)?t.isPlainObject(e[s])?t.widget.extend({},e[s],n):t.widget.extend({},n):n);return e},t.widget.bridge=function(e,s){var n=s.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=i.call(arguments,1),l=this;return a?this.length||"instance"!==o?this.each(function(){var i,s=t.data(this,n);return"instance"===o?(l=s,!1):s?t.isFunction(s[o])&&"_"!==o.charAt(0)?(i=s[o].apply(s,r),i!==s&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):l=void 0:(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,n);e?(e.option(o||{}),e._init&&e._init()):t.data(this,n,new s(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(i,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=e++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),i),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])}}),t.fn.scrollParent=function(e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function(){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var s=!1;t(document).on("mouseup",function(){s=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!s){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,n=1===e.which,o="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return n&&!o&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),s=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,s=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.ui.plugin={add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i,s){var n,o=t.plugins[e];if(o&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(n=0;o.length>n;n++)t.options[o[n][0]]&&o[n][1].apply(t.element,i)}},t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.ui.safeBlur=function(e){e&&"body"!==e.nodeName.toLowerCase()&&t(e).trigger("blur")},t.widget("ui.draggable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this._addClass("ui-draggable"),this._setHandleClassName(),this._mouseInit()},_setOption:function(t,e){this._super(t,e),"handle"===t&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){return(this.helper||this.element).is(".ui-draggable-dragging")?(this.destroyOnClear=!0,void 0):(this._removeHandleClassName(),this._mouseDestroy(),void 0)},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(this._blurActiveElement(e),this._blockFrames(i.iframeFix===!0?"iframe":i.iframeFix),!0):!1)},_blockFrames:function(e){this.iframeBlocks=this.document.find(e).map(function(){var e=t(this);return t("<div>").css("position","absolute").appendTo(e.parent()).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).offset(e.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(e){var i=t.ui.safeActiveElement(this.document[0]),s=t(e.target);s.closest(i).length||t.ui.safeBlur(i)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this._addClass(this.helper,"ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=this.helper.parents().filter(function(){return"fixed"===t(this).css("position")}).length>0,this.positionAbs=this.element.offset(),this._refreshOffsets(e),this.originalPosition=this.position=this._generatePosition(e,!1),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_refreshOffsets:function(t){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:t.pageX-this.offset.left,top:t.pageY-this.offset.top}},_mouseDrag:function(e,i){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e,!0),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp(new t.Event("mouseup",e)),!1;this.position=s.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1},_mouseUp:function(e){return this._unblockFrames(),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),this.handleElement.is(e.target)&&this.element.trigger("focus"),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp(new t.Event("mouseup",{target:this.element[0]})):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this._addClass(this.handleElement,"ui-draggable-handle")},_removeHandleClassName:function(){this._removeClass(this.handleElement,"ui-draggable-handle")},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper),n=s?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return n.parents("body").length||n.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s&&n[0]===this.element[0]&&this._setPositionRelative(),n[0]===this.element[0]||/(fixed|absolute)/.test(n.css("position"))||n.css("position","absolute"),n},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_isRootNode:function(t){return/(html|body)/i.test(t.tagName)||t===this.document[0]},_getParentOffset:function(){var e=this.offsetParent.offset(),i=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==i&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),this._isRootNode(this.offsetParent[0])&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var t=this.element.position(),e=this._isRootNode(this.scrollParent[0]);return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+(e?0:this.scrollParent.scrollTop()),left:t.left-(parseInt(this.helper.css("left"),10)||0)+(e?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options,o=this.document[0];return this.relativeContainer=null,n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):"document"===n.containment?(this.containment=[0,0,t(o).width()-this.helperProportions.width-this.margins.left,(t(o).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):n.containment.constructor===Array?(this.containment=n.containment,void 0):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e=/(scroll|auto)/.test(i.css("overflow")),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=i),void 0):(this.containment=null,void 0)},_convertPositionTo:function(t,e){e||(e=this.position);var i="absolute"===t?1:-1,s=this._isRootNode(this.scrollParent[0]);return{top:e.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:s?0:this.offset.scroll.top)*i,left:e.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:s?0:this.offset.scroll.left)*i}},_generatePosition:function(t,e){var i,s,n,o,a=this.options,r=this._isRootNode(this.scrollParent[0]),l=t.pageX,h=t.pageY;return r&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),e&&(this.containment&&(this.relativeContainer?(s=this.relativeContainer.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,t.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),a.grid&&(n=a.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/a.grid[1])*a.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-a.grid[1]:n+a.grid[1]:n,o=a.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/a.grid[0])*a.grid[0]:this.originalPageX,l=i?o-this.offset.click.left>=i[0]||o-this.offset.click.left>i[2]?o:o-this.offset.click.left>=i[0]?o-a.grid[0]:o+a.grid[0]:o),"y"===a.axis&&(l=this.originalPageX),"x"===a.axis&&(h=this.originalPageY)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:r?0:this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:r?0:this.offset.scroll.left)}},_clear:function(){this._removeClass(this.helper,"ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s,this],!0),/^(drag|start|stop)/.test(e)&&(this.positionAbs=this._convertPositionTo("absolute"),s.offset=this.positionAbs),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i,s){var n=t.extend({},i,{item:s.element});s.sortables=[],t(s.options.connectToSortable).each(function(){var i=t(this).sortable("instance");i&&!i.options.disabled&&(s.sortables.push(i),i.refreshPositions(),i._trigger("activate",e,n))})},stop:function(e,i,s){var n=t.extend({},i,{item:s.element});s.cancelHelperRemoval=!1,t.each(s.sortables,function(){var t=this;t.isOver?(t.isOver=0,s.cancelHelperRemoval=!0,t.cancelHelperRemoval=!1,t._storedCSS={position:t.placeholder.css("position"),top:t.placeholder.css("top"),left:t.placeholder.css("left")},t._mouseStop(e),t.options.helper=t.options._helper):(t.cancelHelperRemoval=!0,t._trigger("deactivate",e,n))})},drag:function(e,i,s){t.each(s.sortables,function(){var n=!1,o=this;o.positionAbs=s.positionAbs,o.helperProportions=s.helperProportions,o.offset.click=s.offset.click,o._intersectsWith(o.containerCache)&&(n=!0,t.each(s.sortables,function(){return this.positionAbs=s.positionAbs,this.helperProportions=s.helperProportions,this.offset.click=s.offset.click,this!==o&&this._intersectsWith(this.containerCache)&&t.contains(o.element[0],this.element[0])&&(n=!1),n})),n?(o.isOver||(o.isOver=1,s._parent=i.helper.parent(),o.currentItem=i.helper.appendTo(o.element).data("ui-sortable-item",!0),o.options._helper=o.options.helper,o.options.helper=function(){return i.helper[0]},e.target=o.currentItem[0],o._mouseCapture(e,!0),o._mouseStart(e,!0,!0),o.offset.click.top=s.offset.click.top,o.offset.click.left=s.offset.click.left,o.offset.parent.left-=s.offset.parent.left-o.offset.parent.left,o.offset.parent.top-=s.offset.parent.top-o.offset.parent.top,s._trigger("toSortable",e),s.dropped=o.element,t.each(s.sortables,function(){this.refreshPositions()}),s.currentItem=s.element,o.fromOutside=s),o.currentItem&&(o._mouseDrag(e),i.position=o.position)):o.isOver&&(o.isOver=0,o.cancelHelperRemoval=!0,o.options._revert=o.options.revert,o.options.revert=!1,o._trigger("out",e,o._uiHash(o)),o._mouseStop(e,!0),o.options.revert=o.options._revert,o.options.helper=o.options._helper,o.placeholder&&o.placeholder.remove(),i.helper.appendTo(s._parent),s._refreshOffsets(e),i.position=s._generatePosition(e,!0),s._trigger("fromSortable",e),s.dropped=!1,t.each(s.sortables,function(){this.refreshPositions()}))})}}),t.ui.plugin.add("draggable","cursor",{start:function(e,i,s){var n=t("body"),o=s.options;n.css("cursor")&&(o._cursor=n.css("cursor")),n.css("cursor",o.cursor)},stop:function(e,i,s){var n=s.options;n._cursor&&t("body").css("cursor",n._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("opacity")&&(o._opacity=n.css("opacity")),n.css("opacity",o.opacity)},stop:function(e,i,s){var n=s.options;n._opacity&&t(i.helper).css("opacity",n._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(t,e,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(e,i,s){var n=s.options,o=!1,a=s.scrollParentNotHidden[0],r=s.document[0];a!==r&&"HTML"!==a.tagName?(n.axis&&"x"===n.axis||(s.overflowOffset.top+a.offsetHeight-e.pageY<n.scrollSensitivity?a.scrollTop=o=a.scrollTop+n.scrollSpeed:e.pageY-s.overflowOffset.top<n.scrollSensitivity&&(a.scrollTop=o=a.scrollTop-n.scrollSpeed)),n.axis&&"y"===n.axis||(s.overflowOffset.left+a.offsetWidth-e.pageX<n.scrollSensitivity?a.scrollLeft=o=a.scrollLeft+n.scrollSpeed:e.pageX-s.overflowOffset.left<n.scrollSensitivity&&(a.scrollLeft=o=a.scrollLeft-n.scrollSpeed))):(n.axis&&"x"===n.axis||(e.pageY-t(r).scrollTop()<n.scrollSensitivity?o=t(r).scrollTop(t(r).scrollTop()-n.scrollSpeed):t(window).height()-(e.pageY-t(r).scrollTop())<n.scrollSensitivity&&(o=t(r).scrollTop(t(r).scrollTop()+n.scrollSpeed))),n.axis&&"y"===n.axis||(e.pageX-t(r).scrollLeft()<n.scrollSensitivity?o=t(r).scrollLeft(t(r).scrollLeft()-n.scrollSpeed):t(window).width()-(e.pageX-t(r).scrollLeft())<n.scrollSensitivity&&(o=t(r).scrollLeft(t(r).scrollLeft()+n.scrollSpeed)))),o!==!1&&t.ui.ddmanager&&!n.dropBehaviour&&t.ui.ddmanager.prepareOffsets(s,e)}}),t.ui.plugin.add("draggable","snap",{start:function(e,i,s){var n=s.options;s.snapElements=[],t(n.snap.constructor!==String?n.snap.items||":data(ui-draggable)":n.snap).each(function(){var e=t(this),i=e.offset();this!==s.element[0]&&s.snapElements.push({item:this,width:e.outerWidth(),height:e.outerHeight(),top:i.top,left:i.left})})},drag:function(e,i,s){var n,o,a,r,l,h,c,u,d,p,f=s.options,g=f.snapTolerance,m=i.offset.left,_=m+s.helperProportions.width,v=i.offset.top,b=v+s.helperProportions.height;for(d=s.snapElements.length-1;d>=0;d--)l=s.snapElements[d].left-s.margins.left,h=l+s.snapElements[d].width,c=s.snapElements[d].top-s.margins.top,u=c+s.snapElements[d].height,l-g>_||m>h+g||c-g>b||v>u+g||!t.contains(s.snapElements[d].item.ownerDocument,s.snapElements[d].item)?(s.snapElements[d].snapping&&s.options.snap.release&&s.options.snap.release.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=!1):("inner"!==f.snapMode&&(n=g>=Math.abs(c-b),o=g>=Math.abs(u-v),a=g>=Math.abs(l-_),r=g>=Math.abs(h-m),n&&(i.position.top=s._convertPositionTo("relative",{top:c-s.helperProportions.height,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l-s.helperProportions.width}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h}).left)),p=n||o||a||r,"outer"!==f.snapMode&&(n=g>=Math.abs(c-v),o=g>=Math.abs(u-b),a=g>=Math.abs(l-m),r=g>=Math.abs(h-_),n&&(i.position.top=s._convertPositionTo("relative",{top:c,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u-s.helperProportions.height,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h-s.helperProportions.width}).left)),!s.snapElements[d].snapping&&(n||o||a||r||p)&&s.options.snap.snap&&s.options.snap.snap.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=n||o||a||r||p)}}),t.ui.plugin.add("draggable","stack",{start:function(e,i,s){var n,o=s.options,a=t.makeArray(t(o.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});a.length&&(n=parseInt(t(a[0]).css("zIndex"),10)||0,t(a).each(function(e){t(this).css("zIndex",n+e)}),this.css("zIndex",n+a.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("zIndex")&&(o._zIndex=n.css("zIndex")),n.css("zIndex",o.zIndex)},stop:function(e,i,s){var n=s.options;n._zIndex&&t(i.helper).css("zIndex",n._zIndex)}}),t.ui.draggable});;/*
Simple Javascript undo and redo.
https://github.com/ArthurClemens/Javascript-Undo-Manager
*/

;(function() {

    'use strict';

    function removeFromTo(array, from, to) {
        array.splice(from,
            !to ||
            1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * array.length));
        return array.length;
    }

    var UndoManager = function() {

        var commands = [],
            index = -1,
            limit = 0,
            isExecuting = false,
            callback,
            
            // functions
            execute;

        execute = function(command, action) {
            if (!command || typeof command[action] !== "function") {
                return this;
            }
            isExecuting = true;

            command[action]();

            isExecuting = false;
            return this;
        };

        return {

            /*
            Add a command to the queue.
            */
            add: function (command) {
                if (isExecuting) {
                    return this;
                }
                // if we are here after having called undo,
                // invalidate items higher on the stack
                commands.splice(index + 1, commands.length - index);

                commands.push(command);
                
                // if limit is set, remove items from the start
                if (limit && commands.length > limit) {
                    removeFromTo(commands, 0, -(limit+1));
                }
                
                // set the current index to the end
                index = commands.length - 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Pass a function to be called on undo and redo actions.
            */
            setCallback: function (callbackFunc) {
                callback = callbackFunc;
            },

            /*
            Perform undo: call the undo function at the current index and decrease the index by 1.
            */
            undo: function () {
                var command = commands[index];
                if (!command) {
                    return this;
                }
                execute(command, "undo");
                index -= 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Perform redo: call the redo function at the next index and increase the index by 1.
            */
            redo: function () {
                var command = commands[index + 1];
                if (!command) {
                    return this;
                }
                execute(command, "redo");
                index += 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Clears the memory, losing all stored states. Reset the index.
            */
            clear: function () {
                var prev_size = commands.length;

                commands = [];
                index = -1;

                if (callback && (prev_size > 0)) {
                    callback();
                }
            },

            hasUndo: function () {
                return index !== -1;
            },

            hasRedo: function () {
                return index < (commands.length - 1);
            },

            getCommands: function () {
                return commands;
            },

            getIndex: function() {
                return index;
            },
            
            setLimit: function (l) {
                limit = l;
            }
        };
    };

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function() {
            return UndoManager;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = UndoManager;
    } else {
        window.UndoManager = UndoManager;
    }

}());

var Undos = new UndoManager();

function Undoable(redo, undo, title, silent) {
    var self = this;

    self.undo = undo;
    self.redo = redo;


    undoHistory.index++;
    undoHistory.title = title || 'last action';

    // hack until pushState's title param works in all browsers:
    var docTitle = document.title + '';
    document.title = undoHistory.title;
    history.pushState({ undoIndex: undoHistory.index }, undoHistory.title);
    //document.title = docTitle;

    var task = { undo: undo, redo: redo };
    Undos.add(task);

    if(!silent) task.redo();

    return self;
}

undoHistory = {
    index:  0,
    title: '',

    goto: function(newIndex) {
        while(newIndex > undoHistory.index) undoHistory.redo();
        while(newIndex < undoHistory.index) undoHistory.undo();
    },

    undo:   function() {
        if(Undos.hasUndo()) {
            Undos.undo();
            undoHistory.index--;
            console.log('newIndex', undoHistory.index);
        }
    },

    redo:   function() {
        if(Undos.hasRedo()) {
            Undos.redo();
            undoHistory.index++;
            console.log('newIndex', undoHistory.index);
        }
    }
};

history.replaceState({ undoIndex: 0 }, '');

jQuery(window).on('popstate', function(event, state) {
    undoHistory.goto(event.originalEvent.state.undoIndex);
});;/*! wavesurfer.js 1.3.7 (Sun, 19 Mar 2017 17:49:02 GMT)
* https://github.com/katspaugh/wavesurfer.js
* @license CC-BY-3.0 */
!function(a,b){"function"==typeof define&&define.amd?define("wavesurfer",[],function(){return a.WaveSurfer=b()}):"object"==typeof exports?module.exports=b():a.WaveSurfer=b()}(this,function(){"use strict";var a={defaultParams:{audioContext:null,audioRate:1,autoCenter:!0,backend:"WebAudio",barHeight:1,closeAudioContext:!1,container:null,cursorColor:"#333",cursorWidth:1,dragSelection:!0,fillParent:!0,forceDecode:!1,height:128,hideScrollbar:!1,interact:!0,loopSelection:!0,mediaContainer:null,mediaControls:!1,mediaType:"audio",minPxPerSec:20,partialRender:!1,pixelRatio:window.devicePixelRatio||screen.deviceXDPI/screen.logicalXDPI,progressColor:"#555",normalize:!1,renderer:"MultiCanvas",scrollParent:!1,skipLength:2,splitChannels:!1,waveColor:"#999"},init:function(b){if(this.params=a.util.extend({},this.defaultParams,b),this.container="string"==typeof b.container?document.querySelector(this.params.container):this.params.container,!this.container)throw new Error("Container element not found");if(null==this.params.mediaContainer?this.mediaContainer=this.container:"string"==typeof this.params.mediaContainer?this.mediaContainer=document.querySelector(this.params.mediaContainer):this.mediaContainer=this.params.mediaContainer,!this.mediaContainer)throw new Error("Media Container element not found");this.savedVolume=0,this.isMuted=!1,this.tmpEvents=[],this.currentAjax=null,this.createDrawer(),this.createBackend(),this.createPeakCache(),this.isDestroyed=!1},createDrawer:function(){var b=this;this.drawer=Object.create(a.Drawer[this.params.renderer]),this.drawer.init(this.container,this.params),this.drawer.on("redraw",function(){b.drawBuffer(),b.drawer.progress(b.backend.getPlayedPercents())}),this.drawer.on("click",function(a,c){setTimeout(function(){b.seekTo(c)},0)}),this.drawer.on("scroll",function(a){b.params.partialRender&&b.drawBuffer(),b.fireEvent("scroll",a)})},createBackend:function(){var b=this;this.backend&&this.backend.destroy(),"AudioElement"==this.params.backend&&(this.params.backend="MediaElement"),"WebAudio"!=this.params.backend||a.WebAudio.supportsWebAudio()||(this.params.backend="MediaElement"),this.backend=Object.create(a[this.params.backend]),this.backend.init(this.params),this.backend.on("finish",function(){b.fireEvent("finish")}),this.backend.on("play",function(){b.fireEvent("play")}),this.backend.on("pause",function(){b.fireEvent("pause")}),this.backend.on("audioprocess",function(a){b.drawer.progress(b.backend.getPlayedPercents()),b.fireEvent("audioprocess",a)})},createPeakCache:function(){this.params.partialRender&&(this.peakCache=Object.create(a.PeakCache),this.peakCache.init())},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(a,b){this.fireEvent("interaction",this.play.bind(this,a,b)),this.backend.play(a,b)},pause:function(){this.backend.isPaused()||this.backend.pause()},playPause:function(){this.backend.isPaused()?this.play():this.pause()},isPlaying:function(){return!this.backend.isPaused()},skipBackward:function(a){this.skip(-a||-this.params.skipLength)},skipForward:function(a){this.skip(a||this.params.skipLength)},skip:function(a){var b=this.getCurrentTime()||0,c=this.getDuration()||1;b=Math.max(0,Math.min(c,b+(a||0))),this.seekAndCenter(b/c)},seekAndCenter:function(a){this.seekTo(a),this.drawer.recenter(a)},seekTo:function(a){this.fireEvent("interaction",this.seekTo.bind(this,a));var b=this.backend.isPaused();b||this.backend.pause();var c=this.params.scrollParent;this.params.scrollParent=!1,this.backend.seekTo(a*this.getDuration()),this.drawer.progress(this.backend.getPlayedPercents()),b||this.backend.play(),this.params.scrollParent=c,this.fireEvent("seek",a)},stop:function(){this.pause(),this.seekTo(0),this.drawer.progress(0)},setVolume:function(a){this.backend.setVolume(a)},getVolume:function(){return this.backend.getVolume()},setPlaybackRate:function(a){this.backend.setPlaybackRate(a)},getPlaybackRate:function(){return this.backend.getPlaybackRate()},toggleMute:function(){this.setMute(!this.isMuted)},setMute:function(a){a!==this.isMuted&&(a?(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0):(this.backend.setVolume(this.savedVolume),this.isMuted=!1))},getMute:function(){return this.isMuted},getFilters:function(){return this.backend.filters||[]},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer()},toggleInteraction:function(){this.params.interact=!this.params.interact},drawBuffer:function(){var a=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),b=this.drawer.getWidth(),c=a,d=this.drawer.getScrollX(),e=Math.min(d+b,c);if(this.params.fillParent&&(!this.params.scrollParent||a<b)&&(c=b,d=0,e=c),this.params.partialRender)for(var f=this.peakCache.addRangeToPeakCache(c,d,e),g=0;g<f.length;g++){var h=this.backend.getPeaks(c,f[g][0],f[g][1]);this.drawer.drawPeaks(h,c,f[g][0],f[g][1])}else{d=0,e=c;var h=this.backend.getPeaks(c,d,e);this.drawer.drawPeaks(h,c,d,e)}this.fireEvent("redraw",h,c)},zoom:function(a){this.params.minPxPerSec=a,this.params.scrollParent=!0,this.drawBuffer(),this.drawer.progress(this.backend.getPlayedPercents()),this.drawer.recenter(this.getCurrentTime()/this.getDuration()),this.fireEvent("zoom",a)},loadArrayBuffer:function(a){this.decodeArrayBuffer(a,function(a){this.isDestroyed||this.loadDecodedBuffer(a)}.bind(this))},loadDecodedBuffer:function(a){this.backend.load(a),this.drawBuffer(),this.fireEvent("ready")},loadBlob:function(a){var b=this,c=new FileReader;c.addEventListener("progress",function(a){b.onProgress(a)}),c.addEventListener("load",function(a){b.loadArrayBuffer(a.target.result)}),c.addEventListener("error",function(){b.fireEvent("error","Error reading file")}),c.readAsArrayBuffer(a),this.empty()},load:function(a,b,c){switch(this.empty(),this.params.backend){case"WebAudio":return this.loadBuffer(a,b);case"MediaElement":return this.loadMediaElement(a,b,c)}},loadBuffer:function(a,b){var c=function(b){return b&&this.tmpEvents.push(this.once("ready",b)),this.getArrayBuffer(a,this.loadArrayBuffer.bind(this))}.bind(this);return b?(this.backend.setPeaks(b),this.drawBuffer(),this.tmpEvents.push(this.once("interaction",c)),void 0):c()},loadMediaElement:function(a,b,c){var d=a;if("string"==typeof a)this.backend.load(d,this.mediaContainer,b,c);else{var e=a;this.backend.loadElt(e,b),d=e.src}this.tmpEvents.push(this.backend.once("canplay",function(){this.drawBuffer(),this.fireEvent("ready")}.bind(this)),this.backend.once("error",function(a){this.fireEvent("error",a)}.bind(this))),b&&this.backend.setPeaks(b),b&&!this.params.forceDecode||!this.backend.supportsWebAudio()||this.getArrayBuffer(d,function(a){this.decodeArrayBuffer(a,function(a){this.backend.buffer=a,this.backend.setPeaks(null),this.drawBuffer(),this.fireEvent("waveform-ready")}.bind(this))}.bind(this))},decodeArrayBuffer:function(a,b){this.arraybuffer=a,this.backend.decodeArrayBuffer(a,function(c){this.isDestroyed||this.arraybuffer!=a||(b(c),this.arraybuffer=null)}.bind(this),this.fireEvent.bind(this,"error","Error decoding audiobuffer"))},getArrayBuffer:function(b,c){var d=this,e=a.util.ajax({url:b,responseType:"arraybuffer"});return this.currentAjax=e,this.tmpEvents.push(e.on("progress",function(a){d.onProgress(a)}),e.on("success",function(a,b){c(a),d.currentAjax=null}),e.on("error",function(a){d.fireEvent("error","XHR error: "+a.target.statusText),d.currentAjax=null})),e},onProgress:function(a){if(a.lengthComputable)var b=a.loaded/a.total;else b=a.loaded/(a.loaded+1e6);this.fireEvent("loading",Math.round(100*b),a.target)},exportPCM:function(a,b,c){a=a||1024,b=b||1e4,c=c||!1;var d=this.backend.getPeaks(a,b),e=[].map.call(d,function(a){return Math.round(a*b)/b}),f=JSON.stringify(e);return c||window.open("data:application/json;charset=utf-8,"+encodeURIComponent(f)),f},exportImage:function(a,b){return a||(a="image/png"),b||(b=1),this.drawer.getImage(a,b)},cancelAjax:function(){this.currentAjax&&(this.currentAjax.xhr.abort(),this.currentAjax=null)},clearTmpEvents:function(){this.tmpEvents.forEach(function(a){a.un()})},empty:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource()),this.cancelAjax(),this.clearTmpEvents(),this.drawer.progress(0),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy"),this.cancelAjax(),this.clearTmpEvents(),this.unAll(),this.backend.destroy(),this.drawer.destroy(),this.isDestroyed=!0}};return a.create=function(b){var c=Object.create(a);return c.init(b),c},a.util={extend:function(a){var b=Array.prototype.slice.call(arguments,1);return b.forEach(function(b){Object.keys(b).forEach(function(c){a[c]=b[c]})}),a},debounce:function(a,b,c){var d,e,f,g=function(){f=null,c||a.apply(e,d)};return function(){e=this,d=arguments;var h=c&&!f;clearTimeout(f),f=setTimeout(g,b),f||(f=setTimeout(g,b)),h&&a.apply(e,d)}},min:function(a){var b=+(1/0);for(var c in a)a[c]<b&&(b=a[c]);return b},max:function(a){var b=-(1/0);for(var c in a)a[c]>b&&(b=a[c]);return b},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},ajax:function(b){var c=Object.create(a.Observer),d=new XMLHttpRequest,e=!1;return d.open(b.method||"GET",b.url,!0),d.responseType=b.responseType||"json",d.addEventListener("progress",function(a){c.fireEvent("progress",a),a.lengthComputable&&a.loaded==a.total&&(e=!0)}),d.addEventListener("load",function(a){e||c.fireEvent("progress",a),c.fireEvent("load",a),200==d.status||206==d.status?c.fireEvent("success",d.response,a):c.fireEvent("error",a)}),d.addEventListener("error",function(a){c.fireEvent("error",a)}),d.send(),c.xhr=d,c}},a.Observer={on:function(a,b){this.handlers||(this.handlers={});var c=this.handlers[a];return c||(c=this.handlers[a]=[]),c.push(b),{name:a,callback:b,un:this.un.bind(this,a,b)}},un:function(a,b){if(this.handlers){var c=this.handlers[a];if(c)if(b)for(var d=c.length-1;d>=0;d--)c[d]==b&&c.splice(d,1);else c.length=0}},unAll:function(){this.handlers=null},once:function(a,b){var c=this,d=function(){b.apply(this,arguments),setTimeout(function(){c.un(a,d)},0)};return this.on(a,d)},fireEvent:function(a){if(this.handlers){var b=this.handlers[a],c=Array.prototype.slice.call(arguments,1);b&&b.forEach(function(a){a.apply(null,c)})}}},a.util.extend(a,a.Observer),a.WebAudio={scriptBufferSize:256,PLAYING_STATE:0,PAUSED_STATE:1,FINISHED_STATE:2,supportsWebAudio:function(){return!(!window.AudioContext&&!window.webkitAudioContext)},getAudioContext:function(){return a.WebAudio.audioContext||(a.WebAudio.audioContext=new(window.AudioContext||window.webkitAudioContext)),a.WebAudio.audioContext},getOfflineAudioContext:function(b){return a.WebAudio.offlineAudioContext||(a.WebAudio.offlineAudioContext=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,2,b)),a.WebAudio.offlineAudioContext},init:function(b){this.params=b,this.ac=b.audioContext||this.getAudioContext(),this.lastPlay=this.ac.currentTime,this.startPosition=0,this.scheduledPause=null,this.states=[Object.create(a.WebAudio.state.playing),Object.create(a.WebAudio.state.paused),Object.create(a.WebAudio.state.finished)],this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setState(this.PAUSED_STATE),this.setPlaybackRate(this.params.audioRate),this.setLength(0)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(a){a&&a.disconnect()}),this.filters=null,this.analyser.connect(this.gainNode))},setState:function(a){this.state!==this.states[a]&&(this.state=this.states[a],this.state.init.call(this))},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(a){this.disconnectFilters(),a&&a.length&&(this.filters=a,this.analyser.disconnect(),a.reduce(function(a,b){return a.connect(b),b},this.analyser).connect(this.gainNode))},createScriptNode:function(){this.ac.createScriptProcessor?this.scriptNode=this.ac.createScriptProcessor(this.scriptBufferSize):this.scriptNode=this.ac.createJavaScriptNode(this.scriptBufferSize),this.scriptNode.connect(this.ac.destination)},addOnAudioProcess:function(){var a=this;this.scriptNode.onaudioprocess=function(){var b=a.getCurrentTime();b>=a.getDuration()?(a.setState(a.FINISHED_STATE),a.fireEvent("pause")):b>=a.scheduledPause?a.pause():a.state===a.states[a.PLAYING_STATE]&&a.fireEvent("audioprocess",b)}},removeOnAudioProcess:function(){this.scriptNode.onaudioprocess=null},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser(),this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.ac.createGain?this.gainNode=this.ac.createGain():this.gainNode=this.ac.createGainNode(),this.gainNode.connect(this.ac.destination)},setVolume:function(a){this.gainNode.gain.value=a},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(a,b,c){this.offlineAc||(this.offlineAc=this.getOfflineAudioContext(this.ac?this.ac.sampleRate:44100)),this.offlineAc.decodeAudioData(a,function(a){b(a)}.bind(this),c)},setPeaks:function(a){this.peaks=a},setLength:function(a){if(!this.mergedPeaks||a!=2*this.mergedPeaks.length-1+2){this.splitPeaks=[],this.mergedPeaks=[];for(var b=this.buffer?this.buffer.numberOfChannels:1,c=0;c<b;c++)this.splitPeaks[c]=[],this.splitPeaks[c][2*(a-1)]=0,this.splitPeaks[c][2*(a-1)+1]=0;this.mergedPeaks[2*(a-1)]=0,this.mergedPeaks[2*(a-1)+1]=0}},getPeaks:function(a,b,c){if(this.peaks)return this.peaks;this.setLength(a);for(var d=this.buffer.length/a,e=~~(d/10)||1,f=this.buffer.numberOfChannels,g=0;g<f;g++)for(var h=this.splitPeaks[g],i=this.buffer.getChannelData(g),j=b;j<=c;j++){for(var k=~~(j*d),l=~~(k+d),m=0,n=0,o=k;o<l;o+=e){var p=i[o];p>n&&(n=p),p<m&&(m=p)}h[2*j]=n,h[2*j+1]=m,(0==g||n>this.mergedPeaks[2*j])&&(this.mergedPeaks[2*j]=n),(0==g||m<this.mergedPeaks[2*j+1])&&(this.mergedPeaks[2*j+1]=m)}return this.params.splitChannels?this.splitPeaks:this.mergedPeaks},getPlayedPercents:function(){return this.state.getPlayedPercents.call(this)},disconnectSource:function(){this.source&&this.source.disconnect()},destroy:function(){this.isPaused()||this.pause(),this.unAll(),this.buffer=null,this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect(),this.params.closeAudioContext&&("function"==typeof this.ac.close&&"closed"!=this.ac.state&&this.ac.close(),this.ac=null,this.params.audioContext?this.params.audioContext=null:a.WebAudio.audioContext=null,a.WebAudio.offlineAudioContext=null)},load:function(a){this.startPosition=0,this.lastPlay=this.ac.currentTime,this.buffer=a,this.createSource()},createSource:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.start=this.source.start||this.source.noteGrainOn,this.source.stop=this.source.stop||this.source.noteOff,this.source.playbackRate.value=this.playbackRate,this.source.buffer=this.buffer,this.source.connect(this.analyser)},isPaused:function(){return this.state!==this.states[this.PLAYING_STATE]},getDuration:function(){return this.buffer?this.buffer.duration:0},seekTo:function(a,b){if(this.buffer)return this.scheduledPause=null,null==a&&(a=this.getCurrentTime(),a>=this.getDuration()&&(a=0)),null==b&&(b=this.getDuration()),this.startPosition=a,this.lastPlay=this.ac.currentTime,this.state===this.states[this.FINISHED_STATE]&&this.setState(this.PAUSED_STATE),{start:a,end:b}},getPlayedTime:function(){return(this.ac.currentTime-this.lastPlay)*this.playbackRate},play:function(a,b){if(this.buffer){this.createSource();var c=this.seekTo(a,b);a=c.start,b=c.end,this.scheduledPause=b,this.source.start(0,a,b-a),"suspended"==this.ac.state&&this.ac.resume&&this.ac.resume(),this.setState(this.PLAYING_STATE),this.fireEvent("play")}},pause:function(){this.scheduledPause=null,this.startPosition+=this.getPlayedTime(),this.source&&this.source.stop(0),this.setState(this.PAUSED_STATE),this.fireEvent("pause")},getCurrentTime:function(){return this.state.getCurrentTime.call(this)},getPlaybackRate:function(){return this.playbackRate},setPlaybackRate:function(a){a=a||1,this.isPaused()?this.playbackRate=a:(this.pause(),this.playbackRate=a,this.play())}},a.WebAudio.state={},a.WebAudio.state.playing={init:function(){this.addOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}},a.WebAudio.state.paused={init:function(){this.removeOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition}},a.WebAudio.state.finished={init:function(){this.removeOnAudioProcess(),this.fireEvent("finish")},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}},a.util.extend(a.WebAudio,a.Observer),a.MediaElement=Object.create(a.WebAudio),a.util.extend(a.MediaElement,{init:function(a){this.params=a,this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}},this.mediaType=a.mediaType.toLowerCase(),this.elementPosition=a.elementPosition,this.setPlaybackRate(this.params.audioRate),this.createTimer()},createTimer:function(){var a=this,b=function(){if(!a.isPaused()){a.fireEvent("audioprocess",a.getCurrentTime());var c=window.requestAnimationFrame||window.webkitRequestAnimationFrame;c(b)}};this.on("play",b)},load:function(a,b,c,d){var e=document.createElement(this.mediaType);e.controls=this.params.mediaControls,e.autoplay=this.params.autoplay||!1,e.preload=null==d?"auto":d,e.src=a,e.style.width="100%";var f=b.querySelector(this.mediaType);f&&b.removeChild(f),b.appendChild(e),this._load(e,c)},loadElt:function(a,b){var c=a;c.controls=this.params.mediaControls,c.autoplay=this.params.autoplay||!1,this._load(c,b)},_load:function(a,b){var c=this;"function"==typeof a.load&&a.load(),a.addEventListener("error",function(){c.fireEvent("error","Error loading media element")}),a.addEventListener("canplay",function(){c.fireEvent("canplay")}),a.addEventListener("ended",function(){c.fireEvent("finish")}),this.media=a,this.peaks=b,this.onPlayEnd=null,this.buffer=null,this.setPlaybackRate(this.playbackRate)},isPaused:function(){return!this.media||this.media.paused},getDuration:function(){var a=(this.buffer||this.media).duration;return a>=1/0&&(a=this.media.seekable.end(0)),a},getCurrentTime:function(){return this.media&&this.media.currentTime},getPlayedPercents:function(){return this.getCurrentTime()/this.getDuration()||0},getPlaybackRate:function(){return this.playbackRate||this.media.playbackRate},setPlaybackRate:function(a){this.playbackRate=a||1,this.media.playbackRate=this.playbackRate},seekTo:function(a){null!=a&&(this.media.currentTime=a),this.clearPlayEnd()},play:function(a,b){this.seekTo(a),this.media.play(),b&&this.setPlayEnd(b),this.fireEvent("play")},pause:function(){this.media&&this.media.pause(),this.clearPlayEnd(),this.fireEvent("pause")},setPlayEnd:function(a){var b=this;this.onPlayEnd=function(c){c>=a&&(b.pause(),b.seekTo(a))},this.on("audioprocess",this.onPlayEnd)},clearPlayEnd:function(){this.onPlayEnd&&(this.un("audioprocess",this.onPlayEnd),this.onPlayEnd=null)},getPeaks:function(b,c,d){return this.buffer?a.WebAudio.getPeaks.call(this,b,c,d):this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(a){this.media.volume=a},destroy:function(){this.pause(),this.unAll(),this.media&&this.media.parentNode&&this.media.parentNode.removeChild(this.media),this.media=null}}),a.AudioElement=a.MediaElement,a.Drawer={init:function(a,b){this.container=a,this.params=b,this.width=0,this.height=b.height*this.params.pixelRatio,this.lastPos=0,this.initDrawer(b),this.createWrapper(),this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave")),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents()},handleEvent:function(a,b){!b&&a.preventDefault();var c,d=a.targetTouches?a.targetTouches[0].clientX:a.clientX,e=this.wrapper.getBoundingClientRect(),f=this.width,g=this.getWidth();return!this.params.fillParent&&f<g?(c=(d-e.left)*this.params.pixelRatio/f||0,c>1&&(c=1)):c=(d-e.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0,c},setupWrapperEvents:function(){var a=this;this.wrapper.addEventListener("click",function(b){var c=a.wrapper.offsetHeight-a.wrapper.clientHeight;if(0!=c){var d=a.wrapper.getBoundingClientRect();if(b.clientY>=d.bottom-c)return}a.params.interact&&a.fireEvent("click",b,a.handleEvent(b))}),this.wrapper.addEventListener("scroll",function(b){a.fireEvent("scroll",b)})},drawPeaks:function(a,b,c,d){this.setWidth(b),this.params.barWidth?this.drawBars(a,0,c,d):this.drawWave(a,0,c,d)},style:function(a,b){return Object.keys(b).forEach(function(c){a.style[c]!==b[c]&&(a.style[c]=b[c])}),a},resetScroll:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0)},recenter:function(a){var b=this.wrapper.scrollWidth*a;this.recenterOnPosition(b,!0)},recenterOnPosition:function(a,b){var c=this.wrapper.scrollLeft,d=~~(this.wrapper.clientWidth/2),e=a-d,f=e-c,g=this.wrapper.scrollWidth-this.wrapper.clientWidth;if(0!=g){if(!b&&-d<=f&&f<d){var h=5;f=Math.max(-h,Math.min(h,f)),e=c+f}e=Math.max(0,Math.min(g,e)),e!=c&&(this.wrapper.scrollLeft=e)}},getScrollX:function(){return Math.round(this.wrapper.scrollLeft*this.params.pixelRatio)},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},setWidth:function(a){this.width!=a&&(this.width=a,this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"}),this.updateSize())},setHeight:function(a){a!=this.height&&(this.height=a,this.style(this.wrapper,{height:~~(this.height/this.params.pixelRatio)+"px"}),this.updateSize())},progress:function(a){var b=1/this.params.pixelRatio,c=Math.round(a*this.width)*b;if(c<this.lastPos||c-this.lastPos>=b){if(this.lastPos=c,this.params.scrollParent&&this.params.autoCenter){var d=~~(this.wrapper.scrollWidth*a);this.recenterOnPosition(d)}this.updateProgress(c)}},destroy:function(){this.unAll(),this.wrapper&&(this.container.removeChild(this.wrapper),this.wrapper=null)},initDrawer:function(){},createElements:function(){},updateSize:function(){},drawWave:function(a,b){},clearWave:function(){},updateProgress:function(a){}},a.util.extend(a.Drawer,a.Observer),a.Drawer.Canvas=Object.create(a.Drawer),a.util.extend(a.Drawer.Canvas,{createElements:function(){var a=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1,left:0,top:0,bottom:0}));if(this.waveCc=a.getContext("2d"),this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.params.waveColor!=this.params.progressColor){var b=this.progressWave.appendChild(document.createElement("canvas"));this.progressCc=b.getContext("2d")}},updateSize:function(){var a=Math.round(this.width/this.params.pixelRatio);this.waveCc.canvas.width=this.width,this.waveCc.canvas.height=this.height,this.style(this.waveCc.canvas,{width:a+"px"}),this.style(this.progressWave,{display:"block"}),this.progressCc&&(this.progressCc.canvas.width=this.width,this.progressCc.canvas.height=this.height,this.style(this.progressCc.canvas,{width:a+"px"})),this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height),this.progressCc&&this.progressCc.clearRect(0,0,this.width,this.height)},drawBars:function(b,c,d,e){var f=this;if(b[0]instanceof Array){var g=b;if(this.params.splitChannels)return this.setHeight(g.length*this.params.height*this.params.pixelRatio),void g.forEach(function(a,b){f.drawBars(a,b,d,e)});b=g[0]}var h=[].some.call(b,function(a){return a<0}),i=1;h&&(i=2);var j=.5/this.params.pixelRatio,k=this.width,l=this.params.height*this.params.pixelRatio,m=l*c||0,n=l/2,o=b.length/i,p=this.params.barWidth*this.params.pixelRatio,q=Math.max(this.params.pixelRatio,~~(p/2)),r=p+q,s=1/this.params.barHeight;if(this.params.normalize){var t=a.util.max(b),u=a.util.min(b);s=-u>t?-u:t}var v=o/k;this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(a){if(a)for(var c=d/v;c<e/v;c+=r){var f=b[Math.floor(c*v*i)]||0,g=Math.round(f/s*n);a.fillRect(c+j,n-g+m,p+j,2*g)}},this)},drawWave:function(b,c,d,e){var f=this;if(b[0]instanceof Array){var g=b;if(this.params.splitChannels)return this.setHeight(g.length*this.params.height*this.params.pixelRatio),void g.forEach(function(a,b){f.drawWave(a,b,d,e)});b=g[0]}var h=[].some.call(b,function(a){return a<0});if(!h){for(var i=[],j=0,k=b.length;j<k;j++)i[2*j]=b[j],i[2*j+1]=-b[j];b=i}var l=.5/this.params.pixelRatio,m=this.params.height*this.params.pixelRatio,n=m*c||0,o=m/2,p=~~(b.length/2),q=1;this.params.fillParent&&this.width!=p&&(q=this.width/p);var r=1/this.params.barHeight;if(this.params.normalize){var s=a.util.max(b),t=a.util.min(b);r=-t>s?-t:s}this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(a){if(a){a.beginPath(),a.moveTo(d*q+l,o+n);for(var c=d;c<e;c++){var f=Math.round(b[2*c]/r*o);a.lineTo(c*q+l,o-f+n)}for(var c=e-1;c>=d;c--){var f=Math.round(b[2*c+1]/r*o);a.lineTo(c*q+l,o-f+n)}a.closePath(),a.fill(),a.fillRect(0,o+n-l,this.width,l)}},this)},updateProgress:function(a){this.style(this.progressWave,{width:a+"px"})},getImage:function(a,b){return this.waveCc.canvas.toDataURL(a,b)}}),a.Drawer.MultiCanvas=Object.create(a.Drawer),a.util.extend(a.Drawer.MultiCanvas,{initDrawer:function(a){if(this.maxCanvasWidth=null!=a.maxCanvasWidth?a.maxCanvasWidth:4e3,this.maxCanvasElementWidth=Math.round(this.maxCanvasWidth/this.params.pixelRatio),this.maxCanvasWidth<=1)throw"maxCanvasWidth must be greater than 1.";if(this.maxCanvasWidth%2==1)throw"maxCanvasWidth must be an even number.";this.hasProgressCanvas=this.params.waveColor!=this.params.progressColor,this.halfPixel=.5/this.params.pixelRatio,this.canvases=[]},createElements:function(){this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.addCanvas()},updateSize:function(){for(var a=Math.round(this.width/this.params.pixelRatio),b=Math.ceil(a/this.maxCanvasElementWidth);this.canvases.length<b;)this.addCanvas();for(;this.canvases.length>b;)this.removeCanvas();for(var c in this.canvases){var d=this.maxCanvasWidth+2*Math.ceil(this.params.pixelRatio/2);c==this.canvases.length-1&&(d=this.width-this.maxCanvasWidth*(this.canvases.length-1)),this.updateDimensions(this.canvases[c],d,this.height),this.clearWaveForEntry(this.canvases[c])}},addCanvas:function(){var a={},b=this.maxCanvasElementWidth*this.canvases.length;a.wave=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1,left:b+"px",top:0,bottom:0})),a.waveCtx=a.wave.getContext("2d"),this.hasProgressCanvas&&(a.progress=this.progressWave.appendChild(this.style(document.createElement("canvas"),{position:"absolute",left:b+"px",top:0,bottom:0})),a.progressCtx=a.progress.getContext("2d")),this.canvases.push(a)},removeCanvas:function(){var a=this.canvases.pop();a.wave.parentElement.removeChild(a.wave),this.hasProgressCanvas&&a.progress.parentElement.removeChild(a.progress)},updateDimensions:function(a,b,c){var d=Math.round(b/this.params.pixelRatio),e=Math.round(this.width/this.params.pixelRatio);a.start=a.waveCtx.canvas.offsetLeft/e||0,a.end=a.start+d/e,a.waveCtx.canvas.width=b,a.waveCtx.canvas.height=c,this.style(a.waveCtx.canvas,{width:d+"px"}),this.style(this.progressWave,{display:"block"}),this.hasProgressCanvas&&(a.progressCtx.canvas.width=b,a.progressCtx.canvas.height=c,this.style(a.progressCtx.canvas,{width:d+"px"}))},clearWave:function(){for(var a in this.canvases)this.clearWaveForEntry(this.canvases[a])},clearWaveForEntry:function(a){a.waveCtx.clearRect(0,0,a.waveCtx.canvas.width,a.waveCtx.canvas.height),this.hasProgressCanvas&&a.progressCtx.clearRect(0,0,a.progressCtx.canvas.width,a.progressCtx.canvas.height)},drawBars:function(b,c,d,e){var f=this;if(b[0]instanceof Array){var g=b;if(this.params.splitChannels)return this.setHeight(g.length*this.params.height*this.params.pixelRatio),void g.forEach(function(a,b){f.drawBars(a,b,d,e)});b=g[0]}var h=[].some.call(b,function(a){return a<0}),i=1;h&&(i=2);var j=this.width,k=this.params.height*this.params.pixelRatio,l=k*c||0,m=k/2,n=b.length/i,o=this.params.barWidth*this.params.pixelRatio,p=Math.max(this.params.pixelRatio,~~(o/2)),q=o+p,r=1/this.params.barHeight;if(this.params.normalize){var s=a.util.max(b),t=a.util.min(b);r=-t>s?-t:s}for(var u=n/j,v=d/u;v<e/u;v+=q){var w=b[Math.floor(v*u*i)]||0,x=Math.round(w/r*m);this.fillRect(v+this.halfPixel,m-x+l,o+this.halfPixel,2*x)}},drawWave:function(b,c,d,e){var f=this;if(b[0]instanceof Array){var g=b;if(this.params.splitChannels)return this.setHeight(g.length*this.params.height*this.params.pixelRatio),void g.forEach(function(a,b){f.drawWave(a,b,d,e)});b=g[0]}var h=[].some.call(b,function(a){return a<0});if(!h){for(var i=[],j=0,k=b.length;j<k;j++)i[2*j]=b[j],i[2*j+1]=-b[j];b=i}var l=this.params.height*this.params.pixelRatio,m=l*c||0,n=l/2,o=1/this.params.barHeight;if(this.params.normalize){var p=a.util.max(b),q=a.util.min(b);o=-q>p?-q:p}this.drawLine(b,o,n,m,d,e),this.fillRect(0,n+m-this.halfPixel,this.width,this.halfPixel)},drawLine:function(a,b,c,d,e,f){for(var g in this.canvases){var h=this.canvases[g];this.setFillStyles(h),this.drawLineToContext(h,h.waveCtx,a,b,c,d,e,f),this.drawLineToContext(h,h.progressCtx,a,b,c,d,e,f)}},drawLineToContext:function(a,b,c,d,e,f,g,h){if(b){var i=c.length/2,j=1;this.params.fillParent&&this.width!=i&&(j=this.width/i);var k=Math.round(i*a.start),l=Math.round(i*a.end);if(!(k>h||l<g)){var m=Math.max(k,g),n=Math.min(l,h);b.beginPath(),b.moveTo((m-k)*j+this.halfPixel,e+f);for(var o=m;o<n;o++){var p=c[2*o]||0,q=Math.round(p/d*e);b.lineTo((o-k)*j+this.halfPixel,e-q+f)}for(var o=n-1;o>=m;o--){var p=c[2*o+1]||0,q=Math.round(p/d*e);b.lineTo((o-k)*j+this.halfPixel,e-q+f)}b.closePath(),b.fill()}}},fillRect:function(a,b,c,d){for(var e=Math.floor(a/this.maxCanvasWidth),f=Math.min(Math.ceil((a+c)/this.maxCanvasWidth)+1,this.canvases.length),g=e;g<f;g++){var h=this.canvases[g],i=g*this.maxCanvasWidth,j={x1:Math.max(a,g*this.maxCanvasWidth),y1:b,x2:Math.min(a+c,g*this.maxCanvasWidth+h.waveCtx.canvas.width),y2:b+d};j.x1<j.x2&&(this.setFillStyles(h),this.fillRectToContext(h.waveCtx,j.x1-i,j.y1,j.x2-j.x1,j.y2-j.y1),this.fillRectToContext(h.progressCtx,j.x1-i,j.y1,j.x2-j.x1,j.y2-j.y1))}},fillRectToContext:function(a,b,c,d,e){a&&a.fillRect(b,c,d,e)},setFillStyles:function(a){a.waveCtx.fillStyle=this.params.waveColor,this.hasProgressCanvas&&(a.progressCtx.fillStyle=this.params.progressColor)},updateProgress:function(a){this.style(this.progressWave,{width:a+"px"})},getImage:function(a,b){var c=[];return this.canvases.forEach(function(d){c.push(d.wave.toDataURL(a,b))}),c.length>1?c:c[0]}}),a.Drawer.SplitWavePointPlot=Object.create(a.Drawer.Canvas),a.util.extend(a.Drawer.SplitWavePointPlot,{defaultPlotParams:{plotNormalizeTo:"whole",plotTimeStart:0,plotMin:0,plotMax:1,plotColor:"#f63",plotProgressColor:"#F00",
plotPointHeight:2,plotPointWidth:2,plotSeparator:!0,plotSeparatorColor:"black",plotRangeDisplay:!1,plotRangeUnits:"",plotRangePrecision:4,plotRangeIgnoreOutliers:!1,plotRangeFontSize:12,plotRangeFontType:"Ariel",waveDrawMedianLine:!0,plotFileDelimiter:"\t"},plotTimeStart:0,plotTimeEnd:-1,plotArrayLoaded:!1,plotArray:[],plotPoints:[],plotMin:0,plotMax:1,initDrawer:function(a){var b=this;for(var c in this.defaultPlotParams)void 0===this.params[c]&&(this.params[c]=this.defaultPlotParams[c]);if(this.plotTimeStart=this.params.plotTimeStart,void 0!==this.params.plotTimeEnd&&(this.plotTimeEnd=this.params.plotTimeEnd),Array.isArray(a.plotArray))this.plotArray=a.plotArray,this.plotArrayLoaded=!0;else{var d=function(a){b.plotArray=a,b.plotArrayLoaded=!0,b.fireEvent("plot_array_loaded")};this.loadPlotArrayFromFile(a.plotFileUrl,d,this.params.plotFileDelimiter)}},drawPeaks:function(a,b,c,d){if(1==this.plotArrayLoaded)this.setWidth(b),this.splitChannels=!0,this.params.height=this.params.height/2,a[0]instanceof Array&&(a=a[0]),this.params.barWidth?this.drawBars(a,1,c,d):this.drawWave(a,1,c,d),this.params.height=2*this.params.height,this.calculatePlots(),this.drawPlots();else{var e=this;e.on("plot-array-loaded",function(){e.drawPeaks(a,b,c,d)})}},drawPlots:function(){var a=this.params.height*this.params.pixelRatio/2,b=.5/this.params.pixelRatio;this.waveCc.fillStyle=this.params.plotColor,this.progressCc&&(this.progressCc.fillStyle=this.params.plotProgressColor);for(var c in this.plotPoints){var d=parseInt(c),e=a-this.params.plotPointHeight-this.plotPoints[c]*(a-this.params.plotPointHeight),f=this.params.plotPointHeight;this.waveCc.fillRect(d,e,this.params.plotPointWidth,f),this.progressCc&&this.progressCc.fillRect(d,e,this.params.plotPointWidth,f)}this.params.plotSeparator&&(this.waveCc.fillStyle=this.params.plotSeparatorColor,this.waveCc.fillRect(0,a,this.width,b)),this.params.plotRangeDisplay&&this.displayPlotRange()},displayPlotRange:function(){var a=this.params.plotRangeFontSize*this.params.pixelRatio,b=this.plotMax.toPrecision(this.params.plotRangePrecision)+" "+this.params.plotRangeUnits,c=this.plotMin.toPrecision(this.params.plotRangePrecision)+" "+this.params.plotRangeUnits;this.waveCc.font=a.toString()+"px "+this.params.plotRangeFontType,this.waveCc.fillText(b,3,a),this.waveCc.fillText(c,3,this.height/2)},calculatePlots:function(){this.plotPoints={},this.calculatePlotTimeEnd();for(var a=[],b=-1,c=0,d=99999999999999,e=0,f=99999999999999,g=this.plotTimeEnd-this.plotTimeStart,h=0;h<this.plotArray.length;h++){var i=this.plotArray[h];if(i.value>c&&(c=i.value),i.value<d&&(d=i.value),i.time>=this.plotTimeStart&&i.time<=this.plotTimeEnd){var j=Math.round(this.width*(i.time-this.plotTimeStart)/g);if(a.push(i.value),j!==b&&a.length>0){var k=this.avg(a);k>e&&(e=k),k<f&&(f=k),this.plotPoints[b]=k,a=[]}b=j}}"whole"==this.params.plotNormalizeTo?(this.plotMin=d,this.plotMax=c):"values"==this.params.plotNormalizeTo?(this.plotMin=this.params.plotMin,this.plotMax=this.params.plotMax):(this.plotMin=f,this.plotMax=e),this.normalizeValues()},normalizeValues:function(){var a={};if("none"!==this.params.plotNormalizeTo){for(var b in this.plotPoints){var c=(this.plotPoints[b]-this.plotMin)/(this.plotMax-this.plotMin);c>1?this.params.plotRangeIgnoreOutliers||(a[b]=1):c<0?this.params.plotRangeIgnoreOutliers||(a[b]=0):a[b]=c}this.plotPoints=a}},loadPlotArrayFromFile:function(b,c,d){void 0===d&&(d="\t");var e=[],f={url:b,responseType:"text"},g=a.util.ajax(f);g.on("load",function(a){if(200==a.currentTarget.status){for(var b=a.currentTarget.responseText.split("\n"),f=0;f<b.length;f++){var g=b[f].split(d);2==g.length&&e.push({time:parseFloat(g[0]),value:parseFloat(g[1])})}c(e)}})},calculatePlotTimeEnd:function(){void 0!==this.params.plotTimeEnd?this.plotTimeEnd=this.params.plotTimeEnd:this.plotTimeEnd=this.plotArray[this.plotArray.length-1].time},avg:function(a){var b=a.reduce(function(a,b){return a+b});return b/a.length}}),a.util.extend(a.Drawer.SplitWavePointPlot,a.Observer),a.PeakCache={init:function(){this.clearPeakCache()},clearPeakCache:function(){this.peakCacheRanges=[],this.peakCacheLength=-1},addRangeToPeakCache:function(a,b,c){a!=this.peakCacheLength&&(this.clearPeakCache(),this.peakCacheLength=a);for(var d=[],e=0;e<this.peakCacheRanges.length&&this.peakCacheRanges[e]<b;)e++;for(e%2==0&&d.push(b);e<this.peakCacheRanges.length&&this.peakCacheRanges[e]<=c;)d.push(this.peakCacheRanges[e]),e++;e%2==0&&d.push(c),d=d.filter(function(a,b,c){return 0==b?a!=c[b+1]:b==c.length-1?a!=c[b-1]:a!=c[b-1]&&a!=c[b+1]}),this.peakCacheRanges=this.peakCacheRanges.concat(d),this.peakCacheRanges=this.peakCacheRanges.sort(function(a,b){return a-b}).filter(function(a,b,c){return 0==b?a!=c[b+1]:b==c.length-1?a!=c[b-1]:a!=c[b-1]&&a!=c[b+1]});var f=[];for(e=0;e<d.length;e+=2)f.push([d[e],d[e+1]]);return f},getCacheRanges:function(){for(var a=[],b=0;b<this.peakCacheRanges.length;b+=2)a.push([this.peakCacheRanges[b],this.peakCacheRanges[b+1]]);return a}},function(){var b=function(){var b=document.querySelectorAll("wavesurfer");Array.prototype.forEach.call(b,function(b){var c=a.util.extend({container:b,backend:"MediaElement",mediaControls:!0},b.dataset);b.style.display="block";var d=a.create(c);if(b.dataset.peaks)var e=JSON.parse(b.dataset.peaks);d.load(b.dataset.url,e)})};"complete"===document.readyState?b():window.addEventListener("load",b)}(),a});
//# sourceMappingURL=wavesurfer.min.js.map;// animation editor engine
// TODOS:
// o #keyframes panel: fix initValue when scrubbing
// o node module for server-side saving & loading of JSON
// o #keyframes panel: add record mode incl. button
// o load files properly on "bodyDrop"
// o refactor scene grabbing to alter view, not item pos
// o performance: use _createTrack, _createProp, and _createLayer for single elements rather than rerendering the whole panel every time
// o keyframes panel: save as animation
// o make everything undoable
// o (add node module for packaging)

var tracks   		= {};
var events 			= {};

var currentGame;

var TIME_FACTOR 	= 10;

var layerTemplate;
var keyItemTemplate;
var propItemTemplate;
var audioTemplate;

var selectionId;

var $time;
var $animationValue;

var snapKeyframes 	= new Snappables(.4);

var _playing 		= false;
var _frameDragging 	= false;
var _timeScrubbing  = false;

var _anchorViz;								// visualization item for anchor position

/* helpers for internal panel calcs */
var _asGroup = function(config) {
	return { 
		content: config,
		type: 'group'
	};
}
var _linearTolog = function(factor, min, max) {
  min = Math.log(min);
  max = Math.log(max);
  return Math.exp(min + (max-min) * factor);
}
var _decimalPlaces = function(num) {
  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max( 0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
}
var _changeProp = function(prop, value) {
	var $input = $('#properties').find('input[data-prop="' + prop + '"]');
	if(typeof value === 'boolean') {
		$input.prop('checked', value);
	} else {
		$input.val(value);
	}
}

/* basic configs for creation of inputs in property panel */
var _ANIMATABLE_COLORS = {
	saturation: {
		range: [0,1],
		type: Number
	},
	brightness: {
		range: [0,1],
		type: Number
	},
	hue: {
		range: [0,360],
		type: Number
	},
	alpha: {
		range: [0,1],
		type: Number
	}
}
var _ANIMATABLE_GEOMETRY = {
	fillColor: 		_asGroup(_ANIMATABLE_COLORS),
	strokeColor: 	_asGroup(_ANIMATABLE_COLORS),
	strokeWidth: 	{	range: [0,100], type: Number  },
};
var _ANIMATABLE_PIVOT = {
	_x: 	{ type: Number },
	_y: 	{ type: Number },
};
var _ANIMATABLE_POS = {
	x: 	{ type: Number },
	y: 	{ type: Number },
};
var _ANIMATABLE_SIZE = {
	width: 	{ type: Number },
	height: { type: Number },
};
var _ANIMATABLE_RECT = _.extend({}, _ANIMATABLE_POS, _ANIMATABLE_SIZE, {
	left: 	{ type: Number },
	top: 	{ type: Number },
	right: 	{ type: Number },
	bottom: { type: Number },
	point: 	_asGroup(_ANIMATABLE_POS),
});
var _ANIMATABLE_DEFAULTS = {
	blendMode: {
					allowedValues: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source- over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'],
					type: String
				},
	bounds: 	_asGroup(_ANIMATABLE_RECT),
	frame: 		{
					range: [0,Math.Infinity],
					type: 	Number
				},
	offsetOnPath: {
					range: [0,1],
					type: 	Number
				},
	opacity: 	{
					range: [0,1],
					type: 	Number
				},
	pivot: 		_asGroup(_ANIMATABLE_POS),
	position: 	_asGroup(_ANIMATABLE_POS),
	rotation: 	{
					range: [-360,360],
					type: 	Number
				},
	visible: 	{
					type: 	Boolean
				}
}
var ANIMATABLE_PROPERTIES = {
	Path: 		_.extend({}, _ANIMATABLE_DEFAULTS, _ANIMATABLE_GEOMETRY, {
					growth: {
						range: [0,1],
						type: Number
					},
					segments: {
						type: 	'elements'
					}
				}),
	Segment: 	_asGroup({
					point: 		_asGroup(_ANIMATABLE_PIVOT),
					handleIn: 	_asGroup(_ANIMATABLE_PIVOT),
					handleOut: 	_asGroup(_ANIMATABLE_PIVOT),
				}),
	SymbolItem: _ANIMATABLE_DEFAULTS,
	Group: 		_ANIMATABLE_DEFAULTS,
	PointText: 	_.extend({}, _ANIMATABLE_DEFAULTS, _ANIMATABLE_GEOMETRY)
}
var PANEL_TOLERANCE = 10;

var _isBoundsItem = function(item) {
	return ['PointText', 'Shape', 'PlacedSymbol', 'Raster'].indexOf(item.className) >= 0;
};
/* helper to retrieve humanly readable name from a paperJS item */
function _getAnimationName(item, property, type) {

	var fx = type && type.match(/^Danimator(.*)$/);
	fx = fx && _.lowerFirst(fx[1]);

	if(fx === 'then') fx = false;

	property = property && property.replace(/\./g, '_');
	fx = (fx || property) ? '_' + (fx || property) : '';

	return (item.name || ('layer' + item.id)) + fx;
}
/* internal helper to deselect all paperJS items and update panels accordingly */
function _resetSelection() {
	$('#layers')
		.find('.layer').removeClass('selected').end()
		.find('#layer-' + selectionId).removeClass('open');

	selectionId = false;
	currentGame.project.deselectAll();
	_anchorViz.visible = false;
	$('#properties')
		.find('.type').text('').end()
		.find('ul.main').html('<li><label>Waiting for a selection …</label></li>');
}
/* mapping all alerts to the console */
function alert(msg) 	{
	console.warn(msg);
}
/* helper to turn a string into alphachars only */
function slug(name) 	{ return name.replace(/[^a-z0-9_\-]+/g, '_'); }
function noop(anything) { return anything; };

/* jQuery helpers to get/set the boundaries of an element */
$.fn.left = function(x) {
	var $this = $(this);
	if(x) return $this.offset({ left: x });
	return $this.offset().left;
}
$.fn.right = function(x) {
	var $this = $(this);
	if(x) return $this.offset({ left: x - $this.width() });
	return $this.offset().left + $this.width();
}
$.fn.top = function(y) {
	var $this = $(this);
	if(y) return $this.offset({ top: y });
	return $this.offset().top;
}
$.fn.bottom = function(y) {
	var $this = $(this);
	if(y) return $this.offset({ top: y - $this.height() });
	return $this.offset().top + $this.height();
}

/* class to handle snapping points */
function Snappables(tolerance) {
	var self = this;
	
	self.list 		= [];
	self.tolerance 	= tolerance;

	self.add = function(snap) {
		if(!_.isArray(snap)) snap = [snap];
		self.list = _.union(self.list, snap);
		return self;
	};
	self.remove = function(snap) {
		self.list = _.pull(self.list, snap);
		return self;
	};
	self.snap = function(value) {
		var result = value;
		self.list = self.list.sort();
		_.each(self.list, function(item) {
			if(Math.abs(item - value) < self.tolerance) {
				result = item;
				return false;
			}
		});
		return result;
	};
	return self;
}

/* override animate method to add animations to animation stack for keyframes panel */
Danimator.animate = function DanimatorAnimate(item, property, fr, to, duration, options) {

	var ease 	  = (property === 'frame' ? null : 'cubicOut');
	var startTime = (options && options.delay) || 0;
	var caller 	  = arguments.callee.caller.caller.name;

	if(caller.match(/^Danimator([A-Z].*)?$/g) || caller === 'onGameStart' || !caller.length) {
		caller = 'root';
	}

	var track = tracks[item.id] || {
			item: 		item,
			properties: {},
			startTime: 	(new Date).getTime() - Danimator.startTime,
		};

	var propertyTrack 	= _.get(track.properties, property, []);
	var options 		= _.defaults(options, { delay: 0, easing: ease });

	var key = {
		from: 		fr,
		to: 		to,
		initValue: 	_.get(item, property),
		duration: 	duration || 1,
		options: 	options,
		caller: 	caller,
		name: 		_getAnimationName(item, property, Danimator.caller && Danimator.caller.name),
		id: 		propertyTrack.length
	};

	var duplicate = _.find(propertyTrack, {options: { delay: options.delay }});
	// make sure start of ani isn't existing already
	if(duplicate) {
		_.pull(propertyTrack, duplicate);
	}
	propertyTrack.push(key);

	/* calc max duration on track-level */
	track.maxDuration   = Math.max(track.maxDuration || 0, options.delay + (duration || 1));
	/* calc max duration on global level */
	Danimator.maxDuration = Math.max((Danimator.maxDuration || 0), track.maxDuration);

	track.properties[property] = propertyTrack;
	tracks[item.id] = track;

	_.debounce(_createTracks, 1000)();

	/* return handles for easier chaining of animations */
	return {
		options: options,
		then: 	 Danimator.then,
		stop: 	 noop
	};
};

/* update properties panel on every step of the animation */
Danimator.onStep = function(animatable, value) {
	if(animatable.item.id === selectionId) {
		_changeProp(animatable.property, value);
	}
}
/* update layers panel when morphing is triggered */
Danimator.onMorph = function() {
	_createLayers(Danimator.layers, $('.panel#layers ul').empty());
}

Danimator.interactive = true;

/* panel events */
jQuery(function($){

	var downPoint;
	var draggingVisibles;
	var draggingMaster;
	var playInterval;
	var lastTime;
	var lastOffset;

	var $keyframesPanel = $('#keyframes');
	var $propertiesPanel = $('#properties');

	$(document)
		/* general panel handling */
		.on('click', '.panel > label .toggle', function(event) {
			var $panel = $(this).closest('.panel');
			$panel.toggleClass('collapsed');
			/* save open state to localStorage */
			localStorage.setItem('editor-panels-' + $panel[0].id + '-collapsed', $panel.is('.collapsed'));
		})
		.on('dblclick', '.panel > label', function(event) {
			$(this).find('.toggle').click();
		})
		.on('click', '.panel li .toggleGroup', function(event) {
			$(this).closest('li').toggleClass('open');

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* layer-specific events */
		.on('click', '.panel .layer', function(event) {
			$(this).trigger($.Event('selected', {
				item: currentGame.find($(this).data('id'))
			}));

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		.on('selected', '.panel .layer', function(event) {
			var $layer 	 = $(this);
			var id 		 = $layer.data('id');
			var selected = !$layer.is('.selected');

			_resetSelection();

			event.item.fullySelected = selected;

			/* change all parent layer's selected state */
			var $allParents = $layer.parentsUntil('.main').andSelf().filter('.layer').toggleClass('selected', selected);

			// ###TODO: scroll layers to pos

			/* if human interaction triggered event open all parent layers */
			if(event.handpicked) {
				$allParents.toggleClass('open', selected);
			}

			$keyframesPanel.toggleClass('hasSelection', selected);

			if(selected) {
				selectionId = id;
				/* update title of property panel and trigger refresh */
				$propertiesPanel.find('.type').text(' OF ' + event.item.className + ' ' + (event.item.name || ''));
				_createProperties(ANIMATABLE_PROPERTIES[event.item.className], $propertiesPanel.find('ul.main').empty(), event.item);

				/* move anchor helper into position and show */
				_anchorViz.position = event.item.pivot || event.item.bounds.center;
				_anchorViz.visible = true;
			}

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* handle visibility of layers */
		.on('mousedown', '.panel .layer .visible', function(event) {
			draggingVisibles = $(this).closest('.layer').is('.hidden') + 0;
			draggingMaster   = this;
		})
		.on('mouseenter', '.panel .layer .visible:visible', function(event) {
			/* dragging across layers to hide all dragged over ones */
			if(draggingVisibles > -1) {
				var $layer = $(this).closest('.layer');
				var hidden = !$layer.is('.hidden');

				if(hidden != draggingVisibles) {
					$layer.find('.visible').click();
				}
			};
		})
		.on('mouseleave', '.panel .layer .visible', function(event) {
			if(draggingVisibles > -1) {
				if(draggingMaster === this) {
					$(this).closest('.layer').toggleClass('hidden', draggingVisibles);
				}
			};
		})
		/* toggle layer visibility */
		.on('click', '.panel .layer .visible', function(event) {
			var $layer 	= $(this).closest('.layer');
			var id 		= $layer.data('id');
			var hidden 	= !$layer.is('.hidden');

			$layer.toggleClass('hidden');
			currentGame.findAndModify(id, { visible: !hidden });

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		})
		/* keyframes time input */
		.on('blur', 'time', function(event) {
			var $this = $(this);
			var value = Number($this.text().replace(/[^\d\.\,]*/g, ''));
			if(isNaN(value)) {
				value = currentGame.time;
			} else {
				currentGame.setTime(value);
			}
			$this.text(value + 's');
		})
		/* reset time on dblclick */
		.on('dblclick', 'time', function(event) {
			$(this).text(0).trigger('blur');
		})
		/* keyframes panel zoom slider */
		.on('input', '.zoom', function(event) {
			var zoom = Danimator.limit($(this).val(), 1, 100)/100;
			var minZoom = 5;
			var maxZoom = 60;

			TIME_FACTOR = _linearTolog(1-zoom, minZoom, maxZoom);
			$(this).attr('title', parseInt(10 + (TIME_FACTOR-minZoom) / (maxZoom-minZoom) * 190) + '%');

			_createTracks();
		})
		/* reset zoom on dblclick */
		.on('dblclick', '.zoom', function(event) {
			$(this).val(50).trigger('input');
		})
		/* timeline handling */
		.on('mousedown', '.timeline .track', function(event) {

			if($(event.target).is('.keyframe')) {
				_frameDragging = true;
			}

			if(!_frameDragging) {
				_timeScrubbing = true;
				event.type = 'mousemove';
				$(this).trigger(event).addClass('scrubbing');
				$keyframesPanel.removeClass('hasSelection');
			}
		})
		/* time scrubbing */
		.on('mousemove', '.timeline .track', function(event) {
			if(!_frameDragging)
				if(_timeScrubbing) {

					var $this = $(event.currentTarget);
					var x = event.clientX - $this.offset().left - 1;
					var t = x / TIME_FACTOR;

					if(event.shiftKey) {
						t = snapKeyframes.snap(t);
					}
					currentGame && currentGame.setTime(t, $this);
				}
		})
		.on('mouseup', '.timeline .track', function(event) {
			$(this).removeClass('scrubbing');
		})
		/* select item and property of doubleclicked keyframe */
		.on('dblclick', '#keyframes .keyframe', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;

			$('#layers').find('#layer-' + item.id).not('.selected').trigger($.Event('selected', {item: item}));
			
			var $input = $('#properties').find('input[data-prop="' + prop + '"]');
			$input.parentsUntil('ul.main').filter('li').addClass('open');
			$input.focus();

			currentGame.setTime($this.data('time'));

			event.stopImmediatePropagation();
		})
		.on('dblclick', '#keyframes .track', function(event) {
			var $this 	= $(this);
			var prop 	= $this.closest('li.timeline').data('property');
			var item 	= $this.closest('li.item').data('track').item;
			var value 	= _.get(item, prop);
			var time 	= currentGame.time;

			var currentTracks = _.clone(tracks[item.id].properties[prop]);
			var isFirst = _getStartTime(currentTracks[0]) > time;
			var isLast  = _getEndTime(_.last(currentTracks)) < time;

			if(isFirst) {
				// add track from currentTime to first keyframe
				Danimator(item, prop, value, value, _getStartTime(currentTracks[0]) - time, {
					delay: time
				});
			} else if(isLast) {
				// add track from last keyframe to currentTime
				Danimator(item, prop, value, value, time - _getEndTime(_.last(currentTracks)), {
					delay: _getEndTime(_.last(currentTracks))
				});
			} else {
				var currentTrackIndex = _.findIndex(currentTracks, function(track) {
					return _.inRange(currentGame.time, _getStartTime(track), _getEndTime(track));
				});
				var currentTrack = currentTracks[currentTrackIndex];
				var lastTrack = _.get(currentTracks, currentTrackIndex-1, false);
				var nextTrack = _.get(currentTracks, currentTrackIndex-1, false);


				if(nextTrack) {
					Danimator(item, prop, value, nextTrack.from, _getStartTime(nextTrack) - time, {
						delay: time
					});
				}

				if(lastTrack)
					if(lastTrack.to != value) {
						Danimator(item, prop, lastTrack.to, value, time - _getEndTime(lastTrack), {
							delay: _getEndTime(lastTrack)
						});
				}

				if(currentTrack) {
					Danimator(item, prop, value, currentTrack.to, _getEndTime(currentTrack) - time, {
						delay: time
					});
					currentTrack.duration = time - _getStartTime(currentTrack);
					currentTrack.to 	  = value;
				}
				_createTracks();
			}
		})
		/*
		.on('click', '#keyframes .animate-btn', function(event) {
			var item = currentGame.find(selectionId);
			var track = {
				item: 		item,
				properties: {
					test: [{
						from: 	  0,
						to:  	  1,
						initValue: 0,
						duration: 1,
						options: { delay: 0.5 }
					}]
				},
				startTime: 	Danimator.startTime,
			};
			alert('Not yet implemented.');
			//tracks[item.name] = track;
			//_createTracks();
		})

		/* interactivity of property inputs */
		.on('change', '#properties :input', function() {
			var $this 	 = $(this);
			var prop  	 = $this.data('prop');
			var data 	 = $this.closest('li').data();
			var oldValue = $this.data('oldValue') || this.defaultValue;
			var value 	 = $this.is(':checkbox') ? $this.is(':checked') : $this.val();
			var item  	 = currentGame.find(selectionId);

			var index 	 = 0;
			var props 	 = {};
			var converter;

			/* use lodash's _.toString, _.toNumber, etc. depending on type */
			if(converter = _['to' + _.capitalize(data.type)]) {
				value = _['to' + _.capitalize(data.type)](value);
			}

			/* coerce to number */
			if($this.prop('type') === 'number') {
				value = Number(value);
			}

			/* if property is part of segment */
			if(index = prop.match(/^segments\.(\d+)\.(.*)/)) {
				new Undoable(function() {
					_.set( item.segments[parseInt(index[1])], index[2], value );
					_changeProp(index[2], value);
				}, function() {
					_.set(item.segments[parseInt(index[1])], index[2], oldValue);
					_changeProp(index[2], oldValue);
				}, 'change segment of ' + _getAnimationName(item));

			} else {
				props[prop] = value;

				var isPivot = !!prop.match(/^pivot\.?/);
				var isPosition = !!prop.match(/^position\.?/);

				new Undoable(function() {
					_.set(item, prop, value);
					_changeProp(prop, value);
					if(isPosition) {
						_changeProp('pivot.x', _.get(item.pivot, 'x', item.bounds.center.x));	// update property field "pivot.x"
						_changeProp('pivot.y', _.get(item.pivot, 'y', item.bounds.center.y));	// update property field "pivot.y"
					}
					if(isPivot || isPosition) _anchorViz.position = item.pivot || item.bounds.center;
				}, function() {
					_.set(item, prop, oldValue);
					_changeProp(prop, oldValue);
					if(isPosition) {
						_changeProp('pivot.x', _.get(item.pivot, 'x', item.bounds.center.x));
						_changeProp('pivot.y', _.get(item.pivot, 'y', item.bounds.center.y));
					}
					if(isPivot || isPosition) _anchorViz.position = item.pivot || item.bounds.center;
				}, 'change property ' + prop + ' of ' + _getAnimationName(item, prop));
			}

			if(data.track) {
				var currentTrack = tracks[selectionId].properties[prop][data.track.id];

				if(currentGame.time === _getStartTime(currentTrack)) {
					currentTrack.from = value;
					if(data.track.id === 0) {
						currentTrack.initValue = value;
					}
				} else {
					currentTrack.to = value;
				}
				_createTracks();
			}

			$this.data('oldValue', value);
		})
		.on('keyup', '#properties :input', function(event) {
			/* use shiftKey + arrow keys to jump in tens instead of ones */
			if(event.shiftKey) {
				var delta = 0;
				switch(event.key) {
					case 'ArrowDown':
						delta = -9;
						break;
					case 'ArrowUp':
						delta = 9;
						break;
					default: break;
				}
				if(delta !== 0) {
					var $this = $(this);
					var step  = parseFloat($this.attr('step'));
					var range = [parseFloat($this.attr('min')), parseFloat($this.attr('max'))];
					var value = parseFloat($this.val()) + step * delta;

					if(isNaN(range[0])) range[0] = -10000;
					if(isNaN(range[1])) range[1] = 10000;

					// we limit to min/max attrs and hack rounding errors by setting a limit on the decimals
					$this.val( _.round( Danimator.limit(value, range[0], range[1]), _decimalPlaces(step * 10)) ).trigger('change');
				}
			}
		})
		/* allow number manipulation using the mousewheel (with a small lag) */
		.on('mousewheel', '#properties :input', _.debounce(function(event) {
			$(this).trigger('change');
		}, 600))
		.on('dblclick', '.panel .audio', function() {
			$(this).data('wave').play();
		})
		/* all resets onMouseUp */
		.on('mouseup', function() {
			_timeScrubbing = false;
			_frameDragging = false;
			draggingVisibles = -1;
			delete draggingMaster;
			$animationValue.text('');
		})
		.on('keyup', function(event) {
			if(!$(event.target).is(':input,[contenteditable]')) {
				switch(event.key) {
					/* play/pause on spacebar */
					case ' ':
						_playing = !_playing;

						if(_playing) {
							lastTime = (new Date).getTime();
							playInterval = setInterval(function(){
								if(currentGame.time >= Danimator.maxDuration) {
									clearInterval(playInterval);
									currentGame.setTime(0);
								} else {
									var delta = ((new Date).getTime() - lastTime) / 1000;
									currentGame.setTime(currentGame.time + delta);
									lastTime = (new Date).getTime();
								}
							}, 1000/12);
						} else {
							clearInterval(playInterval);
						}
						return false;
					/* prevFrame */
					case ',':
						currentGame.setTime( Danimator.limit(currentGame.time - 1/12, 0, Danimator.maxDuration) );
						return false;
					/* nextFrame */
					case '.':
						currentGame.setTime( Danimator.limit(currentGame.time + 1/12, 0, Danimator.maxDuration) );
						return false;
					/* prevFrame * 10 */
					case ';':
						currentGame.setTime( Danimator.limit(currentGame.time - 1/2, 0, Danimator.maxDuration) );
						return false;
					/* nextFrame * 10 */
					case ':':
						currentGame.setTime( Danimator.limit(currentGame.time + 1/2, 0, Danimator.maxDuration) );
						return false;	
					/* zoomIn */
					case '+':
						currentGame.zoomBy( +.1 );
						return false;
					/* zoomOut */
					case '-':
						currentGame.zoomBy( -.1 );
						return false;
					/* zoomReset */
					case '0':
						if(event.ctrlKey || event.metaKey) {
							currentGame.zoom( 1.5 );
							return false;
						}
						break;
					case 'o':
						if(selectionId) {
							$('#properties input[data-prop=opacity]').focus()[0].select();
						}
						break;
					case 'r':
						if(selectionId) {
							$('#properties input[data-prop=rotation]').focus()[0].select();
						}
						break;
					case 'z':
						if(event.ctrlKey || event.metaKey) {
							history.back();
						}
						break;
					case 'u':
						if(event.ctrlKey || event.metaKey) {
							history.forward();
						}
						break;
				}
			} else {
				if(event.key === 'Enter') {
					/* loose focus of inputs when hitting the return key */
					$(event.target).trigger('blur');
				}
			}
		})
		/* time control with cmdKey + mousewheelX */
		.on('mousewheel', function(event) {
			if(event.metaKey) {
				var delta = { x: event.originalEvent.deltaX, y: event.originalEvent.deltaY };

				if(Math.abs(delta.x) > 0.1) {
					var time = currentGame.time + delta.x * 1/24;
					if(event.shiftKey) {
						time = snapKeyframes.snap(time);
					}
					currentGame.setTime(time);
				}

				event.preventDefault();
				event.stopImmediatePropagation();
			}
		})
		// file dropping 
		.on('dragover', 'body', function(event) { 
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#dummy').addClass('dropping'); 
		})
		.on('drop', '#dummy', function(event) { 
			event.preventDefault();

			var data = new FormData();

			_.each(event.originalEvent.dataTransfer.items, function(item){
				console.log('item', item);
			});

	        _.each(event.originalEvent.dataTransfer.files, function(file, i) {
	        	var type 	  = file.type.split('/');
	        	var extension = _.last(file.name.split('.'));
	        	var reader 	  = new FileReader();

	        	reader.onload = function(event) {
	        		currentGame.load(event.target.result);

	        		switch(type[1]) {
		        		case 'javascript':
	        				console.log('script(s) on board.', extension, file);
		        			break;
		        		case 'svg+xml':
		        			console.log('vector on board.');
		        			break;
		        		default:
		        			console.error('not found!');
		        	}
	        		//currentGame.load({svg: event.target.result});
  				};

  				if(type[0] === 'text') {
  					reader.readAsText(file);
  				} else {
  					reader.readAsBinaryString(file);
  				}
	            data.append('file_' + i, file);
	        });
			$('#dummy').removeClass('dropping'); 
		})
		.on('dragleave', '#dummy', function(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			$('#dummy').removeClass('dropping'); 	
		});
		//*/

	/* temporarily save all "reactive" DOM elements */
	layerTemplate 	 = $('template#layer-panel-item')[0].content.children[0].outerHTML;
	keyItemTemplate  = $('template#keyframe-panel-item')[0].content.children[0].outerHTML;
	propItemTemplate = $('template#property-panel-item')[0].content.children[0].outerHTML;
	audioTemplate 	 = $('template#audio-panel-item')[0].content.children[0].outerHTML;
	$time 			 = $('#keyframes .description time');
	$animationValue  = $('#keyframes .description output');
});

/* create layers (UI) for layer panel */
function _createLayers(layers, $layers) {
	var layerTmpl  = _.template(_.unescape(layerTemplate));	// create templating function from template#layer-panel-item

	_.each(layers, function(layer, index) {
		if(layer) {
			var $layer = $(layerTmpl({
							name: 			layer.name || ('[Layer ' + layer.id + ']'),
							hasChildren: 	!!(layer.children && layer.children.length),
							hidden: 		!layer.visible,
							id: 			layer.id
						})).data('id', layer.id);

			layer.data.onStateChanged = layer.data.onFrameChanged = function() {
				_createLayers(layers, $layers.empty());
			}

			/* sublayer support */
			if(layer.children && layer.children.length) {
				var $sublayers = $('<ul>').appendTo($layer);
				_createLayers(layer.children, $sublayers);
			}
			$layers.append($layer);
		}
	});
}

/* UI helpers for keyframes panel */
function _getStartTime(track) 	{ return track.options.delay; 					}
function _getEndTime(track) 	{ return _getStartTime(track) + track.duration; }

/* colorisation & gradient styles for timeline tracks in keyframes panel */
function _getStartStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

	if(propertyConfig) {
		var currentTrack = tracks[key];
		var value;

		if(_.isEqual(propertyConfig.range, [0,1])) {					// if min/max of prop between 0 and 1
			if(key === 0) {
			 	value = currentTrack.initValue;
			} else {
				value = _.get(currentTrack, 'from', tracks[key-1].to);
			}
			var color = _.repeat(parseInt(value * 15).toString(16), 3);	// show property as black/white gradient
		} else if(_.last(property.split('.')) === 'hue') {				// show hue as colored gradient
			color = new paper.Color({hue: value, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}

		return 'background:#' + color;
	} //else console.error('No config found for', property, property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'), ANIMATABLE_PROPERTIES[type]);
}
function _getRangeStyle(property, tracks, key, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

	if(propertyConfig) {

		var currentKey 	= tracks[key];
		var lastKey 	= tracks[key-1];
		var to 			= currentKey.to;
		var begin;
		var end;

		if(key === 0) {
			currentKey.from = currentKey.initValue;
		} else {
			currentKey.from = _.isNil(currentKey.from) ? lastKey.to : currentKey.from;
		}

		if(propertyConfig.range && _.isEqual(propertyConfig.range, [0,1])) {
			begin = _.repeat(parseInt(currentKey.from * 15).toString(16), 3);
			end   = _.repeat(parseInt(to * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			begin = new paper.Color({hue: currentKey.from, saturation: 1, lightness: .5}).toCSS(true).slice(1);
			end   = new paper.Color({hue: to, 			   saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}

		if(begin && end) {
			return 'background:linear-gradient(90deg,#' + begin + ',#' + end + ')';
		}
	}
}
function _getEndStyle(property, track, type) {
	var propertyConfig = _.get(ANIMATABLE_PROPERTIES[type], property.replace(/(\.\d+)?\.([^\.]+)$/, '.content.$2'));

	if(propertyConfig) {
		if(propertyConfig.range && _.isEqual(propertyConfig.range, [0,1])) {
			var color = _.repeat(parseInt(track.to * 15).toString(16), 3);
		} else if(_.last(property.split('.')) === 'hue') {
			var color = new paper.Color({hue: track.to, saturation: 1, lightness: .5}).toCSS(true).slice(1);
		}
		return 'background:#' + color;
	}
}

/* create timeline tracks (UI) for keyframes panel */
function _createTracks() {
	// create templating function from template[id=keyframe-panel-item]
	var keyItemTmpl = _.template(_.unescape(keyItemTemplate));
	var $tracks 	= $('#keyframes ul.main').empty();

	_.each(tracks, function(track) {
		if(track) {
			var properties = _.mapValues(track.properties, _.partial(_.sortBy, _, 'options.delay'));

			var $keys = $(keyItemTmpl({
					maxDuration: 	_.round(track.maxDuration, 2),
					name: 			track.item.name,
					type: 			track.item.className,
					properties: 	properties,
					TIME_FACTOR: 	TIME_FACTOR,
					getTrigger: 	function(range) { 
						switch(range.caller) {
							case '':
							case 'root':
								return '';
						}
						return ' triggered';
					}
				})).data({id: track.item.id, track: track, element: $keys });
			
			var $frames = $tracks.append($keys).find('.keyframe');

			// add all full seconds to the snapping steps of keyframes
			snapKeyframes.list = _.range(Danimator.maxDuration);

			$frames.each(function() {
				var $this = $(this);
				var y = $this.top() - 7;

				var $lastRange = $this.prev('.range');
				var $nextRange = $this.next('.range');

				// add keyframe's time to snapping steps 
				snapKeyframes.add( $this.data('time') );

				$this.draggable({ 
					containment: [ $lastRange.left() + 1, y, $nextRange.right() - 1, y],
					cursor: 'pointer',
					start: 	function() { _frameDragging = true; },
					stop: 	function() { 
						_frameDragging = false; 
						_createTracks();
					},
					drag: 	function(event, ui) { 
						_frameDragging = true;

						var index 	 		= $this.closest('.track').find('.keyframe').index($this);
						var property 		= $this.closest('li.timeline').data('property');
						var trackIndex 		= parseInt(index/2);
						var currentTrack 	= $this.closest('li.item').data('track').properties[property];
						var currentKey 		= currentTrack[trackIndex];

						var x 				= ui.position.left - 1;
						var t 				= x / TIME_FACTOR;

						/* snap to snapping points onShiftHold */
						if(event.shiftKey) {
							t = snapKeyframes.snap(t);
							x = t * TIME_FACTOR;
							ui.position.left = x + 1;
						}

						currentGame.setTime(t);

						var $nextRange 		= $this.next('.range');
						var $prevRange 		= $this.prev('.range');

						$nextRange.css({left: x});	// position "range" right after keyframe

						if(index % 2) {	// every other keyframe ends a "range"
							currentKey.duration = t - _getStartTime(currentKey);

							$prevRange.width(x+1-_getStartTime(currentKey) * TIME_FACTOR);

							if(currentTrack[trackIndex+1]) {
								$nextRange.width((_getStartTime(currentTrack[trackIndex+1]) - t) * TIME_FACTOR);
							}
						} else {
							currentKey.duration += (currentKey.options.delay - t);
							currentKey.options.delay = t;
							$prevRange.width(x+1);
							$nextRange.width(currentKey.duration * TIME_FACTOR);
						}
					}
				});
			});
		}
	});
}

/* create properties (UI) for properties panel */
function _createProperties(properties, $props, item, subitem, path) {
	var propTmpl  = _.template(_.unescape(propItemTemplate));

	// make sure path ends in dot
	path = path ? _.trim(path, '.') + '.' : '';

	_.each(properties, function(prop, name) {
		if(name !== 'type') {
			var step 	  = 1;
			var keyed  	  = [];

			/* calc step for numeric inputs */
			switch(name) {
				default:
					if(prop.range) {
						step = (prop.range[1] - prop.range[0]) / 100;
					}
					break;
				case 'frame':
				case 'rotation':
					step = 1;
					break;
			}

			/* highlighting of animated/triggered properties */
			var property 	  = path + name;
			var propertyTrack = tracks[item.id] && _.get(tracks[item.id].properties, property);

			if(propertyTrack) {
				keyed.push('animated');

				var isKey = _.find(propertyTrack, {options: { delay: currentGame.time }});

				if(!isKey) {
					isKey = _.some(propertyTrack, function(track) {
						return _getEndTime(track) === currentGame.time;
					});
				}
				
				/* add "keyed" class if currentTime corresponds to the current keyframe's time */
				if(isKey) keyed.push('keyed');

				if(_.reject(propertyTrack, { caller: 'root' }).length) {
					keyed.push('triggered');
				}
			}

			/* actual creation of property visualization */
			var config = _.extend({}, { 
							name: 		name + '',
							item: 		item,
							path: 		path,
							keyed:  	keyed,
							range: 		['', ''],
							step: 		step,
							type: 		prop.type,
							value: 		_.get(subitem || item, name)
						}, prop);
			var $prop = $(propTmpl(config)).data('track', _.first(propertyTrack));

			/* special case for Segments and other "subelements" of items */
			if(config.type === 'elements') {
				var elements = {};

				_.each(_.get(subitem || item, name), function(element, key) {
					elements[key] = ANIMATABLE_PROPERTIES[element.className];
				});

				config.content = elements;
				config.type = 'group';
			}

			if(config.type === 'group') {
				var $subprops = $('<ul>').appendTo($prop);
				_createProperties(config.content, $subprops, item, _.get(item, name), property);
			}
			$props.append($prop);
		}
	});
}

/* create waves (UI) for audio panel */
function _createAudio() { 
	var $sounds 	= $('.panel#audio').find('ul.main').empty();
	var audioTmpl 	= _.template(_.unescape(audioTemplate));
	var wave 		= false;

	_.each(Danimator.sounds, function(sound, name) {
		var config = {
			container: 		'#audio_' + slug(name),
			cursorColor: 	'crimson',
			fillParent: 	false,
			loop: 			sound.get('loop'),
			height: 		40,
			width: 			200,
			minPxPerSec: 	80,
			normalize: 		true,
			progressColor: 	'crimson',
			waveColor: 		'white'
		};
		var $sound = $(audioTmpl({
			name: name,
			id: 'audio_' + slug(name)
		}));

		$sounds.append($sound);

		wave = WaveSurfer.create(config);
		var currentWave = wave;

		wave.on('finish', function(event) { 
			currentWave.seekTo(0); 
			
			if(config.loop) {
				if(!Danimator.sounds[name].stopped) {
					currentWave.play();
				}
			}
		});

		wave.on('seek', function(progess, stuff) {
			if(!_timeScrubbing) {
				currentGame.setTime( currentWave.getCurrentTime() );
			}
		});

		if(sound === Danimator._activeSound) {
			currentWave.on('ready', function() { 
				currentWave.play();
			});
		}

		wave.load('audio/' + name);
		$sound.data('wave', wave);
	});

	if(wave) {
		
	}
}

Danimator.onSound = _.debounce(_createAudio, 100);

/* game engine for loading SVG skeletons, extended to editing capabilities */
Game.onLoad = function(project, name, options, scene, container) {

	var self = this;
	currentGame = self;

	self.time = 0;

	self.setTime = function(seconds, $target) {
		var time = Math.max(seconds, 0);

		self.time = time;

		var $inputs = $('#properties').find('li').removeClass('keyed');

		/* update all scrubbes */
		$('.timeline .scrubber').each(function(){
			var $scrubber 	= $(this);
			var data 		= $scrubber.closest('li.item').data();
			var property 	= $scrubber.closest('li.timeline').data('property');
			var currentTrack;

			$time.text(_.round(time, 2) + 's');
			$scrubber.css('left', time * TIME_FACTOR);

			var allTracks = tracks[data.id].properties[property];

			/* retrieve all tracks before current time and sort them chronologically */
			currentTracks = _.sortBy(_.filter(allTracks, function(track) {
				return track.options.delay <= time + _.get(track.options, 'frameDuration', 1/24);
			}), 'options.delay');

			/* find track that encompasses current time */
			_.each(currentTracks, function(track, id) {
				if(_.inRange(time, _getStartTime(track), _getEndTime(track) + _.get(track.options, 'frameDuration', 1/24))) {
					currentTrack = track;
					currentTrack.id = id;
					return false;
				}
			});

			var $track  	= $scrubber.closest('.track');
			var hasActives 	= false;
			$track.find('.keyframe').removeClass('active');

			/* highlight the keyframe that corresponds to the current time */
			if(currentTrack) {
				var isFirstFrame = (time - _getStartTime(currentTrack)) <= 0.05;
				var isLastFrame  = (_getEndTime(currentTrack) - time)   <= 0;

				if(isFirstFrame) {
					$track.find('.keyframe').eq( currentTrack.id * 2 ).addClass('active');
				} else if(isLastFrame) {
					$track.find('.keyframe').eq( currentTrack.id * 2 + 1).addClass('active');
				}

				hasActives = isFirstFrame || isLastFrame;
			} else {
				currentTrack = _.maxBy(allTracks, 'options.delay');
			}

			/* update current track in animation panel and property in properties panel */
			if(currentTrack) {
				var startTime 	= _getStartTime(currentTrack);
				var endTime 	= _getEndTime(currentTrack);
				var t 			= Math.max((time - startTime) / (endTime - startTime), 0);

				currentTrack.item 		= tracks[data.id].item;
				currentTrack.property 	= property;

				if(hasActives) {
					if(data.id === selectionId) {
						$inputs.find('input[data-prop="' + property + '"]').parent().addClass('keyed');
					}
				}

				var ani = Danimator.step(currentTrack, t);

				if($target && $target.length)
					if($.contains($target[0], $scrubber[0])) {
						$animationValue.text(property + ' = ' + _.round(ani.value,2));
					}
			}
		});

		_timeScrubbing = true;
		/* update all sounds */
		$('#audio .audio').each(function(){
			$(this).data('wave').seekTo(time);
		});
		_timeScrubbing = false;

		self.time = time;
	}

	self.find = function(id) {
		return self.container.getItem({ id: id });
	};

	self.findAndModify  = function(id, props) {
		return self.find(id).set(props);
	};

	self.onZoom = function(by) {
		_anchorViz.scale( 1/by );
	}

	var layers = Danimator.layers = self.scene.slice(0).reverse();
	var $borderDummy = $('#border-dummy');
	var _hoverClone;
	var _hoverItem;

	var _clearHover = function() {
		if(_hoverItem !== undefined) {
			_hoverItem.remove();
			_hoverItem = undefined;
		}
		paper.view.update();
	}

	/* hover effect for paper elements */
	project.view.onMouseMove = function(event) {
		var hover = project.hitTest(event.point);

		if(false)
		if(hover) {
			if(hover.item !== _hoverItem) _clearHover();

			if(_hoverItem === undefined && hover.item.selected === false) {
				_hoverClone = hover.item.clone({ insert: true });
				_hoverClone.guide = true;
				_hoverClone.opacity = 1;
				_hoverClone.strokeWidth = 1/project.view.zoom;
				_hoverClone.strokeColor = '#009dec';
				_hoverClone.fillColor = null;
				_hoverClone.bringToFront();
				_hoverItem = hover.item;
			}
		} else _clearHover();
		//console.log('event', event);
	}

	/* selection of elements (by clicking them) */
	project.view.onMouseDown = function onCanvasMouseDown(event) {
		if(!(event.event.altKey || event.event.metaKey)) {
			if(!isNaN(event.target.id)) {
				$('#layer-' + event.target.id).trigger($.Event('selected', { item: event.target, handpicked: true }));
			}
			else _resetSelection();
		} else {
			event.event.preventDefault();
			event.event.stopImmediatePropagation();
		}
	};
	/* allow moving of canvas when commandKey is held */
	project.view.onMouseDrag = function onCanvasMouseDrag(event) {
		if(event.event.metaKey) {
			if(selectionId) {
				var selectedItem = self.find(selectionId);
				selectedItem.position = selectedItem.position.add(event.delta);

				if(selectedItem.pivot) {
					_changeProp('pivot.x', selectedItem.pivot.x);
					_changeProp('pivot.y', selectedItem.pivot.y);
					_anchorViz.position = selectedItem.pivot;
				} else {
					_anchorViz.position = selectedItem.bounds.center;
				}

				_changeProp('pivot.x', _anchorViz.position.x);
				_changeProp('pivot.y', _anchorViz.position.y);

				_changeProp('position.x', selectedItem.position.x);
				_changeProp('position.y', selectedItem.position.y);
			} else {
				self.container.position = self.container.position.add(event.delta);
			}

			event.event.preventDefault();
			event.event.stopImmediatePropagation();
		}
	};

	/* setup and event handlers for visualization of anchor (pivot) point */
	_anchorViz = new paper.Group([
		new paper.Path.Circle({
			center: 		project.view.center,
			radius: 		2,
			strokeWidth: 	2.5,
			strokeColor: 	'rgba(127,127,127,.4)',
			fillColor: 		'rgba(255,255,255,.4)',
		}),
		new paper.Path.Circle({
			center: 		project.view.center,
			radius: 		2,
			strokeColor: 	'cyan'
		}),
		new paper.Path.Line({
			from: 	project.view.center.subtract(new paper.Point(0, 2)), 
			to: 	project.view.center.subtract(new paper.Point(0, 4)),
			strokeColor: 	'cyan'
		}),
		new paper.Path.Line({
			from: 	project.view.center.add(new paper.Point(0, 2)), 
			to: 	project.view.center.add(new paper.Point(0, 4)),
			strokeColor: 	'cyan'
		}),
		new paper.Path.Line({
			from: 	project.view.center.subtract(new paper.Point(2, 0)), 
			to: 	project.view.center.subtract(new paper.Point(4, 0)),
			strokeColor: 	'cyan'
		}),
		new paper.Path.Line({
			from: 	project.view.center.add(new paper.Point(2, 0)), 
			to: 	project.view.center.add(new paper.Point(4, 0)),
			strokeColor: 	'cyan'
		})
	]);
	_anchorViz.visible = false;
	_anchorViz.data._scale = 1;

	_anchorViz.onMouseDown = function(event) {
		if(event.event.altKey) {
			this.data.oldPosition = event.point; 
		}
	};

	_anchorViz.onMouseDrag = function(event) {
		/* move anchor point onAltKey */
		if(event.event.altKey) {
			this.position = event.point;
			currentGame.findAndModify(selectionId, { pivot: this.position });
			_changeProp('pivot.x', this.position.x);
			_changeProp('pivot.y', this.position.y);
		}
	};

	_anchorViz.onMouseUp = function(event) {
		var item = this;

		if(event.event.altKey)
			new Undoable(function(){ 
				item.position = event.point;
				currentGame.findAndModify(selectionId, { pivot: item.position });
			}, function(){ 
				if(item.data.oldPosition) {
					item.position = item.data.oldPosition;
					currentGame.findAndModify(selectionId, { pivot: item.position });
				}
			}, 'setting pivot of ' + _getAnimationName(currentGame.find(selectionId)), true);
	};

	self.container.appendTop(_anchorViz);

	self.onZoom(1);

	_createLayers(layers, $('.panel#layers ul').empty());

	/* initialize panels! */
	$('.panel').each(function() {
		var $panel = $(this);
		var collapsed = localStorage.getItem('editor-panels-' + this.id + '-collapsed');

		$panel
			.draggable({ 
				handle: 		'>label', 
				containment: 	[0, 0, $(window).width() - $panel.width(), $(window).height() - $panel.height()],
				stop: 			function() {
					localStorage.setItem('editor-panels-' + $panel[0].id + '-pos', JSON.stringify($panel.offset()));
				}
			})
			.toggleClass('collapsed', collapsed == 'true');

		var pos = localStorage.getItem('editor-panels-' + $panel[0].id + '-pos');
		if(pos = pos && JSON.parse(pos)) {
			$panel.css(pos);
		}
	});

	$('body').addClass('ready');

	return this;
}