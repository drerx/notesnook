import { navigate } from "../navigation/";
import React from "react";
import Note from "../components/note";
import Notebook from "../components/notebook";
import Tag from "../components/tag";
import Topic from "../components/topic";
import TrashItem from "../components/trash-item";
import {
  getItemHeight,
  getNotebookHeight,
  getNoteHeight,
  MAX_HEIGHTS,
} from "./height-calculator";
import { db } from "./db";

function createProfile(item, itemHeight, estimatedItemHeight) {
  return { item, itemHeight, estimatedItemHeight };
}

const NotesProfile = createProfile(
  (index, item, context) => {
    // TODO doing all this here could be a potential performance issue.

    let tags = item.tags;
    if (tags) tags = tags.map((t) => db.tags.tag(t)).slice(0, 3);
    if (context?.type !== "topic" && item.notebooks?.length) {
      const noteNotebook = item.notebooks[0];
      const _notebook = db.notebooks.notebook(noteNotebook.id);
      var notebook = _notebook?.data;

      const topicId = noteNotebook.topics[0];
      const topic = _notebook?.topics.topic(topicId);
      notebook.topic = topic?._topic;
    }

    return (
      <Note
        index={index}
        pinnable={!context}
        item={item}
        tags={tags || []}
        notebook={notebook}
        context={context}
      />
    );
  },
  getNoteHeight,
  MAX_HEIGHTS.note
);

const NotebooksProfile = createProfile(
  (index, item) => <Notebook index={index} item={item} />,
  getNotebookHeight,
  MAX_HEIGHTS.notebook
);

const TagsProfile = createProfile(
  (index, item) => <Tag item={item} index={index} />,
  getItemHeight,
  MAX_HEIGHTS.generic
);

const TopicsProfile = createProfile(
  (index, item, context) => (
    <Topic
      index={index}
      item={item}
      onClick={() => navigate(`/notebooks/${context.notebookId}/${item.id}`)}
    />
  ),
  getItemHeight,
  MAX_HEIGHTS.generic
);

const TrashProfile = createProfile(
  (index, item) => <TrashItem index={index} item={item} />,
  (item) => {
    if (item.itemType === "note") return getNoteHeight(item);
    else if (item.itemType === "notebook") return getNotebookHeight(item);
  },
  Math.max(MAX_HEIGHTS.note, MAX_HEIGHTS.notebook)
);

const Profiles = {
  home: NotesProfile,
  notebooks: NotebooksProfile,
  notes: NotesProfile,
  tags: TagsProfile,
  topics: TopicsProfile,
  trash: TrashProfile,
};
export default Profiles;