$("#view-admin-tables").hide();

// GET SITERACK INFO //
var siteRack_info;
function siteRackInfo() {
  $.ajax({
    url: '/admin-api-v1/siteinfo',
    type: "GET"
  })
  .done(function (results) {
    var result, type, msg;
    var result_val = JSON.parse(results);
    siteRack_info = result_val;
  })
}

// ~~ Select2 Initiation ~~ (start) //
$("#db_site").select2({
  placeholder: "국사를 선택하세요",
  allowClear: true,
  width: '100%'
});

$("#db_floor").select2({
  placeholder: "국사를 먼저 선택하세요",
  allowClear: true,
  width: '100%'
});

$("#db_rack").select2({
  placeholder: "국사, 층을 먼저 선택하세요",
  allowClear: true,
  width: '100%'
});
for(var i = 1; i <= 42; i++) {
  var newOption = new Option(i, i, false, false);
  $('#db_holes').append(newOption).trigger('change');
}
// ~~ Select2 Initiation ~~(end) //



// DEVICE_INFO TABLE //
var table;
$(function () {
  $("#b-pgw").click(function () {
    $("#view-admin-tables").show();
    $("#pgw-table").show();
    $("#tas-table").hide();
    $("#mss-table").hide();
    $("#auc-table").hide();
    $("#hlr-table").hide();
    $("#hss-table").hide();
    $("#mme-table").hide();
    $("#sgw-table").hide();
    $("#threshold-table").hide();
    
    //$("#total-table").hide();
    
    if ($.fn.dataTable.isDataTable('#pgw-datatables')) {
      table = $('#pgw-datatables').DataTable();
    }
    else {
      
      var pgw_dev_format = "<thead> " + 
           "<tr>"+
              "<th>시스템명</th>"+
              "<th>시스템TYPE</th>"+
              "<th>국사명(SITE)</th>"+
              "<th>층(FLOOR)</th>"+
              "<th>상면</th>"+
              "<th>용량(SESSION)</th>"+
              "<th>용량(BPS)</th>"+
              "<th>최종 수정일(LAST_UPDATE)</th>"+
          "</thead>";
      
      $("#pgw-datatables").append(pgw_dev_format)
      
      table = $('#pgw-datatables').DataTable({
        retrieve: true,
        select: {
          items: 'row',
          style: 'single'
        },
        "language": {
          "emptyTable": "데이터가 존재하지 않습니다.",
          "lengthMenu": "페이지당 _MENU_ 개씩 보기",
          "info": "현재 _START_ - _END_ / _TOTAL_건",
          "infoEmpty": "데이터 없음",
          "infoFiltered": "( _MAX_건의 데이터에서 필터링됨 )",
          "search": "에서 검색: ",
          "zeroRecords": "일치하는 데이터가 없습니다.",
          "loadingRecords": "로딩중...",
          "processing": "잠시만 기다려 주십시오...",
          "paginate": {
            "next": "다음",
            "previoust": "이전"
          }
        },
        ajax: {
          'url': '/admin-api-v1/pgw-info',
          'dataSrc': ''
        },
        columns: [
          { data: "SYSTEM_NAME" },
          { data: "SYSTEM_TYPE" },
          { data: "LOCATION" },
          { data: "BUILDING" },
          { data: "FLOOR_PLAN" },
          { data: "MAX_SESSION" },
          { data: "MAX_BPS" },
          { data: "LAST_UPDATE" },
        ],
        dom: 'Bfrtip',
        buttons: [
          {
            text: '추가',
            className: 'db-add',

            action: function () {
              $("#db_system_name").val("");
              $("#db_system_type").val("");
              $("#db_location").val("");
              $("#db_building").val("");
              $("#db_floor_plan").val("");
              $("#db_max_sess").val("");
              $("#db_max_bps").val("");
               
              $("#AddEditModal-dev").on('show.bs.modal', function (event) {
                $.ajax({
                  //url: '/admin-api-v1/siteinfo',
                  //type: "GET"
                })
                .done(function (results) {
                  //var result, type, msg;
                  //var result = JSON.parse(results)
                              
                  $(document)
                  .off()
                  .on("click", "#addeditbtn", function() {
                  var json = JSON.stringify({
                	SYSTEM_NAME: $("#db_system_name").val(),
                	SYSTEM_TYPE: $("#db_system_type").val(),
                	LOCATION: $("#db_location").val(),
                	BUILDING: $("#db_building").val(),
                	FLOOR_PLAN: $("#db_floor_plan").val(),
                	MAX_SESSION: $("#db_max_sess").val(),
                	MAX_BPS: $("#db_max_bps").val(),
                   });
                  AddDevData(json);
                  })
                })
              });
              $("#AddEditModal-dev").modal("show");
            }
          },
          {
            text: '삭제',
            action: function () {
              var data = table.rows('.selected').data();
              var id = data[0].SYSTEM_NAME;
              $("#DeleteModal-dev").on('show.bs.modal', function (event) {
                $(document)
                  .off()
                  .on("click", "#delete-btn", function() {
                  DeleteDevData(id);
                })
              });
              $('#DeleteModal-dev').modal("show");
            }
          },
          {
            extend: 'excel',
            charset: 'UTF-8',
            title: 'PGW현황_'+getDateTime(), 
            text: 'Download(Excel)'
          }
        ]
      })
    }
  })
});
$(function () {
  $("#b-tas").click(function () {
    $("#view-admin-tables").show();
    $("#tas-table").show();
    $("#pgw-table").hide();
    $("#mss-table").hide();
    $("#auc-table").hide();
    $("#hlr-table").hide();
    $("#hss-table").hide();
    $("#mme-table").hide();
    $("#sgw-table").hide();
    $("#threshold-table").hide();
    
    if ($.fn.dataTable.isDataTable('#tas-datatables')) {
      table = $('#tas-datatables').DataTable();
    }
    else {
      
      var tas_dev_format = "<thead> " + 
           "<tr>"+
              "<th>시스템명</th>"+
              "<th>TYPE</th>"+
              "<th>Zone</th>"+
              "<th>국사명(SITE)</th>"+
              "<th>층(FLOOR)</th>"+
              "<th>상면</th>"+
              "<th>용량(가입자)</th>"+
              "<th>최종 수정일(LAST_UPDATE)</th>"+
          "</thead>";
      
      $("#tas-datatables").append(tas_dev_format)
      
      table = $('#tas-datatables').DataTable({
        retrieve: true,
        select: {
          items: 'row',
          style: 'single'
        },
        "language": {
          "emptyTable": "데이터가 존재하지 않습니다.",
          "lengthMenu": "페이지당 _MENU_ 개씩 보기",
          "info": "현재 _START_ - _END_ / _TOTAL_건",
          "infoEmpty": "데이터 없음",
          "infoFiltered": "( _MAX_건의 데이터에서 필터링됨 )",
          "search": "에서 검색: ",
          "zeroRecords": "일치하는 데이터가 없습니다.",
          "loadingRecords": "로딩중...",
          "processing": "잠시만 기다려 주십시오...",
          "paginate": {
            "next": "다음",
            "previoust": "이전"
          }
        },
        ajax: {
          'url': '/admin-api-v1/tas-info',
          'dataSrc': ''
        },
        columns: [
          { data: "SYSTEM_NAME" },
          { data: "SYSTEM_TYPE" },
          { data: "ZONE" },
          { data: "LOCATION" },
          { data: "BUILDING" },
          { data: "FLOOR_PLAN" },
          { data: "MAX_SUB" },
          { data: "LAST_UPDATE" },
        ],
        dom: 'Bfrtip',
        buttons: [
          {
            text: '추가',
            className: 'db-add',

            action: function () {
              $("#db_system_name").val("");
              $("#db_system_type").val("");
              $("#db_zone").val("");
              $("#db_location").val("");
              $("#db_building").val("");
              $("#db_floor_plan").val("");
              $("#db_max_sub").val("");
               
              $("#AddEditModal-dev").on('show.bs.modal', function (event) {
                $.ajax({
                  //url: '/admin-api-v1/siteinfo',
                  //type: "GET"
                })
                .done(function (results) {
                  //var result, type, msg;
                  //var result = JSON.parse(results)
                              
                  $(document)
                  .off()
                  .on("click", "#addeditbtn", function() {
                  var json = JSON.stringify({
                	SYSTEM_NAME: $("#db_system_name").val(),
                	SYSTEM_TYPE: $("#db_system_type").val(),
                	ZONE: $("#db_zone").val(),
                	LOCATION: $("#db_location").val(),
                	BUILDING: $("#db_building").val(),
                	FLOOR_PLAN: $("#db_floor_plan").val(),
                	MAX_SESSION: $("#db_max_sub").val()
                   });
                  AddDevData(json);
                  })
                })
              });
              $("#AddEditModal-dev").modal("show");
            }
          },
          {
            text: '삭제',
            action: function () {
              var data = table.rows('.selected').data();
              var id = data[0].SYSTEM_NAME;
              $("#DeleteModal-dev").on('show.bs.modal', function (event) {
                $(document)
                  .off()
                  .on("click", "#delete-btn", function() {
                  DeleteDevData(id);
                })
              });
              $('#DeleteModal-dev').modal("show");
            }
          },
          {
            extend: 'excel',
            charset: 'UTF-8',
            title: 'TAS현황_'+getDateTime(), 
            text: 'Download(Excel)'
          }
        ]
      })
    }
  })
});
$(function () {
	  $("#b-mss").click(function () {
	    $("#view-admin-tables").show();
	    $("#mss-table").show();
	    $("#tas-table").hide();
	    $("#pgw-table").hide();
	    $("#auc-table").hide();
	    $("#hlr-table").hide();
	    $("#hss-table").hide();
	    $("#mme-table").hide();
	    $("#sgw-table").hide();
	    $("#threshold-table").hide();
	    
	    if ($.fn.dataTable.isDataTable('#mss-datatables')) {
	      table = $('#mss-datatables').DataTable();
	    }
	    else {
	      
	      var mss_dev_format = "<thead> " + 
	           "<tr>"+
	              "<th>시스템명</th>"+
	              "<th>TYPE</th>"+
	              "<th>Zone</th>"+
	              "<th>국사명(SITE)</th>"+
	              "<th>층(FLOOR)</th>"+
	              "<th>상면</th>"+
	              "<th>Session</th>"+
	              "<th>TPS</th>"+
	              "<th>최종 수정일(LAST_UPDATE)</th>"+
	          "</thead>";
	      
	      $("#mss-datatables").append(mss_dev_format)
	      
	      table = $('#mss-datatables').DataTable({
	        retrieve: true,
	        select: {
	          items: 'row',
	          style: 'single'
	        },
	        "language": {
	          "emptyTable": "데이터가 존재하지 않습니다.",
	          "lengthMenu": "페이지당 _MENU_ 개씩 보기",
	          "info": "현재 _START_ - _END_ / _TOTAL_건",
	          "infoEmpty": "데이터 없음",
	          "infoFiltered": "( _MAX_건의 데이터에서 필터링됨 )",
	          "search": "에서 검색: ",
	          "zeroRecords": "일치하는 데이터가 없습니다.",
	          "loadingRecords": "로딩중...",
	          "processing": "잠시만 기다려 주십시오...",
	          "paginate": {
	            "next": "다음",
	            "previoust": "이전"
	          }
	        },
	        ajax: {
	          'url': '/admin-api-v1/mss-info',
	          'dataSrc': ''
	        },
	        columns: [
	          { data: "SYSTEM_NAME" },
	          { data: "SYSTEM_TYPE" },
	          { data: "ZONE" },
	          { data: "LOCATION" },
	          { data: "BUILDING" },
	          { data: "FLOOR_PLAN" },
	          { data: "MAX_SESS" },
	          { data: "MAX_TPS" },
	          { data: "LAST_UPDATE" },
	        ],
	        dom: 'Bfrtip',
	        buttons: [
	          {
	            text: '추가',
	            className: 'db-add',

	            action: function () {
	              $("#db_system_name").val("");
	              $("#db_system_type").val("");
	              $("#db_zone").val("");
	              $("#db_location").val("");
	              $("#db_building").val("");
	              $("#db_floor_plan").val("");
	              $("#db_max_sess").val("");
	              $("#db_max_tps").val("");
	              
	              $("#AddEditModal-dev").on('show.bs.modal', function (event) {
	                $.ajax({
	                  //url: '/admin-api-v1/siteinfo',
	                  //type: "GET"
	                })
	                .done(function (results) {
	                  //var result, type, msg;
	                  //var result = JSON.parse(results)
	                              
	                  $(document)
	                  .off()
	                  .on("click", "#addeditbtn", function() {
	                  var json = JSON.stringify({
	                	SYSTEM_NAME: $("#db_system_name").val(),
	                	SYSTEM_TYPE: $("#db_system_type").val(),
	                	ZONE: $("#db_zone").val(),
	                	LOCATION: $("#db_location").val(),
	                	BUILDING: $("#db_building").val(),
	                	FLOOR_PLAN: $("#db_floor_plan").val(),
	                	MAX_SESS: $("#db_max_sess").val(),
	                	MAX_TPS: $("#db_max_tps").val()
	                   });
	                  AddDevData(json);
	                  })
	                })
	              });
	              $("#AddEditModal-dev").modal("show");
	            }
	          },
	          {
	            text: '삭제',
	            action: function () {
	              var data = table.rows('.selected').data();
	              var id = data[0].SYSTEM_NAME;
	              $("#DeleteModal-dev").on('show.bs.modal', function (event) {
	                $(document)
	                  .off()
	                  .on("click", "#delete-btn", function() {
	                  DeleteDevData(id);
	                })
	              });
	              $('#DeleteModal-dev').modal("show");
	            }
	          },
	          {
	            extend: 'excel',
	            charset: 'UTF-8',
	            title: 'MSS현황_'+getDateTime(), 
	            text: 'Download(Excel)'
	          }
	        ]
	      })
	    }
	  })
});


