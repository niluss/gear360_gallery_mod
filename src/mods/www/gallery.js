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
}
function showFile(thiz) {
	hideFile();
	curFile = thiz;
	$divShow.empty();
	$divShow.append($divClose);
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
	
	$('body, body > div').addClass('stop-scrolling');
	$divShow.appendTo(document.body);
			
	if (is360) {
		G.container = $divShow[0];
		G.init();
		G.setTextureSource(textureSource);
	}
}
$(document).ready(function() {
	$('div[filename]').each(function() {
		var thiz = $(this);
		var filename = thiz.attr('filename');
		var filepath = thiz.attr('filepath');
		var filetime = thiz.attr('filetime');
		thiz.text('');
		thiz.attr('class', 'inline');
		if (filename.toLowerCase().endsWith("jpg")) {
			$('<div class="box" fname="'+filename+'"><img src="?thumbfile='+filepath+'" onclick="showFile(this)" /></div><a class="smalltext" href="?getfile='+filepath+'">'+filename+'<br/>'+filetime+' Kb</a>').appendTo(this);
		} else {
			$('<div class="box" fname="'+filename+'"><video src="?vidfile='+filepath+'" preload="metadata" onclick="showFile(this)" /></div><a class="smalltext" href="?getfile='+filepath+'">'+filename+'<br/>'+filetime+' Kb</a>').appendTo(this);
		}
		$('<a class="del" href="?rmfile='+filepath+'">DELETE</a>').appendTo(this);
	});
});