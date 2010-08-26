<?php
/*
  Plugin Name: MapWorks
  Plugin URI: http://adaburrows.com/MapWorks
  Description: Display a map for an address and allows the user to get directions.
  Version: 0.1.0
  Author: Jillian Burrows
  Author URI: http://adaburrows.com/
*/ 


if(!class_exists('JAB_MapWorks')) {

  if ( ! defined( 'WP_CONTENT_URL' ) )
    define( 'WP_CONTENT_URL', get_option( 'siteurl' ) . '/wp-content' );
  if ( ! defined( 'WP_CONTENT_DIR' ) )
    define( 'WP_CONTENT_DIR', ABSPATH . 'wp-content' );
  if ( ! defined( 'WP_PLUGIN_URL' ) )
    define( 'WP_PLUGIN_URL', WP_CONTENT_URL. '/plugins' );
  if ( ! defined( 'WP_PLUGIN_DIR' ) )
    define( 'WP_PLUGIN_DIR', WP_CONTENT_DIR . '/plugins' );

  class JAB_MapWorks {

    /*
     * PHP4 compatibility, calls the constructor
     */
    function JAB_MapWorks() {$this->__construct();}


    /*
     * PHP5 constructor, sets up all the hooks that this plugin needs
     */
    function __construct() {
      // Set up scripts and css
      add_action('init',				array(&$this, 'load'));

      // Add ajax hooks for the admin menu
      add_action('wp_ajax_jab_mw_set_sv_latlng',	array(&$this, 'set_sv_latlng'));
      add_action('wp_ajax_jab_mw_add_polygon',		array(&$this, 'add_polygon'));
      add_action('wp_ajax_jab_mw_set_polygon',		array(&$this, 'set_polygon'));
      add_action('wp_ajax_jab_mw_del_polygon',		array(&$this, 'del_polygon'));
      add_action('wp_ajax_jab_mw_set_icon',		array(&$this, 'set_icon'));
      add_action('wp_ajax_jab_mw_del_icon',		array(&$this, 'del_icon'));
      add_action('wp_ajax_jab_mw_set_shadow',		array(&$this, 'set_shadow'));
      add_action('wp_ajax_jab_mw_del_shadow',		array(&$this, 'del_shadow'));

      // Set up the actual shortcode
      add_shortcode('mapworks', array(&$this, 'do_shortcode'));
    }

    /*
     * Function to load required scripts and set associated styles
     */
    function load() {
      // get the base url for all the files we're going to enqueue.
      $plugin_url = WP_PLUGIN_URL . '/' . dirname( plugin_basename(__FILE__) );

      // get the style sheet
      wp_enqueue_style('jab_mapworks_css', "{$plugin_url}/style/MapWorks.css");

      // register the scripts
      wp_register_script('google_map_api_v3', "http://maps.google.com/maps/api/js?sensor=false");
      wp_register_script('jab_mapworks', "{$plugin_url}/scripts/MapWorks.js", array('google_map_api_v3', 'jquery'));

      // enqueue the scripts
      wp_enqueue_script('google_map_api_v3');
      wp_enqueue_script('jab_mapworks');
    }

    /*
     * Here's where we put all the action for displaying the map!
     */
    function do_shortcode($atts, $content=null, $code="") {
      // get all the options from the user, or use the defaults here.
      extract( shortcode_atts(array(
          'id' => sha1(rand(1, 16505723)),		// unique id to allow multiple annonymous maps per post/page
          'name' => 'MapWorks by adaburrows.com',	// name of map, displayed in the marker tooltip
          'address' => 'Portland, OR',			// address to be geocoded
          'zoom' => '17',				// map zoom level
          // these two optionally override the geocoding
          'lat' => null,				// lattitude of business
          'lng' => null					// longitude of business
        ),$atts)
      );

      $info = '';
      // if the content in not null wrap it with the info div and set up the javascript to display it.
      if($content!=null) {
        $info = "map.set_info('<div class=\"mapworks_info\">$content</div>');";
      }

      // set up the documentation example
      if( ($content==null)&&($name=='MapWorks by adaburrows.com')&&($address=='Portland, OR') ) {
        $info = <<<INFO
map.set_info('<div class="mapworks_info"><h3>Simple Use Case:</h3>[mapworks name="Jillian Burrows" address="1909 Southwest 6th Avenue Portland, OR 97201-5205" zoom="13"]This is where I programmed most of this plugin.[/mapworks]</div>');
INFO;
      }

      $latlng = '';
      // set up the lat & lng overide javascript if any
      if($lat!=null && $lng!=null) {
        $latlng = "map.set_coord($lat, $lng);";
      }

      // set up the final block of html to return
      $html = <<<EOF
<div class="mapworks">
  <div id="{$id}_map" class="mapworks_map"></div>
  <!--<h6>Where are you?</h6>
  <input id="{$id}_address" class="mapworks_address" type="textbox" size="50" />
  <input id="{$id}_get_directions" class="mapworks_button" type="button" value="Get directions" />
  <input id="{$id}_clear_directions" class="mapworks_button" type="button" value="Clear directions" />
  <div id="{$id}_directions" class="mapworks_directions"></div>-->
  <script type="text/javascript">
    jQuery(function() {
      var map = new MapWorks("{$id}", "{$name}", "{$address}", {$zoom});{$latlng}{$info}
    });
  </script>
</div>
EOF;
      return $html;
    }

    /*
     * Ajax callback: Set's the initial street view location for a map
     */
    function set_sv_latlng() {
    global $wpdb;
      exit;
    }

    /*
     * Ajax callback: adds an overlay polygon to a map
     */
    function add_polygon() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: changes an existing polygon for a map
     */
    function set_polygon() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: deletes a polygon from a map
     */
    function del_polygon() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: set the icon for a location on a map
     */
    function set_icon() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: deletes custom icon from a map location
     */
    function del_icon() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: set the shadow for an icon on a map
     */
    function set_shadow() {
    global $wpdb;
      exit;      
    }

    /*
     * Ajax callback: deletes a shadow from an icon on a map
     */
    function del_shadow() {
    global $wpdb;
      exit;      
    }
  }

}

//Create an instance of the plugin
$jab_map_works_instance = new JAB_MapWorks();
?>
