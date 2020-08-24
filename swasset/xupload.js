var show_fname_chars=72;
//var upload_type='file';
var form_action;
var UID,interval,enccx;

function $$(elem){return document.getElementById(elem);}

function fileSelected(f)
{
    if(!checkExt(f.value))return;
    var files = $(f).prop("files");
    var fnames=Array();
    $.map(files, function (val) { fnames.push(val.name); });
    if(fnames.length>1){ 
    	$(f).parents("table").find('.onefile').remove(); 
    } else {
	    var fname = fnames[0];
	    var arr = fname.split(/[\.\_\-]+/);
	    var regx = /^(avi|mkv|mpg|mpeg|mov|divx|dvdrip|bdrip|mp4|flv|vob)$/i;
	    arr = jQuery.grep(arr, function (a) { return !regx.test(a) });
	    $(f).parents("tr").next().find("input[name=file_title]").val(arr.join(' '));
	}
    $(f).parent().hide().after( fnames.join("<br>") );
    
}

function openStatusWindow(f1,UID,fnames)
{
 $('#utmodes').hide();

 $('#progress').show();
 $('#progress').offset( $('#div_file').offset() );
 $('#progress').width( $('#div_file').outerWidth() );
 $('#progress').height( $('#div_file').outerHeight() );
 $('#div_file').css('visibility','hidden');
 var d=new Date();
 time_start = d.getTime();
 interval = window.setInterval(function (){progressUpdate(UID);},1000);

 $("#pbon").click(function (e){
	e.preventDefault();
	if($(this).html()=='on'){$(this).html('off');window.clearTimeout(interval);}
	else{$(this).html('on');interval=window.setInterval(function (){progressUpdate(UID);},1000);};
 });
}

function StartUpload(f1)
{
    form_action = getFormAction(f1);
    f1.target='xupload';
    var NF=0;
    var farr=new Array();

    // Unchecked checkbox value hack
    $('.upload_slot input[type="checkbox"]:not(:checked)').each( function(i)
     {
        $(this).append("<input type='hidden' value='0' name='"+$(this).prop('name')+"'>");
     });

    var err_bad_ext=0, err_no_cat=0;
    $('input[type="file"][name="file"]').each( function(i)
     {
         if($(this).val() && $('select[name="cat_id"]:eq('+i+')').val()==0)err_no_cat=1;
         if($(this).val()){
             if(!checkExt($(this).val()))err_bad_ext=1;
             name = $(this).val().match(/[^\\\/]+$/);
             if(name && name!='null'){farr.push(name);NF++;}
         }
     });
    if(err_bad_ext){ return false; }
    if(err_no_cat && category_required){ alert(lng_uploadform_choose_category);return false; }

    if(NF<=0){alert(lng_uploadform_select_file_to_upload);return false;};
    if(f1.tos && !f1.tos.checked){alert(lng_uploadform_agree_to_tos);return false;};
    //if($$('submit_btn')){$$('submit_btn').disabled=true;$$('submit_btn').value='Uploading...';}

    UID='';
    for(var i=0;i<12;i++)UID+=''+Math.floor(Math.random() * 10);

    openStatusWindow( f1, UID, farr.join(', ') );

    //window.scrollTo(0,0); +'&utype='+utype
    form_action = form_action.split('?')[0]+'?X-Progress-ID='+UID; //cleaning old query to avoid ReUpload bugs

    setFormAction(f1,form_action);
    f1.action=form_action;
}

function checkExt(value)
{
    //value = obj.value;
    if(value=="")return true;
    var re1 = new RegExp("^.+\.("+ext_allowed+")$","i");
    if( ext_allowed && !re1.test(value) )
    {
        str='';
        if(ext_allowed)str+="\n"+lng_uploadform_only_these_ext_allowed+" "+ext_allowed.replace(/\|/g,',');
        alert(lng_uploadform_ext_not_allowed+" \"" + value + '"'+str);
        return false;
    }

    return true;
}

function fixLength(str)
{
 var arr = str.split(/\\/);
 str = arr[arr.length-1];
 if(str.length<show_fname_chars)return str;
 return '...'+str.substring(str.length-show_fname_chars-1,str.length);
}

function getFormAction(f)
{
    if(!f)return;
    for(i=0;i<=f.attributes.length;i++)
    {
        if(f.attributes[i] && f.attributes[i].name.toLowerCase()=='action')return f.attributes[i].value;
    }
    return '';
}

function setFormAction(f,val)
{
    for(i=0;i<=f.attributes.length;i++)
    {
        if(f.attributes[i] && f.attributes[i].name.toLowerCase()=='action')f.attributes[i].value=val;
    }
}

function InitUploadSelector(id1,id2,max)
{
    if($$(id1))
    {
        var multi_selector = new MultiSelector( id1, max );
        multi_selector.addElement( $$( id2 ) );
    }
}

