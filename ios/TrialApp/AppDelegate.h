//This was the inital file.
// #import <RCTAppDelegate.h>
// #import <UIKit/UIKit.h>

// @interface AppDelegate : RCTAppDelegate

// @end


//This is the file i took from jazzgroove
#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <React/RCTBridgeDelegate.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>

@interface AppDelegate : RCTAppDelegate <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) RCTRootView* rootView;
@property (nonatomic, strong) RCTBridge *bridge;
@end
