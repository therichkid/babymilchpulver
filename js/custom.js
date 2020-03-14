// BASIC

// NAVIGATION BUTTONS

// When the user scrolls down 50px from the top of the document, show the buttons
window.onscroll = function () {
  scrollFunction()
};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    $('#go-page-up').fadeIn(250);
    $('#go-page-down').fadeIn(250);
  } else {
    $('#go-page-up').fadeOut(250);
    $('#go-page-down').fadeOut(250);
  }
}

// Scroll the document if user is clicking the buttons
function goPageUp() {
  $('html, body').animate({
    scrollTop: '-=500'
  }, 1000);
}

function goPageDown() {
  $('html, body').animate({
    scrollTop: '+=500'
  }, 1000);
}



// MAPS

// Init map
function initMap(map) {
  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  map.attributionControl.addAttribution('Statistical Data &copy; <a href="https://www.clal.it/en/index.php?section=privacy_policy">CLAL</a>');

  var originFilter;
  var destinationFilter;
  if (map === importMap) {
    originFilter = function (feature, layer) {
      if (feature.id === 'NLD' || feature.id === 'NZL' || feature.id === 'FRA' || feature.id === 'IRL' || feature.id === 'DEU' || feature.id === 'DNK' || feature.id === 'AUS' || feature.id === 'CHE' || feature.id === 'KOR' || feature.id === 'USA') {
        return true;
      }
    }
    destinationFilter = function (feature, layer) {
      if (feature.id === 'CHN') {
        return true;
      }
    }
  } else if (map === exportMap) {
    originFilter = function (feature, layer) {
      if (feature.id === 'BEL' || feature.id === 'BGR' || feature.id === 'DNK' || feature.id === 'DEU' || feature.id === 'EST' || feature.id === 'FIN' || feature.id === 'FRA' || feature.id === 'GRC' || feature.id === 'IRL' || feature.id === 'ITA' || feature.id === 'HRV' || feature.id === 'LVA' || feature.id === 'LTU' || feature.id === 'LUX' || feature.id === 'MLT' || feature.id === 'NLD' || feature.id === 'AUT' || feature.id === 'POL' || feature.id === 'PRT' || feature.id === 'ROU' || feature.id === 'SWE' || feature.id === 'SVK' || feature.id === 'SVN' || feature.id === 'ESP' || feature.id === 'CZE' || feature.id === 'HUN' || feature.id === 'GBR' || feature.id === 'CYP') {
        return true;
      }
    }
    destinationFilter = function (feature, layer) {
      if (feature.id === 'CHN' || feature.id === 'SAU' || feature.id === 'RUS' || feature.id === 'DZA' || feature.id === 'TUR' || feature.id === 'IRQ' || feature.id === 'PAK' || feature.id === 'EGY' || feature.id === 'LBY') {
        return true;
      }
    }
  }


  // Create layer group with low zIndex for country layers
  map.createPane('baseLayers').style.zIndex = 200;
  var baseLayerGroup = L.layerGroup();

  L.geoJSON(countries, {
    pane: 'baseLayers',
    style: {
      color: "#D58B8B",
      fillOpacity: 0.4,
      weight: 1
    },
    filter: originFilter
  }).addTo(baseLayerGroup);
  L.geoJSON(countries, {
    pane: 'baseLayers',
    style: {
      color: "#00897B",
      fillOpacity: 0.4,
      weight: 1
    },
    filter: destinationFilter
  }).addTo(baseLayerGroup);

  baseLayerGroup.addTo(map);
}

