//This was the initial file.
// #import "AppDelegate.h"

// #import <React/RCTBundleURLProvider.h>

// @implementation AppDelegate

// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// {
//   self.moduleName = @"TrialApp";
//   // You can add your custom initial props in the dictionary below.
//   // They will be passed down to the ViewController used by React Native.
//   self.initialProps = @{};

//   return [super application:application didFinishLaunchingWithOptions:launchOptions];
// }

// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// {
//   return [self getBundleURL];
// }

// - (NSURL *)getBundleURL
// {
// #if DEBUG
//   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
// #else
//   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// #endif
// }

// @end

//This if from jazzgroove
// #import "AppDelegate.h"

// #import <React/RCTBundleURLProvider.h>
// #import <React/RCTLinkingManager.h>
// #import <React/RCTRootView.h>
// #import "RNSplashScreen.h"
// #import <GoogleCast/GoogleCast.h>
// #import <CarPlay/CarPlay.h>
// #import "CarSceneDelegate.h"
// #import "PhoneSceneDelegate.h"

// @implementation AppDelegate

// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// {
//   self.moduleName = @"TrialApp";
//   // You can add your custom initial props in the dictionary below.
//   // They will be passed down to the ViewController used by React Native.
//   self.initialProps = @{};

//   RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
//   self.bridge = bridge;
//   RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
//                                                    moduleName:@"TrialApp"
//                                             initialProperties:nil];

//   if (@available(iOS 13.0, *)) {
//       rootView.backgroundColor = [UIColor systemBackgroundColor];
//   } else {
//       rootView.backgroundColor = [UIColor whiteColor];
//   }

//   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
//   UIViewController *rootViewController = [UIViewController new];
//   rootViewController.view = rootView;
//   self.window.rootViewController = rootViewController;
//   [self.window makeKeyAndVisible];
//   // [RNSplashScreen show];

//   NSString *receiverAppID = kGCKDefaultMediaReceiverApplicationID; // or @"ABCD1234"
//   GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:receiverAppID];
//   GCKCastOptions* options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
//   options.suspendSessionsWhenBackgrounded = false;
//   [GCKCastContext setSharedInstanceWithOptions:options];

//   return [super application:application didFinishLaunchingWithOptions:launchOptions];
// }

// - (UISceneConfiguration *)application:(UIApplication *)application
//     configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession
//                                  options:(UISceneConnectionOptions *)options {
//     if (connectingSceneSession.role == CPTemplateApplicationSceneSessionRoleApplication) {
//         UISceneConfiguration *scene = [[UISceneConfiguration alloc]
//             initWithName:@"CarPlay"
//             sessionRole:connectingSceneSession.role];
//         scene.delegateClass = [CarSceneDelegate class];
//         return scene;
//     } else {
//         UISceneConfiguration *scene = [[UISceneConfiguration alloc]
//             initWithName:@"Phone"
//             sessionRole:connectingSceneSession.role];
//         scene.delegateClass = [PhoneSceneDelegate class];
//         return scene;
//     }
// }

// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// {
//   return [self getBundleURL];
// }

// - (NSURL *)getBundleURL
// {
// #if DEBUG
//   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
// #else
//   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// #endif
// }

// - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url
//             options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
// {
//   return [RCTLinkingManager application:app openURL:url options:options];
// }

// @end




#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <AVFoundation/AVFoundation.h>
// #import <MediaPlayer/MediaPlayer.h>
// #import "CarPlayEventEmitter.h"

// #import <GoogleCast/GoogleCast.h>


@implementation AppDelegate

@synthesize bridge = _bridge;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
   NSError *sessionError = nil;
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:&sessionError];
  if (sessionError) {
    NSLog(@"Failed to set audio session category: %@", sessionError);
  }

  sessionError = nil;
  [[AVAudioSession sharedInstance] setActive:YES error:&sessionError];
  if (sessionError) {
    NSLog(@"Failed to activate audio session: %@", sessionError);
  }
// NSString *receiverAppID = kGCKDefaultMediaReceiverApplicationID; // or @"ABCD1234"
//   GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:receiverAppID];
//   GCKCastOptions* options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
//   options.suspendSessionsWhenBackgrounded = false;
//   [GCKCastContext setSharedInstanceWithOptions:options];
//  MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];

//   [commandCenter.playCommand setEnabled:YES];
//   [commandCenter.playCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
//     [CarPlayEventEmitter sendEventWithName:@"onCarPlayPlay"];
//     return MPRemoteCommandHandlerStatusSuccess;
//   }];

//   [commandCenter.pauseCommand setEnabled:YES];
//   [commandCenter.pauseCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
//     [CarPlayEventEmitter sendEventWithName:@"onCarPlayPause"];
//     return MPRemoteCommandHandlerStatusSuccess;
//   }];

   return YES;
}

- (NSString *)moduleName
{
  return @"TrialApp";   
}

- (NSDictionary *)initialProps
{
  return @{};
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
