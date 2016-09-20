// you can use document ready function for activing your plugin .

(function($) {
  "use strict";
    /* ==========================================================================
   window laod function
   ========================================================================== */
    $(window).load(function (){
       // preloader active
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            /* Intro Height  */
            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

            function preHeight() {
                var wh = $(window).height();
                $('#boss-preloader').css({height: wh});
            }

            preHeight();
            $(window).bind('resize',function () {
                //Update slider height on resize
                preHeight();
            });
            
            
              // preloader function
                $('#boss-preloader').fadeOut(); // will first fade out the loading animation
                $('body').delay(350).css({'overflow':'visible'});
        // active owl carousel
        $(".boss-owl").owlCarousel({
            pagination: false,
            autoPlay : true,
            stopOnHover : true,
            responsiveClass: true,
            items: 3,
            itemsDesktop: 3,
            itemsDesktopSmall: 3,
            itemsTablet: 1,
            autoHeight : true
        });
    });

    /* ==========================================================================
    Document ready function
   ========================================================================== */

    $( document ).ready(function() {
    // your plugin activation here

     // backstretch active here 
     $(".boss-home-area").backstretch([
            "http://i.imgur.com/kvTfQzd.jpg"
          ]);

     // countdown
      // To change date, simply edit: var endDate = "May 26, 2015 20:39:00";
      var endDate = "October 6, 2016 08:00:00";
        $('.boss-countdown').countdown({
          date: endDate,
          render: function(data) {
            $(this.el).html('<div class="count"><div ><span>' + this.leadingZeros(data.days, 2) + '</span><span>روز</span></div><div><span>' + this.leadingZeros(data.hours, 2) + '</span><span>ساعت</span></div></div><div class="boss-countdown count"><div><span>' + this.leadingZeros(data.min, 2) + '</span><span>دقیقه</span></div><div><span>' + this.leadingZeros(data.sec, 2) + '</span><span>ثانیه</span></div></div>');
          }
        });


     // nicescroll active here
     $("html").niceScroll({
        cursorcolor: '#fff',// it's use for dark version
        cursorborder: '1px solid #fff', // it's use for dark verstion
        //cursorcolor: '#323232',// it's use for light version
        //cursorborder: '1px solid #323232', // it's use for light verstion
        mousescrollstep: 50,
        autohidemode: false 
     });

     // scroll up active
     $(function () {
        $.scrollUp({
          scrollImg: true,
          scrollSpeed: 650,
          topDistance: '1500'
        });
    });

    });

})(jQuery);

