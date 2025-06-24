#import "NowPlayingManager.h"
#import <AVFoundation/AVFoundation.h>
#import <MediaPlayer/MediaPlayer.h>
#import <UIKit/UIKit.h>

@implementation NowPlayingManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setNowPlayingInfo:(NSString *)title
                  artist:(NSString *)artist
                  artworkURL:(NSString *)artworkURL)
{
  // NSLog(@"[NowPlayingManager] Setting Now Playing Info: %@ - %@", title, artist);
  // NSLog(@"[NowPlayingManager] Artwork URL: %@", artworkURL);

  // Basic metadata without artwork first
  NSMutableDictionary *nowPlayingInfo = [NSMutableDictionary dictionary];
  nowPlayingInfo[MPMediaItemPropertyTitle] = title;
  nowPlayingInfo[MPMediaItemPropertyArtist] = artist;
  nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = @(0);
  nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = @(300);
  nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = @(1.0);

  [[MPNowPlayingInfoCenter defaultCenter] setNowPlayingInfo:nowPlayingInfo];

  // Load artwork asynchronously
  if (artworkURL && artworkURL.length > 0) {
    NSURL *url = [NSURL URLWithString:artworkURL];
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url
                                                             completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
      if (data && !error) {
        UIImage *image = [UIImage imageWithData:data];
        if (image) {
          MPMediaItemArtwork *artwork = [[MPMediaItemArtwork alloc] initWithBoundsSize:image.size
                                                                          requestHandler:^UIImage * _Nonnull(CGSize size) {
            return image;
          }];

          dispatch_async(dispatch_get_main_queue(), ^{
            NSMutableDictionary *updatedInfo = [[[MPNowPlayingInfoCenter defaultCenter] nowPlayingInfo] mutableCopy];
            updatedInfo[MPMediaItemPropertyArtwork] = artwork;
            [[MPNowPlayingInfoCenter defaultCenter] setNowPlayingInfo:updatedInfo];

            // NSLog(@"✅ Artwork successfully loaded and set.");
          });
        } else {
          // NSLog(@"❌ Failed to create image from data.");
        }
      } else {
        // NSLog(@"❌ Failed to load artwork from URL: %@", error.localizedDescription);
      }
    }];
    [task resume];
  }
}

RCT_EXPORT_METHOD(setPlaybackPosition:(double)position duration:(double)duration)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    NSMutableDictionary *nowPlayingInfo = [[[MPNowPlayingInfoCenter defaultCenter] nowPlayingInfo] mutableCopy];

    if (!nowPlayingInfo) {
      nowPlayingInfo = [NSMutableDictionary dictionary];
    }

    // NSLog(@"[NowPlayingManager] Updating playback position: %.2f / %.2f", position, duration);

    nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = @(position);
    nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = @(duration);
    nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = @(1.0);

    [[MPNowPlayingInfoCenter defaultCenter] setNowPlayingInfo:nowPlayingInfo];
    // NSLog(@"✅ Final nowPlayingInfo: %@", [MPNowPlayingInfoCenter defaultCenter].nowPlayingInfo);
  });
}


@end
