/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

export type GroupOptions = {
  groupBy: "abc" | "year" | "month" | "week" | undefined;
  sortBy: "dateCreated" | "dateDeleted" | "dateEdited" | "title";
  sortDirection: "desc" | "asc";
};

export type GroupingKey =
  | "home"
  | "notes"
  | "notebooks"
  | "tags"
  | "topics"
  | "trash"
  | "favorites";

export type ValueOf<T> = T[keyof T];

export type GroupHeader = {
  type: "header";
  title: string;
};

export type User = {
  id: string;
  email: string;
  isEmailConfirmed: boolean;
  mfa: {
    isEnabled: boolean;
    primaryMethod: string;
    secondaryMethod: string;
    remainingValidCodes: number;
  };
  subscription: {
    appId: 0;
    cancelURL: string | null;
    expiry: number;
    productId: string;
    provider: 0 | 1 | 2 | 3;
    start: number;
    type: 0 | 1 | 2 | 5 | 6 | 7;
    updateURL: string | null;
  };
};
