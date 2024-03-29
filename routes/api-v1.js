var express = require('express');
var async=require('async');
var router = express.Router();

//var mysql_odbc = require('../config/db_conn')();
//var conn = mysql_odbc.init();
var mysqlDB = require('../config/db_conn')


function getDateTime(){
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return "'"+year + "-" + month + "-" + day+ " " + hour + ":" + min+":"+sec+"'";
}

function getPrevDate(){
	let PrevTime = new Date();
	PrevTime.setMinutes(PrevTime.getMinutes()-5);
	
	let day = (PrevTime.getDate()<10? '0' : '')+PrevTime.getDate();
	let month = ((PrevTime.getMonth()+ 1)<10? '0':'')+(PrevTime.getMonth()+1);
	let year = PrevTime.getFullYear();
	let hours = (PrevTime.getHours()<10? '0' : '')+PrevTime.getHours();
	let minutes = (PrevTime.getMinutes()<10? '0' : '')+PrevTime.getMinutes();
	let seconds = (PrevTime.getSeconds()<10? '0' : '')+PrevTime.getSeconds();
	
	return (year + "-" + month + "-" + day);
}

function getPrevTime(){
	let PrevTime = new Date();
	PrevTime.setMinutes(PrevTime.getMinutes()-5);
	
	let day = (PrevTime.getDate()<10? '0' : '')+PrevTime.getDate();
	let month = ((PrevTime.getMonth()+ 1)<10? '0':'')+(PrevTime.getMonth()+1);
	let year = PrevTime.getFullYear();
	let hours = (PrevTime.getHours()<10? '0' : '')+PrevTime.getHours();
	let minutes = (PrevTime.getMinutes()<10? '0' : '')+PrevTime.getMinutes();
	let seconds = (PrevTime.getSeconds()<10? '0' : '')+PrevTime.getSeconds();
	
	return (hours + ":" + minutes + ":" + seconds);
}

function getPrev10mDate(){
	let PrevTime = new Date();
	PrevTime.setMinutes(PrevTime.getMinutes()-10);
	
	let day = (PrevTime.getDate()<10? '0' : '')+PrevTime.getDate();
	let month = ((PrevTime.getMonth()+ 1)<10? '0':'')+(PrevTime.getMonth()+1);
	let year = PrevTime.getFullYear();
	
	return (year + "-" + month + "-" + day);
}


function getPrev10mTime(){
	let PrevTime = new Date();
	PrevTime.setMinutes(PrevTime.getMinutes()-10);
	
	let hours = (PrevTime.getHours()<10? '0' : '')+PrevTime.getHours();
	let minutes = (PrevTime.getMinutes()<10? '0' : '')+PrevTime.getMinutes();
	let seconds = (PrevTime.getSeconds()<10? '0' : '')+PrevTime.getSeconds();
	
	return (hours + ":" + minutes + ":" + seconds);
}

function getPrev3daysDate(){
	let PrevTime = new Date();
	PrevTime.setDate(PrevTime.getDate()-3);
	
	let day = (PrevTime.getDate()<10? '0' : '')+PrevTime.getDate();
	let month = ((PrevTime.getMonth()+ 1)<10? '0':'')+(PrevTime.getMonth()+1);
	let year = PrevTime.getFullYear();
	
	return "'"+year + "-" + month + "-" + day+ "'";
}

function getHourMin(){
    var date = new Date();
    var hour = Number(date.getHours());
    var min  = Number(date.getMinutes());
    
    return hour+min;
}

function getQueryInUppercase(query) {
  return "'" + String(query).toUpperCase() + "'";
}


router.get('/v1/alarms', function(req, res, next) {
    var result;
    var result_code = 1;
    var result_msg = "success";
	async.parallel([
		function(callback){
			  /* API Send body */
			  var alarmsId = [];
			  var alarm_type = [];
			  var eventTime = [];
			  var date = [];
			  var time = [];
			  var serverName = [];
			  var serverLocation = [];
			  var _event = [];
			  var site=[];
			  var alarm_code=[];
			  /* API Send body */

			  var cnt=0;
			  
			  /** 알람 Clear 메세지 parsing하여 Clear 시켜주는 logic */
			  mysqlDB.query('SELECT date, time, system_name, sys_sub_name, alarm_type, alarm_code FROM alarm_list WHERE alarm_mask=\'N\'',
					  function(error, results, fields) {
			    		if (error) {
			    			console.log(error);
			    		} else {
			    			results.forEach(function(e) {
			    					eventTime.push(e.date+' '+e.time);
			    					date.push(e.date);
				    				time.push(e.time);
				    				serverName.push(e.system_name);
				    				serverLocation.push(e.sys_sub_name);
				    				alarm_type.push(e.alarm_type);
				    				_event.push(e.alarm_desc);
				    				alarm_code.push(e.alarm_code);
			    			});
			    			eventTime.forEach(function(e,index){
			    				if(alarm_type[index] == "CLEAR"){
			    					cnt=0;
			    					for(i=0; i<index; i++){
			    		        		if(eventTime[index] >= eventTime[i] && serverLocation[index] == serverLocation[i] && alarm_code[index]== alarm_code[i] && (alarm_type[i] == "ALARM" || alarm_type[i] == "STAT")){
			    		        			if(cnt<1){
			    		        				cnt++;
			    		        				//console.log(eventTime[index], eventTime[i], serverLocation[index], serverLocation[i], alarm_code[index], alarm_code[i], alarm_type[index],alarm_type[i]);
			    		        				var sql = 'UPDATE alarm_list SET alarm_mask=\'Y\' where sys_sub_name=? and alarm_type=\'ALARM\' and alarm_code=? and alarm_mask = \'N\' and date <= ? and time <= ? ';
			    		        				var params = [serverLocation[i], alarm_code[i], date[i], time[i]];
			    		        				console.log("ALARM : "+serverLocation[i], alarm_code[i], date[i], time[i]);
			    		        				console.log("CLEAR : "+serverLocation[index], alarm_code[index], date[index], time[index]);
			    			        			mysqlDB.query(sql, params,
			    			        					function(error, results, fields) {
			    			        	    		if (error) {
			    			        	    			console.log(error);
			    			        	    		} else {
			    			        	    			//console.log(results);
			    			        	    		}
			    			        			});
			    		        			}
			    		        		}
			    					}
			    				}
			    			});
			    		}
		    			var json = {
		    					
		    			}
		    			callback(null,json);
			  		});	
		  },  
		  function(callback){
			  /* API Send body */
			  var alarmsId = [];
			  var alarm_type = [];
			  var eventTime = [];
			  var date = [];
			  var time = [];
			  var serverName = [];
			  var serverLocation = [];
			  var _event = [];
			  var site=[];
			  var alarm_code=[];
			  
			  var sql = 'SELECT alarm_list.date as date, alarm_list.time as time, system_info_total.location as location, alarm_list.system_name as system_name, alarm_list.sys_sub_name as sys_sub_name, alarm_list.alarm_type as alarm_type, alarm_list.alarm_desc as alarm_desc, alarm_list.alarm_code as alarm_code  FROM alarm_list, system_info_total where alarm_list.system_name = system_info_total.system_name and alarm_list.alarm_mask=\'N\' and alarm_list.alarm_type in(\'ALARM\',\'STAT\')';
			  mysqlDB.query(sql,
  					function(error, results, fields) {
  	    		if (error) {
  	    			console.log(error);
  	    		} else {
  	    			results.forEach(function(e) {
  	    					eventTime.push(e.date+' '+e.time);
  		    				serverName.push(e.system_name);
  		    				serverLocation.push(e.sys_sub_name);
  		    				alarm_type.push(e.alarm_type);
  		    				_event.push(e.alarm_desc);
  		    				site.push(e.location);
  		    				alarm_code.push(e.alarm_code);
  	    			});
  	    		}
  	    		var json = {
  	    				eventTime : eventTime,
  	    				serverName : serverName,
  	    				serverLocation : serverLocation,
  	    				alarm_type : alarm_type,
  	    				event : _event,
  	    				site : site,
  	    				alarm_code : alarm_code
		      	}
	      		callback(null,json);
  			});
		  }
	],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });
});

//3일전 stat data 삭제
router.get('/v1/deleteStat', function(req, res, next) {
	var result;
    var result_code = 1;
    var result_msg = "success";
    
    async.parallel([
		//fallback(0) PGW
		function(callback){
			  var sql_delete_pgw = 'DELETE FROM pgw_stat_list WHERE date < ?';
			  var sql_delete_tas = 'DELETE FROM tas_stat_list WHERE date < ?';
			  var sql_delete_hlr = 'DELETE FROM hlr_stat_list WHERE date < ?';
			  var sql_delete_hss = 'DELETE FROM hss_stat_list WHERE date < ?';
			  var sql_delete_auc = 'DELETE FROM auc_stat_list WHERE date < ?';
			  var sql_delete_mecgw = 'DELETE FROM mecgw_stat_list WHERE date < ?';
			  var sql_delete_mss = 'DELETE FROM mss_stat_list WHERE date < ?';
			  var sql_delete_sgw = 'DELETE FROM sgw_stat_list WHERE date < ?';
			  var sql_delete_mme = 'DELETE FROM mme_stat_list WHERE date < ?';
	
			  var prev_date = getPrev3daysDate();
			  var params = [prev_date];
	
			 
			 if(getHourMin() == 0){ //00시 00분일 때, stat table 3일전 data delete하기
			    mysqlDB.query(sql_delete_pgw, params, function(err, rows, fields){
				  if(err){
		  		  	  console.log('pgw Delete 실패');
				  } else{
					  console.log('pgw Delete 성공');
					
					mysqlDB.query(sql_delete_tas, params, function(err, rows, fields){
						if(err){
							console.log('tas Delete 실패');
						} else{
							console.log('tas Delete 성공');
							
						mysqlDB.query(sql_delete_hlr, params, function(err, rows, fields){
							if(err){
								console.log('hlr Delete 실패');
							} else{
								console.log('hlr Delete 성공');
								
								mysqlDB.query(sql_delete_hss, params, function(err, rows, fields){
									if(err){
										console.log('hss Delete 실패');
									} else{
										console.log('hss Delete 성공');
										
									mysqlDB.query(sql_delete_auc, params, function(err, rows, fields){
										if(err){
											console.log('auc Delete 실패');
										} else{
											console.log('auc Delete 성공');
											
											mysqlDB.query(sql_delete_mecgw, params, function(err, rows, fields){
												if(err){
													console.log('mecgw Delete 실패');
												} else{
													console.log('mecgw Delete 성공');
													
													mysqlDB.query(sql_delete_mss, params, function(err, rows, fields){
														if(err){
															console.log('mss Delete 실패');
														} else{
															console.log('mss Delete 성공');
															
															mysqlDB.query(sql_delete_sgw, params, function(err, rows, fields){
																if(err){
																	console.log('sgw Delete 실패');
																} else{
																	console.log('sgw Delete 성공');
																	
																	mysqlDB.query(sql_delete_mme, params, function(err, rows, fields){
																		if(err){
																			console.log('mme Delete 실패');
																		} else{
																			console.log('mme Delete 성공');
																		}
															 		 });
																}
													 		 });
														}
													  });
												}
									 		 });
										}
									  });
									}
						 		 });
							}
						  });
						}
			 		 });
				}
			  });
			}
			
			
		  }
		 ],
	
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	});
});		


