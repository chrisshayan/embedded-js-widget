var dataJobsList = [];
var translationData =
    {
        "show_less":{
            "vn":"Thu gọn",
            "en":"Show less"
        },"show_more":{
            "vn":"Xem thêm",
            "en":"Show more"
        },"load_more":{
            "vn":"Xem thêm",
            'en':"Load more"
        },"Posted":{
            "vn":"Đăng tuyển",
            "en":"Posted"
        },
        "Industries":{
            "vn":"Ngành nghề",
            "en":"Industries"
        },
        "Benefits" : {
            "vn":"Phúc lợi",
            "en":"Benefits"
        },
        "Skills" : {
            "vn":"Kỹ năng",
            "en":"Skills"
        },"job_not_found":{
            "vn":"No job found!",
            "en":"Không tìm thấy việc làm!"
        },"month_01":{
            'vn':"T1",
            'en':"JAN"
        },"month_02":{
            'vn':"T2",
            'en':"FEB"
        },"month_03":{
            'vn':"T3",
            'en':"MAR"
        },"month_04":{
            'vn':"T4",
            'en':"APR"
        },"month_05":{
            'vn':"T5",
            'en':"MAY"
        },"month_06":{
            'vn':"T6",
            'en':"JUN"
        },"month_07":{
            'vn':"T7",
            'en':"JUL"
        },"month_08":{
            'vn':"T8",
            'en':"AUG"
        },"month_09":{
            'vn':"T9",
            'en':"SEP"
        },"month_10":{
            'vn':"T10",
            'en':"OCT"
        },"month_11":{
            'vn':"T11",
            'en':"NOV"
        },"month_12":{
            'vn':"T12",
            'en':"DEC"
        }
    };
