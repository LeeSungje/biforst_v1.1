function executeSetInterval(func, delay){
  func();
  setInterval(func,delay);
}

var sound_status = 1; //Sound ON
var audio = "<audio autoplay loop class=\"audio\" src='/alert_sound.mp3'></audio>";

function changeStatus(){
	
	if(sound_status == 1){ //Sound ON이면
		sound_status = 0; //OFF으로
		document.getElementById('speaker').src='/mute.png'; //mute 이미지로 바꾸기
		
		$(".mssList-container").find(".audio").remove(); //알람 소리 제거
	}
	
	else{ //Sound OFF면
		sound_status = 1; //ON으로
		document.getElementById('speaker').src='/speaker2.png';
		
		if(document.getElementsByClassName("alarm-twinkle").length > 0) 
		{
			$(".mssList-container").append(audio);
		}
	}
	
}


function play_audio(){
	
	if(document.getElementsByClassName("alarm-twinkle").length > 0 && sound_status==1) 
	{
		$(".mssList-container").append(audio);
	}
} 

function pause_audio(){
	$(".mssList-container").find(".audio").remove();
}

function ajaxShowSystemDetail(url){
	  $.ajax({
	    url: url,
	    type: "GET"
	  })
	  .done(function(data){
	    var json = JSON.parse(data);
	    //fallback(0)
	    var system_name = json.result[0].system_name;
	    var system_type = json.result[0].system_type;
	    var zone = json.result[0].zone;
	    var curSess = json.result[0].curSess;
	    var totSess = json.result[0].totSess;
	    var curTps = json.result[0].curTps;
	    var totTps = json.result[0].totTps;
	    
	    //fallback(1) Zone별 요약 정보
	    var curACnt = json.result[1].curACnt;
		var totACnt = json.result[1].totACnt;
		var curASess = (json.result[1].curASess/10000).toFixed(1);
		var totASess = Math.round(json.result[1].totASess/10000);
		var curATps = Math.round(json.result[1].curATps);
		var totATps = Math.round(json.result[1].totATps);
		
		var curBCnt = json.result[2].curBCnt;
		var totBCnt = json.result[2].totBCnt;
		var curBSess = (json.result[2].curBSess/10000).toFixed(1);
		var totBSess = Math.round(json.result[2].totBSess/10000);
		var curBTps = Math.round(json.result[2].curBTps);
		var totBTps = Math.round(json.result[2].totBTps);
		
		var curBKCnt = json.result[3].curBKCnt;
		var totBKCnt = json.result[3].totBKCnt;
		var curBKSess = (json.result[3].curBKSess/10000).toFixed(1);
		var totBKSess = Math.round(json.result[3].totBKSess/10000);
		var curBKTps = Math.round(json.result[3].curBKTps);
		var totBKTps = Math.round(json.result[3].totBKTps);
		
		
		//fallback(4) 알람 표시
		var rm_sys_name = json.result[4].system_name;
		
	    $(".mssList-container").find(".sys-detail-value").remove();   
	    $(".mssList-container").find(".col-sm-6").remove();
	    $(".mss-detail-box").removeClass("alarm-twinkle");
	    
		pause_audio();
		
	    //fallback(0) Zone별 시스템 출력
	    system_type.forEach(function(e,index){
			if(zone[index] == 'A'){
				  var format_html= "<div class=\"col-sm-6 \">"+
					"<div class=\"mss-detail-box align-middle\">"+
				    "<div id=\"system-name-A\" class=\"sys-detail-name\"></div>"+
				    "<span id=\"curSysSessContainerA\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysSessContainerA\"></span>"+
				    "<span id=\"curSysTpsContainerA\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysTpsContainerA\"></span></div>";
				    
				  $("#azone").append(format_html);
					
			      $("#system-name-A").attr('id', "system-name-A"+system_name[index]);
			      $("#curSysSessContainerA").attr('id', "curSysSessContainerA"+system_name[index]);
			      $("#totSysSessContainerA").attr('id', "totSysSessContainerA"+system_name[index]);
			      $("#curSysTpsContainerA").attr('id', "curSysTpsContainerA"+system_name[index]);
			      $("#totSysTpsContainerA").attr('id', "totSysTpsContainerA"+system_name[index]);
			      
			      $("#system-name-A"+system_name[index]).parents(".mss-detail-box").attr("onclick", "location.href=\"/mss-list/" + system_name[index]+"\"" );
			   
			      var system_nameAddHtml = "<span class='sys-detail-value'>"+system_name[index]+"</span>"; 
			      var curSessAddHtml = "<span class='sys-detail-value'>"+curSess[index]+"</span>";
			      var totSessAddHtml = "<span class='sys-detail-value'>"+totSess[index]+"만</span>";
			      var curTpsAddHtml = "<span class='sys-detail-value'>"+curTps[index]+"</span>";
			      var totTpsAddHtml = "<span class='sys-detail-value'>"+totTps[index]+"TPS</span>";
			      
			      $("#system-name-A"+system_name[index]).append(system_nameAddHtml);
			      $("#curSysSessContainerA"+system_name[index]).append(curSessAddHtml);
			      $("#totSysSessContainerA"+system_name[index]).append(totSessAddHtml);
			      $("#curSysTpsContainerA"+system_name[index]).append(curTpsAddHtml);
			      $("#totSysTpsContainerA"+system_name[index]).append(totTpsAddHtml);
			}
			else if(zone[index] == 'B'){
				  var format_html= "<div class=\"col-sm-6 sys-detail-container\">"+
					"<div class=\"mss-detail-box align-middle\">"+
				    "<div id=\"system-name-B\" class=\"sys-detail-name\"></div>"+
				    "<span id=\"curSysSessContainerB\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysSessContainerB\"></span>"+
				    "<span id=\"curSysTpsContainerB\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysTpsContainerB\"></span></div>";
			
				  $("#bzone").append(format_html);
				
			      $("#system-name-B").attr('id', "system-name-B"+system_name[index]);
			      $("#curSysSessContainerB").attr('id', "curSysSessContainerB"+system_name[index]);
			      $("#totSysSessContainerB").attr('id', "totSysSessContainerB"+system_name[index]);
			      $("#curSysTpsContainerB").attr('id', "curSysTpsContainerB"+system_name[index]);
			      $("#totSysTpsContainerB").attr('id', "totSysTpsContainerB"+system_name[index]);
			      
			      $("#system-name-B"+system_name[index]).parents(".mss-detail-box").attr("onclick", "location.href=\"/mss-list/" + system_name[index]+"\"" );
			   
			      var system_nameAddHtml = "<span class='sys-detail-value'>"+system_name[index]+"</span>"; 
			      var curSessAddHtml = "<span class='sys-detail-value'>"+curSess[index]+"</span>";
			      var totSessAddHtml = "<span class='sys-detail-value'>"+totSess[index]+"만</span>";
			      var curTpsAddHtml = "<span class='sys-detail-value'>"+curTps[index]+"</span>";
			      var totTpsAddHtml = "<span class='sys-detail-value'>"+totTps[index]+"TPS</span>";
			      
			      $("#system-name-B"+system_name[index]).append(system_nameAddHtml);
			      $("#curSysSessContainerB"+system_name[index]).append(curSessAddHtml);
			      $("#totSysSessContainerB"+system_name[index]).append(totSessAddHtml);
			      $("#curSysTpsContainerB"+system_name[index]).append(curTpsAddHtml);
			      $("#totSysTpsContainerB"+system_name[index]).append(totTpsAddHtml);
			}
			else if(zone[index] == 'BK'){
				  var format_html= "<div class=\"col-sm-6 sys-detail-container\">"+
					"<div class=\"mss-detail-box align-middle\">"+
				    "<div id=\"system-name-BK\" class=\"sys-detail-name\"></div>"+
				    "<span id=\"curSysSessContainerBK\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysSessContainerBK\"></span>" +
				    "<span id=\"curSysTpsContainerBK\"></span>" +
				    "<span class=\"sys-detail-delimiter\">&nbsp/&nbsp</span>" + 
				    "<span id=\"totSysTpsContainerBK\"></span></div>";
			
				  $("#bkzone").append(format_html);
				
			      $("#system-name-BK").attr('id', "system-name-BK"+system_name[index]);
			      $("#curSysSessContainerBK").attr('id', "curSysSessContainerBK"+system_name[index]);
			      $("#totSysSessContainerBK").attr('id', "totSysSessContainerBK"+system_name[index]);
			      $("#curSysTpsContainerBK").attr('id', "curSysTpsContainerBK"+system_name[index]);
			      $("#totSysTpsContainerBK").attr('id', "totSysTpsContainerBK"+system_name[index]);
			      
			      $("#system-name-BK"+system_name[index]).parents(".mss-detail-box").attr("onclick", "location.href=\"/mss-list/" + system_name[index]+"\"" );
			   
			      var system_nameAddHtml = "<span class='sys-detail-value'>"+system_name[index]+"</span>"; 
			      var curSessAddHtml = "<span class='sys-detail-value'>"+curSess[index]+"</span>";
			      var totSessAddHtml = "<span class='sys-detail-value'>"+totSess[index]+"만</span>";
			      var curTpsAddHtml = "<span class='sys-detail-value'>"+curTps[index]+"</span>";
			      var totTpsAddHtml = "<span class='sys-detail-value'>"+totTps[index]+"TPS</span>";
			      
			      $("#system-name-BK"+system_name[index]).append(system_nameAddHtml);
			      $("#curSysSessContainerBK"+system_name[index]).append(curSessAddHtml);
			      $("#totSysSessContainerBK"+system_name[index]).append(totSessAddHtml);
			      $("#curSysTpsContainerBK"+system_name[index]).append(curTpsAddHtml);
			      $("#totSysTpsContainerBK"+system_name[index]).append(totTpsAddHtml);
			}
	    });
	    
	    //fallback(1) Zone 별 종합 정보 
	    var curAcntAddHtml = "<span class='sys-detail-value'>"+curACnt+"</span>"; 
	    var totAcntAddHtml = "<span class='sys-detail-value'>"+totACnt+"</span>";
	    var curASessAddHtml = "<span class='sys-detail-value'>"+curASess+"</span>";
	    var totASessAddHtml = "<span class='sys-detail-value'>"+totASess+"</span>";
	    var curATpsAddHtml = "<span class='sys-detail-value'>"+curATps+"</span>";
	    var totATpsAddHtml = "<span class='sys-detail-value'>"+totATps+"</span>";
	    $("#curAcnt").append(curAcntAddHtml);
	    $("#totAcnt").append(totAcntAddHtml);
	    $("#curASess").append(curASessAddHtml);
	    $("#totASess").append(totASessAddHtml);
	    $("#curATps").append(curATpsAddHtml);
	    $("#totATps").append(totATpsAddHtml);
	    
	    var curBcntAddHtml = "<span class='sys-detail-value'>"+curBCnt+"</span>"; 
	    var totBcntAddHtml = "<span class='sys-detail-value'>"+totBCnt+"</span>";
	    var curBSessAddHtml = "<span class='sys-detail-value'>"+curBSess+"</span>";
	    var totBSessAddHtml = "<span class='sys-detail-value'>"+totBSess+"</span>";
	    var curBTpsAddHtml = "<span class='sys-detail-value'>"+curBTps+"</span>";
	    var totBTpsAddHtml = "<span class='sys-detail-value'>"+totBTps+"</span>";
	    $("#curBcnt").append(curBcntAddHtml);
	    $("#totBcnt").append(totBcntAddHtml);
	    $("#curBSess").append(curBSessAddHtml);
	    $("#totBSess").append(totBSessAddHtml);
	    $("#curBTps").append(curBTpsAddHtml);
	    $("#totBTps").append(totBTpsAddHtml);
	    
	    var curBKcntAddHtml = "<span class='sys-detail-value'>"+curBKCnt+"</span>"; 
	    var totBKcntAddHtml = "<span class='sys-detail-value'>"+totBKCnt+"</span>";
	    var curBKSessAddHtml = "<span class='sys-detail-value'>"+curBKSess+"</span>";
	    var totBKSessAddHtml = "<span class='sys-detail-value'>"+totBKSess+"</span>";
	    var curBKTpsAddHtml = "<span class='sys-detail-value'>"+curBKTps+"</span>";
	    var totBKTpsAddHtml = "<span class='sys-detail-value'>"+totBKTps+"</span>";
	    $("#curBKcnt").append(curBKcntAddHtml);
	    $("#totBKcnt").append(totBKcntAddHtml);
	    $("#curBKSess").append(curBKSessAddHtml);
	    $("#totBKSess").append(totBKSessAddHtml);
	    $("#curBKTps").append(curBKTpsAddHtml);
	    $("#totBKTps").append(totBKTpsAddHtml);
	    
	    //fallback(4) -- 알람 표시
	    for(var index in rm_sys_name){
	        var statusClass = "";
	        var statusText = "";
	        
	        if(rm_sys_name[index] != null){ 
	      	  $("#system-name-A"+rm_sys_name[index]).parents(".mss-detail-box").addClass("alarm-twinkle");
	      	  $("#system-name-B"+rm_sys_name[index]).parents(".mss-detail-box").addClass("alarm-twinkle");
	          $("#system-name-BK"+rm_sys_name[index]).parents(".mss-detail-box").addClass("alarm-twinkle");
	        }
	        //$("#skt-map-center-"+site).find(".skt-map-status-btn").text(statusText);
	      }

		play_audio();

	  });
}
	  

(function($){
	  "use strict";
	  
	  const _PERIOD_ = 1000*60;
	  
	  executeSetInterval(function(){
		  ajaxShowSystemDetail("/api/v1/mss-list");
	    }, _PERIOD_);
})(jQuery);