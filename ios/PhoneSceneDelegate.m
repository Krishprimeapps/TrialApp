// This is the file from documentation
// #import "PhoneSceneDelegate.h"

// @implementation PhoneSceneDelegate
// - (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
//   AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
//   UIWindowScene *windowScene = (UIWindowScene *)scene;
//   UIViewController *rootViewController = [[UIViewController alloc] init];
//   rootViewController.view = appDelegate.rootView;
//   UIWindow *window = [[UIWindow alloc] initWithWindowScene:windowScene];
//   window.rootViewController = rootViewController;
//   self.window = window;
//   [window makeKeyAndVisible];
// }

// @end

// This is the file I took from jazzgroove.
// #import "PhoneSceneDelegate.h"
// #import "AppDelegate.h"
// #import <React/RCTRootView.h>
// #import "RNSplashScreen.h"

// @implementation PhoneSceneDelegate
// - (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
//   AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
//   UIWindowScene *windowScene = (UIWindowScene *)scene;

//   RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:appDelegate.bridge
//                                                   moduleName:@"TrialApp" 
//                                            initialProperties:nil];

//   UIViewController *rootViewController = [[UIViewController alloc] init];
//   rootViewController.view = rootView;

//   UIWindow *window = [[UIWindow alloc] initWithWindowScene:windowScene];
//   window.rootViewController = rootViewController;
//   self.window = window;
//   [window makeKeyAndVisible];
//   [RNSplashScreen show];
// }

// @end

#import "PhoneSceneDelegate.h"
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import "AppDelegate.h"

@implementation PhoneSceneDelegate

- (void)scene:(UIScene *)scene
willConnectToSession:(UISceneSession *)session
      options:(UISceneConnectionOptions *)connectionOptions {

  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
  RCTBridge *bridge = appDelegate.bridge;

  UIWindowScene *windowScene = (UIWindowScene *)scene;
  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"TrialApp"
                                            initialProperties:nil];

  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;

  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
}

@end
