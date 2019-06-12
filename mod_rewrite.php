<?php

header( 'Content-Type: text/html; charset=utf-8' );

include 'Mobile_Detect.php';
$detect = new Mobile_Detect;

if ( isset( $_SERVER['SERVER_SOFTWARE'] ) AND $server_software = trim( $_SERVER['SERVER_SOFTWARE'] ) ) {
	if ( isset( $_SERVER['SERVER_NAME'] ) && ! empty( $_SERVER['SERVER_NAME'] ) ) {
		if ( $_SERVER['SERVER_NAME'] == 'staging.findable.co' ) {
			define( 'ENVIRONMENT', 'staging' );
		} else if ( $_SERVER['SERVER_NAME'] == 'findable.co' || $_SERVER['SERVER_NAME'] == 'www.findable.co' ) {
			define( 'ENVIRONMENT', 'production' );
		} else {
			define( 'ENVIRONMENT', 'development' );
		}
	} else {
		define( 'ENVIRONMENT', 'development' );
	}
} else {
	define( 'ENVIRONMENT', 'development' );
}

$path  = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
$query = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_QUERY );
$host  = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_HOST );
$id    = explode( '/', $path );
$path  = $path . ( ( ! is_null( $query ) ) ? '?' . $query : '' );

if ( count( $id ) < 3 ) {
	load($detect, $path);
} else if ( is_numeric( $id[2] ) ) {
	if ( strpos( $_SERVER["HTTP_USER_AGENT"], "facebookexternalhit/" ) !== false || strpos( $_SERVER["HTTP_USER_AGENT"], "Facebot" ) !== false ) {
		makePage( (object) array(
			'slug' => $id[1],
			'id' => $id[2]
		) );
	} else {
		load($detect, $path);
	}
} else {
	load($detect, $path);
}

function load( $detect = null, $path = null ) {
	if ( ! $detect->isMobile() ) {
		require __DIR__ . '/index.html';
	} else if ( $detect->isMobile() && is_business_path($path) ) {
		require __DIR__ . '/index.html';
	} else {
		if ( ENVIRONMENT == 'production' ) {
			header( 'Location: https://mobile.findable.co' . $path );
		} else {
			header( 'Location: https://mobile-staging.findable.co' . $path );
		}
	}
}

function makePage( $data ) {
	if ( ENVIRONMENT == 'production' ) {
		$asset_path = "https://findable.co/assets/images/";
		$pageUrl = "https://findable.co/". $data->slug ."/" . $data->id;
	} else {
		$asset_path = "https://staging.findable.co/assets/images/";
		$pageUrl = "https://staging.findable.co/". $data->slug ."/" . $data->id;
	}

	// Set the share title
	if ($data->slug == 'apply') {
		$title = "Apply for available positions";
	} else {
		$title = "Hi, check out my profile on Findable.co";
	}

	// Set the share description
	if ($data->slug == 'apply') {
		$description = "We are using Findable to help us with our recruitment process. Please create a Findable profile to be considered for available positions";
	} else {
		$description = "Findable – Create your free digital resume and be findable, promote yourself and track your resume activity in just 5 minutes";
	}

	// Set the share image
	if ($data->slug == 'apply') {
		$image = $asset_path . "findable_apply_share.png";
	} else {
		$image = $asset_path . "findable_share.png";;
	}

	$html    = '<!doctype html>' . PHP_EOL;
	$html    .= '<html>' . PHP_EOL;
	$html    .= '<head>' . PHP_EOL;
	$html    .= '<meta property="og:title" content="'. $title .'"/>' . PHP_EOL;
	$html    .= '<meta property="og:description" content="'. $description .'"/>' . PHP_EOL;
	$html    .= '<meta property="og:image" content="'. $image .'"/>' . PHP_EOL;
	$html    .= '<meta property="og:url" content="' . $pageUrl . '"/>' . PHP_EOL;
	$html    .= '</head>' . PHP_EOL;
	$html    .= '<body></body>' . PHP_EOL;
	$html    .= '</html>';
	echo $html;
}

function is_business_path( $path = '' ) {
	return strpos( $path, '/business/' ) !== false;
}
