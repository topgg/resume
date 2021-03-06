var deerResume = angular.module('deerResume', ['ngRoute', 'wiz.markdown', 'ngNotify', 'angularLocalStorage', 'angular-md5']);

//var baseurl = 'http://cvbox.sinaapp.com/'; // 使用SAE托管简历数据
//var baseurl = 'data.php'; // 使用本地文件托管简历数据，本地模式下，不支持在线编辑
var baseurl = 'data.json?v=1.0.0'; // 使用本地文件托管简历数据，本地模式下，不支持在线编辑
var pwdurl = 'pwd.json?v=1.0.0';

deerResume.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: 'admin.html',
            controller: 'adminCtrl'
        }).when('/resume', {
            templateUrl: 'resume.html',
            controller: 'resumeCtrl'
        }).otherwise({
            redirectTo: '/resume'
        });
    }]);

deerResume.controller('resumeCtrl', function ($scope, $rootScope, $http, storage, md5) {
    storage.bind($scope, 'vpass');
    $http.get(pwdurl).success(function (pwdObj) {debugger
        $scope.resume = pwdObj;
        if (pwdObj != null && pwdObj.vpass != null) {

            if (pwdObj.vpass == $scope.vpass) {
                $http.get(baseurl).success(function (data) {
                    $scope.resume.content = data.content;
                    $scope.resume.show = data.show;
                });
            }
            $scope.vpass = "";
        }

        $rootScope.resume = $scope.resume;
    });

    $scope.password = function (vpass) {debugger
        $scope.vpass = md5.createHash(vpass);
        window.location.reload();
    }
});

deerResume.controller('adminCtrl', function ($scope, $rootScope, $http, ngNotify) {
    if ($.trim($rootScope.resume) && $rootScope.resume.show == '1') {
        $scope.resume = $rootScope.resume;
    } 

    $scope.save = function (item) {
        $http
        ({
            method: 'POST',
            url: baseurl + "?a=update&domain=" + encodeURIComponent(window.location),
            data: $.param({
                'title': item.title,
                'subtitle': item.subtitle,
                'content': item.content,
                'view_password': item.view_password,
                'admin_password': item.admin_password
            }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(
            function (data) {
                //$scope.notice('');
                if (data.errno == 0) {
                    $scope.apass = item.admin_password;
                    $scope.wpass = item.view_password;
                    ngNotify.set(data.notice, 'success');
                }
                else {
                    ngNotify.set(data.error, 'error');
                }
            }
        );
    };

    // 请求云端数据，有三种情况：
    // 1 云端没有任何记录，这个时候显示默认模板
    // 2 云端已经存在数据，且设置有阅读密码，这时候提示输入密码

    // 右上角留入口
});

// ============
function makepdf() {
    //post('http://pdf.ftqq.com',{'title':$('#drtitle').html(),'subtitle':$('#drsubtitle').html(),'content':$('#cvcontent').html(),'pdfkey':'jobdeersocool'});
    $("#hform [name=title]").val($('#drtitle').html());
    $("#hform [name=subtitle]").val($('#drsubtitle').html());
    $("#hform [name=content]").val($('#cvcontent').html());
    $("#hform [name=pdfkey]").val('jobdeersocool');
    $("#hform").submit();
}

function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    var form = jQuery('<form/>', {
        'id': 'hform',
        'method': method,
        'action': path,
        'target': '_blank'
    });

    for (var key in params) {
        if (params.hasOwnProperty(key)) {

            var hiddenField = jQuery('<input/>', {
                'type': 'hidden',
                'name': key,
                'value': params[key]
            });

            form.appendChild(hiddenField);
        }
    }

    form.submit();
}


function pdf() {
    var doc = new jsPDF();
    var specialElementHandlers = {
        '.action-bar': function (element, renderer) {
            return true;
        }
    };

    doc.fromHTML($("#resume_body").get(0), 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    });

    doc.output("dataurlnewwindow");
}
//添加置顶功能
$(document).ready(function () {
    var THRESHOLD = 50;
    var $top = $('.back-to-top');

    $(window).on('scroll', function () {
        $top.toggleClass('back-to-top-on', window.pageYOffset > THRESHOLD);
    });

    $top.on('click', function () {
        $('body').velocity('scroll');
    });
});