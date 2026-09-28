const {withAppDelegate, withInfoPlist, withPodfile} = require('expo/config-plugins');

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

  config = withInfoPlist(config, (mod) => {
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

  return withPodfile(config, (mod) => {
    const marker = `    )\n  end\nend`;
    if (mod.modResults.contents.includes('installer.pods_project.targets.each do |target|')) return mod;
    if (!mod.modResults.contents.includes(marker)) {
      throw new Error('The iOS Podfile template changed; review its post_install hook before building.');
    }
    mod.modResults.contents = mod.modResults.contents.replace(marker, `    )
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |configuration|
        version = configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if version && Gem::Version.new(version) < Gem::Version.new('15.1')
          configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end
  end
end`);
    return mod;
  });
};