//미수집 장비 조회
router.get('/v1/Uncollected', function(req, res, next) {
	var result;
    var result_code = 1;
    var result_msg = "success";
    
    async.parallel([
		//fallback(0) PGW
		function(callback){
			  var system_name_PGW = [];
			  var system_type_PGW = [];
			  var location_PGW = [];
			  var building_PGW = [];
			  var floor_PGW = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%PGW%\' and system_name not in (select distinct system_name from pgw_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_PGW.push(e.system_name);
			      			system_type_PGW.push(e.system_type);
			      			location_PGW.push(e.location);
			      			building_PGW.push(e.building);
							floor_PGW.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_PGW : system_name_PGW,	
			      				system_type_PGW: system_type_PGW,
			      				location_PGW : location_PGW,
			      				building_PGW: building_PGW,
								floor_PGW: floor_PGW
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  //fallback(1) TAS
		  function(callback){
			  var system_name_TAS = [];
			  var system_type_TAS = [];
			  var location_TAS = [];
			  var building_TAS = [];
			  var floor_TAS = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%TAS%\' and system_name not in (select distinct system_name from tas_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_TAS.push(e.system_name);
			      			system_type_TAS.push(e.system_type);
			      			location_TAS.push(e.location);
			      			building_TAS.push(e.building);
							floor_TAS.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_TAS : system_name_TAS,	
			      				system_type_TAS: system_type_TAS,
			      				location_TAS : location_TAS,
			      				building_TAS: building_TAS,
								floor_TAS: floor_TAS
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(2), HSS 정보 전송
		  function(callback){
			  var system_name_HSS = [];
			  var system_type_HSS = [];
			  var location_HSS = [];
			  var building_HSS = [];
			  var floor_HSS = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%HSS%\' and system_name not in (select distinct system_name from hss_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_HSS.push(e.system_name);
			      			system_type_HSS.push(e.system_type);
			      			location_HSS.push(e.location);
			      			building_HSS.push(e.building);
							floor_HSS.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_HSS : system_name_HSS,	
			      				system_type_HSS: system_type_HSS,
			      				location_HSS : location_HSS,
			      				building_HSS: building_HSS,
								floor_HSS: floor_HSS
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(3), HLR 정보 전송
		  function(callback){
			  var system_name_HLR = [];
			  var system_type_HLR = [];
			  var location_HLR = [];
			  var building_HLR = [];
			  var floor_HLR = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%HLR%\' and system_name not in (select distinct system_name from hlr_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_HLR.push(e.system_name);
			      			system_type_HLR.push(e.system_type);
			      			location_HLR.push(e.location);
			      			building_HLR.push(e.building);
							floor_HLR.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_HLR : system_name_HLR,	
			      				system_type_HLR: system_type_HLR,
			      				location_HLR : location_HLR,
			      				building_HLR: building_HLR,
								floor_HLR: floor_HLR
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(4), AuC 정보 전송
		  function(callback){
			  var system_name_AUC = [];
			  var system_type_AUC = [];
			  var location_AUC = [];
			  var building_AUC = [];
			  var floor_AUC = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%AUC%\' and system_name not in (select distinct system_name from auc_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_AUC.push(e.system_name);
			      			system_type_AUC.push(e.system_type);
			      			location_AUC.push(e.location);
			      			building_AUC.push(e.building);
							floor_AUC.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_AUC : system_name_AUC,	
			      				system_type_AUC: system_type_AUC,
			      				location_AUC : location_AUC,
			      				building_AUC: building_AUC,
								floor_AUC: floor_AUC
			      		}
			      		callback(null,json);
			      	}
			  });
		  },

		//fallback(5), MME 정보 전송
		  function(callback){
			  var system_name_MME = [];
			  var system_type_MME = [];
			  var location_MME = [];
			  var building_MME = [];
			  var floor_MME = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%MME%\' and system_name not in (select distinct system_name from mme_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_MME.push(e.system_name);
			      			system_type_MME.push(e.system_type);
			      			location_MME.push(e.location);
			      			building_MME.push(e.building);
							floor_MME.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_MME : system_name_MME,	
			      				system_type_MME: system_type_MME,
			      				location_MME : location_MME,
			      				building_MME: building_MME,
								floor_MME: floor_MME
			      		}
			      		callback(null,json);
			      	}
			  });
		  },

		//fallback(6), SGW 정보 전송
		  function(callback){
			  var system_name_SGW = [];
			  var system_type_SGW = [];
			  var location_SGW = [];
			  var building_SGW = [];
			  var floor_SGW = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%SGW%\' and system_name not in (select distinct system_name from sgw_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_SGW.push(e.system_name);
			      			system_type_SGW.push(e.system_type);
			      			location_SGW.push(e.location);
			      			building_SGW.push(e.building);
							floor_SGW.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_SGW : system_name_SGW,	
			      				system_type_SGW: system_type_SGW,
			      				location_SGW : location_SGW,
			      				building_SGW: building_SGW,
								floor_SGW: floor_SGW
			      		}
			      		callback(null,json);
			      	}
			  });
		  },

		//fallback(7), UCMS 정보 전송
		  function(callback){
			  var system_name_UCMS = [];
			  var system_type_UCMS = [];
			  var location_UCMS = [];
			  var building_UCMS = [];
			  var floor_UCMS = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%UCMS%\' and system_name not in (select distinct system_name from ucms_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_UCMS.push(e.system_name);
			      			system_type_UCMS.push(e.system_type);
			      			location_UCMS.push(e.location);
			      			building_UCMS.push(e.building);
							floor_UCMS.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_UCMS : system_name_UCMS,	
			      				system_type_UCMS: system_type_UCMS,
			      				location_UCMS : location_UCMS,
			      				building_UCMS: building_UCMS,
								floor_UCMS: floor_UCMS
			      		}
			      		callback(null,json);
			      	}
			  });
		  },

		//fallback(8), MECGW 정보 전송
		  function(callback){
			  var system_name_MECGW = [];
			  var system_type_MECGW = [];
			  var location_MECGW = [];
			  var building_MECGW = [];
			  var floor_MECGW = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%MECGW%\' and system_name not in (select distinct system_name from mecgw_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_MECGW.push(e.system_name);
			      			system_type_MECGW.push(e.system_type);
			      			location_MECGW.push(e.location);
			      			building_MECGW.push(e.building);
							floor_MECGW.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_MECGW : system_name_MECGW,	
			      				system_type_MECGW: system_type_MECGW,
			      				location_MECGW : location_MECGW,
			      				building_MECGW: building_MECGW,
								floor_MECGW: floor_MECGW
			      		}
			      		callback(null,json);
			      	}
			  });
		  },

		//fallback(9), MSS 정보 전송
		  function(callback){
			  var system_name_MSS = [];
			  var system_type_MSS = [];
			  var location_MSS = [];
			  var building_MSS = [];
			  var floor_MSS = [];
				
				
			  mysqlDB.query('select system_name, system_type, location, building, floor_plan from system_info_total where system_name like \'%MSS%\' and system_name not in (select distinct system_name from mss_stat_list where date >= \''+ getPrev10mDate() + '\' and time >= \''+ getPrev10mTime() + '\' )',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name_MSS.push(e.system_name);
			      			system_type_MSS.push(e.system_type);
			      			location_MSS.push(e.location);
			      			building_MSS.push(e.building);
							floor_MSS.push(e.floor_plan);
			      		});
			      		var json = {
			      				system_name_MSS : system_name_MSS,	
			      				system_type_MSS: system_type_MSS,
			      				location_MSS : location_MSS,
			      				building_MSS: building_MSS,
								floor_MSS: floor_MSS
			      		}
			      		callback(null,json);
			      	}
			  });
		  }
		 ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	});
});

