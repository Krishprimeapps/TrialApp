#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <AVFoundation/AVFoundation.h>
#import <CarPlay/CarPlay.h>
#import <MediaPlayer/MediaPlayer.h> 
#import "CarSceneDelegate.h"
#import "PhoneSceneDelegate.h"
#import <GoogleCast/GoogleCast.h>


@implementation AppDelegate

@synthesize bridge = _bridge;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
 // Audio Session Configuration
NSError *sessionError = nil;
AVAudioSession *session = [AVAudioSession sharedInstance];
BOOL success = [session setCategory:AVAudioSessionCategoryPlayback
                        withOptions:AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionDefaultToSpeaker
                              error:&sessionError];
if (!success || sessionError) {
  NSLog(@"❌ AVAudioSession error: %@", sessionError);
}

success = [session setMode:AVAudioSessionModeDefault error:&sessionError];
if (!success || sessionError) {
  NSLog(@"❌ AVAudioSession mode error: %@", sessionError);
}

success = [session setActive:YES error:&sessionError];
if (!success || sessionError) {
  NSLog(@"❌ AVAudioSession activate error: %@", sessionError);
}

//Remote Command Center Setup
MPRemoteCommandCenter *commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
commandCenter.playCommand.enabled = YES;
commandCenter.pauseCommand.enabled = YES;
commandCenter.togglePlayPauseCommand.enabled = YES;

// Begin receiving remote control events
[[UIApplication sharedApplication] beginReceivingRemoteControlEvents];



NSString *receiverAppID = kGCKDefaultMediaReceiverApplicationID; // or @"ABCD1234"
  GCKDiscoveryCriteria *criteria = [[GCKDiscoveryCriteria alloc] initWithApplicationID:receiverAppID];
  GCKCastOptions* options = [[GCKCastOptions alloc] initWithDiscoveryCriteria:criteria];
  options.suspendSessionsWhenBackgrounded = false;
  [GCKCastContext setSharedInstanceWithOptions:options];


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
- (UISceneConfiguration *)application:(UIApplication *)application
    configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession
                                 options:(UISceneConnectionOptions *)options {
    if (connectingSceneSession.role == CPTemplateApplicationSceneSessionRoleApplication) {
        UISceneConfiguration *scene = [[UISceneConfiguration alloc]
            initWithName:@"CarPlay"
            sessionRole:connectingSceneSession.role];
        scene.delegateClass = [CarSceneDelegate class];
        return scene;
    } else {
        UISceneConfiguration *scene = [[UISceneConfiguration alloc]
            initWithName:@"Phone"
            sessionRole:connectingSceneSession.role];
        scene.delegateClass = [PhoneSceneDelegate class];
        return scene;
    }
}
@end
