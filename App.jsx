import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,Button, AppState ,Platform } from 'react-native';
import Video from 'react-native-video';
import GoogleCast, { CastButton, useCastState, CastState,useRemoteMediaClient , useCastSession } from 'react-native-google-cast';
import createListTemplate from './src/templates/list';
import { CarPlay } from 'react-native-carplay';
import { NativeModules, NativeEventEmitter, DeviceEventEmitter } from 'react-native';
import { AirplayButton,useAirplayConnectivity,useExternalPlaybackAvailability,useAvAudioSessionRoutes,} from 'react-airplay';


const testAudio1 = require('./Audio-1.mp3');
const testAudio2 = require('./Audio-2.mp3');

const REMOTE_AUDIO_1 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 
const REMOTE_AUDIO_2 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';


const App = () => { 
  const isAirplayConnected = useAirplayConnectivity();
  const isExternalPlaybackAvailable = useExternalPlaybackAvailability();
  const routes = useAvAudioSessionRoutes();
  const startOnSecondsLeft = 25;
  const castState = useCastState();
  const client = useRemoteMediaClient();
  const isCrossfading = isPlaying1 && isPlaying2;
  const { NowPlayingManager } = NativeModules;
  // const googleCastEmitter = new NativeEventEmitter(GoogleCast);

  
  const [player1Volume, setPlayer1Volume] = useState(1);
  const [player2Volume, setPlayer2Volume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [duration2 , setDuration2] = useState(0);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [currentTime,setCurrentTime] = useState(0);
  const [castStreamPosition, setCastStreamPosition] = useState(0);
  const [currentCastItem, setCurrentCastItem] = useState(null);
  const [lastPlay,setLastPlay]= useState(0);
  const [audio1Position,setAudio1Position] = useState(0);
  const [audio2Position,setAudio2Position] = useState(0);
  const [nowPlayingTrack, setNowPlayingTrack] = useState(null); 
  const [isCarPlayConnected, setIsCarPlayConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [startingTime,setStartingTime] = useState(0);


  const playerRef = useRef(null);
  const playerRef2 = useRef(null);
  const checkFlag = useRef(false);
  const activePlayerRef = useRef(1);
  const currentTimeRef = useRef(0);
  const prevCastStateRef = useRef(castState);
  const isCastingRef = useRef(false);
  const carPlayEventHandled = useRef(false);

  
//This is the function responsible for loading media in the video component
  const handleLoad = (data) => {
    setDuration(data.duration);  
  };
  const handle2Load = (data) =>{
    setDuration2(data.duration);

  }
//This is the handleprogress which is called in the onProgress of the video comoponent The crossfade volume logic lies here
  const handleProgress = (audioFile) => {
    const audioDuration = Math.ceil(audioFile.seekableDuration);
    const currentTime = Math.ceil(audioFile.currentTime);
    currentTimeRef.current = currentTime;
    setCurrentTime(currentTime);
    if(isPlaying1){
      setAudio1Position(currentTime);
    }
    if(isPlaying2){
      setAudio2Position(currentTime);
    }    
    if (isAirplayConnected) {
      if (currentTime >= audioDuration) {
        if (playerRef.current) {
          playerRef.current.pause();
          setIsPlaying1(false);
        }
        
        if (playerRef2.current) {
          playerRef2.current.seek(0); 
          playerRef2.current.resume();
          setIsPlaying2(true);
          setPlayer2Volume(1.0);
          setPlayer1Volume(0);
          activePlayerRef.current = 2;
          checkFlag.current = false; 
        }
      }
    } 
     if(Platform.OS === 'ios'){
      if ((isAirplayConnected || isCarPlayConnected)) return;
     }

     if(audioDuration - currentTime < startOnSecondsLeft && checkFlag.current){
      if (playerRef.current){
        playerRef.current.resume();
        setIsPlaying1(true);
      }
      if (playerRef2.current) {
        playerRef2.current.resume();
         setIsPlaying2(true);
      }

      const percentage = (currentTime - (audioDuration - startOnSecondsLeft)) / startOnSecondsLeft;
      const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
      setPlayer2Volume(clampedPercentage);
      setPlayer1Volume(1 - clampedPercentage);
      if(Platform.OS === 'ios'){
        if(clampedPercentage >=1){
          checkFlag.current = false;
          if(isPlaying1) {setIsPlaying1(false);}
          if(playerRef.current){
            playerRef.current.pause();
            playerRef.current.seek(0);
          }
          return;
        }

      } 
    }
  };

  useEffect(() => {
    if (!isAirplayConnected && checkFlag.current) {
      if (playerRef.current && !isPlaying1) {
        playerRef.current.resume();
        setIsPlaying1(true);
      }
      if (playerRef2.current && !isPlaying2) {
        playerRef2.current.resume();
        setIsPlaying2(true);
      }
    }
  }, [isAirplayConnected]);
  
//This is responsible for sending progress updates to ios system through custom native bridge made from native side 
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const interval = setInterval(() => {
      if (isPlaying1 && (!isPlaying2 || activePlayerRef.current === 1)) {
        NowPlayingManager.setPlaybackPosition(audio1Position, duration);
      } else if (isPlaying2 && (!isPlaying1 || activePlayerRef.current === 2)) {
        NowPlayingManager.setPlaybackPosition(audio2Position, duration2);
      }
    }, 500); 
  
    return () => clearInterval(interval);
  }, [isPlaying1, isPlaying2, audio1Position, audio2Position, duration,duration2]);

//This is responsible for sending metadata to ios system through custom native bridge made from native side 
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
  
    let mainTrack = null;
    if (isPlaying1 && (!isPlaying2 || activePlayerRef.current === 1)) {
      mainTrack = 'audio1';
    } else if (isPlaying2 && (!isPlaying1 || activePlayerRef.current === 2)) {
      mainTrack = 'audio2';
    }
  
    if (mainTrack && mainTrack !== nowPlayingTrack) {
      if (mainTrack === 'audio1') {
        NowPlayingManager.setNowPlayingInfo(
          'Sample Audio-1',
          'Artist-1',
          'https://assets.jazzgroove.org/sonos/Mix1.jpg'
        );
      } else if (mainTrack === 'audio2') {
        NowPlayingManager.setNowPlayingInfo(
          'Sample Audio-2',
          'Artist-2',
          'https://assets.jazzgroove.org/sonos/Dreams.jpg'
        );
      }
      setNowPlayingTrack(mainTrack);
    }
  }, [isPlaying1, isPlaying2, activePlayerRef.current]);
  //This is to set last play used to check what player was playing recently 

  useEffect(() =>{
    if(isCrossfading)return;
    if(isPlaying1 && !isPlaying2){
      activePlayerRef.current = 1;
      setLastPlay(1);
    }
    if(isPlaying2 && !isPlaying1){
      activePlayerRef.current = 2;
      setLastPlay(2);
    }
  },[isPlaying1,isPlaying2])
  //This configures the play pause button for the first player
   
  const togglePlayPause1 = async () => {
    if (castState === CastState.CONNECTED) {
      const status = await client.getMediaStatus();
      const state = status?.playerState?.toLowerCase();
      if (state === 'playing'){
        client.pause()
        setIsPlaying1(false);
        console.log("Cast Paused");
      }
      else {
        client.play()
        setIsPlaying1(true);
        console.log("Cast playing");
      }
    }
    else{
      if (isPlaying1) {
        playerRef.current.pause();
      }
      else {
        playerRef.current.resume();
      }
      setIsPlaying1(!isPlaying1);
    } 
    
  };
  //This configures the play pause button for the second player

  const togglePlayPause2 = async () => {
    if (castState === CastState.CONNECTED) {
      const status = await client.getMediaStatus();
      const state = status?.playerState?.toLowerCase();
      if (state === 'playing'){
        client.pause()
        setIsPlaying2(false);
        console.log("Cast Paused");
      }
      else {
        client.play()
        setIsPlaying2(true);
        console.log("Cast playing");
      }
    }
    else{
      if (isPlaying2) {
        playerRef2.current.pause();
      }
      else {
        playerRef2.current.resume();
      }
      currentTimeRef.current = 0
      setIsPlaying2(!isPlaying2);
    }
  
  };

  if(Platform.OS === 'ios'){
    CarPlay.enableNowPlaying(true);
  }
  //This handles apples carplay connnection
  useEffect(() => { 
    if (!CarPlay.connected) {
      console.log('CarPlay not connected yet');
      setIsCarPlayConnected(false);
    }
  
    const onConnect = ({ interfaceController, window }) => {
      console.log('CarPlay connected');
      setIsCarPlayConnected(true);
       createListTemplate();
    };
  
    const onDisconnect = () => {
      console.log('CarPlay disconnected');
      setIsCarPlayConnected(false);

      if (checkFlag.current) {
        if (playerRef.current && !isPlaying1) {
          playerRef.current.resume();
          setIsPlaying1(true);
        }
        if (playerRef2.current && !isPlaying2) {
          playerRef2.current.resume();
          setIsPlaying2(true);
        }
      }
    };
  
    CarPlay.registerOnConnect(onConnect);
    CarPlay.registerOnDisconnect(onDisconnect);

  
    return () => {
      CarPlay.unregisterOnConnect(onConnect);
      CarPlay.unregisterOnDisconnect(onDisconnect);
    };
  }, []);
  //This effect calls the function which defines what happens when cast is connected 

  useEffect(() => {

    if (castState === CastState.CONNECTED){
      castAudio();
    }
  },[castState,client]);
