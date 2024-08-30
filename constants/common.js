import { Dimensions } from "react-native";

const {width: deviceWidth, height: deviceHeigth} = Dimensions.get('window')

export const hp = percentage => {
    return (percentage*deviceWidth) / 100;
}
export const wp = percentage => {
    return (percentage*deviceHeigth) / 100;
}