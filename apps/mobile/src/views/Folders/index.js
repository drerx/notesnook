import React, {useCallback, useEffect} from 'react';
import {ContainerBottomButton} from '../../components/Container/ContainerBottomButton';
import {ContainerTopSection} from '../../components/Container/ContainerTopSection';
import {AddNotebookEvent} from '../../components/DialogManager/recievers';
import {Header} from '../../components/Header';
import SelectionHeader from '../../components/SelectionHeader';
import SimpleList from '../../components/SimpleList';
import {useTracked} from '../../provider';
import {Actions} from '../../provider/Actions';
import {eSendEvent} from '../../services/EventManager';
import Navigation from '../../services/Navigation';
import SearchService from '../../services/SearchService';
import {InteractionManager} from '../../utils';
import {db} from '../../utils/DB';
import {eScrollEvent} from '../../utils/Events';

export const Folders = ({route, navigation}) => {
  const [state, dispatch] = useTracked();
  const notebooks = state.notebooks;
  let ranAfterInteractions = false;

  const onFocus = useCallback(() => {
    Navigation.setHeaderState(
      'Notebooks',
      {
        menu: true,
      },
      {
        heading: 'Notebooks',
        id: 'notebooks_navigation',
      },
    );
    if (!ranAfterInteractions) {
      ranAfterInteractions = true;
      runAfterInteractions();
    }
  }, []);

  const runAfterInteractions = () => {
    InteractionManager.runAfterInteractions(() => {
      Navigation.routeNeedsUpdate('Notebooks', () => {
        dispatch({type: Actions.NOTEBOOKS});
      });
    });
    eSendEvent(eScrollEvent, {name: 'Notebooks', type: 'in'});
    updateSearch();
    ranAfterInteractions = false;
  };

  useEffect(() => {
    navigation.addListener('focus', onFocus);
    return () => {
      ranAfterInteractions = false;
      pageIsLoaded = false;
      navigation.removeListener('focus', onFocus);
      eSendEvent(eScrollEvent, {name: 'Notebooks', type: 'back'});
    };
  }, []);

  useEffect(() => {
    if (navigation.isFocused()) {
      updateSearch();
    }
  }, [notebooks]);

  const updateSearch = React.useCallback(() => {
    SearchService.update({
      placeholder: 'Type a keyword to search in notebooks',
      data: db.notebooks.all,
      type: 'notebooks',
      title: 'Notebooks',
    });
  }, []);

  const _onPressBottomButton = () => AddNotebookEvent();

  return (
    <>
      <SelectionHeader screen="Notebooks" />
      <ContainerTopSection>
        <Header
          title="Notebooks"
          isBack={false}
          screen="Notebooks"
          action={_onPressBottomButton}
        />
      </ContainerTopSection>
      <SimpleList
        listData={state.notebooks}
        type="notebooks"
        screen="Notebooks"
        focused={() => navigation.isFocused()}
        placeholderData={{
          heading: 'Your notebooks',
          paragraph: 'You have not added any notebooks yet.',
          button: 'Add a notebook',
          action: _onPressBottomButton,
          loading: 'Loading your notebooks',
        }}
        headerProps={{
          heading: 'Notebooks',
        }}
      />

      {!state.notebooks || state.notebooks.length === 0 ? null : (
        <ContainerBottomButton
          title="Create a new notebook"
          onPress={_onPressBottomButton}
        />
      )}
    </>
  );
};

export default Folders;
