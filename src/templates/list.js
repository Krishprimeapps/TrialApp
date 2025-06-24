import { CarPlay, NowPlayingTemplate,GridTemplate } from 'react-native-carplay';
import { DeviceEventEmitter, Platform } from 'react-native';
import { useEffect } from 'react';
export default function createListTemplate() {

  const template1 = new NowPlayingTemplate({
    buttons:[
      {
        id: 'play',
        type : 'playback',
      }
    ],
    tabTitle: "AlbumArt",
    // upNextButtonTitle: "Up Next",
    // upNextButtonEnabled: false,
    // albumArtistButtonEnabled:false,
    // onUpNextButtonPressed:()=>{
    //   console.log('Pressed');
    // }
  });

 const template = new GridTemplate({
    buttons:[
      {
        id:'Play',
        titleVariants:['▶️ Play'], 
      }
    ],
    title:'Hello from react-native-carplay',
    onButtonPressed: e =>{
      if (e.id === 'Play'){
        CarPlay.enableNowPlaying(true);
        CarPlay.pushTemplate(template1);
      }
    }
  })
  CarPlay.setRootTemplate(template);      
}