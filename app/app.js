define(['jquery', 'Ractive', 'rv!templates/template', 'text!css/my-widget_embed.css'], function ($, Ractive, mainTemplate, css) {

    'use strict';

    var app = {
        init: function () {

            Ractive.DEBUG = false;


            var $style = $("<style></style>", {type: "text/css"});
            $style.text(css);
            $("head").append($style);

            // render our main view
            this.ractive = new Ractive({
                el: 'myWidget',
                template: mainTemplate,
                data: {
                    cnt: 0,
                    ts: 'never'
                }
            });
            this.ractive.on({
                mwClick: function (ev) {
                    ev.original.preventDefault();
                    this.set('cnt', this.get('cnt') + 1);
                    var that = this;

                    $.ajaxSetup({
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('content-md5', '4c443c7e2c515d6b4b4d693c2f63434a7773226a614846733c4c4d4348');
                        }
                    });

                    $.ajax({
                        url: "https://api-staging.vietnamworks.com/jobs/search/",
                        dataType: "jsonp",
                        data: JSON.stringify({job_title: "test"})

                    }).then(function (resp) {
                        console.log(resp);
                    }, function (resp) {
                        console.log(resp);
                        console.log(resp.data);
                        console.log(resp.meta);
                        console.log(resp.status);
                        console.log(resp.statusText);
                        console.log(resp.error());

                        that.set("ts", "Something bad happened");
                    });

                    /*$.ajax({
                        url: "http://date.jsontest.com/",
                        dataType: "jsonp"
                    }).then(function (resp) {
                        that.set("ts", resp.time);
                    }, function (resp) {
                        that.set("ts", "Something bad happened");
                    });*/
                }
            });
        }
    };

    return app;

});
