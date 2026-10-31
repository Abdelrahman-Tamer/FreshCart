export interface FormattedError {
  title: string;
  message: string;
}

/**
 * Transforms technical backend error codes and raw API responses into
 * clear, actionable, and human-friendly messages for shoppers.
 * Completely eliminates cryptic messages like "fail", "Error", or raw validation objects.
 */
export function formatApiError(err: any, requestUrl?: string): FormattedError {
  const url = (requestUrl || '').toLowerCase();
  const isSignIn = url.includes('/signin');
  const isSignUp = url.includes('/signup');
  const isForgot = url.includes('/forgotpasswords');
  const isResetCode = url.includes('/verifyresetcode');
  const isResetPassword = url.includes('/resetpassword');
  const isCart = url.includes('/cart');
  const isWishlist = url.includes('/wishlist');
  const isOrders = url.includes('/orders');
  const isChangePassword = url.includes('/changemypassword') || url.includes('/changepassword');
  const isUpdateProfile = url.includes('/updateme') || url.includes('/updateuser');
  const isAddress = url.includes('/addresses');

  // 1. Connection / Network errors (status 0 or no response)
  if (!err || err.status === 0 || err.name === 'TimeoutError') {
    return {
      title: 'Connection Issue',
      message: 'Unable to connect to FreshCart. Please check your internet connection and try again.'
    };
  }

  const status = err.status;

  // 2. Extract nested validation error messages (Express-validator schema from backend)
  let extractedMsg = '';

  if (err.error?.errors) {
    const errors = err.error.errors;
    if (typeof errors === 'string' && errors.trim().toLowerCase() !== 'fail') {
      extractedMsg = errors.trim();
    } else if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      const msg = typeof first === 'string' ? first : (first?.msg || first?.message || '');
      if (msg && msg.toLowerCase() !== 'fail') {
        extractedMsg = msg;
      }
    } else if (typeof errors === 'object' && errors !== null) {
      const msg = errors.msg || errors.message || '';
      if (typeof msg === 'string' && msg.toLowerCase() !== 'fail') {
        extractedMsg = msg;
      }
    }
  }

  // 3. Fallback to top-level message if not generic "fail" or "error"
  if (!extractedMsg && err.error?.message && typeof err.error.message === 'string') {
    const raw = err.error.message.trim();
    if (raw.toLowerCase() !== 'fail' && raw.toLowerCase() !== 'error') {
      extractedMsg = raw;
    }
  }

  // 4. Humanize backend message strings if they look like technical phrases
  if (extractedMsg) {
    const lower = extractedMsg.toLowerCase();
    if (lower.includes('incorrect email or password')) {
      return {
        title: 'Sign In Failed',
        message: 'Incorrect email or password. Please verify your credentials and try again.'
      };
    }
    if (lower.includes('account already exists') || lower.includes('email already exists')) {
      return {
        title: 'Account Already Exists',
        message: 'An account with this email address already exists. Please sign in instead.'
      };
    }
    if (lower.includes('reset code is invalid') || lower.includes('expired')) {
      return {
        title: 'Invalid Reset Code',
        message: 'The reset code entered is invalid or has expired. Please request a new code.'
      };
    }
    if (lower.includes('no user registered with this email')) {
      return {
        title: 'Account Not Found',
        message: 'No account was found matching this email address. Please check your spelling or register.'
      };
    }
    if (lower.includes('must be at least')) {
      return {
        title: 'Validation Error',
        message: capitalizeFirstLetter(extractedMsg) + '.'
      };
    }
    if (isChangePassword && (lower.includes('current password') || lower.includes('user password') || lower.includes('wrong password') || lower.includes('incorrect password'))) {
      return {
        title: 'Incorrect Current Password',
        message: 'The current password you entered is incorrect. Please verify and try again.'
      };
    }
  }

  // 5. Status-specific intelligent fallbacks
  switch (status) {
    case 400: {
      if (extractedMsg) {
        return {
          title: isSignIn ? 'Sign In Failed' : isSignUp ? 'Registration Error' : isChangePassword ? 'Password Error' : isUpdateProfile ? 'Profile Error' : isAddress ? 'Address Error' : 'Invalid Information',
          message: capitalizeFirstLetter(extractedMsg)
        };
      }
      if (isSignIn) {
        return {
          title: 'Sign In Failed',
          message: 'Please check your email address and password format.'
        };
      }
      if (isSignUp) {
        return {
          title: 'Registration Error',
          message: 'Please ensure all required fields are filled out correctly.'
        };
      }
      if (isChangePassword) {
        return {
          title: 'Password Update Failed',
          message: 'Please ensure your current password is correct and your new password meets the requirements.'
        };
      }
      if (isUpdateProfile) {
        return {
          title: 'Profile Update Failed',
          message: 'Please check your name and phone number and try again.'
        };
      }
      if (isResetCode) {
        return {
          title: 'Invalid Code',
          message: 'The 6-digit code entered is incorrect or expired.'
        };
      }
      return {
        title: 'Invalid Details',
        message: 'The information submitted is incomplete or invalid. Please check your inputs.'
      };
    }

    case 401: {
      if (isSignIn) {
        return {
          title: 'Sign In Failed',
          message: 'Incorrect email or password. Please try again.'
        };
      }
      if (isChangePassword) {
        return {
          title: 'Incorrect Current Password',
          message: 'The current password entered is incorrect. Please verify and try again.'
        };
      }
      return {
        title: 'Session Expired',
        message: 'Your session has ended. Please sign in again to continue.'
      };
    }

    case 403:
      return {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.'
      };

    case 404: {
      if (isForgot) {
        return {
          title: 'Account Not Found',
          message: 'We could not find an account registered with that email address.'
        };
      }
      if (extractedMsg) {
        return {
          title: 'Not Found',
          message: capitalizeFirstLetter(extractedMsg)
        };
      }
      return {
        title: 'Item Not Found',
        message: 'The requested product, order, or page could not be found.'
      };
    }

    case 409:
      return {
        title: 'Account Already Exists',
        message: 'An account with this email is already registered. Please sign in instead.'
      };

    case 429:
      return {
        title: 'Please Slow Down',
        message: 'Too many requests were sent in a short period. Please wait a few seconds and try again.'
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Temporarily Down',
        message: 'We are experiencing temporary server difficulties. Please try again in a few moments.'
      };

    default: {
      if (extractedMsg) {
        return {
          title: 'Notice',
          message: capitalizeFirstLetter(extractedMsg)
        };
      }
      if (isCart) {
        return {
          title: 'Cart Update Failed',
          message: 'Could not update your shopping cart. Please try again.'
        };
      }
      if (isWishlist) {
        return {
          title: 'Wishlist Update Failed',
          message: 'Could not update your wishlist. Please try again.'
        };
      }
      if (isOrders) {
        return {
          title: 'Order Status',
          message: 'Could not retrieve your orders. Please refresh the page.'
        };
      }
      return {
        title: 'Request Failed',
        message: 'An unexpected issue occurred while processing your request. Please try again.'
      };
    }
  }
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
