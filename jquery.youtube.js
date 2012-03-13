/*
 * YouTube Videos Pugin - for jQuery 1.3+
 *
 * Copyright 2011, Tiago Ayer de Andrade
 * http://www.woombo.com/
 *
 * Version: 1.0 (Oct 7th 2011)
 */
 
(function($){
  $.fn.youtube = function(settings) {

    var options = { 
      results: '1',
      user: '',
      width: '560', 
      height: '315', 
      type: 'list', 
      imageSize: 'thumb', 
      topPlayer: false, 
      jsonURL: 'http://gdata.youtube.com/feeds/api/users/#USERNAME#/uploads?v=2&alt=json-in-script&start-index=1&max-results=#RESULTS#', 
      ellipsisText: 'loading videos...'
    };

    if( options){
      $.extend( options, settings);
    }
  
    return this.each(function(){
    
      // SET VARS
      xUsername     = options.user;
      xResults      = options.results < 1 ? 1 : options.results;
      xURL			= options.jsonURL;
      xWidth		= options.width;
      xHeight		= options.height;
      xType			= options.type;
      xTopPlayer	= options.topPlayer;
      xEllipsisText = options.ellipsisText;
    
      // CHECK USERNAME
      if( !xUsername){ 
        return false;
      }
    
      // LOAD OBJECT
      obj = $(this);

      // APPEND CONTAINER
      classContainerLoading	= 'youtube-videos-loading'; 
      classContainerVideos	= 'youtube-videos-container';
      classContainerPlayer	= 'youtube-videos-player';
			
      obj.append('<div class="youtube-videos-wraper">'
        + '	<div class="'+ classContainerVideos +'">'
        + '		<div class="'+ classContainerPlayer +'"></div>'
        + '		<div class="'+ classContainerLoading +'">'+ xEllipsisText +'</div>'
        + ' </div>'
        + '</div>');

      // REPLACE STRINGS
      setUsername	= xURL.replace( '#USERNAME#', xUsername);
      setResults	= setUsername.replace( '#RESULTS#', xResults);
      finalURL 		= setResults;

      function buildIFrame( hash){
        return '<iframe width="'+ xWidth +'" height="'+ xHeight +'" src="http://www.youtube.com/embed/'+ hash +'?wmode=transparent" frameborder="0" allowfullscreen></iframe>';
      }
			
      function setSelectedItem( itemID){ 
        // DESELECT ALL
        obj.find('.youtube-list-item').removeClass('selected');
				
        // SELECT ITEM
        obj.find('#'+itemID).addClass('selected');
      }

      // LOAD JSON
      $.ajax({
        type: 'GET',
        url: finalURL,
        cache: false,
        dataType:'jsonp',
        success: function(data){ 
			  
          items = data.feed.entry;
			  	
          if( !items){
            return false;
          }
			  	
          var holdData = '';

          $.each( items, function( i, item) {

            info  = item.media$group;
            ID    = info.yt$videoid.$t;
            title = info.media$title.$t;
            thumb = info.media$thumbnail[0].url;
            image = info.media$thumbnail[1].url; 

            setClass	= 'youtube-list-item youtube-item-row-'+ i;
            //setIframe = '<div class="youtube-item-embed"><iframe width="'+ xWidth +'" height="'+ xHeight +'" src="http://www.youtube.com/embed/'+ ID +'" frameborder="0" allowfullscreen></iframe></div>';
            setIframe   = '<div class="youtube-item-embed">'+ buildIFrame(ID) +'</div>';
            setLink		= 'http://www.youtube.com/watch?v='+ ID;
            setID		= 'youtube-item-'+ ID;
            setImage	= options.imageSize == 'thumb' ? thumb : image;
						
            if( i == 0){ 
              firstItemHash = ID;
            }
						
            if( xType == 'image-list'){ 
              loadedItem = '<div id="'+ setID +'" class="'+ setClass +'">'
              + '	<div class="youtube-item-image">'
              + '		<a href="'+ setLink +'" title="'+ title +'" target="_blank">'
              + '			<img src="'+ setImage +'" alt="'+ title +'" />'
              + '		</a>'
              + '	</div>'
              + '	<div class="youtube-item-title">'
              + '		<strong>'+ title +'</strong>'
              + '	</div>'
              + '</div>';
            }
            else{ 
              loadedItem = '<div id="'+ setID +'" class="'+ setClass +'">'
              + '	<strong class="youtube-item-title">'+ title +'</strong>'
              + setIframe
              + '</div>';
            }

            holdData = holdData + loadedItem;

          });

          obj.find('div.'+ classContainerLoading).fadeOut('slow', function(){ 
					
            // APPEND DATA
            obj.find('div.'+ classContainerVideos).hide().append(holdData).fadeIn('slow');
						
            // TOP PLAYER
            if( xTopPlayer == true){ 
						
              // ADD PLAYER
              obj.find('div.'+ classContainerPlayer).html( buildIFrame( firstItemHash));
							
              //BIND CLICK
              obj.find('a').click( function(e){ 
                e.preventDefault();
                loadHash = $(this).attr('href').replace( 'http://www.youtube.com/watch?v=', '');
                loadID = $(this).parents('.youtube-list-item').attr('id');
                setSelectedItem(loadID);
                obj.find('div.'+ classContainerPlayer).html( buildIFrame( loadHash));
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