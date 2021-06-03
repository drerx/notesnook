import React, {useEffect, useRef, useState} from 'react';
import {RefreshControl, useWindowDimensions} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {useTracked} from '../../provider';
import {DDS} from '../../services/DeviceDetection';
import {eSendEvent} from '../../services/EventManager';
import SettingsService from '../../services/SettingsService';
import Sync from '../../services/Sync';
import {dHeight, dWidth} from '../../utils';
import {COLORS_NOTE} from '../../utils/Colors';
import {eScrollEvent} from '../../utils/Events';
import useAnnouncement from '../../utils/useAnnouncement';
import JumpToDialog from '../JumpToDialog';
import {NotebookWrapper} from '../NotebookItem/wrapper';
import {NoteWrapper} from '../NoteItem/wrapper';
import TagItem from '../TagItem';
import {Announcement} from './announcement';
import {Empty} from './empty';
import {Footer} from './footer';
import {Header} from './header';
import {SectionHeader} from './section-header';

const header = {
  type: 'MAIN_HEADER',
};

const empty = {
  type: 'empty_loading',
};
const empty_not = {
  type: 'empty_not_loading',
};

const SimpleList = ({
  listData,
  type,
  customRefresh,
  customRefreshing,
  refreshCallback,
  sortMenuButton,
  jumpToDialog,
  placeholderData,
  loading,
  headerProps = {
    heading: 'Home',
  },
  screen,
}) => {
  const [state] = useTracked();
  const {colors, deviceMode, messageBoardState} = state;
  const [_loading, _setLoading] = useState(false);
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => {
      return r1 !== r2;
    }),
  );
  const [width, setWidth] = useState(dWidth);
  const scrollRef = useRef();
  const {fontScale} = useWindowDimensions();
  const refreshing = false;
  const dataType = type;
  const [announcement, remove] = useAnnouncement();

  useEffect(() => {
    if (!loading) {
      if (!dataProvider.getDataForIndex(1) || dataProvider.getDataForIndex(1).type.includes("empty")) {
        setDataProvider(
          dataProvider.cloneWithRows(
            !listData || listData.length === 0
              ? [header, empty_not]
              : [header].concat(
                  listData.length > 1 && SettingsService.get().homepage !== screen
                    ? listData.slice(0, 1)
                    : listData,
                ),
          ),
        );
      }
      

      if (
        !listData ||
        listData.length === 0 ||
        SettingsService.get().homepage === screen
      )
        return;
      setTimeout(() => {
        setDataProvider(dataProvider.cloneWithRows([header].concat(listData)));
      }, 150);
    } else {
      setDataProvider(dataProvider.cloneWithRows([header, empty]));
    }
  }, [listData, loading, announcement]);

  useEffect(() => {
    setWidth(dWidth);
  }, [deviceMode]);

  const _onRefresh = async () => {
    await Sync.run();
    if (refreshCallback) {
      refreshCallback();
    }
  }

  const _onScroll = React.useCallback(
    event => {
      if (!event) return;
      let y = event.nativeEvent.contentOffset.y;
      eSendEvent(eScrollEvent, {
        y,
        screen,
      });
    },
    [screen],
  );

  const _layoutProvider = new LayoutProvider(
    index => {
      return dataProvider.getDataForIndex(index)?.type || 'note';
    },
    (type, dim) => {
      switch (type) {
        case 'note':
          dim.width = width;
          dim.height = 100 * fontScale;
          break;
        case 'notebook':
          dim.width = width;
          dim.height = 110 * fontScale;
          break;
        case 'trash':
          dim.width = width;
          dim.height = 110 * fontScale;
          break;
        case 'empty':
          dim.width = width;
          dim.height = dHeight - 250 - 35;
          break;
        case 'topic':
          dim.width = width;
          dim.height = 80 * fontScale;
          break;
        case 'tag':
          dim.width = width;
          dim.height = 80 * fontScale;
          break;
        case 'header':
          dim.width = width;
          dim.height = 40 * fontScale;
          break;
        case 'MAIN_HEADER':
          dim.width = width;
          dim.height =
            dataType === 'search'
              ? 0
              : DDS.isLargeTablet() || announcement
              ? messageBoardState.visible && !announcement
                ? 50
                : 0
              : 195;
          break;
        default:
          dim.width = width;
          dim.height = 0;
      }
    },
  );
  _layoutProvider.shouldRefreshWithAnchoring = false;

  const _renderRow = (type, data, index) => {
      switch (type) {
        case 'note':
          return <NoteWrapper item={data} index={index} />;
        case 'notebook':
        case 'topic':
          return <NotebookWrapper item={data} index={index} />;
        case 'tag':
          return <TagItem item={data} index={index} />;
        case 'trash':
          return data.itemType === 'note' ? (
            <NoteWrapper item={data} index={index} />
          ) : (
            <NotebookWrapper item={data} index={index} />
          );
        case 'MAIN_HEADER':
          return (
            <Header
              title={headerProps.heading}
              paragraph={headerProps.paragraph}
              onPress={headerProps.onPress}
              icon={headerProps.icon}
              type={dataType}
              announcement={announcement}
              index={index}
              screen={screen}
            />
          );
        case 'header':
          return (
            <SectionHeader
              item={data}
              index={index}
              headerProps={headerProps}
              jumpToDialog={jumpToDialog}
              sortMenuButton={sortMenuButton}
            />
          );
        case 'empty_not_loading':
          return (
            <Empty
              loading={false}
              placeholderData={placeholderData}
              headerProps={headerProps}
            />
          );
        case 'empty_loading':
          return (
            <Empty
              loading={true}
              placeholderData={placeholderData}
              headerProps={headerProps}
            />
          );
      }
    }

  let scrollProps = React.useMemo(() => {
    return {
      refreshControl: (
        <RefreshControl
          style={{
            opacity: 0,
            elevation: 0,
          }}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressViewOffset={150}
          onRefresh={customRefresh ? customRefresh : _onRefresh}
          refreshing={customRefresh ? customRefreshing : refreshing}
        />
      ),

      overScrollMode: 'always',
      contentContainerStyle: {
        width: '100%',
        alignSelf: 'center',
        minHeight: '100%',
      },
      testID: 'list-' + type,
    };
  }, [colors.accent, type, customRefresh]);

  let styles = {
    height: '100%',
    backgroundColor: colors.bg,
    width: '100%',
    minHeight: 1,
    minWidth: 1,
  };

  const renderFooter = () => (listData.length === 0 ? null : <Footer/>);

  return (
    <>
      {!loading && (
        <Announcement
          announcement={announcement}
          remove={remove}
          color={
            COLORS_NOTE[headerProps.heading?.toLowerCase()] || colors.accent
          }
        />
      )}
      <RecyclerListView
        ref={scrollRef}
        layoutProvider={_layoutProvider}
        dataProvider={dataProvider}
        rowRenderer={_renderRow}
        renderAheadOffset={0}
        onScroll={_onScroll}
        renderFooter={renderFooter}
        scrollViewProps={scrollProps}
        style={styles}
      />
      <JumpToDialog scrollRef={scrollRef} />
    </>
  );
};

export default SimpleList;