define(['jquery', 'ractive', 'rv!templates/template', 'rv!templates/jobList', 'text!css/my-widget_embed.css','jquery.scrollbar'], function ($vnwWidget, Ractive, mainTemplate, jobListTemplate, css, $vnwJQueryScrollbar) {

    'use strict';
    $vnwWidget.noConflict(true);
    var app = {
        init: function () {
            Ractive.DEBUG = false;
            dataJobsList = [];
            var $style = $vnwWidget("<style></style>", {type: "text/css"});
            $style.text(css);
            $vnwWidget("head").append($style);

            // render our main view
            this.ractive = new Ractive({
                el: 'vietnamworks-jobs',
                template: mainTemplate,
                partials: {
                    jobList: jobListTemplate
                }
            });
            var lang = $vnwWidget('#vietnamworks-jobs').data('vnw-lang');
            if(lang == '2'){
                lang = 'en';
            }else{
                lang = 'vn';
            }
            var tranlation = {};
            $vnwWidget.each(translationData,function(key, value){
                tranlation[key] = value[lang];
            });
            this.ractive.set("translation",tranlation);
            var domain=document.domain;
            this.ractive.set("domain",domain);
            loadJobListFromVNW($vnwWidget,this.ractive,1);

            $vnwWidget(function () {
                function postDateCheck() {
                    if ($vnwWidget('.job-list').width() <= 300) {
                        $vnwWidget('.job-list').addClass('no-date');
                    } else {
                        $vnwWidget('.job-list').removeClass('no-date');
                    }
                }

                postDateCheck();

                $vnwWidget(window).resize(function () {
                    postDateCheck();
                });
            });


        },
        reload: function ($email,$job_title,$job_category,$job_location,$page_size,$lang,$height) {
            //re-set data from agrument
            $vnwWidget('#vietnamworks-jobs').data('vnw-email',$email);
            $vnwWidget('#vietnamworks-jobs').data('vnw-keyword',$job_title);
            $vnwWidget('#vietnamworks-jobs').data('vnw-industry',$job_category);
            $vnwWidget('#vietnamworks-jobs').data('vnw-location',$job_location);
            $vnwWidget('#vietnamworks-jobs').data('vnw-numjobs',$page_size);
            $vnwWidget('#vietnamworks-jobs').data('vnw-lang',$lang);
            $vnwWidget('#vietnamworks-jobs').data('vnw-widget-height',$height);
            app.init();
        }
    };
    return app;

});
function loadJobListFromVNW($vnwWidget,that,currentPage){
    pageSize = $vnwWidget('#vietnamworks-jobs').data('vnw-numjobs');
    if(pageSize == ''){
        pageSize = 5;
    }
    $vnwWidget.ajax({
        url: "https://api.vietnamworks.com/jobs/search-jsonp/",
        dataType: "jsonp",
        data: {
            'CONTENT-MD5' : "4c443c7e2c515d6b4b4d693c2f63434a7773226a614846733c4c4d4348",
            'email': $vnwWidget('#vietnamworks-jobs').data('vnw-email'),
            'lang': $vnwWidget('#vietnamworks-jobs').data('vnw-lang'),
            'job_title': $vnwWidget('#vietnamworks-jobs').data('vnw-keyword'),
            'job_category': $vnwWidget('#vietnamworks-jobs').data('vnw-industry'),
            'job_location': $vnwWidget('#vietnamworks-jobs').data('vnw-location'),
            'page_size': pageSize,
            'current_page': currentPage
        }

    }).then(function (resp) {
        //Re-get language
        var lang = $vnwWidget('#vietnamworks-jobs').data('vnw-lang');
        if(lang == '2'){
            lang = 'en';
        }else{
            lang = 'vn';
        }

        resp = $vnwWidget.parseJSON(resp);
        var rsApiCode=resp.meta.code;
        if(rsApiCode==200){
            if(resp.data.jobs ==""){
                that.set("not_found_job",1);
            }
            else{
                $vnwWidget.each( resp.data.jobs, function( key, value ) {
                    var postedDate=value.posted_date;
                    var arrPostDate= postedDate.split("/");
                    value.posted_day=arrPostDate[0];
                    //translate month
                    value.posted_month=translationData["month_"+arrPostDate[1]][lang];
                    dataJobsList.push(value);
                });
                var totalDisplayJob = dataJobsList.length;
                var total = resp.data.total;
                that.set("jobs",dataJobsList);
                $vnwWidget('#load-more-jobs-from-vnw').off('click');
                if(total>totalDisplayJob){
                    $vnwWidget('#load-more-jobs-from-vnw').on('click',function(){
                        var currentPage = totalDisplayJob/pageSize + 1;
                        //currentPage = currentPage + 1;
                        loadJobListFromVNW($vnwWidget,that,currentPage);
                    });
                    $vnwWidget('#load-more-jobs-from-vnw').show();
                }else{
                    $vnwWidget('#load-more-jobs-from-vnw').hide();
                }

                $vnwWidget(function () {
                    'use strict';
                    $vnwWidget('.show-more').each(function () {
                        $vnwWidget(this).click(function () {

                            var boxIsVisible = $vnwWidget(this).parents('li').find('.show-more-info-box').hasClass('in'),
                                $thisBox = $vnwWidget(this).parents('li').find('.show-more-info-box'),
                                $self = $vnwWidget(this);
                            if (!boxIsVisible) {
                                $thisBox.removeClass('hide');
                                $self.html(translationData['show_less'][lang]+' <span class="icon-caret-down"></span>');
                                $thisBox.addClass('in').removeClass('hide').slideDown(300);
                                $self.find('.icon-caret-down').removeClass('icon-caret-down').addClass('icon-caret-up');
                            } else {
                                $self.html(translationData['show_more'][lang]+' <span class="icon-caret-up"></span>');
                                $thisBox.removeClass('in').addClass('hide').slideUp(300);
                                $self.find('.icon-caret-up').removeClass('icon-caret-up').addClass('icon-caret-down');

                            }
                        })
                    });
                    $vnwWidget('.scrollbar-outer').scrollbar();
                    $vnwWidget('.scrollbar-outer').height($vnwWidget('#vietnamworks-jobs').data('vnw-widget-height'));
                });
            }
        }else if(rsApiCode==400){
            that.set("not_found_job",1);
        }

    }, function (resp) {
        console.log(resp);
    });
}
