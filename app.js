/*!
 *  Project: Indian Energy Technical Assistance Matrix
 *  Description: Faceted search using cartesian products to select combinations of assistance types
 *  Authors: Michael Oakley <michael.oakley@nrel.gov>, Jessica Sams <jessica.sams@nrel.gov>
 */
'use strict';

$(function() {
    var $container = $('#container');
    var $filters   = $('#filters');

    /*
     *  init Isotope
     *  Requires DOM to be set up
     */
    var initIsotope = function() {

        $container.isotope({
            itemSelector: '.item'
        });

    };


    var refilterIsotope = function(filterlist) {

        $container.isotope({
            filter: filterlist
        });

    };

    /*
     *  If there are no items visible, show a message.
     *
     */
    var toggleMessage = function() {

        if ( !$container.data('isotope').filteredItems.length ) {
            $( '.message' ).removeClass('hide');
        } else {
            $( '.message' ).addClass('hide');
        }

    };


    /*
     *  build out filter arrays (array of arrays)
     *
     */
    var filterBuilder = function(arr) {
        var result
          , allCasesOfRest
          , c, i, j;

        if (arr.length === 0) {
            return [];
        } else if (arr.length === 1) {
            return arr[0];
        } else {

            result = [];
            allCasesOfRest = filterBuilder( arr.slice(1) ); // recur with the rest of array

            if ( allCasesOfRest.length ) {
                for (c in allCasesOfRest) {
                    if ( arr[0].length ) {
                        for (i = 0; i < arr[0].length; i++) {
                            result.push( arr[0][i] + allCasesOfRest[c] ); // concat and push onto results array
                        }
                    } else {
                        result.push( allCasesOfRest[c] ); //  push onto results array
                    }
                }
            } else {
                for (j = 0; j < arr[0].length; j++) {
                    result.push( arr[0][j] ); // push onto results array
                }
            }

            return result;
        }
    };


    /*
     *  figure out how many filter groups we have and set up our filter array
     *
     */
    var countFilterGroups = function(filterClass) {
        var numFilterGroups = $(filterClass).length
          , arr = []
          , i;

        for (i = 0; i < numFilterGroups; i = i + 1) {
            arr.push([]);
        }

        return arr;
    };



    /*
     *  build the HTML cards
     *  return none
     *  modifies DOM
     */
    var buildCards = function(results) {

        var icons = [];

        $filters
            .find( '[data-filter-group="phase"]' )
                .find( '[data-filter]' )
                    .each( function(key) {
                        icons[key] = $(this).data('icon');
                    });


        //console.log('icons:', icons);

        $.each( results, function(key, result) {

            var template;

            template = '<div class="item ' + result.filters + '">';
            template +=  '<h3><a href="' + result.href + '">' + result.name + '</a></h3>';
            template +=  '<p><strong>' + result.agency + '</strong></p>';
            template +=  '<p>' + result.description + '</p>';
            template +=  '<p>Project development phase: </p>';
            template +=  '<div class="phases">';

            result.phase.map( function(val, idx) {

                var phase = result.phase[idx].match(/\d/);

                // if match() returns null, use 0, otherwise use the match
                phase = phase ? phase[0] : 0;

                template += '<p><img src="assets/images/' + icons[phase] + '" alt="" />' + result.phase[idx] + '</p>';

            });

            template +=  '</div>';
            template +=  '<p class="types">' + result.type + ' | ' + result.eligibility + '</p>';
            template += '</div>';

            $container.append(template);
        });

    };


    // store filter for each group
    var filters = countFilterGroups( '.checkbox-group' );

    var api = {
        protocol: '//'
      , host: 'developer.nrel.gov'
      , url: '/api/indianenergyta/programs'
      , params: '?api_key=0mKfgtyJPcn9jLdpHcZMkiUbMRJCVuEu7k7xvmHx'
    };

    // var apix ={
    //     protocol : '//'
    //   , host     : 'localhost:8081'
    //   , url      : '/api/programs'
    //   , params   : ''
    // };

    var jqxhr = $.getJSON( api.protocol + api.host + api.url + api.params );

    jqxhr.done( buildCards, initIsotope );


    // listen for changes on the checkboxes
    $filters.on( 'change', '.checkbox', function() {

        var $this
          , filterType
          , isChecked
          , filterValue
          , index
          , isotopeFilters;

        $this = $(this);

        // get the filter type (eg color)
        filterType = $this.parents( '.checkbox-group' ).attr( 'data-filter-type' );

        // did we check or uncheck the box?
        isChecked = $this.prop( 'checked' );

        // get the filter value (eg red)
        filterValue = $this.attr( 'data-filter' );

        // add/remove the filter value (eg red)
        if (isChecked) {
            filters[filterType].push(filterValue);
        } else {
            index = filters[filterType].indexOf(filterValue);
            filters[filterType].splice(index, 1);
        }

        // do the maths...
        isotopeFilters = filterBuilder(filters);

        // remove holes/blanks in array
        isotopeFilters = isotopeFilters.filter( function(e) {
            return e;
        });

        // convert the array to comma sep string
        isotopeFilters = isotopeFilters.toString();

        refilterIsotope( isotopeFilters );

        toggleMessage();

    });

});
