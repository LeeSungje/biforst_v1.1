var express = require('express');
var router = express.Router();
var mysqlDB = require('../config/db_conn')
//var Set = require("collections/set")

function getStrTypeToken(query) {
	return "'" + String(query) + "'";
}

function getQueryInUppercase(query) {
	return "'" + String(query).toUpperCase() + "'";
}

/* get : select query */
router.get('/pgw-info', function (req, res, next) {
	/* API Send body */
	var array_data = [];

	var result;
	var result_code = 1;
	var result_msg = "success";

	mysqlDB.query('SELECT SYSTEM_NAME, SYSTEM_TYPE, LOCATION, BUILDING, FLOOR_PLAN, MAX_SESSION, MAX_BPS, LAST_UPDATE FROM SYSTEM_INFO_PGW',
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				if (!results.length) json = {};
				else {
					results.forEach(result => {
						var pgw_data = {
							SYSTEM_NAME: result.SYSTEM_NAME,
							SYSTEM_TYPE: result.SYSTEM_TYPE,
							LOCATION: result.LOCATION,
							BUILDING: result.BUILDING,
							FLOOR_PLAN: result.FLOOR_PLAN,
							MAX_SESSION: result.MAX_SESSION,
							MAX_BPS: result.MAX_BPS,
							LAST_UPDATE: result.LAST_UPDATE
						};
						array_data.push(pgw_data);
					})
				}
				res.send(JSON.stringify(array_data));
			};
		}
	)
});

router.get('/tas-info', function (req, res, next) {
	/* API Send body */
	var array_data = [];

	var result;
	var result_code = 1;
	var result_msg = "success";

	mysqlDB.query('SELECT SYSTEM_NAME, SYSTEM_TYPE, ZONE, LOCATION, BUILDING, FLOOR_PLAN, MAX_SUB, LAST_UPDATE FROM SYSTEM_INFO_TAS',
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				if (!results.length) json = {};
				else {
					results.forEach(result => {
						var tas_data = {
							SYSTEM_NAME: result.SYSTEM_NAME,
							SYSTEM_TYPE: result.SYSTEM_TYPE,
							ZONE: result.ZONE,
							LOCATION: result.LOCATION,
							BUILDING: result.BUILDING,
							FLOOR_PLAN: result.FLOOR_PLAN,
							MAX_SUB: result.MAX_SUB,
							LAST_UPDATE: result.LAST_UPDATE
						};
						array_data.push(tas_data);
					})
				}
				res.send(JSON.stringify(array_data));
			};
		}
	)
});

router.get('/mss-info', function (req, res, next) {
	/* API Send body */
	var array_data = [];

	var result;
	var result_code = 1;
	var result_msg = "success";

	mysqlDB.query('SELECT SYSTEM_NAME, SYSTEM_TYPE, ZONE, LOCATION, BUILDING, FLOOR_PLAN, MAX_SESS, MAX_TPS, LAST_UPDATE FROM SYSTEM_INFO_MSS',
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				if (!results.length) json = {};
				else {
					results.forEach(result => {
						var mss_data = {
							SYSTEM_NAME: result.SYSTEM_NAME,
							SYSTEM_TYPE: result.SYSTEM_TYPE,
							ZONE: result.ZONE,
							LOCATION: result.LOCATION,
							BUILDING: result.BUILDING,
							FLOOR_PLAN: result.FLOOR_PLAN,
							MAX_SESS: result.MAX_SESS,
							MAX_TPS: result.MAX_TPS,
							LAST_UPDATE: result.LAST_UPDATE
						};
						array_data.push(mss_data);
					})
				}
				res.send(JSON.stringify(array_data));
			};
		}
	)
});

router.get('/th-info', function (req, res, next) {
	/* API Send body */
	var array_data = [];

	var result;
	var result_code = 1;
	var result_msg = "success";

	mysqlDB.query('SELECT SYSTEM, SYSTEM_NAME, th0, th1, th2, th3, th4, th5, th6, th7, th8, th9, th10 FROM THRESHOLD_LIST',
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				if (!results.length) json = {};
				else {
					results.forEach(result => {
						var th_data = {
							SYSTEM: result.SYSTEM,
							SYSTEM_NAME: result.SYSTEM_NAME,
							TH0: result.th0,
							TH1: result.th1,
							TH2: result.th2,
							TH3: result.th3,
							TH4: result.th4,
							TH5: result.th5,
							TH6: result.th6,
							TH7: result.th7,
							TH8: result.th8,
							TH9: result.th9,
							TH10: result.th10
						};
						array_data.push(th_data);
					})
				}
				res.send(JSON.stringify(array_data));
			};
		}
	)
});


router.get('/siteinfo', function (req, res, next) {
	var site = getQueryInUppercase(req.body.SITE);
	var floor = getQueryInUppercase(req.body.FLOOR);
	var rack = getQueryInUppercase(req.body.RACK);

	var _RESULT;
	mysqlDB.query("SELECT LOCATION, FLOOR_PLAN FROM SYSTEM_INFO_PGW",
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				var result_code = 1;
				var result_msg = "success";
				var result = {
					result_code: result_code,
					result_msg: result_msg
				};
				var site = [];
				var floor = [];

				

				
				res.send(JSON.stringify(result));

			};
		}
	)
})



