import { formatDate } from "notes-core/utils/date";
import React, { useEffect, useRef } from "react";
import { Text } from "rebass";
import { register, format, cancel, render } from "timeago.js";

const shortLocale = [
  ["now", "now"],
  ["%ss", "in %ss"],
  ["1m", "in 1m"],
  ["%sm", "in %sm"],
  ["1h", "in 1h"],
  ["%sh", "in %sh"],
  ["1d", "in 1d"],
  ["%sd", "in %sd"],
  ["1w", "in 1w"],
  ["%sw", "in %sw"],
  ["1mo", "in 1mo"],
  ["%smo", "in %smo"],
  ["1yr", "in 1yr"],
  ["%syr", "in %syr"],
];

const enShortLocale = [
  ["now", "now"],
  ["%ss ago", "in %ss"],
  ["1m ago", "in 1m"],
  ["%sm ago", "in %sm"],
  ["1h ago", "in 1h"],
  ["%sh ago", "in %sh"],
  ["1d ago", "in 1d"],
  ["%sd ago", "in %sd"],
  ["1w ago", "in 1w"],
  ["%sw ago", "in %sw"],
  ["1mo ago", "in 1mo"],
  ["%smo ago", "in %smo"],
  ["1yr ago", "in 1yr"],
  ["%syr ago", "in %syr"],
];
register("short", (_n, index) => shortLocale[index]);
register("en_short", (_n, index) => enShortLocale[index]);

function TimeAgo({ datetime, live, locale, opts, ...restProps }) {
  const timeRef = useRef();
  useEffect(() => {
    const element = timeRef.current;
    if (!element) return;

    // cancel all the interval
    cancel(element);
    // if is live
    if (live !== false) {
      // live render
      element.setAttribute("datetime", toDate(datetime).toISOString());
      render(element, locale, opts);
    }

    return () => {
      cancel(element);
    };
  }, [datetime, live, locale, opts]);

  return (
    <Text
      ref={timeRef}
      {...restProps}
      title={formatDate(datetime)}
      as="time"
      dateTime={toDate(datetime).toISOString()}
    >
      {format(datetime, locale, opts)}
    </Text>
  );
}

export default React.memo(TimeAgo);

/**
 * Convert input to a valid datetime string of <time> tag
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
 * @param input
 * @returns datetime string
 */
const toDate = (input) => {
  let date = null; // new Date();
  if (input instanceof Date) {
    date = input;
  } else date = new Date(input);

  return date;
};