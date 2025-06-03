#import "CarSceneDelegate.h"
#import "AppDelegate.h"
#import <RNCarPlay.h>

@implementation CarSceneDelegate
 - (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene didConnectInterfaceController:(CPInterfaceController *)interfaceController {
   AppDelegate *applicationDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
   if(applicationDelegate.bridge == nil) {
     applicationDelegate.bridge = [[RCTBridge alloc] initWithDelegate:applicationDelegate launchOptions:@{}];
     applicationDelegate.rootView = [[RCTRootView alloc] initWithBridge:applicationDelegate.bridge
                                                             moduleName:@"TrialApp"
                                                      initialProperties:nil];
   }
  
   [RNCarPlay connectWithInterfaceController:interfaceController window:templateApplicationScene.carWindow];
 }

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene didDisconnectInterfaceController:(CPInterfaceController *)interfaceController {
  [RNCarPlay disconnect];
}

@end