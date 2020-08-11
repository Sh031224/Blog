import { observable, action } from "mobx";
import { autobind } from "core-decorators";
import Post from "../../assets/api/Post";

interface PostParmsType {
  page: number;
  limit: number;
  order?: string;
  category?: number;
}

interface PostResponseType {
  status: number;
  data: {
    total?: number;
    posts: PostType[];
  };
}

interface PostType {
  idx: number;
  title: string;
  view?: number;
  comment_count?: number;
  thumbnail?: string;
  description?: string;
  created_at: Date;
}

interface UploadFilesResponse {
  status: number;
  message: string;
  data: {
    files: string[];
  };
}

@autobind
class PostStore {
  @observable
  posts: PostType[] = [];

  @observable
  hit_posts: PostType[] = [];

  @action
  handlePosts = async (query: PostParmsType) => {
    try {
      const response: PostResponseType = await Post.GetPostList(query);
      if (query.page > 1) {
        response.data.posts.map((post: PostType) => {
          this.posts.push(post);
        });
      } else {
        this.posts = response.data.posts;
      }

      return new Promise((resolve, reject) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  };

  @action
  handleTempPosts = async () => {
    try {
      const response: PostResponseType = await Post.GetTempPosts();

      this.posts = response.data.posts;

      return new Promise((resolve, reject) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  };

  @action
  handleHitPosts = async (query: PostParmsType) => {
    try {
      const response: PostResponseType = await Post.GetPostList(query);
      if (query.page > 1) {
        response.data.posts.map((post: PostType) => {
          this.hit_posts.push(post);
        });
      } else {
        this.hit_posts = response.data.posts;
      }

      return new Promise((resolve, reject) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  };

  @action
  handlePostSearch = async (query: string) => {
    try {
      const response: PostResponseType = await Post.GetPostSearch(query);

      this.posts = response.data.posts;

      return new Promise((resolve, reject) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  };

  @action
  initPosts = () => {
    this.posts = [];
  };

  @action
  getPostLength = () => {
    return this.posts.length;
  };

  @action
  getPostInfo = async (idx: number) => {
    try {
      const response: Response = await Post.GetPostInfo(idx);

      return new Promise((resolve: (response: Response) => void, reject) => {
        resolve(response);
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
  };

  @action
  uploadFiles = async (files: File[]): Promise<UploadFilesResponse> => {
    try {
      const response: UploadFilesResponse = await Post.UploadFiles(files);

      return new Promise(
        (resolve: (response: UploadFilesResponse) => void, reject) => {
          resolve(response);
        }
      );
    } catch (error) {
      return new Promise((resolve, reject: (error: Error) => void) => {
        reject(error);
      });
    }
  };
}

export default PostStore;