function findPos(obj)
{
    var curleft = curtop = 0;
    if (obj.offsetParent)
    {
        do {curleft += obj.offsetLeft;curtop += obj.offsetTop;} while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

function changeUploadType(utype)
{
    $$('div_file').style.position='absolute';
    if($$('div_url'))$$('div_url').style.position='absolute';
    if($$('div_rs'))$$('div_rs').style.position='absolute';
    if($$('div_tt'))$$('div_tt').style.position='absolute';
    if($$('div_ff'))$$('div_ff').style.position='absolute';
    $$('div_'+utype).style.position='static';
    $('#utmodes > input.active').removeClass('active');
    $('#r_'+utype).addClass('active');
}

function jah(url,id,silent)
{
    var obj;
    if(id)
    {
      if(id !== null && typeof id === 'object'){obj=id} else {obj=$('#'+id)}
    }
    if(obj &&!silent)
    {
        obj.html('...');
    }
    $.get(url,function (data){
                if(obj)
                {
                    obj.html(data);
                }
                else
                {
                    //alert(data);
                    eval(data);
                };
    });

    return false;
};

function scaleImg(i)
{
  if(i.width>800)
  {
    w=i.width;
    h=i.height;
    wn = 800;
    hn = parseInt(i.height*800/i.width);
    i.width  = wn;
    i.height = hn;
    i.onclick = function(){ if(this.width==wn){this.width=w;this.height=h;}else{this.width=wn;this.height=hn;} }
    return;
  }
}

function OpenWin(link,w,h)
{
  if(!w)w=720;
  if(!h)h=700;
  var popupWin = window.open(link,null, 'width='+w+',height='+h+',status=no,scrollbars=yes,resizable=yes,left=450,top=250');
  popupWin.focus();
  return false;
}
function player_start()
{
    //$('#player_ads').hide();
    //$('#player_img').hide();
    //$('#player_code').show();
//alert(player);
    //player.sendEvent('PLAY');
    return false;
}

function copy(obj)
{
  obj.focus();
  obj.select();
}

function download_video(code,mode,hash)
{
  window.location='/dl?op=download_orig&id='+code+'&mode='+mode+'&hash='+hash;
}

function convertSeconds(seconds)
{
    var secs = seconds % 60;
	var mins = ((seconds - secs) % 3600) / 60;
	var hours = ((seconds - secs - mins*60) % 86400) / 3600;
    if(hours>0)
    {
        return hours+' hours '+mins+' minutes';
    }
    else if(mins>0)
    {
        return mins+' minutes '+secs+' seconds';
    }
    else
    {
        return secs+' seconds';
    }
}
function convertSize(size)
{
    if (size > 1024*1024*1024) {
            size = Math.round(size/(1024*1024*1024)*10)/10 + " Gb";
    } else if (size > 1024*1024) {
            size = Math.round(size/(1024*1024)*10)/10+'';
            if(!size.match(/\./))size+='.0';
            size+=' Mb';
    } else if(size > 1024) {
            size = Math.round(size/1024*10)/10 + " Kb";
    } else {
            size = size + " Bytes";
    }
    return size;
}

$(document).ready(function() {
  //smth
});


// Progress bar functions
function SP(cursize,totalsize,speed,estimate)
{
    var percent = parseInt(100*parseFloat(cursize)/parseFloat(totalsize));
    $('#upload_status').css('width', percent+'%');
    $('#percent').html( percent+'%' );
    $('#cursize').html( convertSize(cursize) );
    $('#totalsize').html( convertSize(totalsize) );
    $('#speed').html(speed);
    $('#estimate').html( convertSeconds(estimate) );
}

function progressUpdate(uid)
{

	var speed = 0;
	var time_left =0;
	$.getJSON( srv_htdocs_url+'/progress?X-Progress-ID='+uid+'&callback=?', {
    			format: "json"
  				})
			.fail(function() {window.clearTimeout(interval);$('#progress_msg').html('Uploading...');})
  			.done(function( upload ) {
  				
  				if (upload.state == 'uploading')
                {
                    if(!total || total==''){total=upload.size;$('#progress_info').show();$('#progress_msg').html('');}
                    if(upload.received>=upload.size)
                    {
                        SP(total, total, 0, 0);
                        $('#progress_info').hide();
                        $('#progress_msg').html('Generating links...');
                        window.clearTimeout(interval);
    					return;
                    }
                    speed = 1000*upload.received / ((new Date()).getTime() - time_start);
			est = Math.round( (upload.size-upload.received)/speed );
			speed = Math.round(speed / 1024);
                    SP(upload.received, upload.size, speed, est);
				}
                else if (upload.state == 'done')
                {
			SP(upload.size, upload.size, 0, 0);
			$('#progress_info').hide();
			$('#progress_msg').html('Generating links...');
			window.clearTimeout(interval);
				}
                else if (upload.state == 'error')
                {
			$('#progress_msg').html(upload.msg);
			window.clearTimeout(interval);
			loc = top.window.location+'';
				}
  			} );
};

function encStatus(fid,init)
{
    if(init)
    {
        enccx=init;
        if($('#enc_pp')) setInterval("encStatus("+fid+")",10000);
    }
    enccx++;
    if(enccx>1000)return;
    $.get('/dl?op=enc_status&id='+fid, function() {}, 'script');
}

$.fn.shiftSelectable = function() {
    var lastChecked,
        $boxes = this;

    $boxes.click(function(evt) {
        if(!lastChecked) {
            lastChecked = this;
            return;
        }

        if(evt.shiftKey) {
            var start = $boxes.index(this),
                end = $boxes.index(lastChecked);
            $boxes.slice(Math.min(start, end), Math.max(start, end) + 1)
                .prop('checked', lastChecked.checked)
                .trigger('change');
        }

        lastChecked = this;
    });
};