//This is the function that defines what happens when cast is connected
  const castAudio = async () => {
    if (!client) return;
  
    try {
      const mediaQueueItems = [
        {
          mediaInfo: {
            contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            contentType: 'audio/mp3',
            metadata: {
              type: 'musicTrack',
              title: 'Sample Audio 1',
              artist: 'Artist 1',
              images: [{ url: 'https://assets.jazzgroove.org/sonos/Mix1.jpg' }],
            },
            customData: {
              contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            },
          },
          autoplay: true,
          preloadTime: 2.0,
        },
        {
          mediaInfo: {
            contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            contentType: 'audio/mp3',
            metadata: {
              type: 'musicTrack',
              title: 'Sample Audio 2',
              artist: 'Artist 2',
              images: [{ url: 'https://assets.jazzgroove.org/sonos/Dreams.jpg' }],
            },
            customData: {
              contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            },
          },
          autoplay: true,
          preloadTime: 2.0,
        },
      ];
  
       const startIndex = lastPlay === 1 ? 0 : 1;
       let startTime = startIndex === 0 ?audio1Position :audio2Position;

      await client.loadMedia({
        mediaInfo: mediaQueueItems[startIndex].mediaInfo,
        autoplay: true,
        startTime: startTime,
        queueData: {
          items: mediaQueueItems,
          startIndex: startIndex,
        },
      });
  
      console.log('Queue loaded and playback started.');
    } catch (err) {
      console.error('Failed to cast audio:', err);
    }
  };
    //This effect is used to set the casting ref
  useEffect(() => {
      console.log('Cast state:', castState);
      isCastingRef.current = castState === CastState.CONNECTED;
  }, [castState]);

