import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Video from 'react-native-video';
// import GoogleCast, { CastButton, useCastState, CastState } from 'react-native-google-cast';
// import { PermissionsAndroid, Platform } from 'react-native';
import createListTemplate from './src/templates/list';
import { CarPlay } from 'react-native-carplay';
// import { NativeModules, NativeEventEmitter } from 'react-native';
import {
  AirplayButton,
  showRoutePicker,
  useAirplayConnectivity,
  useExternalPlaybackAvailability,
  useAvAudioSessionRoutes,
} from 'react-airplay';



const testAudio1 = require('./Audio-1.mp3');
const testAudio2 = require('./Audio-2.mp3');

// const REMOTE_AUDIO_1 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 
// const REMOTE_AUDIO_2 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

const App = () => { 
  const isAirplayConnected = useAirplayConnectivity();
  const isExternalPlaybackAvailable = useExternalPlaybackAvailability();
  const routes = useAvAudioSessionRoutes();
  // const activePlayerRef = useRef(1);
  // const onCrossfadeComplete = () => {
  //   console.log('Crossfade complete — switching CarPlay control to audio 2');
  //   activePlayerRef.current = 2;
  // };
  // useEffect(() => {
  //   const requestPermissions = async () => {
  //     if (Platform.OS === 'android' && Platform.Version >= 33) {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
  //         {
  //           title: 'Nearby Wi-Fi Devices Permission',
  //           message: 'This app requires access to nearby devices to detect Cast targets.',
  //           buttonPositive: 'OK',
  //         }
  //       );
  //       console.log('Nearby Wi-Fi permission granted:', granted);
  //     }
  //   };
  
  //   requestPermissions();
  // }, []);
  const startOnSecondsLeft = 25;
  // const castState = useCastState();

  const [player1Volume, setPlayer1Volume] = useState(1);
  const [player2Volume, setPlayer2Volume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);

  const playerRef = useRef(null);
  const playerRef2 = useRef(null);
  const checkFlag = useRef(false);

  const handleProgress = (audioFile) => {
    // if (castState === CastState.CONNECTED) return; 

    const audioDuration = Math.ceil(audioFile.seekableDuration);
    const currentTime = Math.ceil(audioFile.currentTime);

    if (audioDuration - currentTime < startOnSecondsLeft && checkFlag.current) {
      if (playerRef2.current) {
        playerRef2.current.resume();
        setIsPlaying2(true);
        // onCrossfadeComplete();
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

  
  const togglePlayPause1 = () => {
    // if (castState === CastState.CONNECTED) return; 
    if (isPlaying1) playerRef.current.pause();
    else playerRef.current.resume();
    setIsPlaying1(!isPlaying1);
  };

  const togglePlayPause2 = () => {
    // if (castState === CastState.CONNECTED) return; 
    if (isPlaying2) playerRef2.current.pause();
    else playerRef2.current.resume();
    setIsPlaying2(!isPlaying2);
  };
  // const togglePlayPause1 = () => {
  //     if (isPlaying1) {
  //     playerRef.current.pause();
  //     setIsPlaying1(false);
  //   } else {
  //     playerRef.current.resume();
  //     setIsPlaying1(true);
  //   }
  // };
  
  // const togglePlayPause2 = () => {
  //   if (isPlaying2) {
  //     playerRef2.current.pause();
  //     setIsPlaying2(false);
  //   } else {
  //     playerRef2.current.resume();
  //     setIsPlaying2(true);
  //   }
  // };
  // const castAudio = (url, title) => {
  //   GoogleCast.castMedia({
  //     mediaUrl: url,
  //     title: title,
  //     contentType: 'audio/mp3',
  //   });
  // };



// useEffect(() => {
//   console.log('Cast state:', castState);
// }, [castState]);

// const isPlaying1Ref = useRef(isPlaying1);
// const isPlaying2Ref = useRef(isPlaying2);

// useEffect(() => {
//   isPlaying1Ref.current = isPlaying1;
// }, [isPlaying1]);

// useEffect(() => {
//   isPlaying2Ref.current = isPlaying2;
// }, [isPlaying2]);
useEffect(() => {
  console.log('AirPlay Connected:', isAirplayConnected);
  console.log('External Playback Available:', isExternalPlaybackAvailable);
  console.log('AV Routes:', routes);
}, [isAirplayConnected, isExternalPlaybackAvailable, routes]);
  useEffect(() => {
    // if (castState === CastState.CONNECTED) {
    //   playerRef.current?.pause();
    //   playerRef2.current?.pause();
    //   setIsPlaying1(false);
    //   setIsPlaying2(false);
    //   return;
    // }
    // console.log(Object.keys(CarPlay));
    if (playerRef2.current) {
      playerRef2.current.pause();
      setIsPlaying2(false);
      checkFlag.current = false;
    }

    if (playerRef.current && duration > 0) {
      (async () => {
        try {
          await playerRef.current.seek(duration);
          await playerRef.current.resume();
          setIsPlaying1(true);
          setTimeout(async () => {
            await playerRef.current.seek(0);
            await playerRef.current.resume();
            setIsPlaying1(true);
            checkFlag.current = true;
          }, 500);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [duration]); //castState was there
  
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
      }, []);
      // useEffect(() => {
      //   const eventEmitter = new NativeEventEmitter(NativeModules.CarPlayEventEmitter);
      
      //   const playSub = eventEmitter.addListener('onCarPlayPlay', () => {
      //     console.log('CarPlay play event received');
      //     if (!isPlaying1Ref.current) togglePlayPause1();
      //     if (!isPlaying2Ref.current) togglePlayPause2();
      //   });
      
      //   const pauseSub = eventEmitter.addListener('onCarPlayPause', () => {
      //     console.log('CarPlay pause event received');
      //     if (isPlaying1Ref.current) togglePlayPause1();
      //     if (isPlaying2Ref.current) togglePlayPause2();
      //   });
      
      //   return () => {
      //     playSub.remove();
      //     pauseSub.remove();
      //   };
      // }, [togglePlayPause1, togglePlayPause2]);
      // useEffect(() => {
      //   const eventEmitter = new NativeEventEmitter(NativeModules.CarPlayEventEmitter);
      
      //   const playSub = eventEmitter.addListener('onCarPlayPlay', () => {
      //     console.log('CarPlay play event received');
      
      //     if (!isPlaying1Ref.current && playerRef.current) {
      //       playerRef.current.resume();
      //       setIsPlaying1(true);
      //     }
      
      //     if (!isPlaying2Ref.current && playerRef2.current) {
      //       playerRef2.current.resume();
      //       setIsPlaying2(true);
      //     }
      //   });
      
      //   const pauseSub = eventEmitter.addListener('onCarPlayPause', () => {
      //     console.log('CarPlay pause event received');
      
      //     if (isPlaying1Ref.current && playerRef.current) {
      //       playerRef.current.pause();
      //       setIsPlaying1(false);
      //     }
      
      //     if (isPlaying2Ref.current && playerRef2.current) {
      //       playerRef2.current.pause();
      //       setIsPlaying2(false);
      //     }
      //   });
      
      //   return () => {
      //     playSub.remove();
      //     pauseSub.remove();
      //   };
      // }, []);
      // useEffect(() => {
      //   const eventEmitter = new NativeEventEmitter(NativeModules.CarPlayEventEmitter);
      
      //   const playSub = eventEmitter.addListener('onCarPlayPlay', () => {
      //     console.log('CarPlay play event received');
      //     togglePlayPause1(); 
      //     togglePlayPause2();
      //   });
      
      //   const pauseSub = eventEmitter.addListener('onCarPlayPause', () => {
      //     console.log('CarPlay pause event received');
      //     togglePlayPause1();
      //     togglePlayPause2();
      //   });
      
      //   return () => {
      //     playSub.remove();
      //     pauseSub.remove();
      //   };
      // }, []);
      // useEffect(() => {
      //   const eventEmitter = new NativeEventEmitter(NativeModules.CarPlayEventEmitter);
    
        // const playSub = eventEmitter.addListener('onCarPlayPlay', () => {
      //     console.log('CarPlay play event received');
      //     if (activePlayerRef.current === 1) {
      //       togglePlayPause1();
      //     } else if (activePlayerRef.current === 2) {
      //       togglePlayPause2();
      //     }
      //   });
    
      //   const pauseSub = eventEmitter.addListener('onCarPlayPause', () => {
      //     console.log('CarPlay pause event received');
      //     if (activePlayerRef.current === 1) {
      //       togglePlayPause1();
      //     } else if (activePlayerRef.current === 2) {
      //       togglePlayPause2();
      //     }
      //   });
    
      //   return () => {
      //     playSub.remove();
      //     pauseSub.remove();
      //   };
      // }, []);
  
  return (
    <View style={styles.container}>
      {/* <View style={styles.castButtonContainer}>
        <CastButton style={styles.castButton} />
      </View> */}
      
     
      
      <View style={styles.playerContainer}>
        <Text style={styles.title}>First Audio </Text>

        {/* {castState === CastState.CONNECTED ? (
          <Text style={styles.castingText}>Casting is active. Local playback disabled.</Text>
        ) : (  )} */}
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
         
        

   
        {/* <TouchableOpacity
          onPress={() => castAudio(REMOTE_AUDIO_1, 'First Remote Audio')}
          style={[styles.button, { backgroundColor: '#34C759', marginTop: 10 }]}
        >
          <Text style={styles.buttonText}>Cast Audio 1</Text>
        </TouchableOpacity> */}
      </View>

  
      <View style={styles.playerContainer}>
        <Text style={styles.title}>Second Audio </Text>

        {/* {castState === CastState.CONNECTED ? (
          <Text style={styles.castingText}>Casting is active. Local playback disabled.</Text>
        ) : ( )} */}
          <>
            <Video
              source={testAudio2}
              ref={playerRef2}
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
          {/* <AirplayButton
           prioritizesVideoDevices={true}
           tintColor="black"
           activeTintColor="blue"
           style={{ width: 44, height: 44, backgroundColor: 'gray'}}
           
/> */}
      
        {/* <TouchableOpacity
          onPress={() => castAudio(REMOTE_AUDIO_2, 'Second Remote Audio')}
          style={[styles.button, { backgroundColor: '#34C759', marginTop: 10 }]}
        >
          <Text style={styles.buttonText}>Cast Audio 2</Text>
        </TouchableOpacity> */}
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
  // castButtonContainer: {
  //   alignItems: 'flex-end',
  //   marginBottom: 10,
  // },
  // castButton: {
  //   width: 24,
  //   height: 24,
  //   tintColor: 'black',
  // },
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
  // castingText: {
  //   fontSize: 16,
  //   color: 'green',
  //   marginTop: 15,
  //   fontWeight: '600',
  // },
});

export default App;