// #import "CarPlayEventEmitter.h"

// @implementation CarPlayEventEmitter

// static CarPlayEventEmitter *sharedInstance = nil;

// RCT_EXPORT_MODULE();

// + (void)sendEventWithName:(NSString *)name {
//   if (sharedInstance) {
//     [sharedInstance sendEventWithName:name body:nil];
//   }
// }

// - (instancetype)init {
//   if (self = [super init]) {
//     sharedInstance = self;
//   }
//   return self;
// }

// - (NSArray<NSString *> *)supportedEvents {
//   return @[@"onCarPlayPlay", @"onCarPlayPause"];
// }
// + (BOOL)requiresMainQueueSetup
// {
//   return YES;
// }

// @end
