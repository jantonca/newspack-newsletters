<?php
/**
 * Newspack Newsletters Settubgs Page
 *
 * @package Newspack
 */

defined( 'ABSPATH' ) || exit;

/**
 * Manages Settings page.
 */
class Newspack_Newsletters_Settings {
	/**
	 * Set up hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', [ __CLASS__, 'add_plugin_page' ] );
		add_action( 'admin_init', [ __CLASS__, 'page_init' ] );
	}

	/**
	 * Retreives list of settings.
	 *
	 * @return array Settings list.
	 */
	public static function get_settings_list() {
		return array(
			array(
				'description' => __( 'Mailchimp API Key', 'newspack' ),
				'key'         => 'newspack_newsletters_mailchimp_api_key',
			),
			array(
				'description' => __( 'MJML API Key', 'newspack' ),
				'key'         => 'newspack_newsletters_mjml_api_key',
			),
			array(
				'description' => __( 'MJML API Secret', 'newspack' ),
				'key'         => 'newspack_newsletters_mjml_api_secret',
			),
		);
	}

	/**
	 * Add options page
	 */
	public static function add_plugin_page() {
		add_options_page(
			'Settings Admin',
			'Newspack Newsletters',
			'manage_options',
			'newspack-newsletters-settings-admin',
			[ __CLASS__, 'create_admin_page' ]
		);
	}

	/**
	 * Options page callback
	 */
	public static function create_admin_page() {
		?>
		<div class="wrap">
			<h1>Newspack Newsletters Settings</h1>
			<form method="post" action="options.php">
			<?php
				settings_fields( 'newspack_newsletters_options_group' );
				do_settings_sections( 'newspack-newsletters-settings-admin' );
				submit_button();
			?>
			</form>
		</div>
		<?php
	}

	/**
	 * Register and add settings
	 */
	public static function page_init() {
		add_settings_section(
			'newspack_newsletters_options_group',
			'Newspack Newsletters Custom Settings',
			null,
			'newspack-newsletters-settings-admin'
		);
		foreach ( self::get_settings_list() as $setting ) {
			register_setting(
				'newspack_newsletters_options_group',
				$setting['key']
			);
			add_settings_field(
				$setting['key'],
				$setting['description'],
				[ __CLASS__, 'newspack_newsletters_settings_callback' ],
				'newspack-newsletters-settings-admin',
				'newspack_newsletters_options_group',
				$setting['key']
			);
		};
	}

	/**
	 * Render settings fields.
	 *
	 * @param string $key Setting key.
	 */
	public static function newspack_newsletters_settings_callback( $key ) {
		$value = get_option( $key, false );
		printf(
			'<input type="text" id="%s" name="%s" value="%s" class="widefat" />',
			esc_attr( $key ),
			esc_attr( $key ),
			esc_attr( $value )
		);
	}
}

if ( is_admin() ) {
	Newspack_Newsletters_Settings::init();
}