router.put('/deviceinfo', function (req, res, next) {
	var system_name = getStrTypeToken(req.body.SYSTEM_NAME);
	
	if(system_name.includes("PGW")){
		mysqlDB.query("SELECT SYSTEM_NAME FROM SYSTEM_INFO_PGW WHERE system_name=" + system_name,
			function (error, results, fields) {
				if (error) {
					console.log(error);
				} else {
					var result_code = 1;
					var result_msg = "success";
					var result = {
						result_code: result_code,
						result_msg: result_msg
					};
					if(results == ""){
						var query_result="0";
					}
					else{
						var query_result="1";
					}
					res.send(query_result);
				};
			}
		)
	}	
	if(system_name.includes("TAS")){
		mysqlDB.query("SELECT SYSTEM_NAME FROM SYSTEM_INFO_TAS WHERE system_name=" + system_name,
				function (error, results, fields) {
					if (error) {
						console.log(error);
					} else {
						var result_code = 1;
						var result_msg = "success";
						var result = {
							result_code: result_code,
							result_msg: result_msg
						};
						if(results == ""){
							var query_result="0";
						}
						else{
							var query_result="1";
						}
						res.send(query_result);
					};
				}
			)
	}
})


router.put('/deviceinfo_s', function (req, res, next) {
	var system_name = getStrTypeToken(req.body.SYSTEM_NAME);
	var system_type = getStrTypeToken(req.body.SYSTEM_TYPE);
	var location = getStrTypeToken(req.body.LOCATION);
	var building = getQueryInUppercase(req.body.BUILDING);
	var floor_plan = getQueryInUppercase(req.body.FLOOR_PLAN);
	var max_sess = getStrTypeToken(req.body.MAX_SESSION);
	var max_bps = getStrTypeToken(req.body.MAX_BPS);
	
	mysqlDB.query("INSERT INTO SYSTEM_INFO_PGW(system_name,system_type,location,building,floor_plan,max_session,max_bps,last_update)" +
		"VALUE(" + system_name + "," + system_type + "," + location + "," + building + "," + floor_plan + "," + max_sess + "," + max_bps +",sysdate())",
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				var result_code = 1;
				var result_msg = "success";
				var result = {
					result_code: result_code,
					result_msg: result_msg
				};
				res.send(result);
				mysqlDB.query("INSERT INTO SYSTEM_INFO_TOTAL(system_name,system_type,location,building,floor_plan)" +
						"VALUE(" + system_name + "," + system_type + "," + location + "," + building + "," + floor_plan+ ")",
						function (error, results, fields) {
							if (error) {
								console.log(error);
							} else {
								var result_code = 1;
								var result_msg = "success";
								var result = {
									result_code: result_code,
									result_msg: result_msg
								};
							};
						}
					)
			};
		}
	)
})

router.delete('/deviceinfo/:id', function (req, res, next) {
	var id = req.params.id;
	
	mysqlDB.query('DELETE from SYSTEM_INFO_PGW where SYSTEM_NAME=' + getStrTypeToken(req.params.id),
		function (error, results, fields) {
			if (error) {
				console.log(error);
			} else {
				var result_code = 1;
				var result_msg = "success";
				var result = {
					result_code: result_code,
					result_msg: result_msg
				};
				res.send(result);
				mysqlDB.query('DELETE from SYSTEM_INFO_TOTAL where SYSTEM_NAME=' + getStrTypeToken(req.params.id),
						function (error, results, fields) {
							if (error) {
								console.log(error);
							} else {
								var result_code = 1;
								var result_msg = "success";
								var result = {
									result_code: result_code,
									result_msg: result_msg
								};
							}
						}
					)
			}
		}
	)
})

router.patch('/deviceinfo/:id', function (req, res, next) {

	mysqlDB.query('select system from threshold_list where system='+ getStrTypeToken(req.body.SYSTEM),
		function(error, results, fields) {			
			if (error) {
				console.log(error);
			} else {
				var result_code = 1;
				var result_msg = "success";
				var result = {
					result_code: result_code,
					result_msg: result_msg
				};
				if(results == ""){
					var query_result="1";
				}
				else{
					var query_result="0";
				}
				res.send(query_result);
			};
		}
	)
})

router.patch('/deviceinfo_s/:id', function (req, res, next) {
	var system = getStrTypeToken(req.body.SYSTEM);
	var th0 = getStrTypeToken(req.body.TH0);
	var th1 = getStrTypeToken(req.body.TH1);
	var th2 = getStrTypeToken(req.body.TH2);
	var th3 = getStrTypeToken(req.body.TH3);
	var th4 = getStrTypeToken(req.body.TH4);
	var th5 = getStrTypeToken(req.body.TH5);
	var th6 = getStrTypeToken(req.body.TH6);
	var th7 = getStrTypeToken(req.body.TH7);
	
	
	
	//var sql = 'UPDATE threshold_list SET TH0=?,TH1=?,TH2=?,TH3=?,TH4=?,TH5=?,TH6=?,TH7=? WHERE SYSTEM=?';
	//var params = [th0,th1,th2,th3,th4,th5,th6,th7,system];
	//console.log(params);
	
	mysqlDB.query('update threshold_list set th0='+th0+',th1='+th1+',th2='+th2+',th3='+th3+',th4='+th4+',th5='+th5+',th6='+th6+',th7='+th7+' where system='+system,
		function(error, results, fields) {			
			if (error) {
				console.log(error);
			} else {
				var result_code = 1;
				var result_msg = "success";
				var result = {
					result_code: result_code,
					result_msg: result_msg
				};
				res.send(result);
			};
		}
	)
})
module.exports = router;