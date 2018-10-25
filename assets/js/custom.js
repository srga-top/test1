function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

/*function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}*/

function onComplete1(results1) {
  const config = {
      header: true,
      newline: "\r\n",
      //complete: onComplete1,
      skipEmptyLines: true
    }
    
  if (results1.data.length) {
    //console.table(results1.errors);
    //console.table(results1.data);
    //console.log(results1.data);
    //console.log(results1.meta);
    
    var currencyUSDtitle = $('#currencyUSDtitle').val();
    var rateUSD = $('#currencyUSDrate').val();
    
    var currencyUAHtitle = $('#currencyUAHtitle').val();
    var currencyUAHround = $("#currencyUAHround").prop("checked");
    
    var provider1_instock_label = $('#provider1_instock_label').val();
    var provider1_instock = $('#provider1_instock').val();
    var provider1_not_instock = $('#provider1_not_instock').val();
    
    var arrayLen = results1.data.length;
    var currency;
    var price;
    var stock;
    for (var i = 0; i < arrayLen; i++) {
      price = results1.data[i]["Цена"];
      currency = results1.data[i]["Валюта"];
      
      if ( currency == currencyUSDtitle ) {
        results1.data[i]["Валюта"] = currencyUAHtitle;
        if ( currencyUAHround ) {
          results1.data[i]["Цена"] = String( Math.round( price * rateUSD) );
        } 
        else {
          results1.data[i]["Цена"] = String( Math.round( (price * rateUSD) * 100) / 100 );
        }
      };
      
      // instock
      stock = results1.data[i]["Наличие"];
      if ( stock.indexOf(provider1_instock_label) >= 0 ) {
        results1.data[i]["Наличие"] = String( provider1_instock );
      } 
      else {
        results1.data[i]["Наличие"] = String( provider1_not_instock );
      }
        
      //console.log(results1.data[i]["Код_товара"]);
      //console.log( results1.data[i]['1'] );
    }
    
    var csv = Papa.unparse(results1.data, config);
    var type = 'data:application/octet-stream;base64, ';
    var base = utf8_to_b64(csv);
    var res = type + base;
    $('#provider1_fileout_link').attr("href", res).attr("download", $('#provider1_fileout_name').val()).show();
    
    console.table(results1.data);
  }
}

function load_currency_rate() {
  var bankUSDlink = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json";
  $.getJSON(bankUSDlink, function(json) {
    //console.log(json);
    //console.log(Math.round( json[0].rate * 100) / 100);
    $('#currencyUSDrate').val( Math.round( json[0].rate * 100) / 100 );
    $('#currencyUSDrate_text .rate').html(json[0].rate);
    $('#currencyUSDrate_text .date').html(json[0].exchangedate);
  });
}


jQuery(document).ready(function() {
  
  $('.btn-results').hide();
  
  $('input[type=file]').on('dragover', function() {
    $(this).addClass('inputs__file--hover');
  });
  $('input[type=file]').on('dragleave', function() {
    $(this).removeClass('inputs__file--hover');
  });
  
  load_currency_rate();
  
  $( "#currencyUSDrate_text .updateUSDrate" ).click(function() {
    load_currency_rate();
    console.log( 'Update USD rate at '+Date() );
  });
  
  

$('#provider1_file').change((event)=> {
  const file = event.target.files[0]; 
  if (file) {
    const config = {
      header: true,
      newline: '',
      complete: onComplete1,
      skipEmptyLines: true
    }
    Papa.parse(file, config);
  }
});

});