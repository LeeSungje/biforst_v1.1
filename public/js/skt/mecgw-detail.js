function getDateTime(){
    var date = new Date();
	let day = (date.getDate()<10? '0' : '')+date.getDate();
	let month = ((date.getMonth()+ 1)<10? '0':'')+(date.getMonth()+1);
	let year = date.getFullYear();
	let hours = (date.getHours()<10? '0' : '')+date.getHours();
	let minutes = (date.getMinutes()<10? '0' : '')+date.getMinutes();
	let seconds = (date.getSeconds()<10? '0' : '')+date.getSeconds();
	
	return (year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
}

function getPrevDateTime(){
	let PrevTime = new Date();
	PrevTime.setMinutes(PrevTime.getMinutes()-5);
	
	let day = (PrevTime.getDate()<10? '0' : '')+PrevTime.getDate();
	let month = ((PrevTime.getMonth()+ 1)<10? '0':'')+(PrevTime.getMonth()+1);
	let year = PrevTime.getFullYear();
	let hours = (PrevTime.getHours()<10? '0' : '')+PrevTime.getHours();
	let minutes = (PrevTime.getMinutes()<10? '0' : '')+PrevTime.getMinutes();
	let seconds = (PrevTime.getSeconds()<10? '0' : '')+PrevTime.getSeconds();
	
	return (year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
}

var sound_status = 1; //Sound ON
var audio = "<audio autoplay loop class=\"audio\" src='/alert_sound.mp3'></audio>";

function executeSetInterval(func, delay){
  func();
  setInterval(func,delay);
}

function drawPieChart(data1, data2, elementId){
	var config = {
    		type: 'doughnut',
            data: {
              labels: ["Remain","Using"],
              datasets: [
                {
                  //label: "Population (millions)",
                  backgroundColor: ["#3cba9f","#c45850"],
                  data: [(data2-data1).toFixed(1), data1]
                }
              ]
            },
            options: {
              //responsive: true,
              legend: {		
            	 position: 'mid',
              },
              title: {
                display: true,
                text: (data1/data2*100).toFixed(1)+"%"
              }
            }
    }
	new Chart($("."+elementId), config);
}

function changeStatus(){
	
	if(sound_status == 1){ //Sound ON이면
		sound_status = 0; //OFF으로
		document.getElementById('speaker').src='/mute.png'; //mute 이미지로 바꾸기
		
		$(".ims-container").find(".audio").remove(); //알람 소리 제거
	}
	
	else{ //Sound OFF면
		sound_status = 1; //ON으로
		document.getElementById('speaker').src='/speaker2.png';
		
		if(document.getElementsByClassName("alarm-twinkle").length > 0) 
		{
			$(".ims-container").append(audio);
		}
	}
	
}


function play_audio(){
	
	if(document.getElementsByClassName("alarm-twinkle").length > 0 && sound_status==1) 
	{
		$(".ims-container").append(audio);
	}
} 

function pause_audio(){
	$(".ims-container").find(".audio").remove();
}

function ajaxShowMECGWDetail(url){
	  $.ajax({
	    url: url,
	    type: "GET"
	  })
	  .done(function(data){
		var sys_num = $("#inputCurrentSystem").attr("val");
		var json = JSON.parse(data);
		 
		//fallback(0) 상면, 가입자수 DATA Query
		var system_namef0 = json.result[0].system_name;
		var system_typef0 = json.result[0].system_type;
		var building = json.result[0].building;
		var floor_plan = json.result[0].floor_plan;
	    var curSess = json.result[0].curSess;
	    var totSess = json.result[0].totSess;
	    var curBps = json.result[0].curBps;
	    var totBps = json.result[0].totBps;
	    
		//fallback(1) 통계 DATA Query
		var system_namef1 = json.result[1].system_name;
		var system_typef1 = json.result[1].system_type;
	    var date = json.result[1].date;
	    var time = json.result[1].time;
		var type = json.result[1].type;
		var succ_rate = json.result[1].succ_rate;
		var att = json.result[1].att;
		
		//fallback(2) 알람 data Query
	    var system_name_f2 = json.result[2].system_name;
	    var date_f2 = json.result[2].date;
	    var time_f2 = json.result[2].time;
	    var sys_sub_name_f2 = json.result[2].sys_sub_name;
	    var type_f2 = json.result[2].type;
	    var code_f2 = json.result[2].code;
	    
	    
	    //fallback(3) - 임계치 정보
	    var system_f3 = json.result[3].system;
	    var th0 = json.result[3].th0; // DNS 성공율 임계치
	    var th1 = json.result[3].th1; // CSR 성공율 임계치
	    var th2 = json.result[3].th2; // MBR 성공율 임계치
	    var th3 = json.result[3].th3; // OCS 성공율 임계치
	    var th4 = json.result[3].th4; // DNS 시도호 임계치
	    var th5 = json.result[3].th5; // CSR 시도호 임계치
	    var th6 = json.result[3].th6; // MBR 시도호 임계치
	    var th7 = json.result[3].th7; // OCS 시도호 임계치
	    
	    var S_th0, S_th1, S_th2, S_th3, S_th4, S_th5, S_th6, S_th7;
	    var S_th0, S_th1, S_th2, S_th3, S_th4, S_th5, S_th6, S_th7;
	    
	    system_f3.forEach(function(e,index){
	    	if(system_f3[index] == "SS"){
	    		S_th0 = th0[index];
	    		S_th1 = th1[index];
	    		S_th2 = th2[index];
	    		S_th3 = th3[index];
	    		S_th4 = th4[index];
	    		S_th5 = th5[index];
	    		S_th6 = th6[index];
	    		S_th7 = th7[index];
	    	}
	    	else if(system_f3[index] == "ELG"){
	    		E_th0 = th0[index];
	    		E_th1 = th1[index];
	    		E_th2 = th2[index];
	    		E_th3 = th3[index];
	    		E_th4 = th4[index];
	    		E_th5 = th5[index];
	    		E_th6 = th6[index];
	    		E_th7 = th7[index];
	    	}
	    });
	    
		$(".ims-container").find(".sys-txt-value").remove(); 
		$(".ims-stat-panel").removeClass("alarm-twinkle");
		
		pause_audio();

		//fallback(0)
		system_namef0.forEach(function(e,index) {
			if(system_namef0[index]==sys_num){
				building = building[index];
				floor_plan = floor_plan[index];  
				curSess = curSess[index];
				totSess = totSess[index];
				curBps = curBps[index];
				totBps = totBps[index];
				
				var locationAddHtml = "<span class='sys-txt-value'>"+building+" "+floor_plan+ "</span>"; 
			    var curSessAddHtml = "<span class='sys-txt-value'>"+curSess+"</span>";
			    var totSessAddHtml = "<span class='sys-txt-value'>"+totSess+"</span>";
			    var curBpsAddHtml = "<span class='sys-txt-value'>"+curBps+"</span>";
			    var totBpsAddHtml = "<span class='sys-txt-value'>"+totBps+"</span>";
			    
			    $("#locationContainer").append(locationAddHtml);
			    $("#curimsSessContainer").append(curSessAddHtml);
			    $("#totimsSessContainer").append(totSessAddHtml);
			    $("#curimsBpsContainer").append(curBpsAddHtml);
			    $("#totimsBpsContainer").append(totBpsAddHtml);
			}
		});
		
		drawPieChart(curSess, totSess, "mecgw-chart"); 
		
		//fallback(1, 3)
		//통계 임계치 설정 및 통계 출력
		system_namef1.forEach(function(e,index) {
			if(system_namef1[index] == sys_num ){
				if( getPrevDateTime() < date[index]+" "+time[index] && getDateTime() > date[index]+" "+time[index]){
					if(system_typef1[index] == "SS"){
						switch(type[index]){
							case "CSR" : 
								$("#CSRstat").append("<span class='sys-txt-value'>as "+succ_rate[index]+"%</span>");
								if(Number(succ_rate[index]) < Number(S_th0) && Number(att[index]) > Number(S_th4)){
							      	  $("#CSRstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
							case "MBR" : 
								$("#MBRstat").append("<span class='sys-txt-value'>"+succ_rate[index]+"%</span>");
								if(Number(succ_rate[index]) < Number(S_th1) && Number(att[index]) > Number(S_th5)){
							      	  $("#MBRstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
							case "DNS" : 
								$("#DNSstat").append("<span class='sys-txt-value'> "+succ_rate[index]+"%</span>");
								if( Number(succ_rate[index]) < Number(S_th2) && Number(att[index]) > Number(S_th6) ){
							      	  $("#DNSstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
						}
					}
					if(system_typef1[index] == "ELG"){
						switch(type[index]){
							case "CSR" : 
								$("#CSRstat").append("<span class='sys-txt-value'> "+succ_rate[index]+"%</span>");
								if(Number(succ_rate[index]) < Number(E_th0) && Number(att[index]) > Number(E_th4)){
							      	  $("#CSRstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
							case "MBR" : 
								$("#MBRstat").append("<span class='sys-txt-value'>"+succ_rate[index]+"%</span>");
								if(Number(succ_rate[index]) < Number(E_th1) && Number(att[index]) > Number(E_th5)){
							      	  $("#MBRstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
							case "DNS" : 
								$("#DNSstat").append("<span class='sys-txt-value'> "+succ_rate[index]+"%</span>");
								if( Number(succ_rate[index]) < Number(E_th2) && Number(att[index]) > Number(E_th6) ){
							      	  $("#DNSstat").parents(".ims-stat-panel").addClass("alarm-twinkle");
								}
								break;
						}
					}	
				}
			}
		});
		//fallback(2) -- 알람 ON 조건 
		system_name_f2.forEach(function(e,index) {
			if(system_name_f2[index] == sys_num ){
				if(type_f2[index] == "ALARM"){
					switch(code_f2[index]){
						case "A4111":
							$("#A4111").addClass("alarm-twinkle");
							break;
					}
				}
			}
		});
		type_f2.forEach(function(e,index) { // Clear 조건
			if(type_f2[index] == "CLEAR" ){
				for(var i=0; i<type_f2.length; i++){
					if(type_f2[i] == "ALARM" && sys_sub_name_f2[index] == sys_sub_name_f2[i] && date[index]+" "+time[index] > date[i]+" "+time[i]){ 
						switch(code_f2[index]){
						case "A4111":
							$("#4111").removeClass("alarm-twinkle");
							break;
						}
					}
				}
			}
		});
		
		play_audio();
		
	  });
}

(function($){
	  "use strict";
	  
	  const _PERIOD_ = 1000*60;
	  
	  executeSetInterval(function(){
	      ajaxShowMECGWDetail("/api/v1/mecgw-list/"+$("#inputCurrentSystem").attr("val"));
	    }, _PERIOD_);
	  
})(jQuery);