//This effect is responsible for controling what happens on local device when cast is connected
  useEffect(() => {
    if (castState === CastState.CONNECTED) {
      playerRef.current?.pause();
      playerRef2.current?.pause(); 
      setIsPlaying1(false);
      setIsPlaying2(false);
      return;
    }
    if (currentCastItem === 'audio2') {
      if (playerRef.current) {
        playerRef.current.pause();
        setIsPlaying1(false);
      }
      if (playerRef2.current) {
        playerRef2.current.resume();
        setIsPlaying2(true);
        setPlayer2Volume(1.0);
        setPlayer1Volume(0);
        activePlayerRef.current = 2;
        checkFlag.current = false;
      }
    } 
    else {
      
      if (playerRef2.current) {
        playerRef2.current.pause();
        setIsPlaying2(false);
        checkFlag.current = false;
      }
      if (playerRef.current) {
        playerRef.current.resume();
         //setIsPlaying1(true);
        activePlayerRef.current = 1;
      }
    }
  }, [castState, currentCastItem]);
  //This is the effect that triggers the crossfade when there are 25 seconds remaining on an audio to end 
  useEffect(() => {
    if (!playerRef.current || duration <= 0) return;
  
    let crossfadeTimeout;
  
    (async () => {
      try {
        await playerRef.current.seek(duration);
        await playerRef.current.resume();
         setIsPlaying1(true);
        
  
        crossfadeTimeout = setTimeout(async () => {
          if (!isCastingRef.current) {
            await playerRef.current.seek(0);
            await playerRef.current.resume();
             setIsPlaying1(true);

            
            checkFlag.current = true;
          } else {
            console.log('Skipped crossfade — Chromecast active.');
          }
        }, 500);
      } catch (error) {
        console.error('Crossfade setup failed:', error);
      }
    })();
  
    return () => {
      if (crossfadeTimeout) {
        clearTimeout(crossfadeTimeout);
      }
    };
  }, [duration]);
  
