import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

( function () {
	window.onload = function () {
		[ ...document.querySelectorAll( '.newspack-newsletters-subscribe' ) ].forEach( container => {
			const form = container.querySelector( 'form' );
			if ( ! form ) {
				return;
			}
			const messageContainer = container.querySelector(
				'.newspack-newsletters-subscribe-response'
			);
			const getCaptchaToken = () => {
				return new Promise( ( res, rej ) => {
					const reCaptchaScript = document.getElementById( 'newspack-recaptcha-js' );
					if ( ! reCaptchaScript ) {
						return res( '' );
					}

					const { grecaptcha } = window;
					if ( ! grecaptcha ) {
						return res( '' );
					}

					const captchaSiteKey = reCaptchaScript.getAttribute( 'src' ).split( '?render=' ).pop();
					if ( ! grecaptcha?.ready || ! captchaSiteKey ) {
						rej( __( 'Error loading the reCaptcha library.', 'newspack-newsletters' ) );
					}

					grecaptcha.ready( () => {
						grecaptcha
							.execute( captchaSiteKey, { action: 'submit' } )
							.then( token => res( token ) )
							.catch( e => rej( e ) );
					} );
				} );
			};
			const emailInput = container.querySelector( 'input[type="email"]' );
			const submit = container.querySelector( 'input[type="submit"]' );
			form.endFlow = ( message, status = 500 ) => {
				const messageNode = document.createElement( 'p' );
				emailInput.removeAttribute( 'disabled' );
				submit.removeAttribute( 'disabled' );
				messageNode.innerHTML = message;
				messageNode.className = `message status-${ status }`;
				if ( status === 200 ) {
					container.replaceChild( messageNode, form );
				} else {
					messageContainer.appendChild( messageNode );
				}
			};
			form.addEventListener( 'submit', ev => {
				ev.preventDefault();
				messageContainer.innerHTML = '';
				submit.disabled = true;
				submit.setAttribute( 'disabled', 'true' );

				if ( ! form.npe?.value ) {
					return form.endFlow( 'Please enter a vaild email address.', 400 );
				}

				getCaptchaToken()
					.then( captchaToken => {
						if ( ! captchaToken ) {
							return;
						}
						let tokenField = form.captcha_token;
						if ( ! tokenField ) {
							tokenField = document.createElement( 'input' );
							tokenField.setAttribute( 'type', 'hidden' );
							tokenField.setAttribute( 'name', 'captcha_token' );
							form.appendChild( tokenField );
						}
						tokenField.value = captchaToken;
					} )
					.catch( e => {
						form.endFlow( e, 400 );
					} )
					.finally( () => {
						const body = new FormData( form );
						if ( ! body.has( 'npe' ) || ! body.get( 'npe' ) ) {
							return form.endFlow( 'Please enter a vaild email address.', 400 );
						}
						emailInput.disabled = true;
						emailInput.setAttribute( 'disabled', 'true' );
						fetch( form.getAttribute( 'action' ) || window.location.pathname, {
							method: 'POST',
							headers: {
								Accept: 'application/json',
							},
							body,
						} ).then( res => {
							emailInput.disabled = false;
							submit.disabled = false;
							res.json().then( ( { message } ) => {
								form.endFlow( message, res.status );
							} );
						} );
					} );
			} );
		} );
	};
} )();
