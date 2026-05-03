import 'package:amazon_cognito_identity_dart_2/cognito.dart';
import '../config/api_config.dart';

class AuthService {
  static final _userPool = CognitoUserPool(
    ApiConfig.userPoolId,
    ApiConfig.clientId,
  );

  static CognitoUser? _cognitoUser;
  static CognitoUserSession? _session;

  static Future<Map<String, dynamic>> signIn(String email, String password) async {
    try {
      _cognitoUser = CognitoUser(email, _userPool);
      final authDetails = AuthenticationDetails(
        username: email,
        password: password,
      );
      _session = await _cognitoUser!.authenticateUser(authDetails);
      return {'success': true};
    } on CognitoUserNewPasswordRequiredException {
      return {'success': false, 'error': 'You must set a new password. Please contact admin.'};
    } on CognitoClientException catch (e) {
      final code = e.code ?? '';
      String message;
      switch (code) {
        case 'UserNotFoundException':
          message = 'No account found with this email address.';
          break;
        case 'NotAuthorizedException':
          message = 'Incorrect password. Please try again.';
          break;
        case 'UserNotConfirmedException':
          message = 'Please verify your email before signing in.';
          break;
        case 'TooManyRequestsException':
          message = 'Too many attempts. Please wait and try again.';
          break;
        default:
          message = e.message ?? 'Sign in failed. Please try again.';
      }
      return {'success': false, 'error': message};
    } catch (e) {
      return {'success': false, 'error': 'Connection error. Check your internet and try again.'};
    }
  }

  static Future<Map<String, dynamic>> signUp(
      String email, String password, String name, String address, String district) async {
    try {
      final userAttributes = [
        AttributeArg(name: 'name', value: name),
        AttributeArg(name: 'address', value: address),
        AttributeArg(name: 'custom:district', value: district),
        AttributeArg(name: 'custom:role', value: 'citizen'),
      ];
      await _userPool.signUp(email, password, userAttributes: userAttributes);
      return {'success': true};
    } on CognitoClientException catch (e) {
      final code = e.code ?? '';
      String message;
      switch (code) {
        case 'UsernameExistsException':
          message = 'An account with this email already exists.';
          break;
        case 'InvalidPasswordException':
          message = 'Password must be at least 8 characters with uppercase, number and symbol.';
          break;
        case 'InvalidParameterException':
          message = 'Please enter a valid email address.';
          break;
        default:
          message = e.message ?? 'Sign up failed. Please try again.';
      }
      return {'success': false, 'error': message};
    } catch (e) {
      return {'success': false, 'error': 'Connection error. Check your internet and try again.'};
    }
  }

  static Future<Map<String, dynamic>> confirmSignUp(String email, String code) async {
    try {
      final cognitoUser = CognitoUser(email, _userPool);
      await cognitoUser.confirmRegistration(code);
      return {'success': true};
    } on CognitoClientException catch (e) {
      return {'success': false, 'error': e.message ?? 'Invalid verification code.'};
    } catch (e) {
      return {'success': false, 'error': 'Verification failed. Try again.'};
    }
  }

  static Future<void> signOut() async {
    await _cognitoUser?.signOut();
    _cognitoUser = null;
    _session = null;
  }

  static bool get isLoggedIn => _session?.isValid() ?? false;
  static String? get currentUserEmail => _cognitoUser?.username;
}
