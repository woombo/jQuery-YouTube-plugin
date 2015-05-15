/*
 * YouTube Videos Pugin - for jQuery 1.3+
 *
 * Copyright 2015, Tiago Ayer de Andrade
 * http://www.woombo.com/
 *
 * Version: APIV2.0 (Oct 7th 2011)
 *          APIV3.0 (May 14th 2015)
 */

(function($){
  $.fn.youtube = function(settings) {

    var options = {
      channelId: '',
      key: '',
      maxResults: '1',
      width: '560',
      height: '315',
      type: 'list',
      imageSize: 'thumb',
      topPlayer: false,
      jsonURL: 'https://www.googleapis.com/youtube/v3/search?channelId=:channelId&key=:key&part=snippet&maxResults=:maxResults',
      ellipsisText: 'loading videos...'
    };

    if(options){
      $.extend(options, settings);
    }

    return this.each(function(){

      // SET VARS
      xChannelId  = options.channelId,
      xKey        = options.key,
      xMaxResults = options.maxResults < 1 ? 1 : options.maxResults;
      xURL        = options.jsonURL;
      xWidth      = options.width;
      xHeight     = options.height;
      xType       = options.type;
      xTopPlayer  = options.topPlayer;
      xEllipsisText = options.ellipsisText;

      // CHECK USERNAME
      if(!xChannelId || !xKey){
        console.log('channelId and key are mandatory.');
        return false;
      }

      // LOAD OBJECT
      obj = $(this);

      // APPEND CONTAINER
      classContainerLoading = 'youtube-videos-loading';
      classContainerVideos  = 'youtube-videos-container';
      classContainerPlayer  = 'youtube-videos-player';

      obj.append('<div class="youtube-videos-wraper">'
        + ' <div class="'+ classContainerVideos +'">'
        + '   <div class="'+ classContainerPlayer +'"></div>'
        + '   <div class="'+ classContainerLoading +'">'+ xEllipsisText +'</div>'
        + ' </div>'
        + '</div>');

      // REPLACE STRINGS
      finalURL = xURL
        .replace(':channelId', xChannelId)
        .replace(':key', xKey)
        .replace(':maxResults', xMaxResults);

      function buildIFrame(hash){
        return '<iframe width="'+ xWidth +'" height="'+ xHeight +'" src="http://www.youtube.com/embed/'+ hash +'?wmode=transparent" frameborder="0" allowfullscreen></iframe>';
      }

      function setSelectedItem(itemID){
        // DESELECT ALL
        obj.find('.youtube-list-item').removeClass('selected');

        // SELECT ITEM
        obj.find('#'+ itemID).addClass('selected');
      }

      // LOAD JSON
      $.ajax({
        url: finalURL,
        dataType: 'json',
        success: function(data){

          items = data.items;

          if(!items){
            return false;
          }

          var holdData = '';

          $.each(items, function(i, item) {


            var videoId = item.id.videoId,
                publishedAt = item.snippet.publishedAt,
                title = item.snippet.title,
                thumbnail = {
                  default: item.snippet.thumbnails.default.url,
                  high: item.snippet.thumbnails.high.url,
                  medium: item.snippet.thumbnails.medium.url
                };

            setClass  = 'youtube-list-item youtube-item-row-'+ i;
            setIframe   = '<div class="youtube-item-embed">'+ buildIFrame(videoId) +'</div>';
            setLink   = 'http://www.youtube.com/watch?v='+ videoId;
            setID   = 'youtube-item-'+ videoId;
            setImage  = options.imageSize == 'thumb' ? thumbnail.medium : thumbnail.high;

            if(i == 0){
              firstItemHash = videoId;
            }

            if(xType == 'list'){
              loadedItem = '<div id="'+ setID +'" class="'+ setClass +'">'
              + ' <div class="youtube-item-image">'
              + '   <a href="'+ setLink +'" title="'+ title +'" target="_blank">'
              + '     <img src="'+ setImage +'" alt="'+ title +'" />'
              + '   </a>'
              + ' </div>'
              + ' <div class="youtube-item-title">'
              + '   <strong>'+ title +'</strong>'
              + ' </div>'
              + '</div>';
            }
            else{
              loadedItem = '<div id="'+ setID +'" class="'+ setClass +'">'
              + ' <strong class="youtube-item-title">'+ title +'</strong>'
              + setIframe
              + '</div>';
            }

            holdData = holdData + loadedItem;

          });

          obj.find('div.'+ classContainerLoading).fadeOut('slow', function(){

            // APPEND DATA
            obj.find('div.'+ classContainerVideos).hide().append(holdData).fadeIn('slow');

            // TOP PLAYER
            if(xTopPlayer == true){

              // ADD PLAYER
              obj.find('div.'+ classContainerPlayer).html(buildIFrame(firstItemHash));

              //BIND CLICK
              obj.find('a').click(function(e){
                e.preventDefault();
                loadHash = $(this).attr('href').replace('http://www.youtube.com/watch?v=', '');
                loadID = $(this).parents('.youtube-list-item').attr('id');
                setSelectedItem(loadID);
                obj.find('div.'+ classContainerPlayer).html(buildIFrame(loadHash));
              });
            }

            // SHOW CONTENT
            obj.find('div.'+ classContainerVideos).fadeIn('slow');

          });

        }
      });
    });
  };
})(jQuery);
