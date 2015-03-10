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
    var initIsotope = function(){

        $container.isotope({
            itemSelector: '.item'
        });

    };


    var refilterIsotope = function( filterlist ){
        console.log('refilter ', filterlist);
        $container.isotope({
            filter: filterlist
        });

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
        var numFilterGroups =  $( filterClass ).length
          , arr = []
          , i;

        for( i=0; i < numFilterGroups; i=i+1) {
            arr.push([]);
        }

        return arr;
    };



    /*
     *  build the HTML cards
     *  return none
     *  modifies DOM
     */
    var buildCards = function( results ){

        $.each( results, function(key,result){

            var template = '' +
                '<div class="item ' + result.filters + '">'+
                    '<h3><a href="' + result.href + '">' + result.name + '</a></h3>'+
                    '<p><strong>' + result.agency + '</strong></p>'+
                    '<p>' + result.description + '</p>'+
                    '<p><img src="images/refinement.gif" alt="" height="20" width="20">Project development phase: ' + result.phase + '</p>'+
                    '<p class="types">' + result.type + ' | ' + result.eligibility +'</p>'+
                '</div>';

            $('#container').append(template);
        });

    };


    // store filter for each group
    var filters = countFilterGroups(' .checkbox-group' );

    //var jqxhr = $.getJSON('data.json');
    var jqxhr = $.getJSON('http://xcomm2dev.nrel.gov:8080/api/Programs');

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
        filterValue =  $this.attr( 'data-filter' );

        // add/remove the filter value (eg red)
        if( isChecked ) {
            filters[filterType].push( filterValue );
        } else {
            index = filters[filterType].indexOf( filterValue );
            filters[filterType].splice( index,  1 );
        }

        // do the maths...
        isotopeFilters = filterBuilder(filters);

        // remove holes/blanks in array
        isotopeFilters = isotopeFilters.filter( function(e){
            return e;
        });

        // convert the array to comma sep string
        isotopeFilters = isotopeFilters.toString();

        refilterIsotope( isotopeFilters );

    });

});

