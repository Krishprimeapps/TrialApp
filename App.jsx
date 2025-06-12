import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,Button, AppState  } from 'react-native';
import Video from 'react-native-video';
import GoogleCast, { CastButton, useCastState, CastState,useRemoteMediaClient , useCastSession } from 'react-native-google-cast';
import { PermissionsAndroid, Platform } from 'react-native';
import createListTemplate from './src/templates/list';
import { CarPlay } from 'react-native-carplay';
import { NativeModules, NativeEventEmitter } from 'react-native';
import {
  AirplayButton,
  useAirplayConnectivity,
  useExternalPlaybackAvailability,
  useAvAudioSessionRoutes,
} from 'react-airplay';



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
  // const googleCastEmitter = new NativeEventEmitter(GoogleCast);
  
  const [player1Volume, setPlayer1Volume] = useState(1);
  const [player2Volume, setPlayer2Volume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [currentTime,setCurrentTime] = useState(0);
  const [castStreamPosition, setCastStreamPosition] = useState(0);
  const [currentCastItem, setCurrentCastItem] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastPlay,setLastPlay]= useState(0);

  
 

  const playerRef = useRef(null);
  const playerRef2 = useRef(null);
  const checkFlag = useRef(false);
  const activePlayerRef = useRef(1);
  const currentTimeRef = useRef(0);
  const prevCastStateRef = useRef(castState);
  const isCastingRef = useRef(false);


  const onCrossfadeComplete = () => {
    // console.log('Crossfade complete — switching CarPlay control to audio 2');
  };


  const handleProgress = (audioFile) => {
    const audioDuration = Math.ceil(audioFile.seekableDuration);
    const currentTime = Math.ceil(audioFile.currentTime);
    currentTimeRef.current = currentTime;
    setCurrentTime(currentTime);
    
    
    if (isPlaying1){
      activePlayerRef.current = 1;
      setLastPlay(1);
    }
    else if(isPlaying2){
      activePlayerRef.current = 2;
      setLastPlay(2);
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
    
    else if (audioDuration - currentTime < startOnSecondsLeft && checkFlag.current) {
      if (playerRef2.current) {
        playerRef2.current.resume();
         setIsPlaying2(true);
        onCrossfadeComplete();
      }

      const percentage = (currentTime - (audioDuration - startOnSecondsLeft)) / startOnSecondsLeft;
      const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
      setPlayer2Volume(clampedPercentage);
      setPlayer1Volume(1 - clampedPercentage);
    }
  };
  const handleLoad = (data) => {
    setDuration(data.duration);
  };
  
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
      if (isPlaying1) playerRef.current.pause();
      else {
        playerRef.current.resume();
      }
      setIsPlaying1(!isPlaying1);
    }
  
    
  };

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
      if (isPlaying2) playerRef2.current.pause();
      else {
        playerRef2.current.resume();
      }
      currentTimeRef.current = 0
      setIsPlaying2(!isPlaying2);
    }
  
  };

  useEffect(() => {

    if (castState === CastState.CONNECTED){
      castAudio();
    }
  },[castState,client]);


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
              images: [{ url: 'https://upload.wikimedia.org/wikipedia/en/7/70/Example.png' }],
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
              images: [{ url: 'https://upload.wikimedia.org/wikipedia/en/7/70/Example.png' }],
            },
          },
          autoplay: true,
          preloadTime: 2.0,
        },
      ];
  
      const startIndex = lastPlay === 1 ? 0 : 1;
  
      await client.loadMedia({
        mediaInfo: mediaQueueItems[startIndex].mediaInfo,
        autoplay: true,
        startTime: currentTime,
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
  
  
  useEffect(() => {
      console.log('Cast state:', castState);
  }, [castState]);

  useEffect(() => {
    isCastingRef.current = castState === CastState.CONNECTED;
  }, [castState]);
  

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
  
  
  useEffect(() => { 
        if (!CarPlay.connected) {
          console.log('CarPlay not connected yet');
        }
      
        const onConnect = ({ interfaceController, window }) => {
          console.log('CarPlay connected');
          createListTemplate();
        };
      
        const onDisconnect = () => {
          console.log('CarPlay disconnected');
        };
      
        CarPlay.registerOnConnect(onConnect);
        CarPlay.registerOnDisconnect(onDisconnect);
      
        return () => {
          CarPlay.unregisterOnConnect(onConnect);
          CarPlay.unregisterOnDisconnect(onDisconnect);
        };
      }, [CarPlay]);

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
              const currentMediaUrl = status?.mediaInfo?.contentUrl;
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
                      console.log('Manual position update successful:', {
                        current: currentPosition,
                      });
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
      
        return () => {
          if (interval) clearInterval(interval);
          if (manualUpdateInterval) clearInterval(manualUpdateInterval);
        };
      }, [castState, client, currentCastItem]);

      
      useEffect(() => {
        if (!client) return;
        let lastPosition = null;
        let lastLogTime = Date.now();
        let positionUpdateCount = 0;

        const subscription = client.onMediaStatusUpdated((status) => {
          const currentMediaUrl = status?.mediaInfo?.contentUrl;
          const position = status?.streamPosition;
          const playerState = status?.playerState;
          
          if (position !== undefined && position !== null) {
            setCastStreamPosition(position);
            positionUpdateCount++;
            
            
            const now = Date.now();
            if (position !== lastPosition && 
                (positionUpdateCount % 10 === 0 || 
                 (lastPosition !== null && Math.abs(position - lastPosition) > 1))) {
              console.log('Media status updated:', {
                position,
                currentMediaUrl,
                playerState,
                currentCastItem,
              });
              lastPosition = position;
              lastLogTime = now;
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

      
      useEffect(() => {
        if (!client) return;
        let lastPosition = null;
        let positionUpdateCount = 0;

        const positionSubscription = client.onMediaStatusUpdated((status) => {
          if (status?.streamPosition !== undefined && status?.streamPosition !== null) {
            const position = status.streamPosition;
            setCastStreamPosition(position);
            positionUpdateCount++;
            
            // Log every 10 position updates or when position changes significantly
            
            if (position !== lastPosition && 
                (positionUpdateCount % 10 === 0 || 
                 (lastPosition !== null && Math.abs(position - lastPosition) > 1))) {
              console.log('Position update:', {
                position,
                updateCount: positionUpdateCount
              });
              lastPosition = position;
            }
          }
        });

        return () => {
          positionSubscription.remove();
        };
      }, [client]);


      useEffect(() => {
        
        const prevState = prevCastStateRef.current;
      
        if (prevState === CastState.CONNECTED && castState === CastState.NOT_CONNECTED) {
          console.log('Cast session ended. Last known position:', castStreamPosition);
          console.log('Last cast item:', currentCastItem);
      
          const resumeLocalPlayback = async () => {
            try {
              // First, ensure both players are paused
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
                setIsPlaying1(true)
                
                checkFlag.current = true;
                
                if (duration - castStreamPosition < startOnSecondsLeft) {
                  if (playerRef2.current) {
                    playerRef2.current.resume();
                    setIsPlaying2(true);
                    onCrossfadeComplete();
                    
                    const percentage = (castStreamPosition - (duration - startOnSecondsLeft)) / startOnSecondsLeft;
                    const clampedPercentage = Math.min(Math.max(percentage, 0), 1);
                    setPlayer2Volume(clampedPercentage);
                    setPlayer1Volume(1 - clampedPercentage);
                  }
                }
              } else if (currentCastItem === 'audio2') {
                console.log('Resuming Audio2 playback at position:', castStreamPosition);
                
                // Ensure Audio1 is paused and reset
                if (playerRef.current) {
                  await playerRef.current.pause();
                  //await playerRef.current.seek(0);
                  setIsPlaying1(false);
                  setPlayer1Volume(0);
                }
                
                // Set up Audio2
                await playerRef2.current.seek(castStreamPosition);
                setPlayer2Volume(1.0);
                setPlayer1Volume(0);
                activePlayerRef.current = 2;
                checkFlag.current = false; // Disable crossfade for Audio2
                
                // Start Audio2 playback
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
    
      
  // Modify the AppState effect to use the nextAppState directly
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(`\n=== App State Change ===`);
      console.log('Previous State:', appState);
      console.log('New State:', nextAppState);
      console.log('Current Time:', new Date().toISOString());
      
      if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('\n=== App Termination Started ===');
        console.log('App is going to background or being terminated');
        
        // Log states before cleanup
        console.log('\nStates before cleanup:');
        console.log('App State:', nextAppState); // Use nextAppState instead of appState
        console.log('Player States:', {
          player1: {
            isPlaying: isPlaying1,
            volume: player1Volume,
            currentTime: currentTime,
            ref: playerRef.current ? 'Initialized' : 'Not Initialized'
          },
          player2: {
            isPlaying: isPlaying2,
            volume: player2Volume,
            currentTime: currentTime,
            ref: playerRef2.current ? 'Initialized' : 'Not Initialized'
          }
        });
        console.log('Cast State:', castState);
        console.log('Current Cast Item:', currentCastItem);
        console.log('Cast Stream Position:', castStreamPosition);
        console.log('Refs:', {
          checkFlag: checkFlag.current,
          activePlayer: activePlayerRef.current,
          currentTimeRef: currentTimeRef.current,
          prevCastState: prevCastStateRef.current,
          isCasting: isCastingRef.current
        });

        // Perform cleanup
        cleanupAppState();

        // Log states after cleanup
        console.log('\nStates after cleanup:');
        console.log('App State:', nextAppState);
        console.log('Player States:', {
          player1: {
            isPlaying: isPlaying1,
            volume: player1Volume,
            currentTime: currentTime,
            ref: playerRef.current ? 'Initialized' : 'Not Initialized'
          },
          player2: {
            isPlaying: isPlaying2,
            volume: player2Volume,
            currentTime: currentTime,
            ref: playerRef2.current ? 'Initialized' : 'Not Initialized'
          }
        });
        console.log('Cast State:', castState);
        console.log('Current Cast Item:', currentCastItem);
        console.log('Cast Stream Position:', castStreamPosition);
        console.log('Refs:', {
          checkFlag: checkFlag.current,
          activePlayer: activePlayerRef.current,
          currentTimeRef: currentTimeRef.current,
          prevCastState: prevCastStateRef.current,
          isCasting: isCastingRef.current
        });
        
        console.log('=== App Termination Completed ===\n');
      } else if (appState.match(/inactive|background/) && nextAppState.match(/active/)) {
        console.log('\n=== App Initialization Started ===');
        console.log('App is coming back to foreground');
        
        // Log states before initialization
        console.log('\nStates before initialization:');
        console.log('App State:', nextAppState);
        console.log('Player States:', {
          player1: {
            isPlaying: isPlaying1,
            volume: player1Volume,
            currentTime: currentTime,
            ref: playerRef.current ? 'Initialized' : 'Not Initialized'
          },
          player2: {
            isPlaying: isPlaying2,
            volume: player2Volume,
            currentTime: currentTime,
            ref: playerRef2.current ? 'Initialized' : 'Not Initialized'
          }
        });
        console.log('Cast State:', castState);
        console.log('Current Cast Item:', currentCastItem);
        console.log('Cast Stream Position:', castStreamPosition);
        console.log('Refs:', {
          checkFlag: checkFlag.current,
          activePlayer: activePlayerRef.current,
          currentTimeRef: currentTimeRef.current,
          prevCastState: prevCastStateRef.current,
          isCasting: isCastingRef.current
        });

        // Perform initialization
        initializeAppState();

        // Log states after initialization
        console.log('\nStates after initialization:');
        console.log('App State:', nextAppState);
        console.log('Player States:', {
          player1: {
            isPlaying: isPlaying1,
            volume: player1Volume,
            currentTime: currentTime,
            ref: playerRef.current ? 'Initialized' : 'Not Initialized'
          },
          player2: {
            isPlaying: isPlaying2,
            volume: player2Volume,
            currentTime: currentTime,
            ref: playerRef2.current ? 'Initialized' : 'Not Initialized'
          }
        });
        console.log('Cast State:', castState);
        console.log('Current Cast Item:', currentCastItem);
        console.log('Cast Stream Position:', castStreamPosition);
        console.log('Refs:', {
          checkFlag: checkFlag.current,
          activePlayer: activePlayerRef.current,
          currentTimeRef: currentTimeRef.current,
          prevCastState: prevCastStateRef.current,
          isCasting: isCastingRef.current
        });
        
        console.log('=== App Initialization Completed ===\n');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Add this function to log all states
  const logAppStates = (context) => {
    console.log(`\n=== ${context} ===`);
    console.log('States:', {
      player1Volume,
      player2Volume,
      duration,
      isPlaying1,
      isPlaying2,
      currentTime,
      castStreamPosition,
      currentCastItem,
      appState,
    });
    console.log('Refs:', {
      checkFlag: checkFlag.current,
      activePlayer: activePlayerRef.current,
      currentTimeRef: currentTimeRef.current,
      prevCastState: prevCastStateRef.current,
      isCasting: isCastingRef.current,
    });
    console.log('Player States:', {
      player1: playerRef.current ? {
        isPlaying: isPlaying1,
        volume: player1Volume,
        currentTime: currentTime,
      } : 'Not initialized',
      player2: playerRef2.current ? {
        isPlaying: isPlaying2,
        volume: player2Volume,
        currentTime: currentTime,
      } : 'Not initialized',
    });
    console.log('========================\n');
  };

  // Modify the cleanup function
  const cleanupAppState = async () => {
    try {
      console.log('\n=== App Cleanup Started ===');
      logAppStates('Before Cleanup');

      // Stop cast session if active
      if (client) {
        await client.stop();
      }

      // Pause all players
      if (playerRef.current) {
        await playerRef.current.pause();
      }
      if (playerRef2.current) {
        await playerRef2.current.pause();
      }

      // Reset all states
      setPlayer1Volume(1);
      setPlayer2Volume(0);
      setDuration(0);
      setIsPlaying1(false);
      setIsPlaying2(false);
      setCurrentTime(0);
      setCastStreamPosition(0);
      setCurrentCastItem(null);

      // Reset all refs
      checkFlag.current = false;
      activePlayerRef.current = 1;
      currentTimeRef.current = 0;
      prevCastStateRef.current = null;
      isCastingRef.current = false;

      logAppStates('After Cleanup');
      console.log('=== App Cleanup Completed ===\n');
    } catch (error) {
      console.error('Error during app cleanup:', error);
    }
  };

  // Modify the initialization function
  const initializeAppState = () => {
    try {
      console.log('\n=== App Initialization Started ===');
      logAppStates('Before Initialization');

      // Reset all states to initial values
      setPlayer1Volume(1);
      setPlayer2Volume(0);
      setDuration(0);
      setIsPlaying1(false);
      setIsPlaying2(false);
      setCurrentTime(0);
      setCastStreamPosition(0);
      setCurrentCastItem(null);

      // Reset all refs
      checkFlag.current = false;
      activePlayerRef.current = 1;
      currentTimeRef.current = 0;
      prevCastStateRef.current = null;
      isCastingRef.current = false;

      // Reset video players
      if (playerRef.current) {
        playerRef.current.seek(0);
        playerRef.current.pause();
      }
      if (playerRef2.current) {
        playerRef2.current.seek(0);
        playerRef2.current.pause();
      }

      logAppStates('After Initialization');
      console.log('=== App Initialization Completed ===\n');
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  };

  return (
    
    <View style={styles.container}>
    
      <View style={styles.playerContainer}>
        <Text style={styles.title}>First Audio </Text>

          <>
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
              onPlay={() => setIsPlaying1(true)}
              onPause={() => setIsPlaying1(false)}
              onEnd={() => setIsPlaying1(false)}
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
            <Video
              source={testAudio2}
              ref={playerRef2}
              onProgress={handleProgress}
              audioOnly={true}
              volume={player2Volume}
              muted={false}
              controls={true}
              style={styles.hiddenVideo}
              onPlay={() => setIsPlaying2(true)}
              onPause={() => setIsPlaying2(false)}
              onEnd={() => setIsPlaying2(false)}
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
      <CastButton style={{ width: 40, height: 40, tintColor: 'black' , backgroundColor: 'gray'}} onPress={castAudio}/>
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
    height: 100,
    width: 200,
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

