const {withAppDelegate, withInfoPlist} = require('expo/config-plugins');

const legacyWindowStartup = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

const sceneDelegate = `

@objc(OatMarkSceneDelegate)
public class OatMarkSceneDelegate: UIResponder, UIWindowSceneDelegate {
  public var window: UIWindow?

  public func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: nil)
  }
}
`;

module.exports = (config) => {
  config = withAppDelegate(config, (mod) => {
    if (mod.modResults.contents.includes('@objc(OatMarkSceneDelegate)')) return mod;
    if (mod.modResults.language !== 'swift' || !mod.modResults.contents.includes(legacyWindowStartup)) {
      throw new Error('The iOS AppDelegate template changed; review its scene lifecycle before building.');
    }
    mod.modResults.contents = mod.modResults.contents.replace(legacyWindowStartup, '') + sceneDelegate;
    return mod;
  });

  return withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: 'Default Configuration',
          UISceneDelegateClassName: 'OatMarkSceneDelegate',
        }],
      },
    };
    return mod;
  });
};
