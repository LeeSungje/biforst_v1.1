var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('map');
});

/**
router.get('/:site', function(req, res, next){
	  res.render('index', { site: req.params.site });
});
*/
router.get('/admin', function(req, res, next){
	  res.render('admin');
	  
});

router.get('/pgw-list', function(req, res, next){
	  res.render('pgw-list');
});

router.get('/pgw-list/:system', function(req, res, next){
	  res.render('pgw-detail', { system: req.params.system});
	  
});

router.get('/pgw-rm', function(req, res, next){
	  res.render('pgw-rm');
	  
});

router.get('/tas-list', function(req, res, next){
	  res.render('tas-list');
});

router.get('/tas-list/:system', function(req, res, next){
	  res.render('tas-detail', { system: req.params.system});
	  
});

router.get('/tas-rm', function(req, res, next){
	  res.render('tas-rm');
	  
});

router.get('/mecgw-list', function(req, res, next){
	  res.render('mecgw-list');
});

router.get('/mecgw-list/:system', function(req, res, next){
	  res.render('mecgw-detail', { system: req.params.system});
	  
});

router.get('/mecgw-rm', function(req, res, next){
	  res.render('mecgw-rm');
	  
});
/* -----------------------------------sj 2020.04.20 start----------------------------------- */
router.get('/hss-list', function(req, res, next){
	  res.render('hss-list');
	  
});

router.get('/hss-list/:system', function(req, res, next){
	  res.render('hss-detail', { system: req.params.system});
	  
});

router.get('/hss-rm', function(req, res, next){
	  res.render('hss-rm');
	  
});



router.get('/hlr-list', function(req, res, next){
	  res.render('hlr-list');
	  
});
router.get('/hlr-list/:system', function(req, res, next){
	  res.render('hlr-detail', { system: req.params.system});
	  
});
router.get('/hlr-rm', function(req, res, next){
	  res.render('hlr-rm');
	  
});



router.get('/auc-list', function(req, res, next){
	  res.render('auc-list');
	  
});
router.get('/auc-list/:system', function(req, res, next){
	  res.render('auc-detail', { system: req.params.system});
	  
});
router.get('/auc-rm', function(req, res, next){
	  res.render('auc-rm');
	  
});


router.get('/ucms-detail', function(req, res, next){
	  res.render('ucms-detail');
	  
});

router.get('/ucms-rm', function(req, res, next){
	  res.render('ucms-rm');
	  
});
/* -----------------------------------sj 2020.05.28 end----------------------------------- */

/* -----------------------------------th----------------------------------- */
router.get('/mme-list', function(req, res, next){
	  res.render('mme-list');
});

router.get('/mme-list/:system', function(req, res, next){
	  res.render('mme-detail', { system: req.params.system});
	  
});

router.get('/mme-rm', function(req, res, next){
	  res.render('mme-rm');
	  
});

router.get('/sgw-list', function(req, res, next){
	  res.render('sgw-list');
});

router.get('/sgw-list/:system', function(req, res, next){
	  res.render('sgw-detail', { system: req.params.system});
	  
});

router.get('/sgw-rm', function(req, res, next){
	  res.render('sgw-rm');
	  
});

router.get('/mss-list', function(req, res, next){
	  res.render('mss-list');
});

router.get('/mss-list/:system', function(req, res, next){
	  res.render('mss-detail', { system: req.params.system});
	  
});

router.get('/mss-rm', function(req, res, next){
	  res.render('mss-rm');
	  
});


/**
router.get('/system-detail/:system', function(req, res, next){
  res.render('system-detail');
});
*/

module.exports = router;


	