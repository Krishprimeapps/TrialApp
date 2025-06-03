import { CarPlay, NowPlayingTemplate,GridTemplate } from 'react-native-carplay';
import { DeviceEventEmitter } from 'react-native';
export default function createListTemplate() {

  const template1 = new NowPlayingTemplate({
    tabTitle: "AlbumArt",
    upNextButtonTitle: "Up Next",
    upNextButtonEnabled: true,
    albumArtistButtonEnabled:true,
    onButtonPressed:() => {
      console.log('hello');
    },
    onUpNextButtonPressed:()=>{
      console.log('Pressed');
    }
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
        CarPlay.pushTemplate(template1)
        CarPlay.enableNowPlaying(true);
      }
    }
  })
  
    CarPlay.setRootTemplate(template);
    
}
  // const template = new ListTemplate({
   
  //   title: 'My Playlist',
  //   sections: [
  //     {
  //       header: 'Audio Controls',
  //       items: [
  //         {
  //           text: '▶️ Play',
  //           onItemSelect:() =>{
  //             console.log('pressed');
              
  //           }
  //         },
  //       ],
  //     },
  //   ],
  //   onAppear: () => console.log('List Template appeared'),
  // });
// import { ListTemplate, CarPlay } from 'react-native-carplay';

// export default function createListTemplate(onPlay, onPause) {
//   if (typeof CarPlay.setRootTemplate !== 'function') {
//     console.warn('CarPlay.setRootTemplate is not available');
//     return;
//   }

//   const template = new ListTemplate({
//     title: 'My Playlist',
//     sections: [
//       {
//         header: 'Audio Controls',
//         items: [
//           {
//             text: '▶️ Play',
//             onPress: () => {
//               console.log('Play pressed');
//               onPlay?.();
//             },
//           },
//           {
//             text: '⏸ Pause',
//             onPress: () => {
//               console.log('Pause pressed');
//               onPause?.();
//             },
//           },
//         ],
//       },
//     ],
//     onAppear: () => {
//       console.log('ListTemplate appeared');
//     },
//   });

//   CarPlay.setRootTemplate(template);
// }

// import { NowPlayingTemplate, CarPlay } from 'react-native-carplay';

// function showNowPlaying() {
//   const template = new NowPlayingTemplate({
//     tabTitle: "AlbumArt",
//     upNextButtonTitle: "Loading...",
//     upNextButtonEnabled: false,
//     onButtonPressed(e) {
//       console.log(e);
//     }
//   });



//   console.log('This function is being loaded')
//   CarPlay.setRootTemplate(template, true);
//   console.log('This function is being loaded')
// }

// export default showNowPlaying;
  // template.onPlayPause = () => {
  //   console.log("Play/Pause pressed");
  //   // toggle playback here
  // };

  // template.onNext = () => {
  //   console.log("Next pressed");
  //   // next track logic
  // };

  // template.onPrevious = () => {
  //   console.log("Previous pressed");
  //   // previous track logic
  // };