// Add / change flowmap layer
function changeFlowmapLayer(map, mainCountry, year) {
  // Remove every layer in the beginning to avoid stacking and init map again
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });
  if (map === importMap) {
    $('.importinfo').remove();
    $('.importlegend').remove();
  } else if (map === exportMap) {
    $('.exportinfo').remove();
    $('.exportlegend').remove();
  }
  initMap(map);

  // Create variables
  var csvData;
  // Create 6 class breaks with unique color & linewidth
  var colors = ['#f1eef6', '#d4b9da', '#c994c7', '#c994c7', '#dd1c77', '#980043'];
  var breakpoints;
  // Fill words for info box
  var fill1;
  var fill2;
  var fill3;
  // Unique class names
  var class1;
  var class2;
  if (map === importMap) {
    csvData = 'csv/Flowmap_Import.csv';
    breakpoints = [0, 10000, 20000, 30000, 40000, 50000, 100000];
    fill1 = 'Import';
    fill2 = 'nach';
    fill3 = 'aus';
    class1 = 'importinfo';
    class2 = 'importlegend';
  } else if (map === exportMap) {
    csvData = 'csv/Flowmap_Export.csv';
    breakpoints = [0, 10000, 20000, 30000, 40000, 50000, 1000000];
    fill1 = 'Export';
    fill2 = 'von';
    fill3 = 'nach';
    class1 = 'exportinfo';
    class2 = 'exportlegend';
  }
  // CSV parse to GeoJSON
  Papa.parse(csvData, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function (results) {
      var geoJsonFeatureCollection = {
        type: 'FeatureCollection',
        features: results.data.map(function (datum) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [datum.s_lon, datum.s_lat]
            },
            properties: datum
          }
        })
      };

      console.log('GeoJSON Feature Collection', geoJsonFeatureCollection);

      var classBreaks = [];
      for (var i = 0; i < colors.length; i++) {
        classBreaks.push({
          classMinValue: breakpoints[i],
          classMaxValue: breakpoints[i + 1] - 1,
          symbol: {
            strokeStyle: colors[i],
            lineWidth: 0.75 * (i + 1),
            lineDashOffsetSize: 4,
            lineCap: 'round',
            shadowColor: colors[i],
            shadowBlur: 2
          }
        });
      }

      // Zoom to feature on click and update the info box
      function clickHandler(e) {
        var layer = e.target;
        // Set initial view if main country is clicked
        if (Math.abs(e.target.getLatLng().lat - mainCountry.lat) < 1 && Math.abs(e.target.getLatLng().lng - mainCountry.lng) < 1) {
          map.setView(mainCountry, 2);
          if (year > 2013) {
            info.update(layer.feature.properties, 'origin');
          } else {
            info.update();
          }

        } else {
          var bounds = [e.target.getLatLng(), mainCountry];
          map.fitBounds(bounds);
          info.update(layer.feature.properties);
        }
      }

      // Call all events
      function onEachFeature(feature, layer) {
        layer.on({
          click: clickHandler
        });
      }

      var flowmapLayer = L.canvasFlowmapLayer(geoJsonFeatureCollection, {

        onEachFeature: onEachFeature,

        // Style points
        style: function (geoJsonFeature) {
          if (geoJsonFeature.properties.isOrigin) {
            return {
              radius: 7.5,
              weight: 1,
              color: 'rgb(195, 255, 62)',
              fillColor: 'rgba(195, 255, 62, 0.6)',
              fillOpacity: 0.6
            };
          } else {
            return {
              radius: 7.5,
              weight: 1,
              color: 'rgb(0, 105, 92)',
              fillColor: 'rgba(0, 105, 92, 0.6)',
              fillOpacity: 0.6
            };
          }
        },

        originAndDestinationFieldIds: {
          originUniqueIdField: 's_country_id',
          originGeometry: {
            x: 's_lon',
            y: 's_lat'
          },
          destinationUniqueIdField: 'e_country_id',
          destinationGeometry: {
            x: 'e_lon',
            y: 'e_lat'
          }
        },

        canvasBezierStyle: {
          type: 'classBreaks',
          field: 'data_' + year,
          classBreakInfos: classBreaks,
          // the layer will use the defaultSymbol if a data value doesn't fit
          // in any of the defined classBreaks
          defaultSymbol: {
            strokeStyle: 'rgb(255, 46, 88)',
            lineWidth: 1.25,
            lineDashOffsetSize: 4,
            lineCap: 'round',
            shadowColor: 'rgb(255, 0, 51)',
            shadowBlur: 2
          },
        },

        pathDisplayMode: 'all',
        animationStarted: true,
        animationEasingFamily: 'Cubic',
        animationEasingType: 'In',
        animationDuration: 2000
      }).addTo(map);

      // Some magic
      flowmapLayer.on('click', function (e) {
        if (e.sharedOriginFeatures.length) {
          flowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
        }
        if (e.sharedDestinationFeatures.length) {
          flowmapLayer.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, 'SELECTION_NEW');
        }
      });
    }
  });

  // Create info box
  var info = L.control();
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info ' + class1); // create a div with a class "info"
    this.update();
    return this._div;
  };
  // Update info box
  info.update = function (props, type) {
    // Values for info box
    var fill;
    if (year === '2012') {
      fill = (props ?
        fill3 + ' <b>' + props.s_country + '</b><br>Rang: ' + props.rank_2012 + '<br>Menge: ' + props.data_2012 + ' Tonnen' :
        'Klicke auf ein Land');
    } else if (year === '2013') {
      fill = (props ?
        fill3 + ' <b>' + props.s_country + '</b><br>Rang: ' + props.rank_2013 + ((props.rank_2012 - props.rank_2013) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2012 - props.rank_2013) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2012 + '*)' + '<br>Menge: ' + props.data_2013 + ' (' + ((props.data_2013 - props.data_2012) >= 0 ? '+' : '') + (props.data_2013 - props.data_2012) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>' :
        'Klicke auf ein Land');
    } else if (year === '2014') {
      if (type === 'origin') {
        fill = 'gesamt ' + fill2 + ' <b> ' + (map === importMap ? props.e_country : props.s_country) + '</b><br>Menge: ' + props.data_tot_2014 + ' Tonnen';
      } else {
        if (map === importMap) {
          fill = (props ?
            fill3 + ' <b>' + props.s_country + '</b><br>Rang: ' + props.rank_2014 + ((props.rank_2013 - props.rank_2014) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2013 - props.rank_2014) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2013 + '*)' + '<br>Menge: ' + props.data_2014 + ' (' + ((props.data_2014 - props.data_2013) >= 0 ? '+' : '') + (props.data_2014 - props.data_2013) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>' :
            'Klicke auf ein Land');
        } else if (map === exportMap) {
          fill = (props ?
            fill3 + ' <b>' + props.e_country + '</b><br>Rang: ' + props.rank_2014 + '<br>Menge: ' + props.data_2014 + ' Tonnen' :
            'Klicke auf ein Land');
        }
      }
    } else if (year === '2015') {
      if (type === 'origin') {
        fill = 'gesamt ' + fill2 + ' <b> ' + (map === importMap ? props.e_country : props.s_country) + '</b><br>Menge: ' + props.data_tot_2015 + ' (' + ((props.data_tot_2015 - props.data_tot_2014) >= 0 ? '+' : '') + (props.data_tot_2015 - props.data_tot_2014) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>';
      } else {
        fill = (props ?
          fill3 + ' <b>' + (map === importMap ? props.s_country : props.e_country) + '</b><br>Rang: ' + props.rank_2015 + ((props.rank_2014 - props.rank_2015) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2014 - props.rank_2015) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2014 + '*)' + '<br>Menge: ' + props.data_2015 + ' (' + ((props.data_2015 - props.data_2014) >= 0 ? '+' : '') + (props.data_2015 - props.data_2014) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>' :
          'Klicke auf ein Land');
      }
    } else if (year === '2016') {
      if (type === 'origin') {
        fill = 'gesamt ' + fill2 + ' <b> ' + (map === importMap ? props.e_country : props.s_country) + '</b><br>Menge: ' + props.data_tot_2016 + ' (' + ((props.data_tot_2016 - props.data_tot_2015) >= 0 ? '+' : '') + (props.data_tot_2016 - props.data_tot_2015) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>';
      } else {
        fill = (props ?
          fill3 + ' <b>' + (map === importMap ? props.s_country : props.e_country) + '</b><br>Rang: ' + props.rank_2016 + ((props.rank_2015 - props.rank_2016) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2015 - props.rank_2016) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2015 + '*)' + '<br>Menge: ' + props.data_2016 + ' (' + ((props.data_2016 - props.data_2015) >= 0 ? '+' : '') + (props.data_2016 - props.data_2015) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>' :
          'Klicke auf ein Land');
      }
    } else if (year === '2017') {
      if (type === 'origin') {
        fill = 'gesamt ' + fill2 + ' <b> ' + (map === importMap ? props.e_country : props.s_country) + '</b><br>Menge: ' + props.data_tot_2017 + ' (' + ((props.data_tot_2017 - props.data_tot_2016) >= 0 ? '+' : '') + (props.data_tot_2017 - props.data_tot_2016) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>';
      } else {
        fill = (props ?
          fill3 + ' <b>' + (map === importMap ? props.s_country : props.e_country) + '</b><br>Rang: ' + props.rank_2017 + ((props.rank_2016 - props.rank_2017) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2016 - props.rank_2017) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2016 + '*)' + '<br>Menge: ' + props.data_2017 + ' (' + ((props.data_2017 - props.data_2016) >= 0 ? '+' : '') + (props.data_2017 - props.data_2016) + '*) Tonnen<br><em>*Vergleich Vorjahr</em>' :
          'Klicke auf ein Land');
      }
    } else if (year === '2018') {
      if (type === 'origin') {
        fill = 'gesamt ' + fill2 + ' <b> ' + props.s_country + '</b><br>Menge: ' + props.data_tot_2018 + '* (' + ((props.data_tot_2018 - props.data_tot_2017) >= 0 ? '+' : '') + (props.data_tot_2018 - props.data_tot_2017) + '**) Tonnen<br><em>*Hochrechnung</em><br><em>**Vergleich Vorjahr</em>';
      } else {
        fill = (props ?
          fill3 + ' <b>' + props.e_country + '</b><br>Rang: ' + props.rank_2018 + ((props.rank_2017 - props.rank_2018) > 0 ? '<i class="material-icons up">arrow_upward</i>' : ((props.rank_2017 - props.rank_2018) < 0 ? '<i class="material-icons down">arrow_downward</i>' : '<i class="material-icons eq">code</i>')) + '(' + props.rank_2017 + '**)' + '<br>Menge: ' + props.data_2018 + '* (' + ((props.data_2018 - props.data_2017) >= 0 ? '+' : '') + (props.data_2018 - props.data_2017) + '**) Tonnen<br><em>*Hochrechnung</em><br><em>**Vergleich Vorjahr</em>' :
          'Klicke auf ein Land');
      }
    }
    this._div.innerHTML = '<h4>' + fill1 + ' ' + year + '</h4>' + fill;
  };
  info.addTo(map);

  // Create legend
  var legend = L.control({
    position: 'bottomright'
  });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend ' + class2),
      labels = [];
    div.innerHTML = '<em>in Tonnen</em><br>'
    for (var i = 0; i < colors.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        breakpoints[i] + (breakpoints[i + 2] ? '&ndash;' + breakpoints[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(map);

  // Only focus mouse wheel if map was clicked
  map.scrollWheelZoom.disable();
  map.on('focus', function () {
    map.scrollWheelZoom.enable();
  });
  map.on('blur', function () {
    map.scrollWheelZoom.disable();
  });
}



// CHARTS

function initChart(id, type, obj) {
  // Create universal variables
  var colors = ['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#d2f53c', '#fabebe'];
  // Create unique variables
  var labels = [];
  var dsLabels = [];
  var dsData = [];
  var titleText;
  if (id === 'topimports') {
    labels = ['2012', '2013', '2014', '2015', '2016', '2017'];
    dsLabels = ['Niederlande', 'Neuseeland', 'Frankreich', 'Irland', 'Deutschland', 'Dänemark', 'Australien', 'Schweiz', 'Südkorea', 'USA'];
    dsData = [
      ['21051', '25164', '33608', '57721', '79063', '87866'],
      ['16324', '19747', '10487', '14483', '24071', '47374'],
      ['15764', '22554', '16381', '15715', '15047', '43004'],
      ['4205', '7636', '17308', '24704', '32618', '37953'],
      ['1759', '2108', '4830', '17491', '21695', '28601'],
      ['4896', '11177', '12442', '10865', '13308', '20910'],
      ['3975', '6795', '4546', '10708', '12001', '12427'],
      ['1339', '2039', '3011', '3082', '5273', '6737'],
      ['3255', '4932', '5788', '7320', '8386', '5398'],
      ['2006', '1986', '2327', '4587', '4278', '4606']
    ];
    titleText = 'Die Top-Exporteure von Babymilchpulver nach China';
    xLabel = 'Jahr';
    yLabel = 'Menge (Tonnen)';
  } else if (id === 'topexports') {
    labels = ['2014', '2015', '2016', '2017', '2018 (Hochrechnung)'];
    dsLabels = ['China', 'Hongkong', 'Saudi-Arabien', 'Russland', 'Algerien', 'Türkei', 'Irak', 'Pakistan', 'Ägypten', 'Libyen'];
    dsData = [
      ['91434', '120171', '161076', '225990', '323932'],
      ['45661', '39171', '42252', '45237', '106672'],
      ['33820', '36953', '36796', '32779', '31714'],
      ['26087', '20421', '18579', '25552', '27364'],
      ['22023', '23178', '22338', '22570', '20831'],
      ['15774', '18396', '16219', '17191', '14009'],
      ['3030', '6496', '7686', '11353', '11526'],
      ['5664', '7712', '9608', '9034', '10063'],
      ['10742', '13063', '15257', '10767', '4021'],
      ['8093', '6440', '6356', '3986', '6986']
    ];
    titleText = 'Die Top-Exporte von Babymilchpulver der Europäischen Union';
    xLabel = 'Jahr';
    yLabel = 'Menge (Tonnen)';
  }
  // Case: data was fetched from sql db
  else if (id === 'productionvsimport') {
    var dsData1 = [];
    var dsData2 = [];
    for (var i = 0; i < obj.length; i++) {
      var date;
      // For safari browser: manually create date array as safari does not support toLocaleDateString
      if (/^((?!chrome|android).)*safari|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        console.log('Safari browser detected');
        var month = i + 1 - parseInt(i / 12) * 12;
        var year = 2009 + parseInt(i / 12);
        date = ('0' + month).slice(-2) + '.' + year;
      } else {
        // For all other browsers: change date format to german
        date = new Date(obj[i][0]).toLocaleDateString('de-DE', {
          month: '2-digit',
          year: 'numeric'
        });
      }
      labels.push(date);
      dsData1.push(obj[i][1]);
      dsData2.push(obj[i][2]);
    }
    dsData = [dsData1, dsData2];
    dsLabels = ['Produktion', 'Import'];
    titleText = 'China: Produktion vs. Import';
    xLabel = 'Monat';
    yLabel = 'Menge (Tonnen)';
  } else if (id === 'gni') {
    var dsData1 = [];
    var dsData2 = [];
    var dsData3 = [];
    var dsData4 = [];
    for (var i = 0; i < obj.length; i++) {
      labels.push(obj[i][0]);
      dsData1.push(obj[i][1]);
      dsData2.push(obj[i][2]);
      dsData3.push(obj[i][3]);
      dsData4.push(obj[i][4]);
    }
    dsData = [dsData1, dsData2, dsData3, dsData4];
    dsLabels = ['China', 'Indien', 'Pakistan', 'Welt'];
    titleText = 'China: Bruttonationaleinkommen pro Einwohner';
    xLabel = 'Jahr';
    yLabel = 'BNE (KKP)';
  } else if (id === 'breastfeeding') {
    labels = ['1998', '2004', '2008', '2010', '2013'];
    dsLabels = ['Bruststillrate'];
    dsData = [
      ['67', '49', '27.6', '28.7', '20.8']
    ];
    titleText = 'China: ausschließliche Bruststillung von Neugeborenen bis 6 Monaten';
    xLabel = 'Jahr';
    yLabel = 'Prozent';
  } else if (id === 'birthrate') {
    labels = ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'];
    dsLabels = ['Geburtenrate'];
    dsData = [
      ['16.12', '15.95', '15.85', '12.96', '12.98', '13.14', '13.25', '13.45', '13.71', '14', '12.17', '12.29', '12.31', '12.25', '12.17', null, '12.4', '12.3']
    ];
    titleText = 'China: Geburtenrate pro 1.000 Einwohner';
    xLabel = 'Jahr';
    yLabel = 'Geburten pro 1.000 Einwohner';
  }
  // Loop to create datasets with dsLabels length
  var ds = [];
  for (var j = 0; j < dsLabels.length; j++) {
    ds.push({
      label: dsLabels[j],
      backgroundColor: colors[j],
      borderColor: colors[j],
      data: dsData[j],
      fill: false,
      skipNullValues: true
    });
  }
  // Setup config with created values
  var config = {
    type: type,
    data: {
      labels: labels,
      datasets: ds
    },
    options: {
      responsive: true,
      spanGaps: true,
      title: {
        display: true,
        text: titleText
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: xLabel
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: yLabel
          },
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  }
  var ctx = document.getElementById(id).getContext('2d');
  window.myLine = new Chart(ctx, config);
}