$(function () {
	  $("#b-EditTH").click(function () {
	    $("#view-admin-tables").show();
	    $("#threshold-table").show();
	    $("#pgw-table").hide();
	    $("#tas-table").hide();
	    $("#mss-table").hide();
	    $("#auc-table").hide();
	    $("#hlr-table").hide();
	    $("#hss-table").hide();
	    $("#mme-table").hide();
	    $("#sgw-table").hide();
	    
	    if ($.fn.dataTable.isDataTable('#threshold-datatables')) {
	      table = $('#threshold-datatables').DataTable();
	    }
	    else {
	      table = $('#threshold-datatables').DataTable({
	        retrieve: true,
	        select: {
	          items: 'row',
	          style: 'single'
	        },
	        "language": {
	          "emptyTable": "데이터가 존재하지 않습니다.",
	          "lengthMenu": "페이지당 _MENU_ 개씩 보기",
	          "info": "현재 _START_ - _END_ / _TOTAL_건",
	          "infoEmpty": "데이터 없음",
	          "infoFiltered": "( _MAX_건의 데이터에서 필터링됨 )",
	          "search": "에서 검색: ",
	          "zeroRecords": "일치하는 데이터가 없습니다.",
	          "loadingRecords": "로딩중...",
	          "processing": "잠시만 기다려 주십시오...",
	          "paginate": {
	            "next": "다음",
	            "previoust": "이전"
	          }
	        },
	        ajax: {
	          'url': '/admin-api-v1/th-info',
	          'dataSrc': ''
	        },
	        columns: [
	          { data: "SYSTEM" },
	          { data: "TH0" },
	          { data: "TH1" },
	          { data: "TH2" },
	          { data: "TH3" },
	          { data: "TH4" },
	          { data: "TH5" },
	          { data: "TH6" },
	          { data: "TH7" },
	          { data: "TH8" },
	          { data: "TH9" },
	          { data: "TH10" }
	        ],
	        dom: 'Bfrtip',
	        buttons: [
	          {
	            text: '추가',
	            className: 'db-add',

	            action: function () {
	              $("#db_system").val("");
	              $("#db_th0").val("");
	              $("#db_th1").val("");
	              $("#db_th2").val("");
	              $("#db_th3").val("");
	              $("#db_th4").val("");
	              $("#db_th5").val("");
	              $("#db_th6").val("");
	              $("#db_th7").val("");
	              $("#db_th8").val("");
	              $("#db_th9").val("");
	              $("#db_th10").val("");
	               
	              $("#AddEditModal-dev").on('show.bs.modal', function (event) {
	                $.ajax({
	                  //url: '/admin-api-v1/siteinfo',
	                  //type: "GET"
	                })
	                .done(function (results) {
	                  //var result, type, msg;
	                  //var result = JSON.parse(results)
	                              
	                  $(document)
	                  .off()
	                  .on("click", "#addeditbtn", function() {
	                  var json = JSON.stringify({
	                	SYSTEM: $("#db_system").val(),
	                	TH0: $("#db_th0").val(),
	                	TH1: $("#db_th1").val(),
	                	TH2: $("#db_th2").val(),
	                	TH3: $("#db_th3").val(),
	                	TH4: $("#db_th4").val(),
	                	TH5: $("#db_th5").val(),
	                	TH6: $("#db_th6").val(),
	                	TH7: $("#db_th7").val()
	                   });
	                  AddDevData(json);
	                  })
	                })
	              });
	              $("#AddEditModal-dev").modal("show");
	            }
	          },
	          {
	            text: '수정',
	            action: function () {
	              var count = table.rows('.selected').count();

	              if(count == 0) {              
	                notify_("danger", "수정할 장비를 선택해주세요.");
	                return;
	              } else {
	                  var data = table.rows('.selected').data();
	                  
	                  console.log(data[0]);
	                 
	                  //add data in popup Modal
	                  $("#db_system").val(data[0].SYSTEM);
	                  $("#db_th0").val(data[0].TH0);
	                  $("#db_th1").val(data[0].TH1);
	                  $("#db_th2").val(data[0].TH2);
	                  $("#db_th3").val(data[0].TH3);
	                  $("#db_th4").val(data[0].TH4);
	                  $("#db_th5").val(data[0].TH5);
	                  $("#db_th6").val(data[0].TH6);
	                  $("#db_th7").val(data[0].TH7);
	                  
	                  var id=data[0].SYSTEM;
	                  $("#AddEditModal-threshold").on('show.bs.modal', function () {
	                    $(document)
	                      .off()
	                      .on("click", "#addeditbtn", function() {
	                      var json = JSON.stringify({
	                        SYSTEM: $("#db_system").val(),
	                        TH0: $("#db_th0").val(),
	                        TH1: $("#db_th1").val(),
	                        TH2: $("#db_th2").val(),
	                        TH3: $("#db_th3").val(),
	                        TH4: $("#db_th4").val(),
	                        TH5: $("#db_th5").val(),
	                        TH6: $("#db_th6").val(),
	                        TH7: $("#db_th7").val()
	                      });
	                      EditDevData(id, json);
	                    })
	                  });
	                  $("#AddEditModal-threshold").modal("show");
	              }
	            }
	          },
	          {
	            extend: 'excel',
	            charset: 'UTF-8',
	            title: 'PGW현황_'+getDateTime(), 
	            text: 'Download(Excel)'
	          }
	        ]
	      })
	    }
	  })
});

