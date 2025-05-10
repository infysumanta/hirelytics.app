import {
  parseAsString,
  createSerializer,
  createSearchParamsCache,
} from "nuqs/server";

export const searchParams = {
  user: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
