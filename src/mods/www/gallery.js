var curFile = null;
var $divShow = $('<div class="show"></div>');
var $divClose = $('<div class="close" onclick="hideFile()">X</div>');
var $vid = $('<video class="show" loop="true" crossOrigin="anonymous" autoplay playsinline></video>');
var $img = $('<img class="show" />');
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
function hideFile() {
	$('body, body > div').removeClass('stop-scrolling');
	G.stopRenderLoop();
	G.disposePreviousMaterials();
	$divShow.remove();
	$vid[0].src = '';
	$img[0].src = '';
	curFile = null;
	if (document.fullscreenElement) document.exitFullscreen();
}
function showFile(thiz, type) {
	hideFile();
	$divShow.empty();
	$divShow.append($divClose);
	var is360 = true;
	if (typeof thiz == 'string') {
		var textureSource = type.startsWith('image') ?
			   $('<img src="' + thiz + '" />')[0] :
			   $('<video src="' + thiz + '" loop="true" crossOrigin="anonymous" autoplay playsinline></video>')[0];
		$divShow.append(textureSource);
	} else {
		curFile = thiz;
		var is360 = curFile.parentNode.getAttribute('fname').startsWith("360");
		var isVideo = curFile.tagName == 'VIDEO';
		var textureSource = null;
		if (isVideo) {
			if (curFile.readyState === 4) {
				$divShow.append($vid);
				$vid[0].src = curFile.src;
				textureSource = $vid[0];
			} else { // download instead
				alert("Video not loaded. Please try downloading file instead.");
				return;
			}
		} else {
			$img[0].src = curFile.src.replace("thumbfile", "getfile");
			textureSource = $img[0];
			$divShow.append($img);
		}
	}
	
	$('body, body > div').addClass('stop-scrolling');
	$divShow.appendTo(document.body);
			
	if (is360) {
		G.container = $divShow[0];
		G.init();
		G.setTextureSource(textureSource);
	}
	document.body.requestFullscreen();
}