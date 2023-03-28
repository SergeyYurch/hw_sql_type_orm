import { CommentsSearchParamsType } from './comments-search-params.type';

export type CommentsMongoFilterType = CommentsSearchParamsType & {
  isBanned?: boolean;
};