function AddDevData(json) {
  $.ajax({
    url: '/admin-api-v1/deviceinfo',
    type: "PUT",
    dataType: "json",
    data: json,
    contentType: "application/json; charset=UTF-8"
  })
  .done(function (query_result) {
    var result, type, msg;
    result= JSON.stringify(query_result);
    
    if( result == "0") {
      $.ajax({
        url: 'admin-api-v1/deviceinfo_s',
        type: "PUT",
        dataType: "json",
        data: json,
        contentType: "application/json; charset=UTF-8"
      })
      .done(function (data) {
        var json = data;  
        if (json.result_code == 1) {
          type = "success";
          msg = "시스템을 성공적으로 추가하였습니다."
          table.ajax.reload();
          notify_(type, msg); 
        }
        else {
          type = "danger";
          msg = "정보 업데이트에 실패했습니다."
          notify_(type, msg); 
        }
      })
    } else if(result == "1") {
      type = "danger";
      msg = "이미 등록 된 시스템입니다."
      notify_(type, msg); 
    } else {
      type = "danger";
      msg = "알 수 없는 오류입니다.";
      notify_(type, msg); 
    }
  })
}


function EditDevData(id, json) {
  $.ajax({
    url: '/admin-api-v1/deviceinfo/' + id,
    type: "PATCH",
    dataType: "json",
    data: json,
    contentType: "application/json; charset=UTF-8"
  })
    .done(function (query_result) {
      var result, type, msg;
      result= JSON.stringify(query_result);
      
      if( result == "0") {
        $.ajax({
          url: 'admin-api-v1/deviceinfo_s/' + id,
          type: "PATCH",
          dataType: "json",
          data: json,
          contentType: "application/json; charset=UTF-8"
        })
        .done(function (data) {
          var json = data;    
          // result_code == 1 means updating db is successful
          if (json.result_code == 1) {
            type = "success";
            msg = "정보가 성공적으로 수정되었습니다."
            table.ajax.reload();
            notify_(type, msg); 
          }
          else {
            type = "danger";
            msg = "정보 업데이트를 실패했습니다."
            notify_(type, msg); 
          }
        })
      } else if(result == "1") {
        type = "fail";
        msg = "존재하지 않는 시스템을 입력했습니다."
        notify_(type, msg); 
      } else {
        type = "fail";
        msg = "알 수 없는 오류입니다.";
        notify_(type, msg); 
      }
  })
}

function DeleteDevData(id) {
  $.ajax({
    url: '/admin-api-v1/deviceinfo/' + id,
    type: "DELETE",
    contentType: "application/json; charset=UTF-8"
  })
    .done(function (data) {
      var json = data;
      var type, msg;
      // result_code == 1 means updating db is successful
      if (json.result_code == 1) {
        type = "success";
        msg = "정보가 성공적으로 업데이트 되었습니다."
        table.ajax.reload();
        notify_(type, msg); 
      }
      else {
        type = "danger";
        msg = "정보 업데이트를 실패했습니다."
        notify_(type, msg); 
      }
    });
}

function notify_(type, msg) {
  $.notify({
    message: msg,
    url: ''
  }, {
      element: 'body',
      type: type,
      allow_dismiss: true,
      offset: {
        x: 20,
        y: 85
      },
      spacing: 10,
      z_index: 1031,
      delay: 2500,
      timer: 1000,
      url_target: '_blank',
      mouse_over: false,
      icon_type: 'class',
    });
};


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
	return "'"+year + month + day+ "_" + hour + ":" + min+":"+sec+"'";
}