//This is the effect that returns position updates during the cast is connected
      useEffect(() => {
        let interval;
        let lastPosition = null;
        let positionUpdateCount = 0;
        let manualUpdateInterval;
        let isUpdating = false; 
      
        if (castState === CastState.CONNECTED && client) {
          interval = setInterval(async () => {
            try {
              const status = await client.getMediaStatus();
              const position = status?.streamPosition;
              const currentMediaUrl =status?.mediaInfo?.contentUrl ??status?.mediaInfo?.customData?.contentUrl ??status?.mediaInfo?.metadata?.contentUrl;
              const playerState = status?.playerState;
             
              if (position !== undefined && position !== null) {
                setCastStreamPosition(position);
                positionUpdateCount++;
                
                if (position !== lastPosition && 
                    (positionUpdateCount % 10 === 0 || 
                     (lastPosition !== null && Math.abs(position - lastPosition) > 1))) {
                  console.log('Cast position update:', {
                    position,
                    currentMediaUrl,
                    playerState,
                    currentCastItem,
                    updateCount: positionUpdateCount
                  });
                  lastPosition = position;
                }
                
                if (currentMediaUrl === 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') {
                  setCurrentCastItem('audio1');
                } else if (currentMediaUrl === 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3') {
                  setCurrentCastItem('audio2');
                }
              }
            } catch (e) {
              console.warn('Could not get stream position:', e.message);
            }
          }, 50);

           if (Platform.OS === 'android') {
            manualUpdateInterval = setInterval(async () => {
              try {
                if (client && !isUpdating) {
                  isUpdating = true;
                  const status = await client.getMediaStatus();
                  
                  if (status?.playerState === 'playing' && castState === CastState.CONNECTED) {
                    const currentPosition = status?.streamPosition || 0;
                    const duration = status?.mediaInfo?.streamDuration || 0;
                    const expectedPosition = currentPosition + 0.1;
                    
                    if (expectedPosition < duration) {
                      try {
                        await client.seek({ position: expectedPosition });
                        setCastStreamPosition(expectedPosition);
                      } catch (seekError) {
                        if (seekError.message !== 'CANCELED') {
                          console.warn('Seek operation failed:', seekError.message);
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                if (e.message !== 'CANCELED') {
                  console.warn('Manual position update failed:', e.message);
                }
              } finally {
                isUpdating = false;
              }
            }, 100);
           }
        }
      
        return () => {
          if (interval) clearInterval(interval);
          if (manualUpdateInterval) clearInterval(manualUpdateInterval);
        };
      }, [castState, client, currentCastItem]);
//This effect sets the cast item based on the url of the audio that is playing which helps in handling local playback upon cast disconnection
      useEffect(() => {
        if (!client) return;
        let lastPosition = null;

        const subscription = client.onMediaStatusUpdated((status) => {
          const currentMediaUrl = status?.mediaInfo?.contentUrl;
          const position = status?.streamPosition;
          const playerState = status?.playerState;
          
          if (position !== undefined && position !== null) {
            setCastStreamPosition(position);
          
            if (position !== lastPosition && ((lastPosition !== null && Math.abs(position - lastPosition) > 1))) {
              console.log('Media status updated:', {
                position,
                currentMediaUrl,
                currentCastItem,
              });
              lastPosition = position;
            }
          }

          if (currentMediaUrl === 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') {
            setCurrentCastItem('audio1');
          } else if (currentMediaUrl === 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3') {
            setCurrentCastItem('audio2');
          }
        });

        return () => {
          subscription.remove();
        };
      }, [client]);

    //This effect is responsible to seek the audio on cast to where the audio reached on local device  
      useEffect(() => {
        if (!client) return;
        let lastPosition = null;
        let positionUpdateCount = 0;

        const positionSubscription = client.onMediaStatusUpdated((status) => {
          if (status?.streamPosition !== undefined && status?.streamPosition !== null) {
            const position = status.streamPosition;
            setCastStreamPosition(position);
            positionUpdateCount++;

            
            if (position !== lastPosition && 
                (positionUpdateCount % 10 === 0 || 
                 (lastPosition !== null && Math.abs(position - lastPosition) > 1))) {
              console.log('Position update:', {
                position,
              });
              lastPosition = position;
            }
          }
        });

        return () => {
          positionSubscription.remove();
        };
      }, [client]);

//This is the effect that calls a function that handles what happens on local device when cast is disconnected 
      useEffect(() => {
        
        const prevState = prevCastStateRef.current;
      
        if (prevState === CastState.CONNECTED && castState === CastState.NOT_CONNECTED) {
          console.log('Cast session ended. Last known position:', castStreamPosition);
          console.log('Last cast item:', currentCastItem);
      
          const resumeLocalPlayback = async () => {
            try {
              if (playerRef.current) {
                await playerRef.current.pause();
                setIsPlaying1(false);
              }
              if (playerRef2.current) {
                await playerRef2.current.pause();
                setIsPlaying2(false);
              }

              console.log('Attempting to resume local playback with cast position:', castStreamPosition);
              console.log('Last Cast Item',currentCastItem);
              
              if (castStreamPosition === undefined || castStreamPosition === null || castStreamPosition < 0) {
                console.log('Invalid cast position:', castStreamPosition, 'defaulting to 0');
                return;
              }

              if (currentCastItem === 'audio1') {
                await playerRef.current.seek(castStreamPosition);
                await playerRef.current.resume();
                setIsPlaying1(true);              
                checkFlag.current = true;
                
                if (duration - castStreamPosition < startOnSecondsLeft) {
                  if (playerRef2.current) {
                    playerRef2.current.resume();
                    setIsPlaying2(true);
                    
                    
                    const percentage = (castStreamPosition - (duration - startOnSecondsLeft)) / startOnSecondsLeft;
                    const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
                    setPlayer2Volume(clampedPercentage);
                    setPlayer1Volume(1 - clampedPercentage);
                  }
                }
              } 
              else if (currentCastItem === 'audio2') {
                console.log('Resuming Audio2 playback at position:', castStreamPosition);
                
                
                if (playerRef.current) {
                  await playerRef.current.pause();
                  await playerRef.current.seek(0);
                  setIsPlaying1(false);
                  setPlayer1Volume(0);
                }
                
               
                await playerRef2.current.seek(castStreamPosition);
                setPlayer2Volume(1.0);
                setPlayer1Volume(0);
                activePlayerRef.current = 2;
                checkFlag.current = false; 
                
                
                await playerRef2.current.resume();
                setIsPlaying2(true);
                console.log('Audio2 playback resumed at position:', castStreamPosition);
              }
            } catch (err) {
              console.error('Failed to resume local playback:', err);
            }
          };
      
          resumeLocalPlayback();
        }
      
        prevCastStateRef.current = castState;
      }, [castState, currentCastItem, duration, castStreamPosition]);


//This is the effect for unmounting the video players 
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        //playerRef.current.pause?.();    
        playerRef.current.release?.();  
      }
      if (playerRef2.current) {
        //playerRef2.current.pause?.();
        playerRef2.current.release?.();
      }
    };
  }, []);

  return (
    
         
    <View style={styles.container}>
    
      <View style={styles.playerContainer}>
        <Text style={styles.title}>First Audio </Text>

          <>
          {/* This is the video component for the first player */}
            <Video
              source={testAudio1}
              ref={playerRef}
              audioOnly={true}
              onProgress={handleProgress}
              onLoad={handleLoad}
              volume={player1Volume}
              muted={false}
              controls={true}
              style={styles.hiddenVideo}
              onPlay={() => {setIsPlaying1(true); setLastPlay(1)}}
              onPause={() => setIsPlaying1(false)}
              onEnd={() => setIsPlaying1(false)}
              playInBackground={true}
            />
            
            <TouchableOpacity
              onPress={togglePlayPause1}
              style={[styles.button, isPlaying1 && styles.buttonActive]}
            >
              <Text style={styles.buttonText}>{isPlaying1 ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
            <Text style={styles.volumeText}>Volume: {(player1Volume * 100).toFixed(0)}%</Text>
          </>

     
      </View>

  
      <View style={styles.playerContainer}>
        <Text style={styles.title}>Second Audio </Text>

        
          <>
          {/* This is the video component for the second player */}
            <Video
              source={testAudio2}
              ref={playerRef2}
              onProgress={handleProgress}
              onLoad={handle2Load}
              audioOnly={true}
              volume={player2Volume}
              muted={false}
              controls={true}
              style={styles.hiddenVideo}
              onPlay={() => {setIsPlaying2(true); setLastPlay(2)}}
              onPause={() => setIsPlaying2(false)}
              onEnd={() => setIsPlaying2(false)}
              playInBackground={true}
            />
            <TouchableOpacity
              onPress={togglePlayPause2}
              style={[styles.button, isPlaying2 && styles.buttonActive]}
            >
              <Text style={styles.buttonText}>{isPlaying2 ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
            <Text style={styles.volumeText}>Volume: {(player2Volume * 100).toFixed(0)}%</Text>
          </>
         
               <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      
    </View>
      </View>
      <View>
      {isExternalPlaybackAvailable && (
        <View>
          <AirplayButton
           prioritizesVideoDevices={true}
           tintColor="black"
           activeTintColor="blue"
           style={{ width: 44, height: 44, backgroundColor: 'gray'}}
           />
           </View>
      )}
      <View>
      <CastButton style={{ width: 40, height: 40, tintColor: 'black' , backgroundColor: 'gray'}} />
      </View>
      </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  castButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  castButton: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
  playerContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  hiddenVideo: {
    height: 150,
    width: 300,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#0055CC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  volumeText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  castingText: {
    fontSize: 16,
    color: 'green',
    marginTop: 15,
    fontWeight: '600',
  },
});

export default App;