//임계치에 해당하는 통계 data를 alarm_list table에 insert하는 logic
router.get('/v1/stats', function(req, res, next) {
    var result;
    var result_code = 1;
    var result_msg = "success";
	async.parallel([
		// PGW
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  var D_th0, D_th1, D_th2, D_th3, D_th4, D_th5, D_th6, D_th7;
    		  var H_th0, H_th1, H_th2, H_th3, H_th4, H_th5, H_th6, H_th7;
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
    		   
			
			  mysqlDB.query('select pgw_stat_list.system_name, system_info_pgw.system_type, pgw_stat_list.date, pgw_stat_list.time, pgw_stat_list.type, pgw_stat_list.succ_rate, pgw_stat_list.att from pgw_stat_list, system_info_pgw where pgw_stat_list.system_name = system_info_pgw.system_name and pgw_stat_list.stat_mask=\'N\' and pgw_stat_list.date >= \''+ getPrevDate() + '\' and pgw_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(e.succ_rate);
				      			att.push(e.att);
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%PGW\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      			
								      		    system.forEach(function(e,index){
								      		    	if(system[index] == "DPGW"){
								      		    		D_th0 = th0[index];
								      		    		D_th1 = th1[index];
								      		    		D_th2 = th2[index];
								      		    		D_th3 = th3[index];
								      		    		D_th4 = th4[index];
								      		    		D_th5 = th5[index];
								      		    		D_th6 = th6[index];
								      		    		D_th7 = th7[index];
								      		    	}
								      		    	else if(system[index] == "HPGW"){
								      		    		H_th0 = th0[index];
								      		    		H_th1 = th1[index];
								      		    		H_th2 = th2[index];
								      		    		H_th3 = th3[index];
								      		    		H_th4 = th4[index];
								      		    		H_th5 = th5[index];
								      		    		H_th6 = th6[index];
								      		    		H_th7 = th7[index];
								      		    	}
								      		    });
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE pgw_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(system_type[index] == "D"){
							      					switch(type[index]){
														case "DNS" : 
															if(Number(succ_rate[index]) < Number(D_th0) && Number(att[index]) > Number(D_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DNS","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("DNS 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(D_th1) && Number(att[index]) > Number(D_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(D_th2) && Number(att[index]) > Number(D_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "OCS" : //OCS 
															if(Number(succ_rate[index]) < Number(D_th3) && Number(att[index]) > Number(D_th7)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "OCS","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("OCS 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(system_type[index] == "H"){
													// HDV PGW 로직 설정
													switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(D_th1) && Number(att[index]) > Number(D_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(D_th2) && Number(att[index]) > Number(D_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_pgw.system_type, alarm_code, alarm_type from alarm_list, system_info_pgw where alarm_list.system_name = system_info_pgw.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_systype[index_c] =='D'){
													      					switch(clear_almcode[index_c]){
																				case "DNS" : 
																					if(Number(succ_rate[index_s]) > Number(D_th0) && Number(att[index_s]) > Number(D_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(D_th1) && Number(att[index_s]) > Number(D_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(D_th2) && Number(att[index_s]) > Number(D_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "OCS" : //OCS 
																					if(Number(succ_rate[index_s]) > Number(D_th3) && Number(att[index_s]) > Number(D_th7)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_systype[index_c] == "H"){
																			// HDV PGW 로직 설정
							      											switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(D_th1) && Number(att[index_s]) > Number(D_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(D_th2) && Number(att[index_s]) > Number(D_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// TAS
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
			  mysqlDB.query('select tas_stat_list.system_name, system_info_tas.system_type, tas_stat_list.date, tas_stat_list.time, tas_stat_list.type, tas_stat_list.succ_rate, tas_stat_list.att from tas_stat_list, system_info_tas where tas_stat_list.system_name = system_info_tas.system_name and tas_stat_list.stat_mask=\'N\' and tas_stat_list.date >= \''+ getPrevDate() + '\' and tas_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(e.succ_rate);
				      			att.push(e.att);
				      		});
				      		
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%TAS\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE tas_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
						      					switch(type[index]){
													case "REGI" : 
														if(Number(succ_rate[index]) < Number(th0) && Number(att[index]) > Number(th4)){
									        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "REGI","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("REGI 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}													
														break;
													case "ORIG" : 
														if(Number(succ_rate[index]) < Number(th1) && Number(att[index]) > Number(th5)){
															var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "ORIG","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("Origin INVITE 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}
														break;
													case "TERM" : 
														if(Number(succ_rate[index]) < Number(th2) && Number(att[index]) > Number(th6)){
															var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TERM","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("Term INVITE 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}
														break;
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_tas.system_type, alarm_code, alarm_type from alarm_list, system_info_tas where alarm_list.system_name = system_info_tas.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
												      					switch(clear_almcode[index_c]){
																			case "REGI" : 
																				if(Number(succ_rate[index_s]) > Number(th0) && Number(att[index_s]) > Number(th4)){
																					  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
																			case "ORIG" : 
																				if(Number(succ_rate[index_s]) > Number(th1) && Number(att[index_s]) > Number(th5)){
																					var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
																			case "TERM" : 
																				if(Number(succ_rate[index_s]) > Number(th2) && Number(att[index_s]) > Number(th6)){
																					var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
																		}
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// MECGW
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [], system_type_th=[];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  var S_th0, S_th1, S_th2, S_th3, S_th4, S_th5, S_th6, S_th7;
    		  var E_th0, E_th1, E_th2, E_th3, E_th4, E_th5, E_th6, E_th7;
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
			  mysqlDB.query('select mecgw_stat_list.system_name, system_info_mecgw.system_type, mecgw_stat_list.date, mecgw_stat_list.time, mecgw_stat_list.type, mecgw_stat_list.succ_rate, mecgw_stat_list.att from mecgw_stat_list, system_info_mecgw where mecgw_stat_list.system_name = system_info_mecgw.system_name and mecgw_stat_list.stat_mask=\'N\' and mecgw_stat_list.date >= \''+ getPrevDate() + '\' and mecgw_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(e.succ_rate);
				      			att.push(e.att);
				      		});
				      		
				      		mysqlDB.query('select system, system_name, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%MECGW\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			system_type_th.push(e.system_name);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      		});
								      		
								      		system_type_th.forEach(function(e,index){
							      		    	if(system_type_th[index] == "SS"){
							      		    		S_th0 = th0[index];
							      		    		S_th1 = th1[index];
							      		    		S_th2 = th2[index];
							      		    		S_th3 = th3[index];
							      		    		S_th4 = th4[index];
							      		    		S_th5 = th5[index];
							      		    		S_th6 = th6[index];
							      		    		S_th7 = th7[index];
							      		    	}
							      		    	else if(system_type_th[index] == "ELG"){
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
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE mecgw_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(system_type[index]=="SS") {
							      					switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(S_th0) && Number(att[index]) > Number(S_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SS CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(S_th1) && Number(att[index]) > Number(S_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SS MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "DNS" : 
															console.log(succ_rate[index], S_th2);
															if( Number(succ_rate[index]) < Number(S_th2) && Number(att[index]) > Number(S_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DNS","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SS DNS 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
							      				}
							      				if(system_type[index]=="ELG") {
							      					switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(E_th0) && Number(att[index]) > Number(E_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("E CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(E_th1) && Number(att[index]) > Number(E_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("E MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "DNS" : 
															if( Number(succ_rate[index]) < Number(E_th2) && Number(att[index]) > Number(E_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DNS","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("E DNS 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
							      				}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_mecgw.system_type, alarm_code, alarm_type from alarm_list, system_info_mecgw where alarm_list.system_name = system_info_mecgw.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_systype=="SS"){
													      					switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th0) && Number(att[index_s]) > Number(S_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th1) && Number(att[index_s]) > Number(S_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "DNS" : 
																					if(Number(succ_rate[index_s]) > Number(S_th2) && Number(att[index_s]) > Number(S_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_systype[index_c]=="ELG"){
													      					switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(E_th0) && Number(att[index_s]) > Number(E_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(E_th1) && Number(att[index_s]) > Number(E_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "DNS" : 
																					if(Number(succ_rate[index_s]) > Number(E_th2) && Number(att[index_s]) > Number(E_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
																	}
							      								})
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// MSS
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
  		  
			  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
  		  
			  mysqlDB.query('select mss_stat_list.system_name, system_info_mss.system_type, mss_stat_list.date, mss_stat_list.time, mss_stat_list.type, mss_stat_list.succ_rate, mss_stat_list.att from mss_stat_list, system_info_mss where mss_stat_list.system_name = system_info_mss.system_name and mss_stat_list.stat_mask=\'N\' limit 200;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(e.succ_rate);
				      			att.push(e.att);
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%MSS\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE mss_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
						      					switch(type[index]){
													case "REG" : 
														if(Number(succ_rate[index]) < Number(th0[index]) && Number(att[index]) > Number(th4[index])){
									        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "REGI","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("REGI 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}													
														break;
													case "SESS" : 
														if(Number(succ_rate[index]) < Number(th1[index]) && Number(att[index]) > Number(th5[index])){
															var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SESS","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("SESS 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}
														break;
													case "MC" : 
														if(Number(succ_rate[index]) < Number(th2[index]) && Number(att[index]) > Number(th6[index])){
															var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MC","Success Rate : "+succ_rate[index]];
							  	       	         			  mysqlDB.query(sql_insert, params,
							  	       	         				 function(error, results, fields) {
											        	    		if (error) {
											        	    			console.log(error);
											        	    		} else {
											        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
											        	    			mysqlDB.query(sql_update, params,
											        	    					function(error, results, fields){
													        	    				if (error) {
															        	    			console.log(error);
															        	    		} else {
															        	    			console.log("MC 성공");
															        	    		}
											        	    			});
											        	    		}
										        			     });
														}
														break;
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_mss.system_type, alarm_code, alarm_type from alarm_list, system_info_mss where alarm_list.system_name = system_info_mss.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
												      					switch(clear_almcode[index_c]){
																			case "REG" : 
																				if(Number(succ_rate[index_s]) > Number(th0[index]) && Number(att[index_s]) > Number(th4[index])){
																					  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
																			case "SESS" : 
																				if(Number(succ_rate[index_s]) > Number(th1[index]) && Number(att[index_s]) > Number(th5[index])){
																					var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
																			case "MC" : 
																				if(Number(succ_rate[index_s]) > Number(th2[index]) && Number(att[index_s]) > Number(th6[index])){
																					var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
													  	       	         			  mysqlDB.query(sql_clear, params,
													  	       	         				 function(error, results, fields) {
																	        	    		if (error) {
																	        	    			console.log(error);
																	        	    		} else {
																	        	    			console.log("Clear 성공");
																	        	    		}
																        			     });
																				}
																				break;
							      										}
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// HSS
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  var A_th0, A_th1, A_th2, A_th3, A_th4, A_th5, A_th6, A_th7;
    		  var S_th0, S_th1, S_th2, S_th3, S_th4, S_th5, S_th6, S_th7;
    		  var BK_th0, BK_th1, BK_th2, BK_th3, BK_th4, BK_th5, BK_th6, BK_th7;
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
    		   
			
			  mysqlDB.query('select hss_stat_list.system_name, system_info_hss.system_type, hss_stat_list.date, hss_stat_list.time, hss_stat_list.type, hss_stat_list.succ_rate, hss_stat_list.att from hss_stat_list, system_info_hss where hss_stat_list.system_name = system_info_hss.system_name and hss_stat_list.stat_mask=\'N\' and hss_stat_list.date >= \''+ getPrevDate() + '\' and hss_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(Number(e.succ_rate));
				      			att.push(Number(e.att));
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%HSS\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      			
								      		    system.forEach(function(e,index){
											    	if(system[index] == "AHSS"){
											    		A_th0 = th0[index];
											    		A_th1 = th1[index];
											    		A_th2 = th2[index];
											    		A_th3 = th3[index];
											    		A_th4 = th4[index];
											    		A_th5 = th5[index];
											    		A_th6 = th6[index];
											    		A_th7 = th7[index];
											    	}
											    	else if(system[index] == "SHSS"){
											    		S_th0 = th0[index];
											    		S_th1 = th1[index];
											    		S_th2 = th2[index];
											    		S_th3 = th3[index];
											    		S_th4 = th4[index];
											    		S_th5 = th5[index];
											    		S_th6 = th6[index];
											    		S_th7 = th7[index];
											    	}
											    	else if(system[index] == "BKHSS"){
											    		BK_th0 = th0[index];
											    		BK_th1 = th1[index];
											    		BK_th2 = th2[index];
											    		BK_th3 = th3[index];
											    		BK_th4 = th4[index];
											    		BK_th5 = th5[index];
											    		BK_th6 = th6[index];
											    		BK_th7 = th7[index];
								      		    	}
								      		    });
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE hss_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(system_type[index] == "A"){
							      					switch(type[index]){
														case "UAR" : 
															if(Number(succ_rate[index]) < Number(A_th0) && Number(att[index]) > Number(A_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "UAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("UAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MAR" : 
															if(Number(succ_rate[index]) < Number(A_th1) && Number(att[index]) > Number(A_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SAR" : 
															if(Number(succ_rate[index]) < Number(A_th2) && Number(att[index]) > Number(A_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "LIR" : 
															if(Number(succ_rate[index]) < Number(A_th3) && Number(att[index]) > Number(A_th7)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "LIR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("LIR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(system_type[index] == "S"){ 
													//Standby
													switch(type[index]){
														case "UAR" : 
															if(Number(succ_rate[index]) < Number(S_th0) && Number(att[index]) > Number(S_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "UAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("UAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MAR" : 
															if(Number(succ_rate[index]) < Number(S_th1) && Number(att[index]) > Number(S_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SAR" : 
															if(Number(succ_rate[index]) < Number(S_th2) && Number(att[index]) > Number(S_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "LIR" : 
															if(Number(succ_rate[index]) < Number(S_th3) && Number(att[index]) > Number(S_th7)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "LIR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("LIR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(system_type[index] == "BK"){ 
													//Backup
													switch(type[index]){
														case "UAR" : 
															if(Number(succ_rate[index]) < Number(BK_th0) && Number(att[index]) > Number(BK_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "UAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("UAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MAR" : 
															if(Number(succ_rate[index]) < Number(BK_th1) && Number(att[index]) > Number(BK_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SAR" : 
															if(Number(succ_rate[index]) < Number(BK_th2) && Number(att[index]) > Number(BK_th6)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "LIR" : 
															if(Number(succ_rate[index]) < Number(BK_th3) && Number(att[index]) > Number(BK_th7)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "LIR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("LIR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_hss.system_type, alarm_code, alarm_type from alarm_list, system_info_hss where alarm_list.system_name = system_info_hss.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_systype[index_c] =='A'){
													      					switch(clear_almcode[index_c]){
																				case "UAR" : 
																					if(Number(succ_rate[index_s]) > Number(A_th0) && Number(att[index_s]) > Number(A_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MAR" : 
																					if(Number(succ_rate[index_s]) > Number(A_th1) && Number(att[index_s]) > Number(A_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAR" : 
																					if(Number(succ_rate[index_s]) > Number(A_th2) && Number(att[index_s]) > Number(A_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "LIR" : 
																					if(Number(succ_rate[index_s]) > Number(A_th3) && Number(att[index_s]) > Number(A_th7)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_systype[index_c] == "S"){
							      											switch(clear_almcode[index_c]){
																				case "UAR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th0) && Number(att[index_s]) > Number(S_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MAR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th1) && Number(att[index_s]) > Number(S_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th2) && Number(att[index_s]) > Number(S_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "LIR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th3) && Number(att[index_s]) > Number(S_th7)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
							      										if(clear_systype[index_c] == "BK"){
							      											switch(clear_almcode[index_c]){
																				case "UAR" : 
																					if(Number(succ_rate[index_s]) > Number(BK_th0) && Number(att[index_s]) > Number(BK_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MAR" : 
																					if(Number(succ_rate[index_s]) > Number(BK_th1) && Number(att[index_s]) > Number(BK_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAR" : 
																					if(Number(succ_rate[index_s]) > Number(BK_th2) && Number(att[index_s]) > Number(BK_th6)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "LIR" : 
																					if(Number(succ_rate[index_s]) > Number(BK_th3) && Number(att[index_s]) > Number(BK_th7)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
																		
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// HLRCS
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  
			  var A_th0, A_th1;
    		  var BK_th0, BK_th1;
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
    		   
			
			  mysqlDB.query('select hlr_stat_list.system_name, system_info_hlr.system_type, hlr_stat_list.date, hlr_stat_list.time, hlr_stat_list.type, hlr_stat_list.succ_rate, hlr_stat_list.att from hlr_stat_list, system_info_hlr where hlr_stat_list.system_name = system_info_hlr.system_name and hlr_stat_list.stat_mask=\'N\' and hlr_stat_list.date >= \''+ getPrevDate() + '\' and hlr_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(Number(e.succ_rate));
				      			att.push(Number(e.att));
				      		});
				      		mysqlDB.query('select system, th0, th1 from threshold_list where system like \'%HLRCS\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			
								      		    system.forEach(function(e,index){
											    	if(system[index] == "AHLRCS"){
											    		A_th0 = th0[index];
											    		A_th1 = th1[index];
											    	}
											    	else if(system[index] == "BKHLRCS"){
											    		BK_th0 = th0[index];
											    		BK_th1 = th1[index];
								      		    	}
								      		    });
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE hlr_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(system_type[index] == "A"){
							      					switch(type[index]){
														case "TMOUT" : 
															if(Number(succ_rate[index]) > Number(A_th0) && Number(att[index]) > Number(A_th1)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TMOUT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("TMOUT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
													}
												}
												if(system_type[index] == "BK"){
							      					switch(type[index]){
														case "TMOUT" : 
															if(Number(succ_rate[index]) > Number(BK_th0) && Number(att[index]) > Number(BK_th1)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TMOUT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("TMOUT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
													}
												}
							      			});
				
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_hlr.system_type, alarm_code, alarm_type from alarm_list, system_info_hlr where alarm_list.system_name = system_info_hlr.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_systype[index_c] =='A'){
													      					switch(clear_almcode[index_c]){
																				case "TMOUT" : 
																					if(Number(succ_rate[index_s]) > Number(A_th0) && Number(att[index_s]) < Number(A_th1)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_systype[index_c] =='BK'){
													      					switch(clear_almcode[index_c]){
																				case "TMOUT" : 
																					if(Number(succ_rate[index_s]) > Number(BK_th0) && Number(att[index_s]) < Number(BK_th1)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// AUC
		function(callback){ 
			  var system_name = [];
			  var auc_num = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  var A21_th0, A21_th1, A21_th4, A21_th5;
			  var A22_th0, A22_th1, A22_th4, A22_th5;
			  var A25_th0, A25_th1, A25_th4, A25_th5;
    		  
    		  var clear_sysname=[], clear_auc_num=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[];
    		  
    		   
			
			  mysqlDB.query('select auc_stat_list.system_name, substring(auc_stat_list.system_name,4,2) AS auc_num, system_info_auc.system_type, auc_stat_list.date, auc_stat_list.time, auc_stat_list.type, auc_stat_list.succ_rate, auc_stat_list.att from auc_stat_list, system_info_auc where auc_stat_list.system_name = system_info_auc.system_name and auc_stat_list.stat_mask=\'N\' and auc_stat_list.date >= \''+ getPrevDate() + '\' and auc_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			auc_num.push(e.auc_num);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(Number(e.succ_rate));
				      			att.push(Number(e.att));
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5 from threshold_list where system like \'%AUC\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2); 
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
				
								      			A21_th0= th0;
								      			A21_th1= th1;
								      			A21_th4= th4;
								      			A21_th5= th5;
					
								      			A22_th2= th2; //--> AUC22는 임계치 값 높아서 AUC21과 다른 값 가져옴
								      			A22_th3= th3;
								      			A22_th4= th4;
								      			A22_th5= th5;
					
								      			A25_th0= th0;
								      			A25_th1= th1;
								      			A25_th4= th4;
								      			A25_th5= th5;
										
								      			
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE auc_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(auc_num[index] == "21"){
							      					switch(type[index]){
														case "DAI" : 
															if(Number(succ_rate[index]) < Number(A21_th0) && Number(att[index]) > Number(A21_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("DAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SAI" : 
															if(Number(succ_rate[index]) < Number(A21_th1) && Number(att[index]) > Number(A21_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      				if(auc_num[index] == "22"){
							      					switch(type[index]){
														case "DAI" : 
															if(Number(succ_rate[index]) < Number(A22_th2) && Number(att[index]) > Number(A22_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("DAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SAI" : 
															if(Number(succ_rate[index]) < Number(A22_th3) && Number(att[index]) > Number(A22_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												
							      				if(auc_num[index] == "25"){
							      					switch(type[index]){
														case "DAI" : 
															if(Number(succ_rate[index]) < Number(A25_th0) && Number(att[index]) > Number(A25_th4)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "DAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("DAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SAI" : 
															if(Number(succ_rate[index]) < Number(A25_th1) && Number(att[index]) > Number(A25_th5)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SAI","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SAI 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name, substring(alarm_list.system_name,4,2) AS auc_num, system_info_auc.system_type, alarm_code, alarm_type from alarm_list, system_info_auc where alarm_list.system_name = system_info_auc.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
																clear_auc_num.push(e.auc_num);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_auc_num[index_c] =='21'){
													      					switch(clear_almcode[index_c]){
																				case "DAI" : 
																					if(Number(succ_rate[index_s]) > Number(A21_th0) && Number(att[index_s]) > Number(A21_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAI" : 
																					if(Number(succ_rate[index_s]) > Number(A21_th1) && Number(att[index_s]) > Number(A21_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_auc_num[index_c] =='22'){
							      											switch(clear_almcode[index_c]){
																				case "DAI" : 
																					if(Number(succ_rate[index_s]) > Number(A22_th2) && Number(att[index_s]) > Number(A22_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAI" : 
																					if(Number(succ_rate[index_s]) > Number(A22_th3) && Number(att[index_s]) > Number(A22_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
							      										if(clear_auc_num[index_c] =='25'){
													      					switch(clear_almcode[index_c]){
																				case "DAI" : 
																					if(Number(succ_rate[index_s]) > Number(A25_th0) && Number(att[index_s]) > Number(A25_th4)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SAI" : 
																					if(Number(succ_rate[index_s]) > Number(A25_th1) && Number(att[index_s]) > Number(A25_th5)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
																		
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// SGW
		function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  var L_th0, L_th1, L_th2, L_th3;
			  var S_th0, S_th1, S_th2, S_th3;
			  var V_th0, V_th1, V_th2, V_th3;
    		  
    		   
			
			  mysqlDB.query('select sgw_stat_list.system_name, system_info_sgw.system_type, sgw_stat_list.date, sgw_stat_list.time, sgw_stat_list.type, sgw_stat_list.succ_rate, sgw_stat_list.att from sgw_stat_list, system_info_sgw where sgw_stat_list.system_name = system_info_sgw.system_name and sgw_stat_list.stat_mask=\'N\' and sgw_stat_list.date >= \''+ getPrevDate() + '\' and sgw_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(Number(e.succ_rate));
				      			att.push(Number(e.att));
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3 from threshold_list where system like \'%SGW\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			
								      		    system.forEach(function(e,index){
											    	if(system[index] == "LSGW"){
											    		L_th0 = th0[index];
											    		L_th1 = th1[index];
											    		L_th2 = th2[index];
											    		L_th3 = th3[index];
											    	}
											    	else if(system[index] == "SSGW"){
											    		S_th0 = th0[index];
											    		S_th1 = th1[index];
											    		S_th2 = th2[index];
											    		S_th3 = th3[index];
											    	}
											    	else if(system[index] == "VSGW"){
											    		V_th0 = th0[index];
											    		V_th1 = th1[index];
											    		V_th2 = th2[index];
											    		V_th3 = th3[index];
								      		    	}
								      		    });
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE auc_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(system_type[index] == "L"){
							      					switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(L_th0) && Number(att[index]) > Number(L_th2)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(L_th1) && Number(att[index]) > Number(L_th3)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(system_type[index] == "S"){ 
													//Standby
													switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(S_th0) && Number(att[index]) > Number(S_th2)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(S_th1) && Number(att[index]) > Number(S_th3)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(system_type[index] == "V"){ 
													//Backup
													switch(type[index]){
														case "CSR" : 
															if(Number(succ_rate[index]) < Number(V_th0) && Number(att[index]) > Number(V_th2)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CSR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CSR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "MBR" : 
															if(Number(succ_rate[index]) < Number(V_th1) && Number(att[index]) > Number(V_th3)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "MBR","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("MBR 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name,system_info_sgw.system_type, alarm_code, alarm_type from alarm_list, system_info_sgw where alarm_list.system_name = system_info_sgw.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_systype[index_c] =='L'){
													      					switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(L_th0) && Number(att[index_s]) > Number(L_th2)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(L_th1) && Number(att[index_s]) > Number(L_th3)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
							      										}
							      										if(clear_systype[index_c] == "S"){
							      											switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th0) && Number(att[index_s]) > Number(S_th2)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(S_th1) && Number(att[index_s]) > Number(S_th3)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
							      										if(clear_systype[index_c] == "V"){
							      											switch(clear_almcode[index_c]){
																				case "CSR" : 
																					if(Number(succ_rate[index_s]) > Number(V_th0) && Number(att[index_s]) > Number(V_th2)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "MBR" : 
																					if(Number(succ_rate[index_s]) > Number(V_th1) && Number(att[index_s]) > Number(V_th3)){
																						var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
																		
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		},
		// MME
		function(callback){ 
			  var system_name = [];
			  var vendor = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  var th8 = [];
			  var th9 = [];
			  var th10 = [];
			  var th11 = [];
			  var th12 = [];
			  var th13 = [];
    
    
			    var S_th0, S_th1, S_th2, S_th3, S_th4, S_th5, S_th6, S_th7, S_th8, S_th9, S_th10, S_th11, S_th12, S_th13;
			    var E_th0, E_th1, E_th2, E_th3, E_th4, E_th5, E_th6, E_th7, E_th8, E_th9, E_th10, E_th11, E_th12, E_th13;
			    var G_th0, G_th1, G_th2, G_th3, G_th4, G_th5, G_th6, G_th7, G_th8, G_th9, G_th10, G_th11, G_th12, G_th13;
    
    		  
    		  var clear_sysname=[], clear_date=[], clear_time=[], clear_systype=[], clear_almcode=[], clear_almtype=[], clear_vendor=[];
    		  
    		   
			
			  mysqlDB.query('select mme_stat_list.system_name, system_info_mme.vendor, system_info_mme.system_type, mme_stat_list.date, mme_stat_list.time, mme_stat_list.type, mme_stat_list.succ_rate, mme_stat_list.att from mme_stat_list, system_info_mme where mme_stat_list.system_name = system_info_mme.system_name and mme_stat_list.stat_mask=\'N\' and mme_stat_list.date >= \''+ getPrevDate() + '\' and mme_stat_list.time >= \''+ getPrevTime() + '\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
			      				vendor.push(e.vendor);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);
				      			succ_rate.push(Number(e.succ_rate));
				      			att.push(Number(e.att));
				      		});
				      		mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%MME\';',
									  function(error, results, fields) {
									  	if (error) {
								      		console.log(error);
								      	} else {
								      		results.forEach(function(e) {
								      			system.push(e.system);
								      			th0.push(e.th0);
								      			th1.push(e.th1);
								      			th2.push(e.th2);
								      			th3.push(e.th3);
								      			th4.push(e.th4);
								      			th5.push(e.th5);
								      			th6.push(e.th6);
								      			th7.push(e.th7);
								      			th8.push(e.th8);
								      			th9.push(e.th9);
								      			th10.push(e.th10);
								      			th11.push(e.th11);
								      			th12.push(e.th12);
								      			th13.push(e.th13);
								      			
								      		    system.forEach(function(e,index){
											    	if(system[index] == "SMME"){
											    		S_th0 = th0[index];
											    		S_th1 = th1[index];
											    		S_th2 = th2[index];
											    		S_th3 = th3[index];
											    		S_th4 = th4[index];
											    		S_th5 = th5[index];
											    		S_th6 = th6[index];
											    		S_th7 = th7[index];
											    		S_th8 = th8[index];
											    		S_th9 = th9[index];
											    		S_th10 = th10[index];
											    		S_th11 = th11[index];
											    		S_th12 = th12[index];
											    		S_th13 = th13[index];
											    	}
											    	else if(system[index] == "EMME"){
											    		E_th0 = th0[index];
											    		E_th1 = th1[index];
											    		E_th2 = th2[index];
											    		E_th3 = th3[index];
											    		E_th4 = th4[index];
											    		E_th5 = th5[index];
											    		E_th6 = th6[index];
											    		E_th7 = th7[index];
											    		E_th8 = th8[index];
											    		E_th9 = th9[index];
											    		E_th10 = th10[index];
											    		E_th11 = th11[index];
											    		E_th12 = th12[index];
											    		E_th13 = th13[index];
											    	}
											    	else if(system[index] == "GMME"){
											    		G_th0 = th0[index];
											    		G_th1 = th1[index];
											    		G_th2 = th2[index];
											    		G_th3 = th3[index];
											    		G_th4 = th4[index];
											    		G_th5 = th5[index];
											    		G_th6 = th6[index];
											    		G_th7 = th7[index];
											    		G_th8 = th8[index];
											    		G_th9 = th9[index];
											    		G_th10 = th10[index];
											    		G_th11 = th11[index];
											    		G_th12 = th12[index];
											    		G_th13 = th13[index];
								      		    	}
								      		    });
								      		});
							      			var sql_insert = 'INSERT INTO alarm_list VALUE (?,?,?,?,?,?,?,\'N\');'
							      			var sql_update = 'UPDATE mme_stat_list SET stat_mask=\'Y\' WHERE date=? and time=? and system_name=? and type=? and succ_rate=? and att=?'
							      			
							      			
							      			system_name.forEach(function(e,index) {
							      				if(vendor[index] == "S"){
							      					switch(type[index]){
														case "ATCH" : 
															if(Number(succ_rate[index]) < Number(S_th0) && Number(att[index]) > Number(S_th7)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "ATCH","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("ATCH 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SR_MO" : 
															if(Number(succ_rate[index]) < Number(S_th1) && Number(att[index]) > Number(S_th8)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SR_MT" : 
															if(Number(succ_rate[index]) < Number(S_th2) && Number(att[index]) > Number(S_th9)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MO" : 
															if(Number(succ_rate[index]) < Number(S_th3) && Number(att[index]) > Number(S_th10)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MT" : 
															if(Number(succ_rate[index]) < Number(S_th4) && Number(att[index]) > Number(S_th11)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "TAU" : 
															if(Number(succ_rate[index]) < Number(S_th5) && Number(att[index]) > Number(S_th12)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TAU","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("TAU 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "PAG" : 
															if(Number(succ_rate[index]) < Number(S_th6) && Number(att[index]) > Number(S_th13)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "PAG","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("PAG 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(vendor[index] == "E"){ 
													//Standby
													switch(type[index]){
														case "ATCH" : 
															if(Number(succ_rate[index]) < Number(E_th0) && Number(att[index]) > Number(E_th7)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "ATCH","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("ATCH 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SR_MO" : 
															if(Number(succ_rate[index]) < Number(E_th1) && Number(att[index]) > Number(E_th8)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SR_MT" : 
															if(Number(succ_rate[index]) < Number(E_th2) && Number(att[index]) > Number(E_th9)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MO" : 
															if(Number(succ_rate[index]) < Number(E_th3) && Number(att[index]) > Number(E_th10)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MT" : 
															if(Number(succ_rate[index]) < Number(E_th4) && Number(att[index]) > Number(E_th11)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "TAU" : 
															if(Number(succ_rate[index]) < Number(E_th5) && Number(att[index]) > Number(E_th12)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TAU","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("TAU 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "PAG" : 
															if(Number(succ_rate[index]) < Number(E_th6) && Number(att[index]) > Number(E_th13)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "PAG","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("PAG 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
												if(vendor[index] == "G"){ 
													switch(type[index]){
														case "ATCH" : 
															if(Number(succ_rate[index]) < Number(G_th0) && Number(att[index]) > Number(G_th7)){
										        				  var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "ATCH","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("ATCH 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}													
															break;
														case "SR_MO" : 
															if(Number(succ_rate[index]) < Number(G_th1) && Number(att[index]) > Number(G_th8)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "SR_MT" : 
															if(Number(succ_rate[index]) < Number(G_th2) && Number(att[index]) > Number(G_th9)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MO" : 
															if(Number(succ_rate[index]) < Number(G_th3) && Number(att[index]) > Number(G_th10)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MO","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MO 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "CS_SR_MT" : 
															if(Number(succ_rate[index]) < Number(G_th4) && Number(att[index]) > Number(G_th11)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "CS_SR_MT","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("CS_SR_MT 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "TAU" : 
															if(Number(succ_rate[index]) < Number(G_th5) && Number(att[index]) > Number(G_th12)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "TAU","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("TAU 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
														case "PAG" : 
															if(Number(succ_rate[index]) < Number(G_th6) && Number(att[index]) > Number(G_th13)){
																var params = [date[index], time[index], system_name[index], system_name[index]+"/"+type[index], "STAT", "PAG","Success Rate : "+succ_rate[index]];
								  	       	         			  mysqlDB.query(sql_insert, params,
								  	       	         				 function(error, results, fields) {
												        	    		if (error) {
												        	    			console.log(error);
												        	    		} else {
												        	    			var params = [date[index], time[index], system_name[index], type[index], succ_rate[index], att[index]];
												        	    			mysqlDB.query(sql_update, params,
												        	    					function(error, results, fields){
														        	    				if (error) {
																        	    			console.log(error);
																        	    		} else {
																        	    			console.log("PAG 성공");
																        	    		}
												        	    			});
												        	    		}
											        			     });
															}
															break;
													}
												}
							      			});
								      		//callback(null,json);
							      			/**통계 Clear logic */
							      			var sql_search_stat = 'select alarm_list.date,alarm_list.time,alarm_list.system_name, system_info_mme.vendor, system_info_mme.system_type, alarm_code, alarm_type from alarm_list, system_info_mme where alarm_list.system_name = system_info_mme.system_name and alarm_mask=\'N\' and alarm_type=\'STAT\';';
							      			var sql_clear = 'UPDATE alarm_list SET alarm_mask=\'Y\' where date=? and time=? and system_name=? and alarm_code=?';
							      					
							      			mysqlDB.query(sql_search_stat,
							      					function(error, results, fields){
							      						if(results != ""){
							      							console.log(results);
							      							results.forEach(function(e) {
							      								clear_sysname.push(e.system_name);
							      								clear_vendor.push(e.vendor);
							      								clear_date.push(e.date);
							      								clear_time.push(e.time);
							      								clear_systype.push(e.system_type);
							      								clear_almcode.push(e.alarm_code);
							      								clear_almtype.push(e.alarm_type);
							      							});
							      							
							      							clear_sysname.forEach(function(e,index_c) {
							      								system_name.forEach(function(e,index_s){
							      									if(clear_sysname[index_c] == system_name[index_s] && clear_date[index_c] <= date[index_s] && clear_time[index_c] <= time[index_s]){
							      										if(clear_vendor[index_c] =='S'){
													      					switch(clear_almcode[index_c]){
																				case "ATCH" : 
																					if(Number(succ_rate[index_s]) > Number(S_th0) && Number(att[index_s]) > Number(S_th7)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(S_th1) && Number(att[index_s]) > Number(S_th8)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(S_th2) && Number(att[index_s]) > Number(S_th9)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(S_th3) && Number(att[index_s]) > Number(S_th10)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(S_th4) && Number(att[index_s]) > Number(S_th11)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "TAU" : 
																					if(Number(succ_rate[index_s]) > Number(S_th5) && Number(att[index_s]) > Number(S_th12)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "PAG" : 
																					if(Number(succ_rate[index_s]) > Number(S_th6) && Number(att[index_s]) > Number(S_th13)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																					
																			}
							      										}
							      										if(clear_vendor[index_c] == "E"){
							      											switch(clear_almcode[index_c]){
																				case "ATCH" : 
																					if(Number(succ_rate[index_s]) > Number(E_th0) && Number(att[index_s]) > Number(E_th7)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(E_th1) && Number(att[index_s]) > Number(E_th8)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(E_th2) && Number(att[index_s]) > Number(E_th9)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(E_th3) && Number(att[index_s]) > Number(E_th10)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(E_th4) && Number(att[index_s]) > Number(E_th11)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "TAU" : 
																					if(Number(succ_rate[index_s]) > Number(E_th5) && Number(att[index_s]) > Number(E_th12)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "PAG" : 
																					if(Number(succ_rate[index_s]) > Number(E_th6) && Number(att[index_s]) > Number(E_th13)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
							      										if(clear_vendor[index_c] == "G"){
							      											switch(clear_almcode[index_c]){
																				case "ATCH" : 
																					if(Number(succ_rate[index_s]) > Number(G_th0) && Number(att[index_s]) > Number(G_th7)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(G_th1) && Number(att[index_s]) > Number(G_th8)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(G_th2) && Number(att[index_s]) > Number(G_th9)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MO" : 
																					if(Number(succ_rate[index_s]) > Number(G_th3) && Number(att[index_s]) > Number(G_th10)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "CS_SR_MT" : 
																					if(Number(succ_rate[index_s]) > Number(G_th4) && Number(att[index_s]) > Number(G_th11)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "TAU" : 
																					if(Number(succ_rate[index_s]) > Number(G_th5) && Number(att[index_s]) > Number(G_th12)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																				case "PAG" : 
																					if(Number(succ_rate[index_s]) > Number(G_th6) && Number(att[index_s]) > Number(G_th13)){
																						  var params = [clear_date[index_c], clear_time[index_c], clear_sysname[index_c], clear_almcode[index_c]];
														  	       	         			  mysqlDB.query(sql_clear, params,
														  	       	         				 function(error, results, fields) {
																		        	    		if (error) {
																		        	    			console.log(error);
																		        	    		} else {
																		        	    			console.log("Clear 성공");
																		        	    		}
																	        			     });
																					}
																					break;
																			}
																		}
																		
																	}
																	
							      								})
											      				
											      			});
							      					}else{
							      						//alarm_list 테이블에 값 없을 시(통계로인한 장애 상황이 아닐 시)
							      					}
							      			})
								      	}
									  	
							});
				      	}
					  	callback(null,system_name);
				  });

		}
	],
    function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
    };
    res.send(JSON.stringify(result));
  });
});


router.get('/v1/5Gsystem', function(req, res, next) {
    var result;
    var result_code = 1;
    var result_msg = "success";
    
    async.parallel([
		function(callback){ /** MAP.js PGW 전체 식수,Sess수 출력 */
			/* API Send body */
			  var curPGWCnt = [];
			  var totPGWCnt = [];
			  var curPGWSess = [];
			  var totPGWSess = [];
			  var result_code = 1;
			  var result_msg = "success";

			  var cnt=0;
			  
			  mysqlDB.query('select count(*) as cnt, (select sum(max_session) from system_info_pgw) as totSess, (select sum(current_session)  from system_info_pgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curSess, (select count(*) from system_info_pgw  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_pgw',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			var totSess = e.totSess/10000;
				      			var curSess = e.curSess/10000;
				      			curPGWCnt.push(e.curCnt);
				      			totPGWCnt.push(e.cnt);
				      			curPGWSess.push(Math.round(curSess));
				      			totPGWSess.push(totSess);
				      		});
				      		var final = {
				      			curPGWCnt : curPGWCnt,	
				      			totPGWCnt: totPGWCnt,
				      			curPGWSess : curPGWSess,
				      			totPGWSess: totPGWSess
				      		}
				      		json = {
								    result_code: result_code,
								    result_msg: result_msg,
								    result: final
							};
				      	}
					  	callback(null,final);
				  });
		  },
		  function(callback){ /** MAP.js TAS 전체 식수, 가입자수 출력 */
				/* API Send body */
				  var curTASCnt = [];
				  var totTASCnt = [];
				  var curTASSub = [];
				  var totTASSub = [];
				  var result_code = 1;
				  var result_msg = "success";

				  var cnt=0;
				  
				  mysqlDB.query('select count(*) as cnt, (select sum(max_sub) from system_info_tas) as totSub, (select sum(current_sub)  from system_info_tas where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curSub, (select count(*) from system_info_tas  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_tas',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			var totSub = e.totSub/10000;
					      			var curSub = e.curSub/10000;
					      			curTASCnt.push(e.curCnt);
					      			totTASCnt.push(e.cnt);
					      			curTASSub.push(Math.round(curSub));
					      			totTASSub.push(totSub);
					      		});
					      		var final = {
					      			curTASCnt : curTASCnt,	
					      			totTASCnt: totTASCnt,
					      			curTASSub : curTASSub,
					      			totTASSub: totTASSub
					      		}
					      		json = {
									    result_code: result_code,
									    result_msg: result_msg,
									    result: final
								};
					      	}
						  	callback(null,final);
					  });
		  },
		//fallback(2), HSS 정보 전송
		  function(callback){
			  var curHSSCnt = [];
			  var totHSSCnt = [];
			  var curHSSTps = [];
			  var totHSSTps = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_tps) from system_info_hss) as totTps, (select sum(current_tps) from system_info_hss where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curTps, (select count(*) from system_info_hss  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_hss',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curHSSCnt.push(e.curCnt);
			      			totHSSCnt.push(e.cnt);
			      			curHSSTps.push(Math.round(e.curTps));
			      			totHSSTps.push(e.totTps);
			      		});
			      		var json = {
			      				curHSSCnt : curHSSCnt,	
			      				totHSSCnt: totHSSCnt,
			      				curHSSTps : curHSSTps,
			      				totHSSTps: totHSSTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(3), HLR 정보 전송
		  function(callback){
			  var curHLRCnt = [];
			  var totHLRCnt = [];
			  var curHLRTps = [];
			  var totHLRTps = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_tps) from system_info_hlr) as totTps, (select sum(current_tps) from system_info_hlr where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curTps, (select count(*) from system_info_hlr  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_hlr',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curHLRCnt.push(e.curCnt);
			      			totHLRCnt.push(e.cnt);
			      			curHLRTps.push(Math.round(e.curTps));
			      			totHLRTps.push(e.totTps);
			      		});
			      		var json = {
			      				curHLRCnt : curHLRCnt,	
			      				totHLRCnt: totHLRCnt,
			      				curHLRTps : curHLRTps,
			      				totHLRTps: totHLRTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(4), AuC 정보 전송
		  function(callback){
			  var curAuCCnt = [];
			  var totAuCCnt = [];
			  var curAuCTps = [];
			  var totAuCTps = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_tps) from system_info_auc) as totTps, (select sum(current_tps) from system_info_auc where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curTps, (select count(*) from system_info_auc  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_auc',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curAuCCnt.push(e.curCnt);
			      			totAuCCnt.push(e.cnt);
			      			curAuCTps.push(Math.round(e.curTps));
			      			totAuCTps.push(e.totTps);
			      		});
			      		var json = {
			      				curAuCCnt : curAuCCnt,	
			      				totAuCCnt: totAuCCnt,
			      				curAuCTps : curAuCTps,
			      				totAuCTps: totAuCTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(5), UCMS 정보 전송
		  function(callback){
			  var curUCMSCnt = [];
			  var totUCMSCnt = [];
			  var curUCMSTps = [];
			  var totUCMSTps = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_tps) from system_info_ucms) as totTps, (select sum(current_tps) from system_info_ucms where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curTps, (select count(*) from system_info_ucms  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_ucms',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curUCMSCnt.push(e.curCnt);
			      			totUCMSCnt.push(e.cnt);
			      			curUCMSTps.push(Math.round(e.curTps));
			      			totUCMSTps.push(e.totTps);
			      		});
			      		var json = {
			      				curUCMSCnt : curUCMSCnt,	
			      				totUCMSCnt: totUCMSCnt,
			      				curUCMSTps : curUCMSTps,
			      				totUCMSTps: totUCMSTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(6), MSS 정보 전송
		  function(callback){
			  var curMSSCnt = [];
			  var totMSSCnt = [];
			  var curMSSSess = [];
			  var totMSSSess = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_session) from system_info_mss) as totSess, (select sum(current_session) from system_info_mss where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curSess, (select count(*) from system_info_mss  where not system_name in (select distinct system_name from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\')) as curCnt from system_info_mss',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curMSSCnt.push(e.curCnt);
			      			totMSSCnt.push(e.cnt);
			      			curMSSSess.push(Math.round(e.curSess/10000));
			      			totMSSSess.push(e.totSess/10000);
			      		});
			      		var json = {
			      				curMSSCnt : curMSSCnt,	
			      				totMSSCnt: totMSSCnt,
			      				curMSSSess : curMSSSess,
			      				totMSSSess: totMSSSess
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(7), MECGW 정보 전송
		  function(callback){
			  var curMECGWCnt = [];
			  var totMECGWCnt = [];
			  var curMECGWSess = [];
			  var totMECGWSess = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_sess) from system_info_mecgw) as totSess, (select sum(current_sess) from system_info_mecgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curSess, (select count(*) from system_info_mecgw  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_mecgw',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curMECGWCnt.push(e.curCnt);
			      			totMECGWCnt.push(e.cnt);
			      			curMECGWSess.push((e.curSess/10000).toFixed(1));
			      			totMECGWSess.push(e.totSess/10000);
			      		});
			      		var json = {
			      				curMECGWCnt : curMECGWCnt,	
			      				totMECGWCnt: totMECGWCnt,
			      				curMECGWSess : curMECGWSess,
			      				totMECGWSess: totMECGWSess
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(8), SGW 정보 전송
		  function(callback){
			  var curSGWCnt = [];
			  var totSGWCnt = [];
			  var curSGWSess = [];
			  var totSGWSess = [];
				
			   mysqlDB.query('select count(*) as cnt, (select sum(max_session) from system_info_sgw) as totSess, (select sum(current_session) from system_info_sgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curSess, (select count(*) from system_info_sgw  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_sgw',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curSGWCnt.push(e.curCnt);
			      			totSGWCnt.push(e.cnt);
			      			curSGWSess.push(Math.round(Number(e.curSess)/10000));
			      			totSGWSess.push(Number(e.totSess)/10000);
			      		});
			      		var json = {
			      				curSGWCnt : curSGWCnt,	
			      				totSGWCnt: totSGWCnt,
			      				curSGWSess : curSGWSess,
			      				totSGWSess: totSGWSess
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		//fallback(9), MME 정보 전송
		  function(callback){
			  var curMMECnt = [];
			  var totMMECnt = [];
			  var curMMESub = [];
			  var totMMESub = [];
				
			  mysqlDB.query('select count(*) as cnt, (select sum(max_subscriber) from system_info_mme) as totSub, (select sum(current_subscriber) from system_info_mme where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curSub, (select count(*) from system_info_mme  where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\', \'STAT\') and alarm_mask=\'N\')) as curCnt from system_info_mme',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			curMMECnt.push(e.curCnt);
			      			totMMECnt.push(e.cnt);
			      			curMMESub.push((e.curSub/10000).toFixed(1));
			      			totMMESub.push(e.totSub/10000);
			      		});
			      		var json = {
			      				curMMECnt : curMMECnt,	
			      				totMMECnt: totMMECnt,
			      				curMMESub : curMMESub,
			      				totMMESub: totMMESub
			      		}
			      		callback(null,json);
			      	}
			  });
		  }
		 ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	});
});


router.get('/v1/pgw-list', function(req, res, next) {
  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([
		  function(callback){
			  var system_name = [];
			  var system_type = [];
			  var curSess = [];
			  var totSess = [];
			  mysqlDB.query('select system_name, system_type, current_session, max_session from system_info_pgw;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			curSess.push((e.current_session/10000).toFixed(2));
			      			totSess.push(e.max_session/10000);
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			curSess : curSess,
			      			totSess : totSess
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  // DATA PGW 요약 정보 전송
		  function(callback){
			  var curDataCnt = [];
			  var totDataCnt = [];
			  var curDataSess = [];
			  var totDataSess = [];
			  var curDataBps =[];
			  var totDataBps =[];
			  
			  mysqlDB.query('select (select count(system_name) from system_info_pgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\') and system_type=' + '"D"'+ ') as curDCnt, ' +
					  		'count(system_name) as totDCnt, '+
					        'sum(current_session) as curDSess, ' +
					        '(select sum(max_session) from system_info_pgw where system_type=' + '"D"'+ ') as totDSess, ' +
					        'sum(current_bps) as curDBps, sum(max_bps) as totDBps ' +
					        'from system_info_pgw where system_type=' + '"D"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			curDataCnt.push(e.curDCnt);
				      			totDataCnt.push(e.totDCnt);
				      			curDataSess.push(e.curDSess);
				      			totDataSess.push(e.totDSess);
				      			curDataBps.push((e.curDBps/1048576).toFixed(2));
				      			totDataBps.push((e.totDBps/1048576).toFixed(0));
				      		});
				      		var json = {
				      			curDataCnt : curDataCnt,
				      			totDataCnt : totDataCnt,
				      			curDataSess : curDataSess,
				      			totDataSess : totDataSess,
				      			curDataBps : curDataBps,
				      			totDataBps : totDataBps
				      		};
				      		callback(null,json);
				      	};
				  });
		  },
		  // 장애 SYSTEM Animation 표시
		  function(callback){
			  var system_name = [];

			  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%PGW%"',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      		});
			      		var json = {
			      			system_name : system_name,
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  // HDV PGW 요약 정보 전송
		  function(callback){
			  var curHDVCnt = [];
			  var totHDVCnt = [];
			  var curHDVSess = [];
			  var totHDVSess = [];
			  var curHDVBps =[];
			  var totHDVBps =[];
			  
			  mysqlDB.query('select (select count(system_name) from system_info_pgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"H"'+ ') as curHDVCnt, ' +
					  		'count(system_name) as totHDVCnt, '+
					        'sum(current_session) as curHDVSess, ' +
					        '(select sum(max_session) from system_info_pgw where system_type=' + '"H"'+ ') as totHDVSess, ' +
					        'sum(current_bps) as curHDVBps, sum(max_bps) as totHDVBps ' +
					        'from system_info_pgw where system_type=' + '"H"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			curHDVCnt.push(e.curHDVCnt);
				      			totHDVCnt.push(e.totHDVCnt);
				      			curHDVSess.push(e.curHDVSess);
				      			totHDVSess.push(e.totHDVSess);
				      			curHDVBps.push((e.curHDVBps/1073741824).toFixed(2));
				      			totHDVBps.push((e.totHDVBps/1073741824).toFixed(0));
				      		});
				      		var json = {
				      			curHDVCnt : curHDVCnt,
				      			totHDVCnt : totHDVCnt,
				      			curHDVSess : curHDVSess,
				      			totHDVSess : totHDVSess,
				      			curHDVBps : curHDVBps,
				      			totHDVBps : totHDVBps
				      		};
				      		callback(null,json);
				      		
				      	};
				  });
		  }
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });
});

router.get('/v1/pgw-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";

	  
	  async.parallel([ //상면,세션,bps DATA Query, pgw-detail.js, fallback(0)
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curSess = [];
			  var totSess = [];
			  var curBps = [];
			  var totBps = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_session, max_session, current_bps, max_bps from system_info_pgw;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curSess.push((e.current_session/10000).toFixed(1));
			      			totSess.push((e.max_session/10000).toFixed(0));
			      			curBps.push((e.current_bps/1048576).toFixed(2));
			      			totBps.push((e.max_bps/1048576).toFixed(2));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curSess : curSess,
			      			totSess : totSess,
			      			curBps : curBps,
			      			totBps : totBps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, pgw-detail.js, fallback(1)
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select pgw_stat_list.system_name, system_info_pgw.system_type, pgw_stat_list.date, pgw_stat_list.time, pgw_stat_list.type, pgw_stat_list.succ_rate, pgw_stat_list.att from pgw_stat_list, system_info_pgw where pgw_stat_list.system_name = system_info_pgw.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, pgw-detail.js, fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\' and system_name like \'%PGW%\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, pgw-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%PGW\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});


router.get('/v1/tas-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  /** TAS-LIST 페이지 Zone 별 정보 Query*/
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var zone = [];
				  var curSub = [];
				  var totSub = [];
				  mysqlDB.query('select system_name, system_type, zone, current_sub, max_sub from system_info_tas;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			zone.push(e.zone);
				      			curSub.push(Number(e.current_sub/10000).toFixed(1));
				      			totSub.push(Number(e.max_sub/10000));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			zone : zone,
				      			curSub : curSub,
				      			totSub : totSub
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  //Azone 장비 현황
			  function(callback){
				  var curACnt = [];
				  var totACnt = [];
				  var curASub = [];
				  var totASub = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_tas where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and zone=' + '"A"'+ ') as curACnt, ' +
						  		'count(system_name) as totACnt, '+
						        'sum(current_sub) as curASub, ' +
						        '(select sum(max_sub) from system_info_tas where zone=' + '"A"'+ ') as totASub ' +
						        'from system_info_tas where zone=' + '"A"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curACnt.push(e.curACnt);
					      			totACnt.push(e.totACnt);
					      			curASub.push(e.curASub);
					      			totASub.push(e.totASub);
					      		});
					      		var json = {
					      			curACnt : curACnt,
					      			totACnt : totACnt,
					      			curASub : curASub,
					      			totASub : totASub
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			//Bzone 장비 현황
			  function(callback){
				  var curBCnt = [];
				  var totBCnt = [];
				  var curBSub = [];
				  var totBSub = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_tas where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and zone=' + '"B"'+ ') as curBCnt, ' +
						  		'count(system_name) as totBCnt, '+
						        'sum(current_sub) as curBSub, ' +
						        '(select sum(max_sub) from system_info_tas where zone=' + '"B"'+ ') as totBSub ' +
						        'from system_info_tas where zone=' + '"B"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBCnt.push(e.curBCnt);
					      			totBCnt.push(e.totBCnt);
					      			curBSub.push(e.curBSub);
					      			totBSub.push(e.totBSub);
					      		});
					      		var json = {
					      			curBCnt : curBCnt,
					      			totBCnt : totBCnt,
					      			curBSub : curBSub,
					      			totBSub : totBSub
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			//BKzone 장비 현황
			  function(callback){
				  var curBKCnt = [];
				  var totBKCnt = [];
				  var curBKSub = [];
				  var totBKSub = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_tas where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and zone=' + '"BK"'+ ') as curBKCnt, ' +
						  		'count(system_name) as totBKCnt, '+
						        'sum(current_sub) as curBKSub, ' +
						        '(select sum(max_sub) from system_info_tas where zone=' + '"BK"'+ ') as totBKSub ' +
						        'from system_info_tas where zone=' + '"BK"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBKCnt.push(e.curBKCnt);
					      			totBKCnt.push(e.totBKCnt);
					      			curBKSub.push(e.curBKSub);
					      			totBKSub.push(e.totBKSub);
					      		});
					      		var json = {
					      			curBKCnt : curBKCnt,
					      			totBKCnt : totBKCnt,
					      			curBKSub : curBKSub,
					      			totBKSub : totBKSub
					      		};
					      		console.log(curBKCnt)
					      		callback(null,json);
					      	};
					  });
			  },
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%TAS%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});
router.get('/v1/tas-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";

	  
	  async.parallel([ //상면, 가입자수 DATA Query, tas-detail.js, fallback(0)
		  function(callback){
			  var system_name = [];
			  var zone = [];
			  var building = [];
			  var floor_plan = [];
			  var curSub = [];
			  var totSub = [];
			  mysqlDB.query('select system_name, zone, building, floor_plan, current_sub, max_sub from system_info_tas;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			zone.push(e.zone);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curSub.push((e.current_sub/10000).toFixed(1));
			      			totSub.push((e.max_sub/10000).toFixed(0));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			zone : zone,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curSub : curSub,
			      			totSub : totSub
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, tas-detail.js, fallback(1)
			  var system_name = [];
			  var zone = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select tas_stat_list.system_name, system_info_tas.zone, tas_stat_list.date, tas_stat_list.time, tas_stat_list.type, tas_stat_list.succ_rate, tas_stat_list.att from tas_stat_list, system_info_tas where tas_stat_list.system_name = system_info_tas.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			zone.push(e.zone);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			zone : zone,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, tas-detail.js, fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\' and system_name like \'%TAS%\'; ',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, pgw-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%TAS\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});

router.get('/v1/mss-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  /** mss-LIST 페이지 Zone 별 정보 Query*/
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var zone = [];
				  var curSess = [];
				  var totSess = [];
				  var curTps = [];
				  var totTps = [];
				  
				  mysqlDB.query('select system_name, system_type, zone, current_session, max_session, current_tps, max_tps from system_info_mss;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			zone.push(e.zone);
				      			curSess.push((Number(e.current_session)/10000).toFixed(1));
				      			totSess.push(Number((e.max_session)/10000).toFixed(0));
				      			curTps.push(Number(e.current_tps));
				      			totTps.push(Number(e.max_tps));
				      			
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			zone : zone,
				      			curSess : curSess,
				      			totSess : totSess,
				      			curTps : curTps,
				      			totTps : totTps
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  //Azone 장비 현황
			  function(callback){
				  var curACnt = [];
				  var totACnt = [];
				  var curASess = [];
				  var totASess = [];
				  var curATps = [];
				  var totATps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_mss where not system_name in (select distinct system_name from alarm_list where alarm_mask=\'N\') and zone=\'A\') as curACnt, ' +
						  		'count(system_name) as totACnt, '+
						        '(select sum(max_tps) from system_info_mss where zone=\'A\') as totATps, ' +
						        'sum(current_tps) as curATps, ' +
						        '(select sum(max_session) from system_info_mss where zone=\'A\') as totASess, ' +
						        'sum(current_session) as curASess ' +
						        'from system_info_mss where zone=\'A\'',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curACnt.push(e.curACnt);
					      			totACnt.push(e.totACnt);
					      			curASess.push(e.curASess);
					      			totASess.push(e.totASess);
					      			curATps.push(e.curATps);
					      			totATps.push(e.totATps);
					      		});
					      		var json = {
					      			curACnt : curACnt,
					      			totACnt : totACnt,
					      			curATps : curATps,
					      			totATps : totATps,
					      			curASess : curASess,
					      			totASess : totASess
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			//Bzone 장비 현황
			  function(callback){
				  var curBCnt = [];
				  var totBCnt = [];
				  var curBSess = [];
				  var totBSess = [];
				  var curBTps = [];
				  var totBTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_mss where not system_name in (select distinct system_name from alarm_list where alarm_mask=\'N\') and zone=' + '"B"'+ ') as curBCnt, ' +
						  		'count(system_name) as totBCnt, '+
						        'sum(current_session) as curBSess, ' +
						        '(select sum(max_session) from system_info_mss where zone=' + '"B"'+ ') as totBSess, ' +
						        'sum(current_tps) as curBTps, ' +
						        '(select sum(max_tps) from system_info_mss where zone=' + '"B"'+ ') as totBTps ' +
						        'from system_info_mss where zone=' + '"B"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBCnt.push(e.curBCnt);
					      			totBCnt.push(e.totBCnt);
					      			curBSess.push(e.curBSess);
					      			totBSess.push(e.totBSess);
					      			curBTps.push(e.curBTps);
					      			totBTps.push(e.totBTps);
					      		});
					      		var json = {
					      			curBCnt : curBCnt,
					      			totBCnt : totBCnt,
					      			curBTps : curBTps,
					      			totBTps : totBTps,
					      			curBSess : curBSess,
					      			totBSess : totBSess
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			//BKzone 장비 현황
			  function(callback){
				  var curBKCnt = [];
				  var totBKCnt = [];
				  var curBKSess = [];
				  var totBKSess = [];
				  var curBKTps = [];
				  var totBKTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_mss where not system_name in (select distinct system_name from alarm_list where alarm_mask=\'N\') and zone=' + '"BK"'+ ') as curBKCnt, ' +
						  		'count(system_name) as totBKCnt, '+
						        'sum(current_session) as curBKSess, ' +
						        '(select sum(max_session) from system_info_mss where zone=' + '"BK"'+ ') as totBKSess, ' +
						        'sum(current_tps) as curBKTps, ' +
						        '(select sum(max_tps) from system_info_mss where zone=' + '"BK"'+ ') as totBKTps ' +
						        'from system_info_mss where zone=' + '"BK"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBKCnt.push(e.curBKCnt);
					      			totBKCnt.push(e.totBKCnt);
					      			curBKSess.push(e.curBKSess);
					      			totBKSess.push(e.totBKSess);
					      			curBKTps.push(e.curBKTps);
					      			totBKTps.push(e.totBKTps);
					      		});
					      		var json = {
					      			curBKCnt : curBKCnt,
					      			totBKCnt : totBKCnt,
					      			curBKSess : curBKSess,
					      			totBKSess : totBKSess,
					      			curBKTps : curBKTps,
					      			totBKTps : totBKTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%mss%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});

router.get('/v1/mss-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";

	  
	  async.parallel([ //상면, 세션 수 DATA Query, mss-detail.js, fallback(0)
		  function(callback){
			  var system_name = [];
			  var zone = [];
			  var building = [];
			  var floor_plan = [];
			  var curSess = [];
			  var totSess = [];
			  var curTps = [];
			  var totTps = [];
			  
			  mysqlDB.query('select system_name, zone, building, floor_plan, current_session, max_session, current_tps, max_tps from system_info_mss;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			zone.push(e.zone);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curSess.push((Number(e.current_session)/10000).toFixed(1));
			      			totSess.push((Number(e.max_session)/10000).toFixed(0));
			      			curTps.push(e.current_tps);
			      			totTps.push(e.max_tps);
			      		});
			      		var json = {
			      			system_name : system_name,
			      			zone : zone,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curSess : curSess,
			      			totSess : totSess,
			      			curTps : curTps,
			      			totTps : totTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, mss-detail.js, fallback(1)
			  var system_name = [];
			  var zone = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select mss_stat_list.system_name, system_info_mss.zone, mss_stat_list.date, mss_stat_list.time, mss_stat_list.type, mss_stat_list.succ_rate, mss_stat_list.att from mss_stat_list, system_info_mss where mss_stat_list.system_name = system_info_mss.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			zone.push(e.zone);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			zone : zone,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, pgw-detail.js, fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\' and system_name like \'%MSS%\'; ',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, pgw-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%MSS\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});
router.get('/v1/mecgw-list', function(req, res, next) {
  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([
		  function(callback){
			  var system_name = [];
			  var system_type = [];
			  var location = [];
			  var curSess = [];
			  var totSess = [];
			  var curBps = [];
			  var totBps = [];
			  
			  
			  mysqlDB.query('select system_name, system_type, location, current_sess, max_sess, current_bps, max_bps from system_info_mecgw;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			location.push(e.location);
			      			curSess.push(Number(e.current_sess/10000).toFixed(2));
			      			totSess.push(Number(e.max_sess/10000).toFixed(1));
			      			curBps.push(Number(e.current_bps));
			      			totBps.push(Number(e.max_bps/1048576).toFixed(1));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			location : location,
			      			curSess : curSess,
			      			totSess : totSess,
			      			curBps : curBps,
			      			totBps : totBps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  // 광주 mecgw 요약 정보 전송
		  function(callback){
			  var curGJCnt = [];
			  var totGJCnt = [];
			  var curGJSess = [];
			  var totGJSess = [];
			  var curGJBps =[];
			  var totGJBps =[];
			  
			  mysqlDB.query('select (select count(system_name) from system_info_mecgw where not system_name in (select distinct system_name from alarm_list) and system_type=' + '"SS"'+ ') as curSSCnt, ' +
					  		'count(system_name) as totSSCnt, '+
					        'sum(current_sess) as curSSSess, ' +
					        '(select sum(max_sess) from system_info_mecgw where not system_name in (select distinct system_name from alarm_list) and system_type=' + '"SS"'+ ') as totSSSess, ' +
					        'sum(current_bps) as curSSBps, sum(max_bps) as totSSBps ' +
					        'from system_info_mecgw where system_type=' + '"SS"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			curGJCnt.push(Number(e.curSSCnt));
				      			totGJCnt.push(Number(e.totSSCnt));
				      			curGJSess.push(Number(e.curSSSess/10000).toFixed(2));
				      			totGJSess.push(Number(e.totSSSess/10000).toFixed(2));
				      			curGJBps.push(Number(e.curSSBps/1048576).toFixed(2));
				      			totGJBps.push(Number(e.totSSBps/1048576).toFixed(2));
				      		});
				      		var json = {
				      			curGJCnt : curGJCnt,
				      			totGJCnt : totGJCnt,
				      			curGJSess : curGJSess,
				      			totGJSess : totGJSess,
				      			curGJBps : curGJBps,
				      			totGJBps : totGJBps
				      		};
				      		callback(null,json);
				      	};
				  });
		  },
		  // 장애 SYSTEM Animation 표시
		  function(callback){
			  var system_name = [];

			  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%mecgw%"',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      		});
			      		var json = {
			      			system_name : system_name,
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  // 부산 mecgw 요약 정보 전송
		  function(callback){
			  var curBSCnt = [];
			  var totBSCnt = [];
			  var curBSSess = [];
			  var totBSSess = [];
			  var curBSBps =[];
			  var totBSBps =[];
			  
			  mysqlDB.query('select (select count(system_name) from system_info_mecgw where not system_name in (select distinct system_name from alarm_list) and system_type=' + '"ELG"'+ ') as curBSCnt, ' +
					  		'count(system_name) as totBSCnt, '+
					        'sum(current_sess) as curBSSess, ' +
					        '(select sum(max_sess) from system_info_mecgw where not system_name in (select distinct system_name from alarm_list) and system_type=' + '"ELG"'+ ') as totBSSess, ' +
					        'sum(current_bps) as curBSBps, sum(max_bps) as totBSBps ' +
					        'from system_info_mecgw where system_type=' + '"ELG"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			curBSCnt.push(e.curBSCnt);
				      			totBSCnt.push(e.totBSCnt);
				      			curBSSess.push(Number(e.curBSSess/10000).toFixed(2));
				      			totBSSess.push(Number(e.totBSSess/10000).toFixed(2));
				      			curBSBps.push((e.curBSBps/1048576).toFixed(2));
				      			totBSBps.push((e.totBSBps/1048576).toFixed(0));
				      		});
				      		var json = {
				      			curBSCnt : curBSCnt,
				      			totBSCnt : totBSCnt,
				      			curBSSess : curBSSess,
				      			totBSSess : totBSSess,
				      			curBSBps : curBSBps,
				      			totBSBps : totBSBps
				      		};
				      		callback(null,json);
				      		
				      	};
				  });
		  }
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });
});

router.get('/v1/mecgw-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";

	  
	  async.parallel([ //상면,세션,bps DATA Query, mecgw-detail.js, fallback(0)
		  function(callback){
			  var system_name = [];
			  var system_type = [];
			  var building = [];
			  var floor_plan = [];
			  var curSess = [];
			  var totSess = [];
			  var curBps = [];
			  var totBps = [];
			  mysqlDB.query('select system_name, system_type, building, floor_plan, current_sess, max_sess, current_bps, max_bps from system_info_mecgw;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curSess.push((e.current_sess/10000).toFixed(1));
			      			totSess.push((e.max_sess/10000).toFixed(0));
			      			curBps.push((e.current_bps/1048576).toFixed(2));
			      			totBps.push((e.max_bps/1048576).toFixed(2));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curSess : curSess,
			      			totSess : totSess,
			      			curBps : curBps,
			      			totBps : totBps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, mecgw-detail.js, fallback(1)
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select mecgw_stat_list.system_name, system_info_mecgw.system_type, mecgw_stat_list.date, mecgw_stat_list.time, mecgw_stat_list.type, mecgw_stat_list.succ_rate, mecgw_stat_list.att from mecgw_stat_list, system_info_mecgw where mecgw_stat_list.system_name = system_info_mecgw.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, mecgw-detail.js, fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\' and system_name like \'%mecgw%\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, mecgw-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system_name, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%mecgw\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system_name);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});

router.get('/v1/map', function(req, res, next) {
  /* API Send body */
  /* API Send body */
  var site = [];
  var system_name = [];
  var result;
  var result_code = 1;
  var result_msg = "success";

  async.parallel([
	  function(callback){
		  mysqlDB.query('SELECT alarm_list.date, alarm_list.time, system_info_pgw.location as location, alarm_list.system_name as system_name, alarm_list.sys_sub_name FROM alarm_list, system_info_pgw where alarm_list.system_name = system_info_pgw.system_name',
			function(error, results, fields) {
			  if(error){
				  console.log(error);
			  } else{
				  results.forEach(function(e) {
					  site.push(e.location);
					  system_name.push(e.system_name);
				  });
				  var json = {
				      site : site,
				      system_name : system_name
				  };		
				  callback(null,json);
			  }
		  });
	  }
  ],
  function(err,results){
    if(err)console.log(err);
    var result = {
      result_code: result_code,
      result_msg: result_msg,
      result:results
    };
    res.send(JSON.stringify(result));
  });		  
});

router.get('/v1/TT', function(req, res, next) {
  /* API Send body */s
  var location_arr=[]; var servertime_arr=[]; var contents_arr=[];
  /* API Send body */
  var result;
  var result_code = 1;
  var result_msg = "success";

  influxDB.query('select _contents,_location,_servertime from COOLER where time>now()-1d group by(_id)').then(results => {
    results.groups().forEach(results => {
        var curr = results.rows[0];
        location_arr.push(curr._location);
        servertime_arr.push(curr._servertime);
        contents_arr.push(curr._contents);
    });
    var final = {
      location:location_arr,
      servertime:servertime_arr,
      contents:contents_arr
    }
    result = {
      result_code: result_code,
      result_msg: result_msg,
      result: final
    };
    res.send(JSON.stringify(result));
  })
});

/* -----------------------------------sj 2020.05.18 start----------------------------------- */
router.get('/v1/hss-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var curTps = [];
				  var totTps = [];
				  mysqlDB.query('select system_name, system_type, current_tps, max_tps from system_info_hss;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			curTps.push(Math.round(e.current_tps));
				      			totTps.push(Math.round(e.max_tps));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			curTps : curTps,
				      			totTps : totTps
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  // Active HSS 요약 정보 전송
			  function(callback){
				  var curActiveCnt = [];
				  var totActiveCnt = [];
				  var curActiveTps = [];
				  var totActiveTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_hss where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"A"'+ ') as curACnt, ' +
						  		'count(system_name) as totACnt, '+
						        'sum(current_tps) as curATps, ' +
						        '(select sum(max_tps) from system_info_hss where system_type=' + '"A"'+ ') as totATps ' +
						        'from system_info_hss where system_type=' + '"A"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curActiveCnt.push(e.curACnt);
					      			totActiveCnt.push(e.totACnt);
					      			curActiveTps.push(e.curATps);
					      			totActiveTps.push(e.totATps);
					      		});
					      		var json = {
					      			curActiveCnt : curActiveCnt,
					      			totActiveCnt : totActiveCnt,
					      			curActiveTps : curActiveTps,
					      			totActiveTps : totActiveTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%HSS%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  
			// Standby HSS 요약 정보 전송
			  function(callback){
				  var curStandbyCnt = [];
				  var totStandbyCnt = [];
				  var curStandbyTps = [];
				  var totStandbyTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_hss where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"S"'+ ') as curSCnt, ' +
						  		'count(system_name) as totSCnt, '+
						        'sum(current_tps) as curSTps, ' +
						        '(select sum(max_tps) from system_info_hss where system_type=' + '"S"'+ ') as totSTps ' +
						        'from system_info_hss where system_type=' + '"S"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curStandbyCnt.push(e.curSCnt);
					      			totStandbyCnt.push(e.totSCnt);
					      			curStandbyTps.push(e.curSTps);
					      			totStandbyTps.push(e.totSTps);
					      		});
					      		var json = {
					      			curStandbyCnt : curStandbyCnt,
					      			totStandbyCnt : totStandbyCnt,
					      			curStandbyTps : curStandbyTps,
					      			totStandbyTps : totStandbyTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  
			// BKUP HSS 요약 정보 전송
			  function(callback){
				  var curBKCnt = [];
				  var totBKCnt = [];
				  var curBKTps = [];
				  var totBKTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_hss where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"BK"'+ ') as curBCnt, ' +
						  		'count(system_name) as totBCnt, '+
						        'sum(current_tps) as curBTps, ' +
						        '(select sum(max_tps) from system_info_hss where system_type=' + '"BK"'+ ') as totBTps ' +
						        'from system_info_hss where system_type=' + '"BK"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBKCnt.push(e.curBCnt);
					      			totBKCnt.push(e.totBCnt);
					      			curBKTps.push(e.curBTps);
					      			totBKTps.push(e.totBTps);
					      		});
					      		var json = {
					      			curBKCnt : curBKCnt,
					      			totBKCnt : totBKCnt,
					      			curBKTps : curBKTps,
					      			totBKTps : totBKTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  }
		
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});

router.get('/v1/hss-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([ //상면,세션,tps DATA Query, hss-detail.js
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curTps = [];
			  var totTps = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_tps, max_tps from system_info_hss;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curTps.push((e.current_tps));
			      			totTps.push((e.max_tps));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curTps : curTps,
			      			totTps : totTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, hss-detail.js
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select hss_stat_list.system_name, system_info_hss.system_type, hss_stat_list.date, hss_stat_list.time, hss_stat_list.type, hss_stat_list.succ_rate, hss_stat_list.att from hss_stat_list, system_info_hss where hss_stat_list.system_name = system_info_hss.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, hss-detail.js
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, hss-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%HSS\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});

router.get('/v1/hlr-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var curTps = [];
				  var totTps = [];
				  mysqlDB.query('select system_name, system_type, current_tps, max_tps from system_info_hlr;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			curTps.push(Math.round(e.current_tps));
				      			totTps.push(Math.round(e.max_tps));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			curTps : curTps,
				      			totTps : totTps
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  // Active HLR 요약 정보 전송
			  function(callback){
				  var curActiveCnt = [];
				  var totActiveCnt = [];
				  var curActiveTps = [];
				  var totActiveTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_hlr where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"A"'+ ') as curACnt, ' +
						  		'count(system_name) as totACnt, '+
						        'sum(current_tps) as curATps, ' +
						        '(select sum(max_tps) from system_info_hlr where system_type=' + '"A"'+ ') as totATps ' +
						        'from system_info_hlr where system_type=' + '"A"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curActiveCnt.push(e.curACnt);
					      			totActiveCnt.push(e.totACnt);
					      			curActiveTps.push(e.curATps);
					      			totActiveTps.push(e.totATps);
					      		});
					      		var json = {
					      			curActiveCnt : curActiveCnt,
					      			totActiveCnt : totActiveCnt,
					      			curActiveTps : curActiveTps,
					      			totActiveTps : totActiveTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%HLR%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  
			  
			// BKUP HLR 요약 정보 전송
			  function(callback){
				  var curBKCnt = [];
				  var totBKCnt = [];
				  var curBKTps = [];
				  var totBKTps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_hlr where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"BK"'+ ') as curBCnt, ' +
						  		'count(system_name) as totBCnt, '+
						        'sum(current_tps) as curBTps, ' +
						        '(select sum(max_tps) from system_info_hlr where system_type=' + '"BK"'+ ') as totBTps ' +
						        'from system_info_hlr where system_type=' + '"BK"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curBKCnt.push(e.curBCnt);
					      			totBKCnt.push(e.totBCnt);
					      			curBKTps.push(e.curBTps);
					      			totBKTps.push(e.totBTps);
					      		});
					      		var json = {
					      			curBKCnt : curBKCnt,
					      			totBKCnt : totBKCnt,
					      			curBKTps : curBKTps,
					      			totBKTps : totBKTps
					      		};
					      		callback(null,json);
					      	};
					  });
			  }
		
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});

router.get('/v1/hlr-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([ //상면,세션,tps DATA Query, hlr-detail.js
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curTps = [];
			  var totTps = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_tps, max_tps from system_info_hlr;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curTps.push((e.current_tps));
			      			totTps.push((e.max_tps));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curTps : curTps,
			      			totTps : totTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, hlr-detail.js
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = []; //timeout_event*1000/succ
			  var att = []; //timeout_event 값
	
			  mysqlDB.query('select hlr_stat_list.system_name, system_info_hlr.system_type, hlr_stat_list.date, hlr_stat_list.time, hlr_stat_list.type, hlr_stat_list.succ_rate, hlr_stat_list.att from hlr_stat_list, system_info_hlr where hlr_stat_list.system_name = system_info_hlr.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate)); //timeout_event*1000/succ
			      			att.push(Number(e.att));  //timeout_event 값
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
							att : att 
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, hlr-detail.js
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, hlr-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  
			  mysqlDB.query('select system, th0, th1 from threshold_list where system like \'%HLR\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1
				      		}
				      		callback(null,json);
				      	}
				  });
		  }
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});


router.get('/v1/auc-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  function(callback){
				  var system_name = [];
				  var auc_num = [];
				  var system_type = [];
				  var curTps = [];
				  var totTps = [];
				  mysqlDB.query('select system_name, substring(system_name, 4, 2) AS auc_num, system_type, current_tps, max_tps from system_info_auc;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			auc_num.push(e.auc_num)
				      			system_type.push(e.system_type);
				      			curTps.push(e.current_tps);
				      			totTps.push(e.max_tps);
				      		});
				      		var json = {
				      			system_name : system_name,
				      			auc_num : auc_num,
				      			system_type : system_type,
				      			curTps : curTps,
				      			totTps : totTps
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  // AuC21_MP0, MP1 요약 정보 전송
			  function(callback){
				  var curAuC21Cnt = [];
				  var totAuC21Cnt = [];
				  var curAuC21Tps = [];
				  var totAuC21Tps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_auc where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_name like ' + '"AUC21%"'+ ') as curA21Cnt, ' +
						  		'count(system_name) as totA21Cnt, '+
						        'sum(current_tps) as curA21Tps, ' +
						        '(select sum(max_tps) from system_info_auc where system_name like ' + '"AUC21%"'+ ') as totA21Tps ' +
						        'from system_info_auc where system_name like ' + '"AUC21%"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curAuC21Cnt.push(e.curA21Cnt);
					      			totAuC21Cnt.push(e.totA21Cnt);
					      			curAuC21Tps.push(e.curA21Tps);
					      			totAuC21Tps.push(e.totA21Tps);
					      		});
					      		var json = {
					      			curAuC21Cnt : curAuC21Cnt,
					      			totAuC21Cnt : totAuC21Cnt,
					      			curAuC21Tps : curAuC21Tps,
					      			totAuC21Tps : totAuC21Tps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%AUC%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  
			// AuC22_MP0, MP1 요약 정보 전송
			  function(callback){
				  var curAuC22Cnt = [];
				  var totAuC22Cnt = [];
				  var curAuC22Tps = [];
				  var totAuC22Tps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_auc where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_name like ' + '"AUC22%"'+ ') as curA22Cnt, ' +
						  		'count(system_name) as totA22Cnt, '+
						        'sum(current_tps) as curA22Tps, ' +
						        '(select sum(max_tps) from system_info_auc where system_name like ' + '"AUC22%"'+ ') as totA22Tps ' +
						        'from system_info_auc where system_name like ' + '"AUC22%"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curAuC22Cnt.push(e.curA22Cnt);
					      			totAuC22Cnt.push(e.totA22Cnt);
					      			curAuC22Tps.push(e.curA22Tps);
					      			totAuC22Tps.push(e.totA22Tps);
					      		});
					      		var json = {
					      			curAuC22Cnt : curAuC22Cnt,
					      			totAuC22Cnt : totAuC22Cnt,
					      			curAuC22Tps : curAuC22Tps,
					      			totAuC22Tps : totAuC22Tps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  
			// AuC25 요약 정보 전송
			  function(callback){
				  var curAuC25Cnt = [];
				  var totAuC25Cnt = [];
				  var curAuC25Tps = [];
				  var totAuC25Tps = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_auc where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_name like ' + '"AUC25%"'+ ') as curA25Cnt, ' +
						  		'count(system_name) as totA25Cnt, '+
						        'sum(current_tps) as curA25Tps, ' +
						        '(select sum(max_tps) from system_info_auc where system_name like ' + '"AUC25%"'+ ') as totA25Tps ' +
						        'from system_info_auc where system_name like ' + '"AUC25%"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curAuC25Cnt.push(e.curA25Cnt);
					      			totAuC25Cnt.push(e.totA25Cnt);
					      			curAuC25Tps.push(e.curA25Tps);
					      			totAuC25Tps.push(e.totA25Tps);
					      		});
					      		var json = {
					      			curAuC25Cnt : curAuC25Cnt,
					      			totAuC25Cnt : totAuC25Cnt,
					      			curAuC25Tps : curAuC25Tps,
					      			totAuC25Tps : totAuC25Tps
					      		};
					      		callback(null,json);
					      	};
					  });
			  }
		
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});

router.get('/v1/auc-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([ //상면,세션,tps DATA Query, auc-detail.js
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curTps = [];
			  var totTps = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_tps, max_tps from system_info_auc;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curTps.push((e.current_tps));
			      			totTps.push((e.max_tps));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curTps : curTps,
			      			totTps : totTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, auc-detail.js  fallback(1)
			  var system_name = [];
			  var auc_num = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select s.system_name, substring(s.system_name,4,2) AS auc_num, i.system_type ,s.date, s.time, s.type, s.succ_rate, s.att from auc_stat_list AS s, system_info_auc AS i where s.system_name = i.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			auc_num.push(e.auc_num);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			auc_num : auc_num,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, auc-detail.js  fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, auc-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7 from threshold_list where system like \'%AUC%\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});

router.get('/v1/ucms-detail', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([ //상면,세션,tps DATA Query, ucms-detail.js
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curTps = [];
			  var totTps = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_tps, max_tps from system_info_ucms;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curTps.push((e.current_tps));
			      			totTps.push((e.max_tps));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curTps : curTps,
			      			totTps : totTps
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ //통계 DATA Query, ucms-detail.js  fallback(1)
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var att = [];
			  mysqlDB.query('select s.system_name, i.system_type , s.date, s.time, s.type, s.succ_rate, s.att from ucms_stat_list AS s, system_info_ucms AS i where s.system_name = i.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, ucms-detail.js  fallback(2)
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, auc-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  var th8 = [];
			  var th9 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7, th8, th9 from threshold_list where system like \'%UCMS%\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      			th8.push(e.th8);
				      			th9.push(e.th9);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7,
				      			th8 : th8,
				      			th9 : th9
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});
/* ---------------------------------------sj 2020.05.18~ end-----------------------------------*/

/* ---------------------------------------taeh start-----------------------------------*/

router.get('/v1/sgw-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var curSess = [];
				  var totSess = [];
				  mysqlDB.query('select system_name, system_type, current_session, max_session from system_info_sgw;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			curSess.push((Number(e.current_session)/10000).toFixed(2));
				      			totSess.push((Number(e.max_session)/10000).toFixed(2));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			curSess : curSess,
				      			totSess : totSess
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  
			  function(callback){
				  var curLCnt = [];
				  var totLCnt = [];
				  var curLSess = [];
				  var totLSess = [];
				  var curLBps =[];
				  var totLBps =[];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_sgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\') and system_type=' + '"L"'+ ') as curLCnt, ' +
						  		'count(system_name) as totLCnt, '+
						        'sum(current_session) as curLSess, ' +
						        '(select sum(max_session) from system_info_sgw where system_type=' + '"L"'+ ') as totLSess, ' +
						        'sum(current_bps) as curLBps, sum(max_bps) as totLBps ' +
						        'from system_info_sgw where system_type=' + '"L"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curLCnt.push(e.curLCnt);
					      			totLCnt.push(e.totLCnt);
					      			curLSess.push(e.curLSess);
					      			totLSess.push(e.totLSess);
					      			curLBps.push((e.curLBps/1073741824).toFixed(2));
					      			totLBps.push((e.totLBps/1073741824).toFixed(2));
					      		});
					      		var json = {
					      			curLCnt : curLCnt,
					      			totLCnt : totLCnt,
					      			curLSess : curLSess,
					      			totLSess : totLSess,
					      			curLBps : curLBps,
					      			totLBps : totLBps
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%SGW%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  
			  function(callback){
				  var curVCnt = [];
				  var totVCnt = [];
				  var curVSess = [];
				  var totVSess = [];
				  var curVBps =[];
				  var totVBps =[];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_sgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"V"'+ ') as curVCnt, ' +
						  		'count(system_name) as totVCnt, '+
						        'sum(current_session) as curVSess, ' +
						        '(select sum(max_session) from system_info_sgw where system_type=' + '"V"'+ ') as totVSess, ' +
						        'sum(current_bps) as curVBps, sum(max_bps) as totVBps ' +
						        'from system_info_sgw where system_type=' + '"V"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curVCnt.push(e.curVCnt);
					      			totVCnt.push(e.totVCnt);
					      			curVSess.push(e.curVSess);
					      			totVSess.push(e.totVSess);
					      			curVBps.push((e.curVBps/1073741824).toFixed(2));
					      			totVBps.push((e.totVBps/1073741824).toFixed(2));
					      		});
					      		var json = {
					      			curVCnt : curVCnt,
					      			totVCnt : totVCnt,
					      			curVSess : curVSess,
					      			totVSess : totVSess,
					      			curVBps : curVBps,
					      			totVBps : totVBps
					      		};
					      		callback(null,json);
					      		
					      	};
					  });
			  },

			  function(callback){
				  var curSCnt = [];
				  var totSCnt = [];
				  var curSSess = [];
				  var totSSess = [];
				  var curSBps =[];
				  var totSBps =[];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_sgw where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"S"'+ ') as curSCnt, ' +
						  		'count(system_name) as totSCnt, '+
						        'sum(current_session) as curSSess, ' +
						        '(select sum(max_session) from system_info_sgw where system_type=' + '"S"'+ ') as totSSess, ' +
						        'sum(current_bps) as curSBps, sum(max_bps) as totSBps ' +
						        'from system_info_sgw where system_type=' + '"S"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curSCnt.push(e.curSCnt);
					      			totSCnt.push(e.totSCnt);
					      			curSSess.push(e.curSSess);
					      			totSSess.push(e.totSSess);
					      			curSBps.push((e.curSBps/1073741824).toFixed(2));
					      			totSBps.push((e.totSBps/1073741824).toFixed(2));
					      		});
					      		var json = {
					      			curSCnt : curSCnt,
					      			totSCnt : totSCnt,
					      			curSSess : curSSess,
					      			totSSess : totSSess,
					      			curSBps : curSBps,
					      			totSBps : totSBps
					      		};
					      		callback(null,json);
					      		
					      	};
					  });
			  }
	      ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
});

router.get('/v1/sgw-list/:number', function(req, res, next) {
		  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([ //상면,세션,bps DATA Query, pgw-detail.js
			  function(callback){
				  var system_name = [];
				  var building = [];
				  var floor_plan = [];
				  var curSess = [];
				  var totSess = [];
				  var curBps = [];
				  var totBps = [];
				  mysqlDB.query('select system_name, building, floor_plan, current_session, max_session, current_bps, max_bps from system_info_sgw;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			building.push(e.building);
				      			floor_plan.push(e.floor_plan);
				      			curSess.push((e.current_session/10000).toFixed(1));
				      			totSess.push((e.max_session/10000).toFixed(0));
				      			curBps.push((e.current_bps/1073741824).toFixed(2));
				      			totBps.push((e.max_bps/1073741824).toFixed(2));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			building : building,
				      			floor_plan : floor_plan,
				      			curSess : curSess,
				      			totSess : totSess,
				      			curBps : curBps,
				      			totBps : totBps
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  function(callback){ //통계 DATA Query, pgw-detail.js
				  var system_name = [];
				  var system_type = [];
				  var date = [];
				  var time = [];
				  var type = [];
				  var succ_rate = [];
			 	  var att = [];
				  mysqlDB.query('select sgw_stat_list.system_name, system_info_sgw.system_type, sgw_stat_list.date, sgw_stat_list.time, sgw_stat_list.type, sgw_stat_list.succ_rate, sgw_stat_list.att from sgw_stat_list, system_info_sgw where sgw_stat_list.system_name = system_info_sgw.system_name;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			date.push(e.date);
				      			time.push(e.time);
				      			type.push(e.type);			      			
								succ_rate.push(Number(e.succ_rate));
			      				att.push(Number(e.att));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			date : date,
				      			time : time,
				      			type : type,
				      			succ_rate : succ_rate,
			      				att : att
				      		}
				      		callback(null,json);
				      	}
				  });

			  },
			  function(callback){ //알람 DATA Query, pgw-detail.js
				  var system_name = [];
				  var date = [];
				  var time = [];
				  var sys_sub_name = [];
				  var type = [];
				  var code = [];
				  
				  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\' and system_name like \'%SGW%\';',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			date.push(e.date);
					      			time.push(e.time);
					      			system_name.push(e.system_name);
					      			sys_sub_name.push(e.sys_sub_name);
					      			type.push(e.alarm_type);
					      			code.push(e.alarm_code);
					      		});
					      		var json = {
					      			date : date,
					      			time : time,
					      			system_name : system_name,
					      			sys_sub_name : sys_sub_name,
					      			type : type,
					      			code : code
					      		}
					      		callback(null,json);
					      	}
					  });
			  },
			  function(callback){ //Threshold Query, hss-detail.js, fallback(3)
				  var system = [];
				  var th0 = [];
				  var th1 = [];
				  var th2 = [];
				  var th3 = [];
				  
				  mysqlDB.query('select system, th0, th1, th2, th3 from threshold_list where system like \'%SGW\';',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			system.push(e.system);
					      			th0.push(e.th0);
					      			th1.push(e.th1);
					      			th2.push(e.th2);
					      			th3.push(e.th3);
					      		});
					      		var json = {
					      			system : system,
					      			th0 : th0,
					      			th1 : th1,
					      			th2 : th2,
					      			th3 : th3,
					      		}
					      		callback(null,json);
					      	}
					  });
			  }
		  ],
		  function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });	
	});

router.get('/v1/mme-list', function(req, res, next) {
	  /* API Send body */
		  var result_code = 1;
		  var result_msg = "success";
		  
		  async.parallel([
			  function(callback){
				  var system_name = [];
				  var system_type = [];
				  var curSub = [];
				  var totSub = [];
				  mysqlDB.query('select system_name, system_type, current_subscriber, max_subscriber from system_info_mme;',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      			system_type.push(e.system_type);
				      			curSub.push(Math.round(e.current_subscriber/10000));
				      			totSub.push(Math.round(e.max_subscriber/10000));
				      		});
				      		var json = {
				      			system_name : system_name,
				      			system_type : system_type,
				      			curSub : curSub,
				      			totSub : totSub
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  // mme 요약 정보 전송
			  function(callback){
				  var curCenterCnt = [];
				  var totCenterCnt = [];
				  var curCenterSub = [];
				  var totCenterSub = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_mme where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask=\'N\') and system_type=' + '"C"'+ ') as curcmCnt, ' +
						  		'count(system_name) as totcmCnt, '+
						        'sum(current_subscriber) as curcmSub, ' +
						        '(select sum(max_subscriber) from system_info_mme where system_type=' + '"C"'+ ') as totcmSub ' +
						        'from system_info_mme where system_type=' + '"C"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curCenterCnt.push(e.curcmCnt);
					      			totCenterCnt.push(e.totcmCnt);
					      			curCenterSub.push(e.curcmSub);
					      			totCenterSub.push(e.totcmSub);
					      		});
					      		var json = {
					      			curCenterCnt : curCenterCnt,
					      			totCenterCnt : totCenterCnt,
					      			curCenterSub : curCenterSub,
					      			totCenterSub : totCenterSub
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
			  // 장애 SYSTEM Animation 표시
			  function(callback){
				  var system_name = [];

				  mysqlDB.query('select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\' and system_name LIKE ' + '"%MME%"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system_name.push(e.system_name);
				      		});
				      		var json = {
				      			system_name : system_name,
				      		}
				      		callback(null,json);
				      	}
				  });
			  },
			  // mme 요약 정보 전송
			  function(callback){
				  var curEastCnt = [];
				  var totEastCnt = [];
				  var curEastSub = [];
				  var totEastSub = [];
				  
				  mysqlDB.query('select (select count(system_name) from system_info_mme where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"E"'+ ') as curemCnt, ' +
						  		'count(system_name) as totemCnt, '+
						        'sum(current_subscriber) as curemSub, ' +
						        '(select sum(max_subscriber) from system_info_mme where system_type=' + '"E"'+ ') as totemSub ' +
						        'from system_info_mme where system_type=' + '"E"',
						  function(error, results, fields) {
						  	if (error) {
					      		console.log(error);
					      	} else {
					      		results.forEach(function(e) {
					      			curEastCnt.push(e.curemCnt);
					      			totEastCnt.push(e.totemCnt);
					      			curEastSub.push(e.curemSub);
					      			totEastSub.push(e.totemSub);
					      		});
					      		var json = {
					      			curEastCnt : curEastCnt,
					      			totEastCnt : totEastCnt,
					      			curEastSub : curEastSub,
					      			totEastSub : totEastSub
					      		};
					      		callback(null,json);
					      	};
					  });
			  },
		  function(callback){
			  var curngCnt = [];
			  var totngCnt = [];
			  var curngSub = [];
			  var totngSub = [];
			  
			  mysqlDB.query('select (select count(system_name) from system_info_mme where not system_name in (select distinct system_name from alarm_list where alarm_type in (\'ALARM\',\'STAT\') and alarm_mask =\'N\') and system_type=' + '"G"'+ ') as curgmCnt, ' +
					  		'count(system_name) as totgmCnt, '+
					        'sum(current_subscriber) as curgmSub, ' +
					        '(select sum(max_subscriber) from system_info_mme where system_type=' + '"G"'+ ') as totgmSub ' +
					        'from system_info_mme where system_type=' + '"G"',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			curngCnt.push(e.curgmCnt);
				      			totngCnt.push(e.totgmCnt);
				      			curngSub.push(e.curgmSub);
				      			totngSub.push(e.totgmSub);
		
				      		});
				      		var json = {
				      			curngCnt : curngCnt,
				      			totngCnt : totngCnt,
				      			curngSub : curngSub,
				      			totngSub : totngSub
				      		};
				      		callback(null,json);
				      	};
				  });
		  },	  
		],
		
		function(err,results){
		    if(err)console.log(err);
		    var result = {
		      result_code: result_code,
		      result_msg: result_msg,
		      result:results
		    };
		    res.send(JSON.stringify(result));
		  });
		  


});

router.get('/v1/mme-list/:number', function(req, res, next) {
	  /* API Send body */
	  var result_code = 1;
	  var result_msg = "success";
	  
	  async.parallel([ 
		  function(callback){
			  var system_name = [];
			  var building = [];
			  var floor_plan = [];
			  var curSub = [];
			  var totSub = [];
			  mysqlDB.query('select system_name, building, floor_plan, current_subscriber, max_subscriber from system_info_mme;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			building.push(e.building);
			      			floor_plan.push(e.floor_plan);
			      			curSub.push(Math.round(e.current_subscriber/10000));
			      			totSub.push(Math.round(e.max_subscriber/10000));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			building : building,
			      			floor_plan : floor_plan,
			      			curSub : curSub,
			      			totSub : totSub
			      		}
			      		callback(null,json);
			      	}
			  });
		  },
		  function(callback){ 
			  var system_name = [];
			  var system_type = [];
			  var date = [];
			  var time = [];
			  var type = [];
			  var succ_rate = [];
			  var vendor = [];
			  var att = [];
			  mysqlDB.query('select mme_stat_list.system_name, system_info_mme.system_type, mme_stat_list.date, mme_stat_list.time, mme_stat_list.type, mme_stat_list.succ_rate, system_info_mme.vendor, mme_stat_list.att from mme_stat_list, system_info_mme where mme_stat_list.system_name = system_info_mme.system_name;',
				  function(error, results, fields) {
				  	if (error) {
			      		console.log(error);
			      	} else {
			      		results.forEach(function(e) {
			      			system_name.push(e.system_name);
			      			system_type.push(e.system_type);
			      			date.push(e.date);
			      			time.push(e.time);
			      			type.push(e.type);
			      			succ_rate.push(Number(e.succ_rate));
			      			vendor.push(e.vendor);
			      			att.push(Number(e.att));
			      		});
			      		var json = {
			      			system_name : system_name,
			      			system_type : system_type,
			      			date : date,
			      			time : time,
			      			type : type,
			      			succ_rate : succ_rate,
			      			vendor : vendor,
							att : att
			      		}
			      		callback(null,json);
			      	}
			  });

		  },
		  function(callback){ //알람 DATA Query, hss-detail.js
			  var system_name = [];
			  var date = [];
			  var time = [];
			  var sys_sub_name = [];
			  var type = [];
			  var code = [];
			  
			  mysqlDB.query('select date, time, system_name, sys_sub_name, alarm_type, alarm_code from alarm_list where alarm_type=\'ALARM\' and alarm_mask=\'N\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			date.push(e.date);
				      			time.push(e.time);
				      			system_name.push(e.system_name);
				      			sys_sub_name.push(e.sys_sub_name);
				      			type.push(e.alarm_type);
				      			code.push(e.alarm_code);
				      		});
				      		var json = {
				      			date : date,
				      			time : time,
				      			system_name : system_name,
				      			sys_sub_name : sys_sub_name,
				      			type : type,
				      			code : code
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
		  function(callback){ //Threshold Query, hss-detail.js, fallback(3)
			  var system = [];
			  var th0 = [];
			  var th1 = [];
			  var th2 = [];
			  var th3 = [];
			  var th4 = [];
			  var th5 = [];
			  var th6 = [];
			  var th7 = [];
			  var th8 = [];
			  var th9 = [];
			  var th10 = [];
			  var th11 = [];
			  var th12 = [];
			  var th13 = [];
			  
			  mysqlDB.query('select system, th0, th1, th2, th3, th4, th5, th6, th7, th8, th9, th10, th11, th12, th13 from threshold_list where system like \'%MME\';',
					  function(error, results, fields) {
					  	if (error) {
				      		console.log(error);
				      	} else {
				      		results.forEach(function(e) {
				      			system.push(e.system);
				      			th0.push(e.th0);
				      			th1.push(e.th1);
				      			th2.push(e.th2);
				      			th3.push(e.th3);
				      			th4.push(e.th4);
				      			th5.push(e.th5);
				      			th6.push(e.th6);
				      			th7.push(e.th7);
				      			th8.push(e.th8);
				      			th9.push(e.th9);
				      			th10.push(e.th10);
				      			th11.push(e.th11);
				      			th12.push(e.th12);
				      			th13.push(e.th13);
				      		});
				      		var json = {
				      			system : system,
				      			th0 : th0,
				      			th1 : th1,
				      			th2 : th2,
				      			th3 : th3,
				      			th4 : th4,
				      			th5 : th5,
				      			th6 : th6,
				      			th7 : th7,
				      			th8 : th8,
				      			th9 : th9,
				      			th10 : th10,
				      			th11 : th11,
				      			th12 : th12,
				      			th13 : th13
				      		}
				      		callback(null,json);
				      	}
				  });
		  },
	  ],
	  function(err,results){
	    if(err)console.log(err);
	    var result = {
	      result_code: result_code,
	      result_msg: result_msg,
	      result:results
	    };
	    res.send(JSON.stringify(result));
	  });	
});


/* ---------------------------------------taeh end-----------------------------------*/

module.exports = router;
