import React, {useRef} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
  HMSTrackSource,
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {getHmsViewHeight} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import {LayoutParams, ModalTypes, PeerTrackNode} from '../../utils/types';

type GridViewProps = {
  pairedPeers: PeerTrackNode[][];
  speakers: HMSSpeaker[];
  instance?: HMSSDK;
  layout: LayoutParams;
  statsForNerds?: boolean;
  rtcStats?: HMSRTCStatsReport;
  remoteAudioStats?: any;
  remoteVideoStats?: any;
  localAudioStats?: HMSLocalAudioStats;
  localVideoStats?: HMSLocalVideoStats;
  page: number;
  pinnedPeerTrackIds?: String[];
  setModalVisible?: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setZoomableTrackId?: React.Dispatch<React.SetStateAction<string>>;
  setPinnedPeerTrackIds?: React.Dispatch<React.SetStateAction<String[]>>;
};

const GridView = ({
  pairedPeers,
  setPage,
  setModalVisible,
  setZoomableTrackId,
  setPinnedPeerTrackIds,
  speakers,
  instance,
  layout,
  statsForNerds,
  rtcStats,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  page,
  pinnedPeerTrackIds,
}: GridViewProps) => {
  const {left, right, top, bottom} = useSafeAreaInsets();
  const flatlistRef = useRef<FlatList>(null);
  var doublePress = 0;
  if (page + 1 > pairedPeers.length) {
    flatlistRef?.current?.scrollToEnd();
  }
  const speakerIds = speakers?.map(speaker => speaker?.peer?.peerID);

  return (
    <FlatList
      ref={flatlistRef}
      horizontal
      data={pairedPeers}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      onScroll={({nativeEvent}) => {
        const {contentOffset, layoutMeasurement} = nativeEvent;
        setPage(contentOffset.x / layoutMeasurement.width);
      }}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({item}: {item: Array<PeerTrackNode>}) => {
        return (
          <View
            key={item[0]?.id}
            style={[
              styles.page,
              {width: Dimensions.get('window').width - left - right},
            ]}>
            {item?.map(view => {
              if (view.track?.source === HMSTrackSource.SCREEN) {
                return (
                  <View style={styles.flex} key={view.id}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        console.log('Single Tap');
                        doublePress++;
                        if (doublePress === 2) {
                          console.log('Double Tap');
                          doublePress = 0;
                          setModalVisible && setModalVisible(ModalTypes.ZOOM);
                          setZoomableTrackId &&
                            setZoomableTrackId(view.track?.trackId!);
                        } else {
                          setTimeout(() => {
                            doublePress = 0;
                          }, 500);
                        }
                      }}>
                      <DisplayTrack
                        peerTrackNode={view}
                        videoStyles={styles.generalTile}
                        speakerIds={speakerIds}
                        instance={instance}
                        layout={layout}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                );
              } else {
                return (
                  <View
                    key={view?.id}
                    style={{
                      ...getHmsViewHeight(layout, item.length, top, bottom),
                    }}>
                    <DisplayTrack
                      peerTrackNode={view}
                      videoStyles={styles.generalTile}
                      speakerIds={speakerIds}
                      instance={instance}
                      layout={layout}
                      setModalVisible={setModalVisible}
                      statsForNerds={statsForNerds}
                      rtcStats={rtcStats}
                      remoteAudioStats={remoteAudioStats}
                      remoteVideoStats={remoteVideoStats}
                      localAudioStats={localAudioStats}
                      localVideoStats={localVideoStats}
                      pinnedPeerTrackIds={pinnedPeerTrackIds}
                      setPinnedPeerTrackIds={setPinnedPeerTrackIds}
                    />
                  </View>
                );
              }
            })}
          </View>
        );
      }}
      numColumns={1}
      keyExtractor={item => item[0]?.id}
    />
  );
};
export {GridView};
