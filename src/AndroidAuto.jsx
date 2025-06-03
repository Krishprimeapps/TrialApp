import React from 'react';
import {Button, Text, View} from 'react-native';
import { CarPlay } from 'react-native-carplay';
export function AndroidAutoModule(){
    CarPlay.emitter.addListener('didconnect', () => {
        <Text>Android Auto connected</Text>
    });
    CarPlay.emitter.addListener('diddisconnect', () => {
        <Text>Android Auto disconnected</Text>
    });
    
}
export function AndroidAuto(){
    return(
        <View>
            <Text>Hello Android Auto</Text>
            <Button title="Reload" onPress={() => CarPlay.bridge.reload()} />
        </View>
    )
}