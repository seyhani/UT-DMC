// you can write your own plugin here and active them in active.js
// there is no custom made plugin here.

(function($) {
    "use strict";
    /* ==========================================================================
   window laod function
   ========================================================================== */
    $(window).load(function () {
      // Home wrapper vertical centering
        $(function () {
          var wrapper_height = $('.boss-wrapper').height();
          var negative_margin = -(wrapper_height / 2);
          $('.boss-wrapper').css({'marginTop':negative_margin+'px'});

    // scroll down button show/hide function
          function scrolldown() {
            var header_h = $('.boss-home-area').height();
            var scrolldown = $('.boss-scroll-down');

            if( header_h >= 650 )
              scrolldown.show();
            else
              scrolldown.hide();
            }
          scrolldown(); 
          $(window).on('resize', function(){
            scrolldown();
          });
        });
    });

    /* ==========================================================================
    Document ready function
   ========================================================================== */

    $(document).ready(function () {
    // smooth scroll 
      $(function() {
            $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
              var target = $(this.hash);
              target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
              if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top
              }, 1000);
              return false;
              }
            }
            });
          });



      // scroll up plugin
      !function(l,o,e){"use strict";l.fn.scrollUp=function(o){l.data(e.body,"scrollUp")||(l.data(e.body,"scrollUp",!0),l.fn.scrollUp.init(o))},l.fn.scrollUp.init=function(r){var s,t,c,i,n,a,d,p=l.fn.scrollUp.settings=l.extend({},l.fn.scrollUp.defaults,r),f=!1;switch(d=p.scrollTrigger?l(p.scrollTrigger):l("<a/>",{id:p.scrollName,href:"#top"}),p.scrollTitle&&d.attr("title",p.scrollTitle),d.appendTo("body"),p.scrollImg||p.scrollTrigger||d.html(p.scrollText),d.css({display:"none",position:"fixed",zIndex:p.zIndex}),p.activeOverlay&&l("<div/>",{id:p.scrollName+"-active"}).css({position:"absolute",top:p.scrollDistance+"px",width:"100%",borderTop:"1px dotted"+p.activeOverlay,zIndex:p.zIndex}).appendTo("body"),p.animation){case"fade":s="fadeIn",t="fadeOut",c=p.animationSpeed;break;case"slide":s="slideDown",t="slideUp",c=p.animationSpeed;break;default:s="show",t="hide",c=0}i="top"===p.scrollFrom?p.scrollDistance:l(e).height()-l(o).height()-p.scrollDistance,n=l(o).scroll(function(){l(o).scrollTop()>i?f||(d[s](c),f=!0):f&&(d[t](c),f=!1)}),p.scrollTarget?"number"==typeof p.scrollTarget?a=p.scrollTarget:"string"==typeof p.scrollTarget&&(a=Math.floor(l(p.scrollTarget).offset().top)):a=0,d.click(function(o){o.preventDefault(),l("html, body").animate({scrollTop:a},p.scrollSpeed,p.easingType)})},l.fn.scrollUp.defaults={scrollName:"scrollUp",scrollDistance:300,scrollFrom:"top",scrollSpeed:300,easingType:"linear",animation:"fade",animationSpeed:200,scrollTrigger:!1,scrollTarget:!1,scrollText:"Scroll to top",scrollTitle:!1,scrollImg:!1,activeOverlay:!1,zIndex:2147483647},l.fn.scrollUp.destroy=function(r){l.removeData(e.body,"scrollUp"),l("#"+l.fn.scrollUp.settings.scrollName).remove(),l("#"+l.fn.scrollUp.settings.scrollName+"-active").remove(),l.fn.jquery.split(".")[1]>=7?l(o).off("scroll",r):l(o).unbind("scroll",r)},l.scrollUp=l.fn.scrollUp}(jQuery,window,document);



      // validate email valu + show error messages


          // E-mail validation via regular expression
          function isValidEmailAddress(emailAddress) {
            var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
            return pattern.test(emailAddress);
          };

        // ajax mail Chimp
        $('#mc-form').ajaxChimp({
                language: 'lj',
                url: 'http://hasib-rahman.us8.list-manage2.com/subscribe/post?u=74e8ba57153fb3b7bae403d34&id=514058c103'                
            });


          // Mailchimp translation
            //
            // Defaults:
            //'submit': 'Submitting...',
            //  0: 'We have sent you a confirmation email',
            //  1: 'Please enter a value',
            //  2: 'An email address must contain a single @',
            //  3: 'The domain portion of the email address is invalid (the portion after the @: )',
            //  4: 'The username portion of the email address is invalid (the portion before the @: )',
            //  5: 'This email address looks fake or invalid. Please enter a real email address'

            $.ajaxChimp.translations.lj = {
              'submit': 'Submitting...',
              0: '<p  class="sdsf" > We will be in touch soon!</p>',
              1: '<p class="sdsf" > Enter a valid e-mail address.</p>',
              2: '<p> E-mail address is not valid.</p>',
              3: '<p> E-mail address is not valid.</p>',
              4: '<p> E-mail address is not valid.</p>',
              5: '<p> E-mail address is not valid.</p>'
            }


          // Subscription form notifications and AJAX function
          $(function () {
            $("#subscribe").submit(function (event) {
              var input = $('.boss-subscribe-message');
                if(!input.is(':empty')) {
                  $('.boss-subscribe-message').stop(true);
                }
                event.preventDefault();
                event.stopImmediatePropagation();

                var email = $("input#subscribe-email").val();

                if (email == "") {

                  $(".boss-subscribe-message").stop(true).html(' <p> You must enter a valid e-mail address.</p>');
                  $("input#subscribe-email").focus();
                } 
                else if (!isValidEmailAddress( email )) {
                  $(".boss-subscribe-message").stop(true).html(' <p>E-mail address is not valid.</p>');
                  $("input#subscribe-email").focus();            
                }
                else {
                  $.ajax({
                    type: "POST",
                    url: "./php/send-subscription.php",
                    data: {subscription:email},
                    success: function () {
                      $(".boss-subscribe-message").html(' <p>We will be in touch soon! </p>');
                      $('input#subscribe-email').val('');
                    }
                  });
                }
             });
          });
    });
})(jQuery);